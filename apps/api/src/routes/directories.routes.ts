import type { FastifyInstance } from 'fastify';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { directories } from '../db/schema.js';

export default async function directoriesRoutes(fastify: FastifyInstance) {
  // GET /api/directories — list all, sorted by health urgency (down first, degraded, healthy), then name
  fastify.get('/directories', async (_request, reply) => {
    const rows = await db
      .select()
      .from(directories)
      .orderBy(
        sql`CASE health_status WHEN 'down' THEN 0 WHEN 'degraded' THEN 1 ELSE 2 END`,
        directories.name
      );

    return reply.send({ data: rows, meta: { count: rows.length } });
  });

  // POST /api/directories — create a new directory
  fastify.post('/directories', async (request, reply) => {
    const body = request.body as {
      name?: unknown;
      slug?: unknown;
      type?: unknown;
      dailyCap?: unknown;
      timeoutSeconds?: unknown;
      notes?: unknown;
    };

    const { name, slug, type, dailyCap, timeoutSeconds, notes } = body;

    if (!name || typeof name !== 'string') {
      return reply.status(400).send({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'name is required',
      });
    }

    if (!slug || typeof slug !== 'string') {
      return reply.status(400).send({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'slug is required',
      });
    }

    if (type !== 'browser' && type !== 'file_export' && type !== 'api') {
      return reply.status(400).send({
        error: true,
        code: 'VALIDATION_ERROR',
        message: "type must be 'browser', 'file_export', or 'api'",
      });
    }

    // Check slug uniqueness
    const existing = await db
      .select({ id: directories.id })
      .from(directories)
      .where(eq(directories.slug, slug as string));

    if (existing.length > 0) {
      return reply.status(400).send({
        error: true,
        code: 'SLUG_CONFLICT',
        message: 'Slug already exists — choose a unique identifier',
      });
    }

    const dailyCapNum = typeof dailyCap === 'number' ? dailyCap : Number(dailyCap ?? 10);
    const timeoutSecondsNum =
      typeof timeoutSeconds === 'number' ? timeoutSeconds : Number(timeoutSeconds ?? 30);

    const [newDirectory] = await db
      .insert(directories)
      .values({
        name: name as string,
        slug: slug as string,
        type: type as 'browser' | 'file_export' | 'api',
        apiConfig: { notes: typeof notes === 'string' ? notes : '' },
        rateLimits: { dailyCap: dailyCapNum, timeoutSeconds: timeoutSecondsNum },
        healthStatus: 'healthy',
        paused: false,
      })
      .returning();

    return reply.status(201).send({ data: newDirectory, meta: {} });
  });

  // POST /api/directories/:id/pause
  fastify.post('/directories/:id/pause', async (request, reply) => {
    const { id } = request.params as { id: string };

    const rows = await db
      .update(directories)
      .set({ paused: true })
      .where(eq(directories.id, id))
      .returning();

    if (rows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Directory not found',
      });
    }

    return reply.send({ data: rows[0], meta: {} });
  });

  // POST /api/directories/:id/resume
  fastify.post('/directories/:id/resume', async (request, reply) => {
    const { id } = request.params as { id: string };

    const rows = await db
      .update(directories)
      .set({ paused: false })
      .where(eq(directories.id, id))
      .returning();

    if (rows.length === 0) {
      return reply.status(404).send({
        error: true,
        code: 'NOT_FOUND',
        message: 'Directory not found',
      });
    }

    return reply.send({ data: rows[0], meta: {} });
  });
}
