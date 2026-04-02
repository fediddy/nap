import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { directories } from '../src/db/schema.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://nap:nap_dev_password@localhost:5432/nap_db',
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: true }
    : { rejectUnauthorized: false },
});

const db = drizzle(pool);

async function seed() {
  console.log('Seeding directories...');

  await db.insert(directories).values([
    {
      name: 'Bing Places',
      slug: 'bing-places',
      type: 'file_export',
      apiConfig: {
        exportFormat: 'xlsx',
        uploadUrl: 'https://www.bingplaces.com',
      },
      rateLimits: {
        dailyCap: 50,
        timeoutSeconds: 30,
      },
      healthStatus: 'healthy',
      paused: false,
    },
    {
      name: 'Facebook Business',
      slug: 'facebook-business',
      type: 'browser',
      apiConfig: {
        loginUrl: 'https://www.facebook.com',
        createPageUrl: 'https://www.facebook.com/pages/create',
      },
      rateLimits: {
        dailyCap: 10,
        timeoutSeconds: 180,
      },
      healthStatus: 'healthy',
      paused: false,
    },
    {
      name: 'Yelp',
      slug: 'yelp',
      type: 'browser',
      apiConfig: {
        claimUrl: 'https://biz.yelp.com/claim',
      },
      rateLimits: {
        dailyCap: 10,
        timeoutSeconds: 180,
      },
      healthStatus: 'healthy',
      paused: false,
    },
  ]).onConflictDoNothing();

  console.log('Seeding complete.');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
