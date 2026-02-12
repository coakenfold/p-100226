import { describe, it, expect } from 'vitest';
import { HTTP_STATUS, USER_ROLES } from '@project/shared/constants';
import { isValidEmail, formatDate } from '@project/shared/utils';

describe('shared constants', () => {
  it('exports expected HTTP status codes', () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.CREATED).toBe(201);
    expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });

  it('exports expected user roles', () => {
    expect(USER_ROLES.ADMIN).toBe('admin');
    expect(USER_ROLES.USER).toBe('user');
    expect(USER_ROLES.GUEST).toBe('guest');
  });
});

describe('shared utils', () => {
  it('validates email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user@sub.example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });

  it('formats ISO date strings', () => {
    const formatted = formatDate('2024-01-15T09:30:00.000Z');
    expect(formatted).toContain('Jan');
    expect(formatted).toContain('15');
    expect(formatted).toContain('2024');
  });
});
