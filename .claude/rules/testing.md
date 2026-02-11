---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/test/**"
  - "**/tests/**"
  - "**/__tests__/**"
---

# Testing Rules

> PROSE constraint: **Reduced Scope** — loaded only when working on test files,
> keeping test-specific guidance out of implementation context.

## Structure

- Unit tests co-located with source in `__tests__/` directories
- Integration tests in `tests/integration/`
- E2E tests in `frontend/tests/e2e/` using Playwright

## Conventions

- Name test files: `<ModuleName>.test.ts` or `<ModuleName>.spec.ts`
- Use descriptive `describe`/`it` blocks that read as sentences
- One logical assertion per test (multiple `expect` calls are fine if testing one behavior)

## Patterns

- Arrange-Act-Assert structure for each test
- Use factory functions for test data, not raw object literals
- Mock at module boundaries, not internal functions
- Prefer `jest.spyOn` over `jest.fn` when mocking existing methods

## E2E Testing (Playwright)

- Test pages with JavaScript both enabled and disabled to verify progressive enhancement
- Use accessible selectors (`getByRole`, `getByLabel`) over CSS selectors
- Test form submissions via native HTML submission, not just JS-enhanced paths

## Coverage

- New code must have tests — no untested features
- Target >90% line coverage for critical paths (auth, payments, data mutations)
- Don't write tests just for coverage — test behavior, not implementation
