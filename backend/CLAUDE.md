# Backend Context

> PROSE constraint: **Explicit Hierarchy** — this file adds backend-specific
> context on top of the root `CLAUDE.md`. Claude loads it automatically when
> working on files in `backend/`.

## Stack

- Node.js with TypeScript
- Express for HTTP routing and template rendering
- Nunjucks as the view engine (templates live in `frontend/views/`)
- PostgreSQL for persistence
- JWT for authentication
- Vitest for testing

## Directory Structure

```
backend/
├── src/
│   ├── routes/         # Express route handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── services/       # Business logic layer
│   ├── models/         # Database models and queries
│   ├── utils/          # Backend utility functions
│   └── types/          # Backend-only types (shared types in shared/)
├── migrations/         # Database schema migrations
└── tests/
    ├── unit/           # Unit tests
    └── integration/    # API integration tests
```

## Key Commands

- Dev server: `npm run dev:backend`
- Build: `npm run build:backend`
- Test: `npm test -- backend/`
- Migrate: `npm run migrate`
- Seed: `npm run seed`

## Routing

Express serves two kinds of routes:

- **Page routes** — render Nunjucks templates via `res.render()` with typed data
- **API routes** — return JSON at `/api/v1/` for progressive enhancement (AJAX)

Page routes handle native HTML form submissions using the POST → Redirect → GET
(PRG) pattern: validate server-side, redirect on success, re-render with errors
on failure. API routes remain RESTful JSON endpoints.

## Conventions

- Route → Service → Model layering — routes never access models directly
- All database queries use parameterized statements via the query builder
- Shared types imported from `@shared/types` — used for both API contracts and template data shapes
- Template data passed to `res.render()` must conform to shared types
- Backend owns *what data* to render; frontend owns *how it looks* (template markup)
- Environment config loaded from `backend/src/config.ts`, never raw `process.env`
