import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'],
    globals: true,
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, '../shared'),
      '@frontend': resolve(__dirname, 'src'),
    },
  },
});
