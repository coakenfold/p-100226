import { Router } from 'express';

export const pageRoutes = Router();

pageRoutes.get('/', (_req, res) => {
  res.render('pages/index.njk', {
    title: 'Home',
  });
});
