import { Queue, Worker, type Job } from 'bullmq';
import { Redis as IORedis } from 'ioredis';
import { eq, and, sql } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { submissions, businesses, directories } from '../db/schema.js';
import { getAdapter } from '../integrations/index.js';
import { checkDirectoryFailureThreshold } from '../services/health.service.js';
import { logger } from '../utils/logger.js';

export interface SubmissionJobData {
  submissionId: string;
  businessId: string;
  directoryId: string;
  directorySlug: string;
  externalId?: string;
  action: 'submit' | 'update';
}

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });

export const submissionQueue = new Queue<SubmissionJobData>('submissions', { connection });

// Worker — processes one job at a time per directory to respect rate limits
export const submissionWorker = new Worker<SubmissionJobData>(
  'submissions',
  async (job: Job<SubmissionJobData>) => {
    const { submissionId, businessId, directorySlug, externalId, action } = job.data;

    // Mark as submitting
    await db.update(submissions)
      .set({ status: 'submitting', lastAttempt: sql`now()` })
      .where(eq(submissions.id, submissionId));

    // Load business
    const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
    if (!business) throw new Error(`Business ${businessId} not found`);

    // Get adapter
    const adapter = getAdapter(directorySlug);
    if (!adapter) throw new Error(`No adapter for ${directorySlug}`);

    // Execute
    let result;
    if (action === 'update' && externalId) {
      result = await adapter.update(business as any, externalId);
    } else {
      result = await adapter.submit(business as any);
    }

    // Update submission record
    await db.update(submissions)
      .set({
        status: result.status,
        externalId: result.externalId ?? null,
        errorCode: result.errorCode ?? null,
        message: result.message ?? null,
        submittedAt: ['submitted', 'verified'].includes(result.status) ? sql`now()` : undefined,
        updatedAt: sql`now()`,
      })
      .where(eq(submissions.id, submissionId));

    logger.info({ submissionId, directorySlug, status: result.status }, 'Submission processed');
    return result;
  },
  {
    connection,
    concurrency: 1, // one at a time globally
    lockDuration: 300_000, // 5 min — browser sessions can run long
    lockRenewTime: 60_000,  // renew every 60s (must be < lockDuration / 2)
    limiter: {
      max: 1,
      duration: 5000, // 1 job per 5 seconds (rate limiting)
    },
  }
);

// On job failure — update DB status and track consecutive failures for auto-pause
submissionWorker.on('failed', async (job, err) => {
  if (!job) return;
  const { submissionId, directoryId, directorySlug } = job.data;

  // Mark submission as failed in DB
  await db.update(submissions)
    .set({ status: 'failed', errorCode: 'WORKER_ERROR', message: err.message, updatedAt: sql`now()` })
    .where(eq(submissions.id, submissionId));

  // Count consecutive failures for this directory
  const recentJobs = await submissionQueue.getJobs(['failed'], 0, 20);
  const consecutiveFailures = recentJobs.filter(j => j.data.directorySlug === directorySlug).length;

  await checkDirectoryFailureThreshold(directoryId, directorySlug, consecutiveFailures);
  logger.error({ submissionId, directorySlug, err: err.message }, 'Submission job failed');
});

/**
 * Enqueue all queued submissions — call this on server startup or via cron
 */
export async function enqueueQueuedSubmissions(): Promise<number> {
  const queued = await db
    .select({
      id: submissions.id,
      businessId: submissions.businessId,
      directoryId: submissions.directoryId,
      externalId: submissions.externalId,
      status: submissions.status,
      directorySlug: directories.slug,
    })
    .from(submissions)
    .innerJoin(directories, eq(submissions.directoryId, directories.id))
    .where(and(eq(submissions.status, 'queued'), eq(directories.paused, false)));

  for (const sub of queued) {
    const action = sub.externalId ? 'update' : 'submit';
    await submissionQueue.add('process', {
      submissionId: sub.id,
      businessId: sub.businessId,
      directoryId: sub.directoryId,
      directorySlug: sub.directorySlug,
      externalId: sub.externalId ?? undefined,
      action,
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 30_000 }, // 30s, 60s, 120s
      removeOnComplete: 100,
      removeOnFail: 200,
    });
  }

  return queued.length;
}
