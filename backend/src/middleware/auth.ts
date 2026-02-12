import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { HTTP_STATUS } from '@project/shared/constants';
import type { User } from '@project/shared/types';

interface JwtPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header',
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      createdAt: '',
    };

    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      statusCode: HTTP_STATUS.UNAUTHORIZED,
    });
  }
}

export function generateToken(user: Omit<User, 'updatedAt' | 'createdAt'>): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return jwt.sign(
    payload,
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions,
  );
}
