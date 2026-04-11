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

    if (!slug || slug.length > 100) {
      return reply.status(400).send({ error: true, code: 'VALIDATION_ERROR', message: 'slug must be 1-100 characters' });
    }
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

    const isNew = !(await db
      .select({ id: directoryAccounts.id })
      .from(directoryAccounts)
      .where(and(eq(directoryAccounts.slug, slug), eq(directoryAccounts.label, label)))
      .then(r => r[0]));

    const [account] = await db
      .insert(directoryAccounts)
      .values({ slug, label, cookiesJson: body.cookies as string, userAgent, status: 'active' })
      .onConflictDoUpdate({
        target: [directoryAccounts.slug, directoryAccounts.label],
        set: {
          cookiesJson: body.cookies as string,
          userAgent,
          status: 'active',
          updatedAt: new Date(),
        },
      })
      .returning();

    const { cookiesJson: _, ...safeAccount } = account;
    return reply.status(isNew ? 201 : 200).send({ data: safeAccount, meta: { action: isNew ? 'created' : 'updated' } });
  });

  // GET /api/session-relay/:slug — list accounts for a directory
  fastify.get('/session-relay/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    if (!slug || slug.length > 100) {
      return reply.status(400).send({ error: true, code: 'VALIDATION_ERROR', message: 'slug must be 1-100 characters' });
    }

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
