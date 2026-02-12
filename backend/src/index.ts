import 'dotenv/config';
import { createApp } from './app.js';
import { config } from './config.js';
import { closePool } from './db.js';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(
    `Server running at http://${config.host}:${config.port} [${config.env}]`,
  );
});

// Graceful shutdown
function shutdown(signal: string): void {
  console.log(`\n${signal} received — shutting down gracefully`);
  server.close(async () => {
    await closePool();
    console.log('Server closed');
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
