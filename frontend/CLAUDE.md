# Frontend Context

> PROSE constraint: **Explicit Hierarchy** — this file adds frontend-specific
> context on top of the root `CLAUDE.md`. Claude loads it automatically when
> working on files in `frontend/`.

## Stack

- Nunjucks for server-rendered HTML templates
- Vite for CSS and JavaScript asset bundling
- Vanilla TypeScript for progressive enhancement scripts
- Playwright for end-to-end testing
- Vitest for unit testing enhancers and utilities

## Philosophy

This is a **progressively enhanced multipage application**:

- Every page works fully without JavaScript — HTML and CSS first
- JavaScript enhances existing server-rendered markup, never replaces it
- Navigation uses standard links and full page loads — no client-side routing
- Forms submit natively with server-side validation; JS validation is an enhancement
- Interactive behaviors bind to server-rendered elements via `data-` attributes

## Directory Structure

```
frontend/
├── views/              # Nunjucks templates (rendered by Express)
│   ├── layouts/        # Base layouts (head, nav, footer)
│   ├── pages/          # Full page templates
│   └── partials/       # Reusable template fragments
├── public/             # Static assets served directly
│   ├── css/            # Stylesheets
│   ├── js/             # Compiled enhancement scripts
│   └── images/         # Static images
├── src/
│   ├── enhancers/      # TypeScript modules for progressive enhancement
│   ├── utils/          # Frontend utility functions
│   └── types/          # Frontend-only types (shared types in shared/)
└── tests/
    ├── e2e/            # Playwright page-level tests
    └── unit/           # Unit tests for enhancers and utilities
```

## Key Commands

- Dev server: `npm run dev`
- Build: `npm run build:frontend`
- Test unit: `npm test -- frontend/`
- Test E2E: `npm run test:e2e`

## Conventions

- Templates rendered by Express — backend routes call `res.render()` with page data
- Shared types imported from `@shared/types` — used for both API contracts and template data shapes
- Enhancer scripts use `data-enhance="<name>"` attributes to find and bind to elements
- No inline `<script>` blocks — all JS lives in `src/enhancers/` and is bundled by Vite
- CSS is plain CSS (or PostCSS) — no CSS-in-JS or CSS Modules
