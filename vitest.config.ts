import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
    environmentMatchGlobs: [
      // Frontend tests need jsdom for DOM APIs
      ['frontend/**/*.test.ts', 'jsdom'],
      // Backend tests use node environment (default)
      ['backend/**/*.test.ts', 'node'],
    ],
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, './shared'),
      '@backend': resolve(__dirname, './backend/src'),
      '@frontend': resolve(__dirname, './frontend/src'),
    },
  },
});
