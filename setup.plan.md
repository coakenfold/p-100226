# Project Setup Implementation Plan

## Overview

This is a Node.js monorepo with a progressively enhanced multipage application architecture:

- **Backend**: Express + TypeScript + PostgreSQL
- **Frontend**: Nunjucks templates + TypeScript progressive enhancement + Vite
- **Shared**: Common types, constants, and utilities

## Prerequisites

- Node.js 24
- PostgreSQL (for backend database)
- Git

---

## Phase 1: Initial Setup

### 1.1 Root Configuration

- [x] Create root `package.json` with workspace configuration
  - Define workspaces: `["frontend", "backend", "shared"]`
  - Add root-level scripts for building, testing, and linting all packages
  - Install shared dev dependencies: TypeScript, ESLint, Prettier, etc.

- [x] Create root `tsconfig.json` as base configuration
  - Enable strict mode
  - Configure ES modules
  - Set up path aliases for `@shared/*`, `@backend/*`, `@frontend/*`

- [x] Create `.gitignore`
  - Ignore `node_modules/`, `dist/`, `.env*`, and build artifacts
  - Include `*.log`, coverage reports, and IDE-specific files

- [x] Create `.nvmrc` or `.node-version`
  - Specify Node.js 24

### 1.2 Environment Configuration

- [x] Create `.env.example` with required environment variables:

  ```
  NODE_ENV=development
  PORT=3000
  DATABASE_URL=postgresql://user:password@localhost:5432/dbname
  JWT_SECRET=your-secret-key
  ```

- [x] Create `backend/src/config.ts` for centralized configuration management

---

## Phase 2: Shared Package Setup

### 2.1 Package Configuration

- [x] Create `shared/package.json`
  - Name: `@project/shared`
  - Type: module
  - Main/exports configuration
  - Add TypeScript as dependency

- [x] Create `shared/tsconfig.json`
  - Extend root config
  - Set up for library compilation
  - Configure declaration files

### 2.2 Directory Structure

- [x] Create `shared/types/` directory with initial type files:
  - `shared/types/models.ts` — Domain entity types (User, etc.)
  - `shared/types/api.ts` — API request/response types
  - `shared/types/index.ts` — Re-export all types

- [x] Create `shared/constants/` directory:
  - `shared/constants/index.ts` — Shared constants (HTTP status codes, user roles, etc.)

- [x] Create `shared/utils/` directory:
  - `shared/utils/index.ts` — Pure utility functions (validation, formatting)

### 2.3 Build Configuration

- [x] Add build script to compile TypeScript to `dist/`
- [x] Configure TypeScript to generate type declarations

---

## Phase 3: Backend Setup

### 3.1 Package Configuration

- [x] Create `backend/package.json`
  - Name: `@project/backend`
  - Type: module
  - Add dependencies: Express, PostgreSQL client, JWT libraries, dotenv
  - Add dev dependencies: Vitest, TypeScript, type definitions
  - Link to shared package

- [x] Create `backend/tsconfig.json`
  - Extend root config
  - Configure for Node.js backend (CommonJS interop, module resolution)

### 3.2 Directory Structure

- [x] Create core backend directories:
  ```
  backend/
  ├── src/
  │   ├── index.ts              # Application entry point
  │   ├── app.ts                # Express app configuration
  │   ├── config.ts             # Environment configuration
  │   ├── routes/               # Route handlers
  │   │   ├── index.ts          # Route aggregation
  │   │   ├── pages.ts          # Page routes (render templates)
  │   │   └── api/              # API routes (JSON responses)
  │   │       └── v1/
  │   ├── middleware/           # Custom middleware
  │   │   ├── auth.ts           # JWT authentication
  │   │   ├── validation.ts     # Request validation
  │   │   └── errorHandler.ts   # Error handling
  │   ├── services/             # Business logic
  │   ├── models/               # Database models
  │   ├── utils/                # Backend utilities
  │   └── types/                # Backend-specific types
  ├── migrations/               # Database migrations
  └── tests/
      ├── unit/
      └── integration/
  ```

### 3.3 Express Configuration

- [x] Create `backend/src/app.ts`:
  - Configure Express instance
  - Set up Nunjucks as view engine pointing to `frontend/views/`
  - Configure static file serving from `frontend/public/`
  - Set up middleware (JSON parsing, CORS, etc.)
  - Register routes
  - Add error handling middleware

- [x] Create `backend/src/index.ts`:
  - Import app from `app.ts`
  - Start server on configured port
  - Handle graceful shutdown

### 3.4 Database Setup

- [x] Create database connection module `backend/src/db.ts`:
  - Configure PostgreSQL connection pool
  - Export query function with parameterized query support

- [x] Create initial migration file `backend/migrations/001_initial.sql`:
  - Users table schema
  - Any other core tables

- [x] Add migration script to `package.json`

### 3.5 Authentication

- [x] Create `backend/src/middleware/auth.ts`:
  - JWT token verification
  - User session management
  - Protected route middleware

- [x] Create authentication service `backend/src/services/auth.ts`:
  - Login/logout logic
  - Token generation
  - Password hashing (bcrypt)

### 3.6 Testing Setup

- [x] Create `backend/vitest.config.ts`
- [x] Create sample test file `backend/tests/unit/example.test.ts`
- [x] Create sample integration test `backend/tests/integration/api.test.ts`

---

## Phase 4: Frontend Setup

### 4.1 Package Configuration

- [x] Create `frontend/package.json`
  - Name: `@project/frontend`
  - Type: module
  - Add dependencies: Nunjucks (for type definitions)
  - Add dev dependencies: Vite, TypeScript, PostCSS, Playwright, Vitest
  - Link to shared package

- [x] Create `frontend/tsconfig.json`
  - Extend root config
  - Configure for browser environment
  - Enable DOM types

### 4.2 Directory Structure

- [x] Create frontend directories:
  ```
  frontend/
  ├── views/
  │   ├── layouts/
  │   │   └── base.njk         # Base HTML layout
  │   ├── pages/
  │   │   ├── index.njk         # Home page
  │   │   └── 404.njk           # Error page
  │   └── partials/
  │       ├── header.njk
  │       └── footer.njk
  ├── public/
  │   ├── css/
  │   │   └── main.css          # Global styles
  │   ├── js/                   # Compiled enhancer scripts (build output)
  │   └── images/
  ├── src/
  │   ├── enhancers/            # Progressive enhancement scripts
  │   │   └── example.ts
  │   ├── utils/                # Frontend utilities
  │   └── types/                # Frontend-specific types
  └── tests/
      ├── e2e/                  # Playwright tests
      └── unit/                 # Vitest tests
  ```

### 4.3 Vite Configuration

- [x] Create `frontend/vite.config.ts`:
  - Configure build for multiple entry points (enhancer scripts)
  - Set output directory to `public/js/`
  - Configure CSS processing
  - Set up source maps for development

### 4.4 Template Setup

- [x] Create base layout `frontend/views/layouts/base.njk`:
  - HTML boilerplate with semantic HTML5
  - Meta tags (viewport, charset, description)
  - CSS link tags
  - Script tags for progressive enhancement (deferred)
  - Content blocks for page-specific content

- [x] Create home page template `frontend/views/pages/index.njk`:
  - Extend base layout
  - Sample content demonstrating data binding

- [x] Create shared partials:
  - Header with navigation
  - Footer

### 4.5 Styles Setup

- [x] Create `frontend/public/css/main.css`:
  - CSS reset/normalize
  - CSS custom properties (design tokens)
  - Base typography
  - Layout utilities

- [ ] Optional: Create `frontend/postcss.config.js` for PostCSS plugins

### 4.6 Progressive Enhancement Setup

- [x] Create sample enhancer `frontend/src/enhancers/example.ts`:
  - Demonstrates `data-enhance` pattern
  - Shows how to enhance server-rendered markup
  - Includes event listeners and DOM manipulation

### 4.7 Testing Setup

- [x] Create `frontend/vitest.config.ts`
- [x] Create `frontend/playwright.config.ts`:
  - Configure base URL
  - Set up test browsers
  - Configure test directory

- [x] Create sample E2E test `frontend/tests/e2e/home.spec.ts`

---

## Phase 5: Development Tooling

### 5.1 Linting & Formatting

- [x] Create `.eslintrc.json` or `eslint.config.js`:
  - TypeScript parser
  - Recommended rules
  - Import resolution for path aliases

- [x] Create `.prettierrc`:
  - 2-space indentation
  - Single quotes
  - Trailing commas

- [x] Create `.prettierignore`:
  - Ignore dist/, coverage/, etc.

### 5.2 Git Hooks (optional)

- [x] Install husky for git hooks
- [x] Create pre-commit hook to run linting and type checking
- [x] Create pre-push hook to run tests

### 5.3 Scripts Organization

Add to root `package.json`:

```json
{
  "scripts": {
    "dev": "npm run dev:backend",
    "dev:backend": "npm run -w @project/backend dev",
    "dev:frontend": "npm run -w @project/frontend dev",
    "build": "npm run build:shared && npm run build:backend && npm run build:frontend",
    "build:shared": "npm run -w @project/shared build",
    "build:backend": "npm run -w @project/backend build",
    "build:frontend": "npm run -w @project/frontend build",
    "test": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:unit": "vitest run",
    "test:e2e": "npm run -w @project/frontend test:e2e",
    "lint": "eslint . --ext .ts,.js",
    "typecheck": "tsc --noEmit",
    "format": "prettier --write \"**/*.{ts,js,json,md,css}\"",
    "clean": "rm -rf **/dist **/node_modules"
  }
}
```

---

## Phase 6: PROSE/Claude Integration

### 6.1 Create `.claude/` Directory

- [ ] Create `.claude/rules/` directory for path-scoped instructions:
  - `frontend.md` — Frontend coding standards (paths: `frontend/**/*.{ts,css,njk}`)
  - `backend.md` — Backend coding standards (paths: `backend/**/*.ts`)
  - `testing.md` — Testing guidelines (paths: `**/*.test.ts`)
  - `security.md` — Security best practices (paths: `**/*auth*`, `**/*token*`)

### 6.2 Create Skills Directory

- [ ] Create `.claude/skills/` directory with specialized workflows:
  - `architect/SKILL.md` — Planning mode (no code edits)
  - `frontend-engineer/SKILL.md` — UI specialist mode
  - `backend-engineer/SKILL.md` — API specialist mode
  - `technical-writer/SKILL.md` — Documentation mode
  - `code-review/SKILL.md` — Code review workflow
  - `implement-feature/SKILL.md` — Spec-to-code workflow
  - `debug/SKILL.md` — Systematic debugging workflow
  - `spec/SKILL.md` — Generate spec templates
  - `perf/SKILL.md` — Performance optimization

---

## Phase 7: Verification & Documentation

### 7.1 Smoke Tests

- [ ] Verify root install: `npm install`
- [ ] Verify build: `npm run build`
- [ ] Verify typecheck: `npm run typecheck`
- [ ] Verify lint: `npm run lint`
- [ ] Verify all tests pass: `npm test`

### 7.2 Development Workflow Test

- [ ] Start backend dev server: `npm run dev:backend`
- [ ] Verify server starts and listens on configured port
- [ ] Open browser and verify home page renders
- [ ] Test API endpoints with curl/Postman
- [ ] Verify hot reload works for backend changes

- [ ] Start frontend asset watcher: `npm run dev:frontend`
- [ ] Verify Vite builds and watches frontend assets
- [ ] Test progressive enhancement scripts load and execute
- [ ] Verify hot reload works for CSS changes

### 7.3 Documentation

- [ ] Create/update `README.md`:
  - Project overview
  - Prerequisites
  - Installation steps
  - Development workflow
  - Testing instructions
  - Deployment guidelines
  - Architecture overview

- [ ] Document environment variables in `.env.example`
- [ ] Document API endpoints (consider OpenAPI/Swagger)
- [ ] Add inline code comments for complex logic

---

## Phase 8: Optional Enhancements

### 8.1 CI/CD Pipeline

- [ ] Create `.github/workflows/ci.yml`:
  - Install dependencies
  - Run linting and type checking
  - Run all tests
  - Build all packages
  - Upload coverage reports

### 8.2 Docker Setup

- [ ] Create `Dockerfile` for backend
- [ ] Create `docker-compose.yml`:
  - Backend service
  - PostgreSQL service
  - Volume mounts for development

### 8.3 Monitoring & Logging

- [ ] Set up structured logging (Winston, Pino)
- [ ] Add request logging middleware
- [ ] Configure error tracking (Sentry, etc.)

### 8.4 Performance

- [ ] Add compression middleware
- [ ] Configure caching headers
- [ ] Set up CDN for static assets (production)

---

## Implementation Order

**Recommended sequence:**

1. **Phase 1** — Root setup (5-10 min)
2. **Phase 2** — Shared package (10-15 min)
3. **Phase 3** — Backend core (30-45 min)
4. **Phase 4** — Frontend core (30-45 min)
5. **Phase 5** — Tooling (15-20 min)
6. **Phase 6** — Claude integration (15-20 min)
7. **Phase 7** — Verification (10-15 min)
8. **Phase 8** — Optional, as needed

**Total estimated time:** 2-3 hours for core setup (Phases 1-7)

---

## Success Criteria

✅ All packages install without errors
✅ TypeScript compiles without errors
✅ All linting passes
✅ All tests pass
✅ Backend server starts and serves pages
✅ Frontend assets build and load correctly
✅ Progressive enhancement scripts execute
✅ Database migrations run successfully
✅ Authentication flow works end-to-end
✅ E2E tests pass in headless browser

---

## Notes

- This plan follows the architecture described in the project's `CLAUDE.md` files
- The project uses ES modules throughout (no CommonJS)
- Named exports are preferred over default exports
- All types are strictly typed (no `any`)
- The frontend is progressively enhanced — works without JavaScript
- Backend serves both HTML pages (via Nunjucks) and JSON APIs
- Shared types ensure consistency between frontend and backend
