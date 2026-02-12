/**
 * Centralized configuration management
 *
 * Loads and validates environment variables, providing type-safe access
 * to configuration values throughout the application.
 */

interface Config {
  env: string;
  port: number;
  host: string;
  database: {
    url: string;
    poolMin: number;
    poolMax: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origin: string;
  };
  log: {
    level: string;
  };
  sentry: {
    dsn: string | undefined;
  };
}

/**
 * Load and validate configuration from environment variables
 */
function loadConfig(): Config {
  const env = process.env['NODE_ENV'] || 'development';
  const port = parseInt(process.env['PORT'] || '3000', 10);
  const host = process.env['HOST'] || 'localhost';

  const databaseUrl = process.env['DATABASE_URL'];
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const jwtSecret = process.env['JWT_SECRET'];
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return {
    env,
    port,
    host,
    database: {
      url: databaseUrl,
      poolMin: parseInt(process.env['DATABASE_POOL_MIN'] || '2', 10),
      poolMax: parseInt(process.env['DATABASE_POOL_MAX'] || '10', 10),
    },
    jwt: {
      secret: jwtSecret,
      expiresIn: process.env['JWT_EXPIRES_IN'] || '7d',
    },
    cors: {
      origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
    },
    log: {
      level: process.env['LOG_LEVEL'] || 'info',
    },
    sentry: {
      dsn: process.env['SENTRY_DSN'],
    },
  };
}

export const config = loadConfig();

export { type Config };
