import type { User } from '@project/shared/types';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'updatedAt'>;
    }
  }
}

export {};
