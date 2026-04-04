import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { businesses } from '../db/schema.js';

interface BusinessUpdate {
  id: string;
  fields: Partial<{
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    category: string;
    website: string;
  }>;
}

export default async function bulkRoutes(fastify: FastifyInstance) {
  fastify.patch('/businesses/bulk', async (request, reply) => {
    const body = request.body as { updates?: BusinessUpdate[] };

    if (!body.updates || !Array.isArray(body.updates) || body.updates.length === 0) {
      return reply.status(400).send({ error: true, code: 'MISSING_UPDATES', message: 'updates array is required' });
    }

    let updated = 0;
    let unchanged = 0;

    await db.transaction(async (tx) => {
      for (const update of body.updates!) {
        if (!update.id || !update.fields || Object.keys(update.fields).length === 0) {
          unchanged++;
          continue;
        }

        const updateValues: Record<string, unknown> = {
          ...update.fields,
          updatedAt: new Date(),
        };

        await tx
          .update(businesses)
          .set(updateValues)
          .where(eq(businesses.id, update.id));

        updated++;
      }
    });

    return reply.status(200).send({
      data: { updated, unchanged },
      meta: {},
    });
  });
}
