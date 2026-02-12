import { Router } from 'express';
import { pageRoutes } from './pages.js';
import { apiV1Routes } from './api/v1/index.js';

export const routes = Router();

// Page routes — render Nunjucks templates
routes.use('/', pageRoutes);

// API routes — return JSON
routes.use('/api/v1', apiV1Routes);
