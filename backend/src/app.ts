import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import nunjucks from 'nunjucks';
import { config } from './config.js';
import { routes } from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(): express.Express {
  const app = express();

  // View engine — Nunjucks templates live in frontend/views/
  const viewsPath = path.resolve(__dirname, '../../frontend/views');
  nunjucks.configure(viewsPath, {
    autoescape: true,
    express: app,
    noCache: config.env === 'development',
  });
  app.set('view engine', 'njk');

  // Static files — served from frontend/public/
  const publicPath = path.resolve(__dirname, '../../frontend/public');
  app.use(express.static(publicPath));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS
  app.use(cors({ origin: config.cors.origin }));

  // Routes
  app.use(routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
