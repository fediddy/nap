import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './utils/logger.js';
import healthRoutes from './routes/health.routes.js';
import businessesRoutes from './routes/businesses.routes.js';
import importRoutes from './routes/import.routes.js';
import bulkRoutes from './routes/bulk.routes.js';
import directoriesRoutes from './routes/directories.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import propagationRoutes from './routes/propagation.routes.js';
import exportRoutes from './routes/export.routes.js';
import planRoutes from './routes/plan.routes.js';
import { submissionWorker } from './queues/submission.queue.js';

const server = Fastify({ logger });

await server.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN ?? false
    : true,
});

await server.register(healthRoutes, { prefix: '/api' });
await server.register(businessesRoutes, { prefix: '/api' });
await server.register(importRoutes, { prefix: '/api' });
await server.register(bulkRoutes, { prefix: '/api' });
await server.register(directoriesRoutes, { prefix: '/api' });
await server.register(submissionsRoutes, { prefix: '/api' });
await server.register(propagationRoutes, { prefix: '/api' });
await server.register(exportRoutes, { prefix: '/api' });
await server.register(planRoutes, { prefix: '/api' });

// Start BullMQ worker
server.log.info('BullMQ submission worker started');
void submissionWorker;

const start = async () => {
  try {
    await server.listen({
      port: Number(process.env.PORT ?? 3000),
      host: '0.0.0.0',
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
