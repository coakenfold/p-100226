# Frontend Context

> PROSE constraint: **Explicit Hierarchy** — this file adds frontend-specific
> context on top of the root `CLAUDE.md`. Claude loads it automatically when
> working on files in `frontend/`.

## Stack

- React 18 with TypeScript
- Vite for bundling
- CSS Modules for styling
- React Router for navigation
- React Testing Library + Jest for tests

## Directory Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Route-level page components
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API client functions
│   ├── utils/          # Frontend utility functions
│   └── types/          # Frontend-only types (shared types in shared/)
├── public/             # Static assets
└── tests/              # E2E and integration tests
```

## Key Commands

- Dev server: `npm run dev`
- Build: `npm run build:frontend`
- Test: `npm test -- frontend/`
- Storybook: `npm run storybook` (if available)

## Conventions

- API calls go through `frontend/src/services/` — components never call APIs directly
- Shared types imported from `@shared/types` — never duplicate type definitions
- State management via React Context for app-level state, hooks for component state
