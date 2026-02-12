# Vitest & Playwright Configuration Issue Resolution

**Date:** 2026-02-11
**Status:** Resolved

## Problem Summary

Encountered multiple test configuration issues preventing git push:

1. TypeScript compilation errors for frontend code (DOM types not found)
2. Vitest attempting to run Playwright test files (framework conflict)
3. Frontend unit tests missing DOM environment (`document is not defined`)
4. Pre-push hook failing due to e2e tests requiring browsers/server

## Root Causes

### Issue 1: TypeScript DOM Errors

The root `typecheck` script ran `tsc --noEmit` against the root `tsconfig.json`, which has `lib: ["ES2022"]` without DOM types. This is correct for backend but fails for frontend code that needs browser APIs like `HTMLElement` and `document`.

**Error:**

```
frontend/src/enhancers/example.ts(9,24): error TS2304: Cannot find name 'HTMLElement'.
frontend/src/enhancers/example.ts(24,19): error TS2584: Cannot find name 'document'.
```

### Issue 2: Playwright/Vitest Conflict

Vitest was discovering and attempting to run Playwright test files from `tests/e2e/`, causing a framework conflict since Playwright's test API is incompatible with Vitest.

**Error:**

```
Error: Playwright Test did not expect test.describe() to be called here.
```

### Issue 3: Missing DOM Environment

When running `vitest run` from the root, it didn't respect the frontend workspace's `vitest.config.ts` with `environment: 'jsdom'`, causing frontend tests to fail with `document is not defined`.

### Issue 4: Pre-push Hook Failures

The pre-push hook ran `npm test`, which included e2e tests that require:

- Running development server on localhost:3000
- Installed Playwright browsers

## Solutions Implemented

### 1. Workspace-Specific TypeScript Checking

**File:** `package.json`

```json
{
  "scripts": {
    "typecheck": "npm run typecheck:shared && npm run typecheck:backend && npm run typecheck:frontend",
    "typecheck:shared": "tsc --project shared/tsconfig.json --noEmit",
    "typecheck:backend": "tsc --project backend/tsconfig.json --noEmit",
    "typecheck:frontend": "tsc --project frontend/tsconfig.json --noEmit"
  }
}
```

This ensures each workspace uses its own `tsconfig.json` with appropriate library definitions:

- Frontend gets DOM types (`HTMLElement`, `document`, etc.)
- Backend gets only Node.js types
- Shared gets pure JavaScript types

### 2. Root Vitest Configuration with Environment Matching

**File:** `vitest.config.ts` (new file at root)

```typescript
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
```

Key features:

- `exclude` pattern prevents Vitest from discovering Playwright tests
- `environmentMatchGlobs` automatically assigns correct test environment based on file path
- Centralizes path aliases for the monorepo

### 3. Frontend Vitest Config Enhancement

**File:** `frontend/vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/tests/e2e/**'], // Added
    globals: true,
  },
  // ... rest of config
});
```

Added explicit `exclude` pattern for defense-in-depth, though the root config now handles this.

### 4. Updated Pre-Push Hook

**File:** `.husky/pre-push`

```bash
npm run test:unit && npm run test:integration
```

Changed from `npm test` to skip e2e tests, which:

- Require running development server
- Require installed Playwright browsers
- Are better suited for CI/CD pipeline

## Verification

All tests now pass:

```bash
$ npm run test:unit
✓ backend/tests/unit/example.test.ts (4 tests)
✓ frontend/tests/unit/example-enhancer.test.ts (3 tests)

$ npm run typecheck
✓ All workspaces type-check successfully

$ .husky/pre-push
✓ Pre-push validation passes
```

## Key Learnings

1. **Monorepo TypeScript**: Each workspace needs its own `tsconfig.json` with appropriate `lib` settings. Root-level type checking must respect workspace boundaries.

2. **Vitest Environment Matching**: Use `environmentMatchGlobs` in the root config to automatically assign test environments based on file patterns. This is cleaner than workspace-specific configs.

3. **Test Framework Separation**: Explicitly exclude e2e test directories from Vitest to prevent framework conflicts with Playwright.

4. **Git Hook Scope**: Pre-push hooks should only run fast, deterministic tests. Save integration and e2e tests for CI/CD where proper infrastructure is available.

## Architecture Notes

### Test Strategy by Layer

- **Unit Tests** (Vitest): Fast, isolated, no external dependencies
  - Backend: Node environment
  - Frontend: jsdom environment for DOM APIs
  - Run on: Local (pre-push) + CI/CD

- **Integration Tests** (Vitest): Database/API integration
  - Backend only
  - Run on: Local (pre-push) + CI/CD

- **E2E Tests** (Playwright): Full user flows across browsers
  - Frontend only
  - Requires: Running server + installed browsers
  - Run on: CI/CD only (skipped in pre-push)

### File Structure

```
project/
├── vitest.config.ts           # Root config with environment matching
├── frontend/
│   ├── vitest.config.ts       # Frontend-specific overrides
│   ├── playwright.config.ts   # E2E test config
│   └── tests/
│       ├── unit/              # Vitest (jsdom)
│       └── e2e/               # Playwright (excluded from Vitest)
├── backend/
│   ├── vitest.config.ts       # Backend-specific overrides
│   └── tests/
│       ├── unit/              # Vitest (node)
│       └── integration/       # Vitest (node)
└── shared/
    └── tests/                 # Vitest (node)
```

## Related Documentation

- TypeScript Configuration: See root `tsconfig.json` and workspace-specific configs
- Test Strategy: See `CLAUDE.md` files in each workspace
- Git Hooks: See `.husky/` directory
