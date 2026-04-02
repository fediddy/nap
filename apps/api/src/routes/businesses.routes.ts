import type { FastifyInstance } from 'fastify';
import { ilike, and, eq, asc, desc, count, or } from 'drizzle-orm';
import { businessProfileSchema } from '@nap/shared';
import { db } from '../db/connection.js';
import { businesses } from '../db/schema.js';

const SORTABLE_COLUMNS = ['name', 'category', 'status', 'createdAt'] as const;
type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export default async function businessesRoutes(fastify: FastifyInstance) {
  // GET /api/businesses
  fastify.get('/businesses', async (request, reply) => {
    const {
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortDir = 'desc',
    } = request.query as {
      status?: string;
      category?: string;
      search?: string;
      sortBy?: string;
      sortDir?: string;
    };

    const conditions = [];

    if (status === 'active' || status === 'deactivated') {
      conditions.push(eq(businesses.status, status));
    }
    if (category) {
      conditions.push(ilike(businesses.category, `%${category}%`));
    }
    if (search) {
      conditions.push(
        or(
          ilike(businesses.name, `%${search}%`),
          ilike(businesses.address, `%${search}%`)
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const col = SORTABLE_COLUMNS.includes(sortBy as SortableColumn)
      ? (sortBy as SortableColumn)
      : 'createdAt';
    const direction = sortDir === 'asc' ? asc : desc;
    const orderBy = direction(businesses[col]);

    const [rows, [{ value: total }]] = await Promise.all([
      db.select().from(businesses).where(where).orderBy(orderBy),
      db.select({ value: count() }).from(businesses).where(where),
    ]);

    return reply.send({ data: rows, meta: { count: Number(total) } });
  });

  // POST /api/businesses
  fastify.post('/businesses', async (request, reply) => {
    const result = businessProfileSchema.safeParse(request.body);

    if (!result.success) {
      return reply.status(400).send({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: result.error.errors.map((e) => ({
          field: e.path.join('.'),
          issue: e.message,
        })),
      });
    }

    const { name, address, city, state, zip, phone, category, website } = result.data;

    const [business] = await db
      .insert(businesses)
      .values({
        name,
        address,
        city,
        state,
        zip,
        phone,
        category,
        website: website || null,
        status: 'active',
      })
      .returning();

    return reply.status(201).send({ data: business, meta: {} });
  });
}
