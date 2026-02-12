import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { generateToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@project/shared/constants';
import type { User, LoginResponse } from '@project/shared/types';

const SALT_ROUNDS = 12;

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const result = await query<UserRow>(
    'SELECT id, email, name, role, password_hash, created_at, updated_at FROM users WHERE email = $1',
    [email],
  );

  const row = result.rows[0];
  if (!row) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password');
  }

  const user: Omit<User, 'updatedAt'> = {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };

  const token = generateToken(user);

  return { token, user };
}

export async function registerUser(
  email: string,
  name: string,
  password: string,
): Promise<LoginResponse> {
  const existing = await query<{ id: number }>(
    'SELECT id FROM users WHERE email = $1',
    [email],
  );

  if (existing.rows.length > 0) {
    throw new AppError(HTTP_STATUS.CONFLICT, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await query<UserRow>(
    `INSERT INTO users (email, name, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, name, role, created_at`,
    [email, name, passwordHash, 'user'],
  );

  const row = result.rows[0];
  if (!row) {
    throw new AppError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create user');
  }

  const user: Omit<User, 'updatedAt'> = {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };

  const token = generateToken(user);

  return { token, user };
}

export async function getUserById(
  id: number,
): Promise<Omit<User, 'updatedAt'> | undefined> {
  const result = await query<UserRow>(
    'SELECT id, email, name, role, created_at FROM users WHERE id = $1',
    [id],
  );

  const row = result.rows[0];
  if (!row) return undefined;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };
}
