import type { FastifyInstance } from 'fastify';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { businesses, directories, submissions } from '../db/schema.js';
import { submissionQueue, enqueueQueuedSubmissions } from '../queues/submission.queue.js';

type SubmissionStatus =
  | 'queued'
  | 'submitting'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'requires_action'
  | 'removed';

type PlanAction = 'submit' | 'update' | 'skip';

interface PlanItem {
  directoryId: string;
  directoryName: string;
  directorySlug: string;
  action: PlanAction;
  reason: string;
  existingStatus: SubmissionStatus | null;
  externalId: string | null;
}

export default async function planRoutes(fastify: FastifyInstance) {
  // GET /api/businesses/:id/plan
  fastify.get('/businesses/:id/plan', async (request, reply) => {
    const { id } = request.params as { id: string };

    // Load business
    const [business] = await db
      .select({ id: businesses.id, name: businesses.name })
      .from(businesses)
      .where(eq(businesses.id, id));

    if (!business) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Business not found',
      });
    }

    // Load all directories
    const allDirectories = await db
      .select({
        id: directories.id,
        name: directories.name,
        slug: directories.slug,
        paused: directories.paused,
        healthStatus: directories.healthStatus,
      })
      .from(directories);

    // Load existing submissions for this business
    const existingSubmissions = await db
      .select({
        directoryId: submissions.directoryId,
        status: submissions.status,
        externalId: submissions.externalId,
      })
      .from(submissions)
      .where(eq(submissions.businessId, id));

    // Build lookup map: directoryId -> submission
    const submissionMap = new Map<string, { status: SubmissionStatus; externalId: string | null }>();
    for (const sub of existingSubmissions) {
      submissionMap.set(sub.directoryId, {
        status: sub.status as SubmissionStatus,
        externalId: sub.externalId ?? null,
      });
    }

    // Build plan items
    const planItems: PlanItem[] = allDirectories.map((dir) => {
      const existing = submissionMap.get(dir.id) ?? null;
      const existingStatus = existing?.status ?? null;
      const externalId = existing?.externalId ?? null;

      let action: PlanAction;
      let reason: string;

      if (dir.paused) {
        action = 'skip';
        reason = 'Directory paused';
      } else if (dir.healthStatus === 'down') {
        action = 'skip';
        reason = 'Directory health is down';
      } else if (!existing) {
        action = 'submit';
        reason = 'No existing submission';
      } else if (existingStatus === 'submitted' || existingStatus === 'verified') {
        action = 'update';
        reason = 'Has active submission';
      } else if (existingStatus === 'failed' || existingStatus === 'requires_action') {
        action = 'submit';
        reason = 'Previous attempt failed — will retry';
      } else if (existingStatus === 'queued' || existingStatus === 'submitting') {
        action = 'skip';
        reason = 'Submission already in progress';
      } else if (existingStatus === 'removed') {
        action = 'submit';
        reason = 'Listing was removed — will resubmit';
      } else {
        action = 'skip';
        reason = 'Unknown state';
      }

      return {
        directoryId: dir.id,
        directoryName: dir.name,
        directorySlug: dir.slug,
        action,
        reason,
        existingStatus,
        externalId,
      };
    });

    return reply.send({
      data: {
        businessId: business.id,
        businessName: business.name,
        planItems,
      },
    });
  });

  // POST /api/businesses/:id/approve-plan
  fastify.post('/businesses/:id/approve-plan', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = (request.body ?? {}) as { directoryIds?: string[] };

    // Load business
    const [business] = await db
      .select({ id: businesses.id, name: businesses.name })
      .from(businesses)
      .where(eq(businesses.id, id));

    if (!business) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Business not found',
      });
    }

    // Load all directories (optionally filtered)
    const allDirectories = await db
      .select({
        id: directories.id,
        slug: directories.slug,
        paused: directories.paused,
        healthStatus: directories.healthStatus,
      })
      .from(directories);

    // Load existing submissions for this business
    const existingSubmissions = await db
      .select({
        id: submissions.id,
        directoryId: submissions.directoryId,
        status: submissions.status,
        externalId: submissions.externalId,
      })
      .from(submissions)
      .where(eq(submissions.businessId, id));

    const submissionMap = new Map<
      string,
      { id: string; status: SubmissionStatus; externalId: string | null }
    >();
    for (const sub of existingSubmissions) {
      submissionMap.set(sub.directoryId, {
        id: sub.id,
        status: sub.status as SubmissionStatus,
        externalId: sub.externalId ?? null,
      });
    }

    // Determine which directories to queue
    const queuedDirectoryIds: string[] = [];

    for (const dir of allDirectories) {
      // If a filter list is provided, skip directories not in the list
      if (body.directoryIds && body.directoryIds.length > 0) {
        if (!body.directoryIds.includes(dir.id)) continue;
      }

      const existing = submissionMap.get(dir.id) ?? null;
      const existingStatus = existing?.status ?? null;

      // Determine action (same logic as plan endpoint)
      let action: PlanAction;

      if (dir.paused) {
        action = 'skip';
      } else if (dir.healthStatus === 'down') {
        action = 'skip';
      } else if (!existing) {
        action = 'submit';
      } else if (existingStatus === 'submitted' || existingStatus === 'verified') {
        action = 'update';
      } else if (existingStatus === 'failed' || existingStatus === 'requires_action') {
        action = 'submit';
      } else if (existingStatus === 'queued' || existingStatus === 'submitting') {
        action = 'skip';
      } else if (existingStatus === 'removed') {
        action = 'submit';
      } else {
        action = 'skip';
      }

      if (action === 'skip') continue;

      // Upsert submission
      if (!existing) {
        // INSERT new submission with status 'queued'
        await db.insert(submissions).values({
          businessId: id,
          directoryId: dir.id,
          status: 'queued',
        });
      } else if (
        existingStatus === 'failed' ||
        existingStatus === 'requires_action' ||
        existingStatus === 'removed'
      ) {
        // UPDATE to queued, clear error fields
        await db.update(submissions)
          .set({ status: 'queued', errorCode: null, message: null })
          .where(eq(submissions.id, existing.id));
      }
      // For 'update' action (submitted/verified), no status change needed here —
      // they will be picked up by the worker with action='update'

      queuedDirectoryIds.push(dir.id);
    }

    return reply.send({
      data: {
        queued: queuedDirectoryIds.length,
        directoryIds: queuedDirectoryIds,
      },
    });
  });

  // POST /api/queue/process — manually trigger enqueueQueuedSubmissions
  fastify.post('/queue/process', async (_request, reply) => {
    const count = await enqueueQueuedSubmissions();
    return reply.send({ data: { enqueued: count } });
  });

  // GET /api/queue/status — returns queue stats
  fastify.get('/queue/status', async (_request, reply) => {
    const [waiting, active, completed, failed] = await Promise.all([
      submissionQueue.getWaitingCount(),
      submissionQueue.getActiveCount(),
      submissionQueue.getCompletedCount(),
      submissionQueue.getFailedCount(),
    ]);
    return reply.send({ data: { waiting, active, completed, failed } });
  });
}
