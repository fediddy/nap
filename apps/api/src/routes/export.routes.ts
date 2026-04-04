import type { FastifyInstance } from 'fastify';
import { eq, and } from 'drizzle-orm';
import Papa from 'papaparse';
import { db } from '../db/connection.js';
import { businesses, directories, submissions } from '../db/schema.js';

export default async function exportRoutes(fastify: FastifyInstance) {
  // GET /api/export/businesses
  fastify.get('/export/businesses', async (request, reply) => {
    const { status, includeSubmissions } = request.query as {
      status?: string;
      includeSubmissions?: string;
    };

    // Build where clause
    const conditions = [];
    if (status === 'active' || status === 'deactivated') {
      conditions.push(eq(businesses.status, status));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const businessRows = await db.select().from(businesses).where(where);

    const date = new Date().toISOString().slice(0, 10);

    if (includeSubmissions !== 'true') {
      // Basic export
      const rows = businessRows.map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        city: b.city,
        state: b.state,
        zip: b.zip,
        phone: b.phone,
        category: b.category,
        website: b.website ?? '',
        status: b.status,
        createdAt: b.createdAt.toISOString(),
      }));

      const csv = Papa.unparse(rows);
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="nap-export-${date}.csv"`);
      return reply.send(csv);
    }

    // With submissions: join all submissions + directories
    const [allSubmissions, allDirectories] = await Promise.all([
      db.select().from(submissions),
      db.select().from(directories),
    ]);

    // Index submissions by businessId -> directoryId -> submission
    const submissionIndex = new Map<string, Map<string, typeof allSubmissions[0]>>();
    for (const sub of allSubmissions) {
      if (!submissionIndex.has(sub.businessId)) {
        submissionIndex.set(sub.businessId, new Map());
      }
      submissionIndex.get(sub.businessId)!.set(sub.directoryId, sub);
    }

    // Index directories by id
    const directoryById = new Map(allDirectories.map((d) => [d.id, d]));

    const rows = businessRows.map((b) => {
      const base: Record<string, string> = {
        id: b.id,
        name: b.name,
        address: b.address,
        city: b.city,
        state: b.state,
        zip: b.zip,
        phone: b.phone,
        category: b.category,
        website: b.website ?? '',
        status: b.status,
        createdAt: b.createdAt.toISOString(),
      };

      const businessSubs = submissionIndex.get(b.id);

      for (const dir of allDirectories) {
        const sub = businessSubs?.get(dir.id);
        base[`${dir.slug}_status`] = sub?.status ?? '';
        base[`${dir.slug}_externalId`] = sub?.externalId ?? '';
      }

      return base;
    });

    const csv = Papa.unparse(rows);
    reply.header('Content-Type', 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="nap-export-${date}.csv"`);
    return reply.send(csv);
  });

  // GET /api/export/nap-consistency
  fastify.get('/export/nap-consistency', async (_request, reply) => {
    const allBusinesses = await db.select().from(businesses);

    const phoneRegex = /^\+?1?\s*\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    const zipRegex = /^\d{5}(-\d{4})?$/;

    const results: Array<{
      businessId: string;
      businessName: string;
      issues: Array<{ field: 'phone' | 'address' | 'website' | 'name'; issue: string }>;
    }> = [];

    for (const b of allBusinesses) {
      const issues: Array<{ field: 'phone' | 'address' | 'website' | 'name'; issue: string }> = [];

      // Phone check
      if (!phoneRegex.test(b.phone.trim())) {
        issues.push({ field: 'phone', issue: 'Phone number is not a valid US format (10-digit)' });
      }

      // Website check
      if (b.website) {
        if (!/^https?:\/\//i.test(b.website)) {
          issues.push({ field: 'website', issue: 'Website is missing http:// or https:// protocol' });
        }
        if (/\s/.test(b.website)) {
          issues.push({ field: 'website', issue: 'Website URL contains spaces' });
        }
      }

      // Name check
      if (/[<>&"]/.test(b.name)) {
        issues.push({ field: 'name', issue: 'Name contains special characters (<, >, &, ")' });
      }

      // Address / zip check
      if (!zipRegex.test(b.zip.trim())) {
        issues.push({ field: 'address', issue: 'Zip code is not a valid 5-digit or ZIP+4 format' });
      }

      // City/State check
      if (!b.city || b.city.trim() === '' || /\d/.test(b.city)) {
        issues.push({ field: 'address', issue: 'City is empty or contains numbers' });
      }
      if (!b.state || b.state.trim() === '' || /\d/.test(b.state)) {
        issues.push({ field: 'address', issue: 'State is empty or contains numbers' });
      }

      if (issues.length > 0) {
        results.push({
          businessId: b.id,
          businessName: b.name,
          issues,
        });
      }
    }

    return reply.send({
      data: results,
      meta: {
        totalChecked: allBusinesses.length,
        issuesFound: results.length,
      },
    });
  });
}
