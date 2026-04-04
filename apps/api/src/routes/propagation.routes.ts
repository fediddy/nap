import type { FastifyInstance } from 'fastify';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { businesses, directories, submissions } from '../db/schema.js';
import { getAdapter } from '../integrations/index.js';
import type { BusinessProfile } from '@nap/shared';

export default async function propagationRoutes(fastify: FastifyInstance) {
  // ─────────────────────────────────────────────
  // Story 4.1 — Push profile updates to active directory listings
  // POST /api/businesses/:id/push-updates
  // ─────────────────────────────────────────────
  fastify.post('/businesses/:id/push-updates', async (request, reply) => {
    const { id } = request.params as { id: string };

    // Fetch business
    const businessRows = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id));

    if (businessRows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Business not found',
      });
    }

    const business = businessRows[0] as unknown as BusinessProfile;

    // Find all submitted/verified submissions for this business, joined with directory info
    const activeSubmissions = await db
      .select({
        submissionId: submissions.id,
        externalId: submissions.externalId,
        directoryId: directories.id,
        directorySlug: directories.slug,
        directoryPaused: directories.paused,
      })
      .from(submissions)
      .innerJoin(directories, eq(submissions.directoryId, directories.id))
      .where(
        and(
          eq(submissions.businessId, id),
          inArray(submissions.status, ['submitted', 'verified'])
        )
      );

    const results: Array<{ directorySlug: string; status: string; reason?: string }> = [];
    let updated = 0;
    let failed = 0;

    await db.transaction(async (tx) => {
      for (const sub of activeSubmissions) {
        // Skip paused directories
        if (sub.directoryPaused) {
          results.push({ directorySlug: sub.directorySlug, status: 'skipped', reason: 'directory_paused' });
          continue;
        }

        if (!sub.externalId) {
          results.push({ directorySlug: sub.directorySlug, status: 'skipped', reason: 'no_external_id' });
          continue;
        }

        const adapter = getAdapter(sub.directorySlug);
        if (!adapter) {
          results.push({ directorySlug: sub.directorySlug, status: 'failed', reason: 'adapter_not_found' });
          failed++;
          await tx
            .update(submissions)
            .set({
              status: 'failed',
              errorCode: 'ADAPTER_NOT_FOUND',
              lastAttempt: sql`now()`,
              updatedAt: sql`now()`,
            })
            .where(eq(submissions.id, sub.submissionId));
          continue;
        }

        try {
          const result = await adapter.update(business, sub.externalId);
          const newStatus = result.status === 'failed' ? 'failed' : 'submitted';

          await tx
            .update(submissions)
            .set({
              status: newStatus,
              errorCode: result.status === 'failed' ? (result.errorCode ?? null) : null,
              lastAttempt: sql`now()`,
              updatedAt: sql`now()`,
            })
            .where(eq(submissions.id, sub.submissionId));

          if (result.status === 'failed') {
            failed++;
            results.push({ directorySlug: sub.directorySlug, status: 'failed' });
          } else {
            updated++;
            results.push({ directorySlug: sub.directorySlug, status: newStatus });
          }
        } catch {
          failed++;
          results.push({ directorySlug: sub.directorySlug, status: 'failed' });
          await tx
            .update(submissions)
            .set({
              status: 'failed',
              errorCode: 'UPDATE_ERROR',
              lastAttempt: sql`now()`,
              updatedAt: sql`now()`,
            })
            .where(eq(submissions.id, sub.submissionId));
        }
      }
    });

    return reply.send({ data: { updated, failed, results } });
  });

  // ─────────────────────────────────────────────
  // Story 4.2 — Per-directory business name override
  // POST /api/businesses/:id/name-override
  // GET  /api/businesses/:id/name-overrides
  // ─────────────────────────────────────────────
  fastify.post('/businesses/:id/name-override', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { directoryId, overrideName } = request.body as {
      directoryId?: unknown;
      overrideName?: unknown;
    };

    if (!directoryId || typeof directoryId !== 'string') {
      return reply.status(400).send({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'directoryId is required',
      });
    }

    if (!overrideName || typeof overrideName !== 'string' || overrideName.trim() === '') {
      return reply.status(400).send({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'overrideName is required and must be a non-empty string',
      });
    }

    // Verify business exists
    const businessRows = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.id, id));

    if (businessRows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Business not found',
      });
    }

    // Verify directory exists
    const directoryRows = await db
      .select({ id: directories.id, name: directories.name })
      .from(directories)
      .where(eq(directories.id, directoryId));

    if (directoryRows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Directory not found',
      });
    }

    const encodedOverride = JSON.stringify({ nameOverride: overrideName.trim() });

    // Upsert: check if a submission row exists for this business+directory
    const existingSubmissions = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(
        and(
          eq(submissions.businessId, id),
          eq(submissions.directoryId, directoryId)
        )
      );

    if (existingSubmissions.length > 0) {
      await db
        .update(submissions)
        .set({ message: encodedOverride, updatedAt: sql`now()` })
        .where(eq(submissions.id, existingSubmissions[0].id));
    } else {
      await db.insert(submissions).values({
        businessId: id,
        directoryId: directoryId,
        status: 'queued',
        message: encodedOverride,
      });
    }

    return reply.send({
      data: {
        businessId: id,
        directoryId: directoryId,
        directoryName: directoryRows[0].name,
        overrideName: overrideName.trim(),
      },
    });
  });

  fastify.get('/businesses/:id/name-overrides', async (request, reply) => {
    const { id } = request.params as { id: string };

    const rows = await db
      .select({
        directoryId: directories.id,
        directoryName: directories.name,
        message: submissions.message,
      })
      .from(submissions)
      .innerJoin(directories, eq(submissions.directoryId, directories.id))
      .where(eq(submissions.businessId, id));

    const overrides: Array<{ directoryId: string; directoryName: string; overrideName: string }> =
      [];

    for (const row of rows) {
      if (!row.message) continue;
      try {
        const parsed = JSON.parse(row.message) as { nameOverride?: string };
        if (typeof parsed.nameOverride === 'string') {
          overrides.push({
            directoryId: row.directoryId,
            directoryName: row.directoryName,
            overrideName: parsed.nameOverride,
          });
        }
      } catch {
        // not a name-override message, skip
      }
    }

    return reply.send({ data: overrides });
  });

  // ─────────────────────────────────────────────
  // Story 4.3 — Listing removal for deactivated businesses
  // POST /api/businesses/:id/remove-listings
  // ─────────────────────────────────────────────
  fastify.post('/businesses/:id/remove-listings', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { force } = (request.body as { force?: boolean }) ?? {};

    const businessRows = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, id));

    if (businessRows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Business not found',
      });
    }

    const business = businessRows[0];

    if (business.status !== 'deactivated' && !force) {
      return reply.status(400).send({
        error: true,
        code: 'BUSINESS_ACTIVE',
        message:
          'Business is still active. Pass { force: true } to remove listings anyway.',
      });
    }

    const activeSubmissions = await db
      .select({
        submissionId: submissions.id,
        externalId: submissions.externalId,
        directorySlug: directories.slug,
      })
      .from(submissions)
      .innerJoin(directories, eq(submissions.directoryId, directories.id))
      .where(
        and(
          eq(submissions.businessId, id),
          inArray(submissions.status, ['submitted', 'verified'])
        )
      );

    const results: Array<{ directorySlug: string; status: string }> = [];
    let removed = 0;
    let failed = 0;
    let skipped = 0;

    await db.transaction(async (tx) => {
      for (const sub of activeSubmissions) {
        if (!sub.externalId) {
          skipped++;
          results.push({ directorySlug: sub.directorySlug, status: 'skipped' });
          continue;
        }

        const adapter = getAdapter(sub.directorySlug);
        if (!adapter) {
          skipped++;
          results.push({ directorySlug: sub.directorySlug, status: 'skipped' });
          continue;
        }

        try {
          const result = await adapter.remove(sub.externalId);
          const newStatus = result.status === 'failed' ? 'failed' : 'removed';

          await tx
            .update(submissions)
            .set({
              status: newStatus,
              errorCode: result.status === 'failed' ? (result.message ?? null) : null,
              lastAttempt: sql`now()`,
              updatedAt: sql`now()`,
            })
            .where(eq(submissions.id, sub.submissionId));

          if (result.status === 'failed') {
            failed++;
            results.push({ directorySlug: sub.directorySlug, status: 'failed' });
          } else {
            removed++;
            results.push({ directorySlug: sub.directorySlug, status: 'removed' });
          }
        } catch {
          failed++;
          results.push({ directorySlug: sub.directorySlug, status: 'failed' });
          await tx
            .update(submissions)
            .set({
              status: 'failed',
              errorCode: 'REMOVAL_ERROR',
              lastAttempt: sql`now()`,
              updatedAt: sql`now()`,
            })
            .where(eq(submissions.id, sub.submissionId));
        }
      }
    });

    return reply.send({ data: { removed, failed, skipped, results } });
  });

  // ─────────────────────────────────────────────
  // Story 4.4 — Pause and resume directory submissions (business-level)
  // POST /api/businesses/:id/pause-submissions
  // POST /api/businesses/:id/resume-submissions
  // ─────────────────────────────────────────────
  fastify.post('/businesses/:id/pause-submissions', async (request, reply) => {
    const { id } = request.params as { id: string };

    const businessRows = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.id, id));

    if (businessRows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Business not found',
      });
    }

    const affected = await db
      .update(submissions)
      .set({
        status: 'requires_action',
        message: 'Paused by operator',
        updatedAt: sql`now()`,
      })
      .where(
        and(
          eq(submissions.businessId, id),
          eq(submissions.status, 'queued')
        )
      )
      .returning({ id: submissions.id });

    return reply.send({
      data: {
        paused: affected.length,
        message: `${affected.length} queued submission(s) paused`,
      },
    });
  });

  fastify.post('/businesses/:id/resume-submissions', async (request, reply) => {
    const { id } = request.params as { id: string };

    const businessRows = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.id, id));

    if (businessRows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Business not found',
      });
    }

    // Find submissions that were paused by operator (status=requires_action, message='Paused by operator')
    const pausedSubmissions = await db
      .select({ id: submissions.id })
      .from(submissions)
      .where(
        and(
          eq(submissions.businessId, id),
          eq(submissions.status, 'requires_action'),
          eq(submissions.message, 'Paused by operator')
        )
      );

    if (pausedSubmissions.length === 0) {
      return reply.send({
        data: {
          resumed: 0,
          message: 'No paused submissions found',
        },
      });
    }

    const pausedIds = pausedSubmissions.map((s) => s.id);

    await db
      .update(submissions)
      .set({
        status: 'queued',
        message: null,
        updatedAt: sql`now()`,
      })
      .where(inArray(submissions.id, pausedIds));

    return reply.send({
      data: {
        resumed: pausedIds.length,
        message: `${pausedIds.length} submission(s) resumed`,
      },
    });
  });
}
