import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { directoryAccounts } from '../db/schema.js';

export default async function sessionRelayRoutes(fastify: FastifyInstance) {
  // POST /api/session-relay/:slug
  // Body: { label: string, cookies: string }
  // Upserts a directory account (creates or updates by slug+label)
  fastify.post('/session-relay/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const body = request.body as { label?: unknown; cookies?: unknown; userAgent?: unknown };

    if (!body.label || typeof body.label !== 'string') {
      return reply.status(400).send({ error: true, code: 'VALIDATION_ERROR', message: 'label is required' });
    }
    if (!body.cookies || typeof body.cookies !== 'string') {
      return reply.status(400).send({ error: true, code: 'VALIDATION_ERROR', message: 'cookies is required (JSON string)' });
    }

    // Validate cookies is parseable JSON
    try {
      JSON.parse(body.cookies);
    } catch {
      return reply.status(400).send({ error: true, code: 'VALIDATION_ERROR', message: 'cookies must be valid JSON' });
    }

    const label = body.label as string;
    const userAgent = typeof body.userAgent === 'string' ? body.userAgent : null;

    // Check for existing account with same slug+label
    const [existing] = await db
      .select({ id: directoryAccounts.id })
      .from(directoryAccounts)
      .where(and(eq(directoryAccounts.slug, slug), eq(directoryAccounts.label, label)));

    if (existing) {
      // Update cookies and reset status to active
      const [updated] = await db
        .update(directoryAccounts)
        .set({
          cookiesJson: body.cookies as string,
          userAgent,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(directoryAccounts.id, existing.id))
        .returning();

      const { cookiesJson: _, ...safeUpdated } = updated;
      return reply.send({ data: safeUpdated, meta: { action: 'updated' } });
    }

    // Insert new account
    const [created] = await db
      .insert(directoryAccounts)
      .values({
        slug,
        label,
        cookiesJson: body.cookies as string,
        userAgent,
        status: 'active',
      })
      .returning();

    const { cookiesJson: _, ...safeCreated } = created;
    return reply.status(201).send({ data: safeCreated, meta: { action: 'created' } });
  });

  // GET /api/session-relay/:slug — list accounts for a directory
  fastify.get('/session-relay/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const accounts = await db
      .select({
        id: directoryAccounts.id,
        slug: directoryAccounts.slug,
        label: directoryAccounts.label,
        status: directoryAccounts.status,
        pagesCreated: directoryAccounts.pagesCreated,
        lastUsedAt: directoryAccounts.lastUsedAt,
        createdAt: directoryAccounts.createdAt,
      })
      .from(directoryAccounts)
      .where(eq(directoryAccounts.slug, slug));

    return reply.send({ data: accounts, meta: { count: accounts.length } });
  });
}
