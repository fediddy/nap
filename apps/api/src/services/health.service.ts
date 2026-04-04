import { eq, sql } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { directories } from '../db/schema.js';
import { logger } from '../utils/logger.js';

/**
 * Auto-pause logic: if a directory accumulates >= 5 consecutive failures,
 * set it to paused + degraded and emit a warning log.
 * (BullMQ scheduling will be wired in Epic 3; this is the pure service layer.)
 */
export async function checkDirectoryFailureThreshold(
  directoryId: string,
  directoryName: string,
  consecutiveFailures: number
): Promise<void> {
  if (consecutiveFailures >= 5) {
    await db
      .update(directories)
      .set({ paused: true, healthStatus: 'degraded' })
      .where(eq(directories.id, directoryId));

    logger.warn({ directoryId, directoryName }, 'Directory auto-paused: 5 consecutive failures');
  }
}

/**
 * Mark a directory as healthy after a successful submission.
 * Paused state is intentionally left unchanged — operator must resume manually.
 */
export async function markDirectoryHealthy(directoryId: string): Promise<void> {
  await db
    .update(directories)
    .set({ healthStatus: 'healthy', lastHealthCheck: sql`now()` })
    .where(eq(directories.id, directoryId));
}

/**
 * Record a health check result and timestamp for a directory.
 */
export async function recordHealthCheck(
  directoryId: string,
  status: 'healthy' | 'degraded' | 'down'
): Promise<void> {
  await db
    .update(directories)
    .set({ healthStatus: status, lastHealthCheck: sql`now()` })
    .where(eq(directories.id, directoryId));
}
