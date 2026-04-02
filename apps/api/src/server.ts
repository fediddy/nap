import Fastify from 'fastify';
import cors from '@fastify/cors';
import { logger } from './utils/logger.js';
import healthRoutes from './routes/health.routes.js';
import businessesRoutes from './routes/businesses.routes.js';

const server = Fastify({ logger });

await server.register(cors, {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGIN ?? false
    : true,
});

await server.register(healthRoutes, { prefix: '/api' });
await server.register(businessesRoutes, { prefix: '/api' });

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
