import pino from 'pino';
import pinoHttp, { type HttpLogger } from 'pino-http';
import type { IncomingMessage } from 'node:http';
import { config } from '../config.js';

const isDev = config.env === 'development';

export const logger = pino({
  level: config.log.level,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
      },
    },
  }),
});

export function createHttpLogger(): HttpLogger {
  return pinoHttp({
    logger,
    autoLogging: {
      ignore: (req: IncomingMessage) => req.url === '/favicon.ico',
    },
  });
}
