import 'dotenv/config';
import * as Sentry from '@sentry/node';
import { config } from './config.js';
import { logger } from './utils/logger.js';
import { createApp } from './app.js';
import { closePool } from './db.js';

// Initialize Sentry before app creation
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    environment: config.env,
  });
  logger.info('Sentry initialized');
}

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  logger.info(
    `Server running at http://${config.host}:${config.port} [${config.env}]`
  );
});

// Graceful shutdown
function shutdown(signal: string): void {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(() => {
    closePool()
      .then(() => {
        logger.info('Server closed');
        process.exit(0);
      })
      .catch((err: unknown) => {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      });
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
