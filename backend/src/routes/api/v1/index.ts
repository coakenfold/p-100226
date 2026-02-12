import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validation.js';
import { loginUser, registerUser, getUserById } from '../../../services/auth.js';
import { HTTP_STATUS } from '@project/shared/constants';
import { isValidEmail } from '@project/shared/utils';

export const apiV1Routes = Router();

// --- Auth routes ---

apiV1Routes.post(
  '/auth/login',
  validate([
    { field: 'email', required: true, type: 'string' },
    { field: 'password', required: true, type: 'string' },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      if (!isValidEmail(email)) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
          error: 'Validation Error',
          message: 'Invalid email format',
          statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        });
        return;
      }

      const result = await loginUser(email, password);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (err) {
      next(err);
    }
  },
);

apiV1Routes.post(
  '/auth/register',
  validate([
    { field: 'email', required: true, type: 'string' },
    { field: 'name', required: true, type: 'string', minLength: 1, maxLength: 255 },
    { field: 'password', required: true, type: 'string', minLength: 8 },
  ]),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, password } = req.body as {
        email: string;
        name: string;
        password: string;
      };

      if (!isValidEmail(email)) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
          error: 'Validation Error',
          message: 'Invalid email format',
          statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
        });
        return;
      }

      const result = await registerUser(email, name, password);
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (err) {
      next(err);
    }
  },
);

// --- User routes ---

apiV1Routes.get(
  '/users/me',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
          error: 'Unauthorized',
          message: 'Not authenticated',
          statusCode: HTTP_STATUS.UNAUTHORIZED,
        });
        return;
      }

      const user = await getUserById(req.user.id);
      if (!user) {
        res.status(HTTP_STATUS.NOT_FOUND).json({
          error: 'Not Found',
          message: 'User not found',
          statusCode: HTTP_STATUS.NOT_FOUND,
        });
        return;
      }

      res.status(HTTP_STATUS.OK).json({ user });
    } catch (err) {
      next(err);
    }
  },
);
