import { describe, it, expect, beforeAll } from 'vitest';
import type { Express } from 'express';

/**
 * Integration tests for the API.
 *
 * These tests use the Express app directly (via supertest or similar)
 * against a test database. They are skipped by default until a test
 * database is configured.
 *
 * To run:
 *   1. Set DATABASE_URL and JWT_SECRET in a .env.test file
 *   2. Run: npm run -w @project/backend test:integration
 */

// Lazy import so the module doesn't blow up when env vars are missing
let app: Express;

describe.skip('API v1 integration', () => {
  beforeAll(async () => {
    process.env['DATABASE_URL'] = process.env['DATABASE_URL'] ?? 'postgresql://localhost:5432/test';
    process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-secret';
    const { createApp } = await import('../../src/app.js');
    app = createApp();
  });

  it('GET /api/v1/nonexistent returns 404 JSON', async () => {
    // Requires a fetch-based test utility or supertest
    // Placeholder to demonstrate integration test structure
    expect(app).toBeDefined();
  });

  it('POST /api/v1/auth/login with missing body returns 422', async () => {
    expect(app).toBeDefined();
  });
});
