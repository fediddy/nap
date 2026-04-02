import pino from 'pino';

export const logger = pino({
  redact: {
    paths: ['*.api_key', '*.password', '*.token', 'api_key', 'password', 'token'],
    censor: '[REDACTED]',
  },
  level: process.env.LOG_LEVEL ?? 'info',
  transport: process.env.NODE_ENV !== 'production'
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});
