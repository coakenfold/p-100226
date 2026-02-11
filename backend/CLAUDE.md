# Backend Context

> PROSE constraint: **Explicit Hierarchy** — this file adds backend-specific
> context on top of the root `CLAUDE.md`. Claude loads it automatically when
> working on files in `backend/`.

## Stack

- Node.js with TypeScript
- Express for HTTP routing
- PostgreSQL for persistence
- JWT for authentication
- Jest for testing

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

## Conventions

- Route → Service → Model layering — routes never access models directly
- All database queries use parameterized statements via the query builder
- Shared types imported from `@shared/types` — API contracts defined there
- Environment config loaded from `backend/src/config.ts`, never raw `process.env`
