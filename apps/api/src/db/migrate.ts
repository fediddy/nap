import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './connection.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, '../../drizzle/migrations');

console.log('Running database migrations...');
await migrate(db, { migrationsFolder });
console.log('Migrations complete.');

await pool.end();
