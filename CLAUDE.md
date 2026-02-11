# Project Instructions

> PROSE constraint: **Explicit Hierarchy** — this root file provides project-wide
> principles. Subdirectory `CLAUDE.md` files add domain-specific context that
> Claude discovers automatically by walking the directory tree.

## Architecture

- Monorepo with `frontend/` (React + TypeScript) and `backend/` (Node.js + TypeScript)
- Shared types live in `shared/types/`
- API follows RESTful conventions at `/api/v1/`

## Code Style

- Use ES modules (`import`/`export`), never CommonJS (`require`)
- Prefer named exports over default exports
- Use 2-space indentation
- Strict TypeScript — no `any` types (use `unknown` with type guards)

## Build & Test

- Install: `npm install`
- Build: `npm run build`
- Test all: `npm test`
- Test single file: `npm test -- path/to/test.ts`
- Lint: `npm run lint`
- Type check: `npm run typecheck`

## Git Workflow

- Branch naming: `feat/*`, `fix/*`, `docs/*`
- Write concise commit messages focusing on "why" not "what"
- Run `npm run lint && npm test` before committing

## Domain-Specific Context

Claude automatically loads the closest `CLAUDE.md` when working in subdirectories:

- @frontend/CLAUDE.md — React, components, styling
- @backend/CLAUDE.md — API routes, database, auth
- @shared/CLAUDE.md — Shared types and utilities

## Path-Scoped Rules

Modular rules in `.claude/rules/` load automatically based on file patterns.
See that directory for domain-specific coding standards.
