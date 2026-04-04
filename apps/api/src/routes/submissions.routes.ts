import type { FastifyInstance } from 'fastify';
import { eq, sql, or, desc } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { businesses, directories, submissions } from '../db/schema.js';

type SubmissionStatus =
  | 'queued'
  | 'submitting'
  | 'submitted'
  | 'verified'
  | 'failed'
  | 'requires_action'
  | 'removed';

export default async function submissionsRoutes(fastify: FastifyInstance) {
  // GET /api/submissions/summary
  fastify.get('/submissions/summary', async (_request, reply) => {
    const [allBusinesses, allDirectories, allSubmissions, recentRows] =
      await Promise.all([
        db.select({ id: businesses.id, status: businesses.status }).from(businesses),
        db
          .select({ id: directories.id, healthStatus: directories.healthStatus })
          .from(directories),
        db.select({ status: submissions.status }).from(submissions),
        db
          .select({
            submissionId: submissions.id,
            businessName: businesses.name,
            directoryName: directories.name,
            status: submissions.status,
            updatedAt: submissions.updatedAt,
          })
          .from(submissions)
          .innerJoin(businesses, eq(submissions.businessId, businesses.id))
          .innerJoin(directories, eq(submissions.directoryId, directories.id))
          .orderBy(desc(submissions.updatedAt))
          .limit(10),
      ]);

    const totalBusinesses = allBusinesses.length;
    const activeBusinesses = allBusinesses.filter((b) => b.status === 'active').length;
    const totalDirectories = allDirectories.length;
    const healthyDirectories = allDirectories.filter(
      (d) => d.healthStatus === 'healthy'
    ).length;

    const statusCounts: Record<string, number> = {
      queued: 0,
      submitting: 0,
      submitted: 0,
      verified: 0,
      failed: 0,
      requires_action: 0,
      removed: 0,
    };
    for (const s of allSubmissions) {
      if (s.status in statusCounts) {
        statusCounts[s.status]++;
      }
    }

    const recentActivity = recentRows.map((r) => ({
      submissionId: r.submissionId,
      businessName: r.businessName,
      directoryName: r.directoryName,
      status: r.status,
      updatedAt: r.updatedAt?.toISOString() ?? '',
    }));

    return reply.send({
      data: {
        totalBusinesses,
        activeBusinesses,
        totalDirectories,
        healthyDirectories,
        submissionsByStatus: statusCounts as Record<SubmissionStatus, number>,
        recentActivity,
      },
    });
  });

  // GET /api/submissions/matrix
  fastify.get('/submissions/matrix', async (_request, reply) => {
    const [allBusinesses, allDirectories, allSubmissions] = await Promise.all([
      db
        .select({ id: businesses.id, name: businesses.name, status: businesses.status })
        .from(businesses),
      db
        .select({ id: directories.id, name: directories.name })
        .from(directories),
      db
        .select({
          id: submissions.id,
          businessId: submissions.businessId,
          directoryId: submissions.directoryId,
          status: submissions.status,
          externalId: submissions.externalId,
          lastAttempt: submissions.lastAttempt,
        })
        .from(submissions),
    ]);

    // Build a lookup map: `${businessId}:${directoryId}` -> submission
    const submissionMap = new Map<
      string,
      {
        id: string;
        status: SubmissionStatus;
        externalId: string | null;
        lastAttempt: Date | null;
      }
    >();
    for (const s of allSubmissions) {
      submissionMap.set(`${s.businessId}:${s.directoryId}`, {
        id: s.id,
        status: s.status as SubmissionStatus,
        externalId: s.externalId ?? null,
        lastAttempt: s.lastAttempt ?? null,
      });
    }

    const matrix: Array<{
      businessId: string;
      businessName: string;
      businessStatus: string;
      directoryId: string;
      directoryName: string;
      status: SubmissionStatus | null;
      submissionId: string | null;
      externalId: string | null;
      lastAttempt: string | null;
    }> = [];

    for (const business of allBusinesses) {
      for (const directory of allDirectories) {
        const key = `${business.id}:${directory.id}`;
        const sub = submissionMap.get(key) ?? null;
        matrix.push({
          businessId: business.id,
          businessName: business.name,
          businessStatus: business.status,
          directoryId: directory.id,
          directoryName: directory.name,
          status: sub ? sub.status : null,
          submissionId: sub ? sub.id : null,
          externalId: sub ? sub.externalId : null,
          lastAttempt: sub?.lastAttempt ? sub.lastAttempt.toISOString() : null,
        });
      }
    }

    return reply.send({ data: matrix });
  });

  // GET /api/submissions/actions
  fastify.get('/submissions/actions', async (_request, reply) => {
    const rows = await db
      .select({
        submissionId: submissions.id,
        businessId: submissions.businessId,
        businessName: businesses.name,
        directoryId: submissions.directoryId,
        directoryName: directories.name,
        status: submissions.status,
        errorCode: submissions.errorCode,
        message: submissions.message,
        lastAttempt: submissions.lastAttempt,
      })
      .from(submissions)
      .innerJoin(businesses, eq(submissions.businessId, businesses.id))
      .innerJoin(directories, eq(submissions.directoryId, directories.id))
      .where(
        or(
          eq(submissions.status, 'requires_action'),
          eq(submissions.status, 'failed')
        )
      )
      .orderBy(desc(submissions.lastAttempt));

    const data = rows.map((r) => ({
      submissionId: r.submissionId,
      businessId: r.businessId,
      businessName: r.businessName,
      directoryId: r.directoryId,
      directoryName: r.directoryName,
      status: r.status,
      errorCode: r.errorCode ?? null,
      message: r.message ?? null,
      lastAttempt: r.lastAttempt ? r.lastAttempt.toISOString() : null,
    }));

    return reply.send({ data });
  });

  // GET /api/businesses/:id/submissions
  fastify.get('/businesses/:id/submissions', async (request, reply) => {
    const { id } = request.params as { id: string };

    const rows = await db
      .select({
        submissionId: submissions.id,
        directoryId: directories.id,
        directoryName: directories.name,
        directorySlug: directories.slug,
        status: submissions.status,
        externalId: submissions.externalId,
        errorCode: submissions.errorCode,
        message: submissions.message,
        lastAttempt: submissions.lastAttempt,
        submittedAt: submissions.submittedAt,
        verifiedAt: submissions.verifiedAt,
      })
      .from(submissions)
      .innerJoin(directories, eq(submissions.directoryId, directories.id))
      .where(eq(submissions.businessId, id))
      .orderBy(directories.name);

    const data = rows.map((r) => ({
      submissionId: r.submissionId,
      directoryId: r.directoryId,
      directoryName: r.directoryName,
      directorySlug: r.directorySlug,
      status: r.status as SubmissionStatus,
      externalId: r.externalId ?? null,
      errorCode: r.errorCode ?? null,
      message: r.message ?? null,
      lastAttempt: r.lastAttempt ? r.lastAttempt.toISOString() : null,
      submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
      verifiedAt: r.verifiedAt ? r.verifiedAt.toISOString() : null,
    }));

    return reply.send({ data });
  });

  // PATCH /api/submissions/:id
  fastify.patch('/submissions/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { status, message } = request.body as {
      status: SubmissionStatus;
      message?: string;
    };

    const setValues: Record<string, unknown> = {
      status,
      updatedAt: sql`now()`,
    };

    if (message !== undefined) {
      setValues.message = message;
    }

    if (status === 'submitting') {
      setValues.lastAttempt = sql`now()`;
    }

    const rows = await db
      .update(submissions)
      .set(setValues)
      .where(eq(submissions.id, id))
      .returning();

    if (rows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Submission not found',
      });
    }

    return reply.send({ data: rows[0] });
  });
}
