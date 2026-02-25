# Project Monorepo

**Status**: Complete
**Last Updated**: 2026-02-24
**Related Files**:

- Implementation: `backend/src/`, `frontend/src/`, `frontend/views/`, `shared/`
- Tests: `frontend/tests/`, `backend/tests/`
- Spec: `phase8.plan.md`, `documentation/diagrams/`

---

## Overview

Project Monorepo is a progressively enhanced multipage web application. It combines a Node.js Express backend, Nunjucks server-rendered templates, and a PostgreSQL database into a single repository with three coordinated packages: `backend/`, `frontend/`, and `shared/`.

The application follows two core principles. First, every page works fully without JavaScript — the server renders complete HTML and sends it to the browser. Second, TypeScript runs on both the server and the client, and a shared package enforces type consistency across the boundary.

This document explains every major feature of the codebase: how routing works, how authentication is implemented, how shared types keep the stack consistent, and how the progressive enhancement pipeline operates.

---

## Architecture

### Monorepo Structure

The project is an npm workspace monorepo with three packages.

```
.
├── backend/       # Express server — routes, services, middleware, database
├── frontend/      # Nunjucks templates, Vite-compiled TypeScript enhancers
└── shared/        # Types, constants, and utilities shared by both packages
```

The `shared/` package is the source of truth for API contracts. Any type defined there is available to both `backend/` and `frontend/`. Changing a shared type propagates type errors to all consumers at compile time.

### Request Lifecycle

The application handles two kinds of requests.

**Page requests** follow this path:

1. The browser requests a URL (for example, `GET /about`).
2. The file-system router maps the URL to a Nunjucks template.
3. Express calls `res.render()` with the template path and page data.
4. Nunjucks renders a complete HTML document and sends it to the browser.
5. The browser loads CSS and, optionally, JavaScript enhancement scripts.

**API requests** follow this path:

1. JavaScript in the browser sends an AJAX request (for example, `POST /api/v1/auth/login`).
2. Express validation middleware checks the request body.
3. The route handler calls the service layer.
4. The service layer runs database queries and returns typed data.
5. The handler sends a JSON response.

### Technology Stack

| Layer             | Technology                           |
| ----------------- | ------------------------------------ |
| Runtime           | Node.js 24                           |
| Language          | TypeScript (strict mode, ES modules) |
| Backend framework | Express                              |
| Template engine   | Nunjucks                             |
| Database          | PostgreSQL 14+                       |
| Frontend build    | Vite                                 |
| Authentication    | JWT (JSON Web Token)                 |
| Logging           | Pino + pino-http                     |
| Error tracking    | Sentry                               |
| Unit testing      | Vitest                               |
| E2E testing       | Playwright                           |

---

## File-System Routing

### How It Works

The `createFileSystemRouter` function in `backend/src/utils/fsRouter.ts` automatically creates Express page routes by scanning the `frontend/views/pages/` directory at startup.

Every `.njk` file in that directory becomes a URL route. You do not write route handler code for pages. Adding a template file is sufficient to create a new page.

### Path Mapping Rules

The router derives URL paths from file paths using these conventions.

| File                   | URL          |
| ---------------------- | ------------ |
| `pages/index.njk`      | `/`          |
| `pages/about.njk`      | `/about`     |
| `pages/blog/index.njk` | `/blog`      |
| `pages/blog/post.njk`  | `/blog/post` |

Index files always map to the directory root. Named files map to their filename as a URL segment.

### Title Generation

The router also derives a page title from the filename. It converts kebab-case and snake_case filenames to Title Case and passes the title to the template as a variable.

| Filename         | Title        |
| ---------------- | ------------ |
| `index.njk`      | `Home`       |
| `about.njk`      | `About`      |
| `contact-us.njk` | `Contact Us` |

### Exclusion Rules

The router skips certain files during scanning.

- Files whose names start with `_` are skipped. Use this prefix for partial templates stored inside the pages directory.
- `404.njk` and `500.njk` are skipped. The error handler renders these files directly when needed.

### Route Ordering

The router sorts routes by specificity before registering them. More specific routes (longer paths) register first. This prevents a shallow wildcard from shadowing a deeper route.

### Inspector API

The `getFileSystemRoutes` function returns the full list of discovered routes without creating a router. This is useful for generating sitemaps or debugging route configuration.

```typescript
import { getFileSystemRoutes } from './utils/fsRouter.js';

const routes = getFileSystemRoutes(pagesDir);
// returns: Array<{ path: string; template: string; title: string }>
```

---

## Authentication

### Overview

Authentication uses JSON Web Tokens (JWT). A user registers or logs in and receives a token. The client sends that token in the `Authorization` header on subsequent requests. The `authenticate` middleware verifies the token before the route handler runs.

The system stores passwords as bcrypt hashes with a salt factor of 12. Plain-text passwords never persist to the database.

### User Registration

The `POST /api/v1/auth/register` endpoint creates a new user account.

**Validation rules:**

| Field      | Type   | Rules                                   |
| ---------- | ------ | --------------------------------------- |
| `email`    | string | Required. Must be a valid email format. |
| `name`     | string | Required. 1 to 255 characters.          |
| `password` | string | Required. Minimum 8 characters.         |

If a user with the same email already exists, the endpoint returns `409 Conflict`.

On success, the endpoint returns `201 Created` with a JWT token and the user's profile. The client can use the token immediately for authenticated requests.

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jane Doe",
    "role": "user",
    "createdAt": "2026-02-24T10:00:00.000Z"
  }
}
```

### User Login

The `POST /api/v1/auth/login` endpoint authenticates an existing user.

The service layer fetches the user record by email, then calls `bcrypt.compare` to verify the password against the stored hash. If either the email or the password is wrong, the endpoint returns `401 Unauthorized` with a generic message. The generic message prevents email enumeration.

On success, the endpoint returns `200 OK` with the same token-and-user shape as registration.

### JWT Token Structure

Tokens contain the following claims in their payload.

| Claim    | Value               |
| -------- | ------------------- |
| `userId` | Numeric database ID |
| `email`  | User email address  |
| `name`   | Display name        |
| `role`   | User role string    |

Tokens expire after 7 days by default. Set the `JWT_EXPIRES_IN` environment variable to change this duration. When a token expires, all authenticated requests return `401 Unauthorized`.

### The Authenticate Middleware

The `authenticate` middleware in `backend/src/middleware/auth.ts` protects routes. Apply it to any route that requires authentication.

```typescript
import { authenticate } from '../middleware/auth.js';

router.get('/users/me', authenticate, async (req, res) => {
  // req.user is available here
});
```

The middleware reads the `Authorization` header, extracts the Bearer token, and verifies it using the JWT secret. On success, it attaches the decoded user to `req.user` and calls `next()`. On failure, it returns `401 Unauthorized` without calling the route handler.

### Get Current User

The `GET /api/v1/users/me` endpoint returns the authenticated user's profile. The route requires authentication. If the token is valid but the user record no longer exists, the endpoint returns `404 Not Found`.

---

## Request Validation

The `validate` middleware in `backend/src/middleware/validation.ts` runs before route handlers on endpoints that accept request bodies. Pass an array of validation rules to configure it.

```typescript
router.post(
  '/auth/register',
  validate([
    { field: 'email', required: true, type: 'string' },
    {
      field: 'name',
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 255,
    },
    { field: 'password', required: true, type: 'string', minLength: 8 },
  ]),
  handler
);
```

Each rule can specify:

- `field` — The body property to validate.
- `required` — Whether the field must be present and non-empty.
- `type` — The expected JavaScript type (`'string'`, `'number'`, or `'boolean'`).
- `minLength` / `maxLength` — Length bounds for string values.
- `pattern` — A regular expression the value must match.
- `message` — A custom error message to use instead of the default.

When one or more rules fail, the middleware returns `422 Unprocessable Entity` with all error messages joined by semicolons. The route handler does not run.

---

## Error Handling

### Dual-Mode Responses

The error handler in `backend/src/middleware/errorHandler.ts` detects whether the incoming request is an API call or a page request. It uses the request path to make this determination: paths starting with `/api/` receive JSON error responses; all other paths receive HTML error pages.

This design ensures that API clients always receive machine-readable errors, while browser users always see a rendered error page.

### AppError

The `AppError` class extends the native `Error` class with an HTTP status code. Services and route handlers throw `AppError` instances to signal expected failure conditions.

```typescript
import { AppError } from '../middleware/errorHandler.js';
import { HTTP_STATUS } from '@project/shared/constants';

throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
```

The error handler catches `AppError` and uses its `statusCode` property directly. Any other error class triggers a `500 Internal Server Error` response.

### 404 Handling

The `notFoundHandler` middleware runs after all routes. It returns `404 Not Found` for any request that did not match a registered route. API requests receive a JSON body; page requests receive the `pages/404.njk` template.

### Sentry Integration

Errors with status codes of 500 or higher are reported to Sentry automatically. The `SENTRY_DSN` environment variable enables this integration. When `SENTRY_DSN` is not set, error tracking is silent.

---

## Shared Types and Utilities

### Purpose

The `shared/` package defines types, constants, and utility functions that both `backend/` and `frontend/` import. It is the single source of truth for API contracts.

Both packages import from the package alias `@project/shared`:

```typescript
import type { User, LoginResponse } from '@project/shared/types';
import { HTTP_STATUS, USER_ROLES } from '@project/shared/constants';
import { isValidEmail, formatDate } from '@project/shared/utils';
```

### Domain Types

`shared/types/models.ts` defines the core domain entity.

```typescript
export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
```

`ISODateString` is a type alias for `string`. It documents intent — these strings always conform to the ISO 8601 format — without introducing a `Date` object that cannot serialize to JSON.

### API Types

`shared/types/api.ts` defines request and response shapes for all endpoints.

| Type                   | Purpose                                      |
| ---------------------- | -------------------------------------------- |
| `LoginRequest`         | Body for `POST /api/v1/auth/login`           |
| `LoginResponse`        | Response from login and registration         |
| `RegisterRequest`      | Body for `POST /api/v1/auth/register`        |
| `ApiErrorResponse`     | Shape of all error responses                 |
| `PaginationParams`     | Query parameters for paginated endpoints     |
| `PaginatedResponse<T>` | Generic wrapper for paginated list responses |

### Constants

`shared/constants/index.ts` exports three constant objects.

**`HTTP_STATUS`** — Named HTTP status codes used throughout the backend.

```typescript
HTTP_STATUS.OK; // 200
HTTP_STATUS.CREATED; // 201
HTTP_STATUS.UNAUTHORIZED; // 401
HTTP_STATUS.UNPROCESSABLE_ENTITY; // 422
```

**`USER_ROLES`** — The set of valid role strings.

```typescript
USER_ROLES.ADMIN; // 'admin'
USER_ROLES.USER; // 'user'
USER_ROLES.GUEST; // 'guest'
```

**`PAGINATION`** — Default values for paginated queries.

```typescript
PAGINATION.DEFAULT_PAGE; // 1
PAGINATION.DEFAULT_LIMIT; // 20
PAGINATION.MAX_LIMIT; // 100
```

### Utility Functions

`shared/utils/index.ts` exports four pure functions. They have no side effects and no platform-specific dependencies, so both the browser and Node.js can use them.

| Function       | Signature                       | Description                                                    |
| -------------- | ------------------------------- | -------------------------------------------------------------- |
| `formatDate`   | `(isoString: string) => string` | Formats an ISO date string as `Jan 15, 2024`.                  |
| `isValidEmail` | `(email: string) => boolean`    | Returns true if the string matches a basic email pattern.      |
| `clamp`        | `(value, min, max) => number`   | Constrains a number to the range `[min, max]`.                 |
| `truncate`     | `(str, maxLength) => string`    | Shortens a string and appends `...` if it exceeds `maxLength`. |

---

## Frontend and Progressive Enhancement

### Philosophy

Every page in this application works fully without JavaScript. Nunjucks renders complete HTML on the server. CSS provides all visual styling. JavaScript loads asynchronously and adds behavior on top of what the server already rendered — it never replaces server content.

This approach means users on slow connections or devices without JavaScript see a functional page immediately. JavaScript enhancement is additive.

### Template System

Nunjucks renders templates from the `frontend/views/` directory. Express calls `res.render()` from route handlers with a template path and a data object.

```
frontend/views/
├── layouts/
│   └── base.njk       # Root HTML document structure
├── pages/
│   ├── index.njk      # Home page (maps to /)
│   ├── about.njk      # About page (maps to /about)
│   └── 404.njk        # 404 error page
└── partials/
    ├── header.njk     # Site navigation header
    └── footer.njk     # Site footer
```

The base layout (`layouts/base.njk`) defines the outer HTML document. Every page template extends it using `{% extends "layouts/base.njk" %}` and fills named blocks.

Available blocks:

| Block         | Purpose                                                 |
| ------------- | ------------------------------------------------------- | --------- |
| `title`       | The `<title>` tag content (appears before `             | Project`) |
| `description` | The meta description content                            |
| `head`        | Additional `<link>` or `<meta>` tags for this page      |
| `content`     | The main page content inside `<main id="main-content">` |
| `scripts`     | Script tags loaded before `</body>`                     |

### Writing a New Page

To add a page, create a `.njk` file in `frontend/views/pages/`. The file-system router registers it automatically. No route handler code is needed.

```nunjucks
{# frontend/views/pages/contact.njk #}
{% extends "layouts/base.njk" %}

{% block title %}Contact{% endblock %}
{% block description %}Get in touch with us{% endblock %}

{% block content %}
  <h1>Contact Us</h1>
  <p>Email us at hello@example.com</p>
{% endblock %}
```

This file creates the route `GET /contact` with the title "Contact".

### Progressive Enhancement Scripts

TypeScript enhancers live in `frontend/src/enhancers/`. Each file is an independent module that finds elements in the server-rendered DOM and adds behavior.

Enhancers use `data-enhance` attributes to locate their targets. The server renders the `data-enhance` attribute; the script reads it at runtime.

```html
<!-- Rendered by server -->
<section data-enhance="example">
  <ul>
    <li>Item 1</li>
    <li>Item 2</li>
  </ul>
</section>
```

```typescript
// frontend/src/enhancers/example.ts
function enhance(root: HTMLElement): void {
  const items = root.querySelectorAll('li');
  items.forEach((item) => {
    item.addEventListener('click', () => {
      item.classList.toggle('highlighted');
    });
  });
  root.dataset['enhanced'] = 'true';
}

const targets = document.querySelectorAll<HTMLElement>(
  '[data-enhance="example"]'
);
targets.forEach(enhance);
```

The script sets `data-enhanced="true"` after binding. Templates and tests use this attribute to verify that enhancement ran.

### Vite Build Pipeline

Vite compiles TypeScript enhancers into JavaScript. The `vite.config.ts` file auto-discovers every `.ts` file in `frontend/src/enhancers/` and creates a separate output file for each one.

```
frontend/src/enhancers/example.ts  →  frontend/public/js/example.js
```

Output files use the ES module format and include source maps. Templates load them as `type="module"` scripts.

```nunjucks
{% block scripts %}
  <script type="module" src="/js/example.js" defer></script>
{% endblock %}
```

To add a new enhancer, create a `.ts` file in `frontend/src/enhancers/`. Vite picks it up automatically on the next build.

### Static Asset Serving

Express serves static assets from `frontend/public/` with cache headers configured for long-term browser caching.

| Path    | Cache duration | Contents                      |
| ------- | -------------- | ----------------------------- |
| `/js/`  | 1 year         | Compiled enhancer scripts     |
| `/css/` | 1 year         | Stylesheets                   |
| Other   | 1 day          | Images and other static files |

Vite includes a content hash in chunk filenames for shared code, ensuring browsers receive updated files after a build.

---

## Logging and Monitoring

### Structured Logging

The application uses [Pino](https://getpino.io/) for structured logging. All log output is JSON by default, which integrates with log aggregation services.

In development, the `pino-pretty` transport formats logs with colors and human-readable timestamps.

Import the logger from `backend/src/utils/logger.ts`:

```typescript
import { logger } from '../utils/logger.js';

logger.info('Server started');
logger.error({ err, path: req.path }, 'Request failed');
```

The log level is configurable with the `LOG_LEVEL` environment variable. Default: `info`.

### HTTP Request Logging

The `createHttpLogger` factory returns a `pino-http` middleware instance. This middleware logs every HTTP request and response automatically, including method, path, status code, and response time. Requests to `/favicon.ico` are excluded from logs.

### Sentry Error Tracking

Initialize Sentry by setting the `SENTRY_DSN` environment variable. The server initializes Sentry before creating the Express application, so all unhandled errors during startup are captured.

The error handler middleware captures all `5xx` errors to Sentry automatically. Expected errors (instances of `AppError` with status codes below 500) are not sent to Sentry.

---

## Database and Migrations

### Connection Pool

`backend/src/db.ts` manages a PostgreSQL connection pool using the `pg` library. Pool settings are configurable through environment variables.

| Variable            | Default | Description               |
| ------------------- | ------- | ------------------------- |
| `DATABASE_POOL_MIN` | `2`     | Minimum idle connections  |
| `DATABASE_POOL_MAX` | `10`    | Maximum total connections |

Two functions are exported for executing queries.

`query<T>(text, params)` runs a parameterized SQL statement and returns typed rows. All queries use parameterized statements — no string interpolation, which prevents SQL injection.

```typescript
const result = await query<{ id: number; email: string }>(
  'SELECT id, email FROM users WHERE id = $1',
  [userId]
);
// result.rows is typed as Array<{ id: number; email: string }>
```

`getClient()` checks out a connection from the pool for transactions. Always release the client after use.

### Schema

The initial migration (`backend/migrations/001_initial.sql`) creates the `users` table.

| Column          | Type                                 | Notes                       |
| --------------- | ------------------------------------ | --------------------------- |
| `id`            | `SERIAL PRIMARY KEY`                 | Auto-incrementing integer   |
| `email`         | `TEXT NOT NULL UNIQUE`               | Indexed for login lookups   |
| `name`          | `TEXT NOT NULL`                      | Display name                |
| `password_hash` | `TEXT NOT NULL`                      | bcrypt hash, salt factor 12 |
| `role`          | `TEXT NOT NULL DEFAULT 'user'`       | Role string                 |
| `created_at`    | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Creation timestamp          |
| `updated_at`    | `TIMESTAMPTZ NOT NULL DEFAULT NOW()` | Auto-updated by trigger     |

A `BEFORE UPDATE` trigger automatically sets `updated_at` to the current time whenever a row changes.

An index on `email` accelerates the login query, which selects by email on every authentication attempt.

### Migration Runner

The migration runner in `backend/src/migrate.ts` applies SQL files from `backend/migrations/` in lexicographic order. It maintains an internal `migrations` table to track which files have already run, so it skips previously applied migrations.

Run migrations with:

```bash
npm run migrate
```

To add a new migration, create a `.sql` file in `backend/migrations/` with a name that sorts after all existing files. Use a numeric prefix for reliable ordering (for example, `002_add_posts.sql`).

---

## Testing

### Unit Tests (Vitest)

Unit tests run with Vitest. They cover individual modules in isolation, including enhancers and utilities.

```bash
# Run all unit tests
npm run test:unit

# Run tests in a specific package
npm test -- frontend/
npm test -- backend/

# Run a specific file
npm test -- frontend/tests/unit/example-enhancer.test.ts
```

The example enhancer test (`frontend/tests/unit/example-enhancer.test.ts`) demonstrates how to test DOM interaction by setting `document.body.innerHTML` before each test case.

### End-to-End Tests (Playwright)

E2E tests run with Playwright against a live server. They verify full page behavior in a real browser.

```bash
# Start the server first
npm run dev:backend

# Run E2E tests in another terminal
npm run test:e2e

# Run in headed mode (shows the browser window)
npm run test:e2e -- --headed

# Run in a specific browser
npm run test:e2e -- --project=chromium
```

The home page E2E test (`frontend/tests/e2e/home.spec.ts`) verifies the page title, navigation, features section, and that the progressive enhancement script runs and sets `data-enhanced="true"`.

### Integration Tests

Backend integration tests (`npm run test:integration`) run against a real PostgreSQL database. These tests cover the API endpoints end-to-end through the HTTP layer.

---

## Configuration

All configuration loads from environment variables through `backend/src/config.ts`. The configuration module validates required variables at startup and throws an error if any are missing.

### Required Variables

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string              |
| `JWT_SECRET`   | Secret key for signing and verifying JWTs |

### Optional Variables

| Variable            | Default                 | Description                                |
| ------------------- | ----------------------- | ------------------------------------------ |
| `NODE_ENV`          | `development`           | Runtime environment                        |
| `PORT`              | `3000`                  | HTTP server port                           |
| `HOST`              | `localhost`             | HTTP server host address                   |
| `DATABASE_POOL_MIN` | `2`                     | Minimum pool connections                   |
| `DATABASE_POOL_MAX` | `10`                    | Maximum pool connections                   |
| `JWT_EXPIRES_IN`    | `7d`                    | Token expiration duration                  |
| `CORS_ORIGIN`       | `http://localhost:3000` | Allowed CORS origin                        |
| `LOG_LEVEL`         | `info`                  | Pino log level                             |
| `SENTRY_DSN`        | (none)                  | Sentry Data Source Name for error tracking |

Place these variables in `backend/.env` for local development. Copy `.env.example` to create a starting point.

---

## Infrastructure

### Docker Compose (Development)

A Docker Compose file provides a self-contained development environment with no local PostgreSQL installation required.

```bash
docker compose up
```

This starts two services.

- **db** — PostgreSQL 16 with a health check. Data persists in the `pgdata` named volume. The database is accessible on host port `5433` to avoid conflicts with a local PostgreSQL installation.
- **backend** — Node.js 24 server running `tsx watch` for live reload. It waits for the database health check before starting. The project directory mounts into `/app` so code changes reflect immediately.

```bash
docker compose down   # Stop services
```

### CI/CD Pipeline

GitHub Actions runs on every push to `main` and every pull request targeting `main`. The pipeline runs these steps in order.

1. Type checking (`npm run typecheck`)
2. Linting (`npm run lint`)
3. Build all packages (`npm run build`)
4. Unit tests (`npm run test:unit`)
5. Integration tests with a PostgreSQL service container (`npm run test:integration`)

End-to-end tests are excluded from CI because they require a running server and browser installation.

### Graceful Shutdown

The server handles `SIGTERM` and `SIGINT` signals. On receiving either signal, it stops accepting new connections, waits for in-flight requests to complete, drains the database pool, and exits cleanly. A 10-second timeout forces exit if the graceful shutdown stalls.

---

## Developer Tooling

### Git Hooks

Husky runs lint-staged on every commit. It lints and formats all staged `.ts` and `.js` files with ESLint and Prettier. Staged `.json`, `.md`, and `.css` files are formatted with Prettier only.

### Code Quality Commands

```bash
npm run lint          # Lint all TypeScript and JavaScript
npm run typecheck     # Type-check all packages
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without writing changes
```

### Clean Build

```bash
npm run clean         # Remove all dist/ directories and node_modules/
npm install           # Reinstall dependencies
npm run build         # Build shared → backend → frontend
```

Build order matters. The `shared` package must build first because `backend` and `frontend` import from it.

---

## AI-Native Development (PROSE)

This project uses the PROSE framework for AI-assisted development. PROSE defines five constraints that govern how AI agents interact with the codebase.

| Constraint               | Principle                              |
| ------------------------ | -------------------------------------- |
| Progressive Disclosure   | Load context on demand, not upfront    |
| Reduced Scope            | Match task size to context capacity    |
| Orchestrated Composition | Chain simple primitives, not monoliths |
| Safety Boundaries        | Define agent autonomy explicitly       |
| Explicit Hierarchy       | Layer guidance from global to local    |

### Project Structure for AI

The `.claude/` directory contains all AI tooling.

```
.claude/
├── agents/           # Custom agent definitions
│   ├── tdd-orchestrator.md
│   ├── tdd-test-writer.md
│   ├── tdd-implementer.md
│   ├── tdd-refactorer.md
│   └── feature-documentater.md
├── rules/            # Path-scoped coding rules
│   ├── backend.md    # Applies when editing backend/ files
│   ├── frontend.md   # Applies when editing frontend/ files
│   ├── security.md   # Applies to auth and data handling
│   └── testing.md    # Applies when editing test files
└── skills/           # Reusable skill definitions
    ├── architect/
    ├── backend-engineer/
    ├── code-review/
    ├── debug/
    ├── frontend-engineer/
    ├── implement-feature/
    ├── perf/
    ├── spec/
    └── technical-writer/
```

### Hierarchical Instructions

Claude Code loads `CLAUDE.md` files as it walks the directory tree. Each file adds domain-specific context without polluting adjacent domains.

- `/CLAUDE.md` — Project-wide principles (runtime, architecture, code style, git workflow)
- `/backend/CLAUDE.md` — Backend stack, routing conventions, service layer rules
- `/frontend/CLAUDE.md` — Template conventions, progressive enhancement philosophy, Vite pipeline
- `/shared/CLAUDE.md` — Type serialization rules, dual-purpose usage, update propagation

Path-scoped rules in `.claude/rules/` load automatically when Claude edits matching file patterns, providing targeted guidance without context overhead.

### TDD Agent Workflow

The TDD agent workflow decomposes test-driven development into four specialized agents.

1. **tdd-orchestrator** — Reads the feature spec and coordinates the other agents.
2. **tdd-test-writer** — Writes failing tests based on the spec. Makes no implementation changes.
3. **tdd-implementer** — Writes the minimum code needed to make the tests pass.
4. **tdd-refactorer** — Cleans up the implementation while keeping tests green.

Each agent has an explicit boundary (`CAN` / `CANNOT` list) that prevents scope creep and keeps each phase focused.

The PROSE reference guide is at `/Users/chadoakenfold/Documents/Code/p-100226/ai/docs/prose.md`.

---

## Architecture Diagrams

The `documentation/diagrams/` directory contains architecture diagrams in Mermaid syntax following the C4 model.

### C4 Static Diagrams

| Level                   | File                        | Description                                   |
| ----------------------- | --------------------------- | --------------------------------------------- |
| 1 — System Context      | `c4-system-context.md`      | Users, the application, and external services |
| 2 — Container           | `c4-container.md`           | Express server, PostgreSQL, templates, Vite   |
| 3 — Backend Components  | `c4-backend-components.md`  | Routes, middleware, services, database module |
| 3 — Frontend Components | `c4-frontend-components.md` | Templates, enhancers, Vite build pipeline     |
| Deployment              | `c4-deployment.md`          | Docker Compose dev environment and CI         |

### Sequence Diagrams

| Flow                    | File                             |
| ----------------------- | -------------------------------- |
| Application startup     | `seq-application-startup.md`     |
| Page request            | `seq-page-request.md`            |
| User registration       | `seq-user-registration.md`       |
| User login              | `seq-user-login.md`              |
| Authenticated request   | `seq-authenticated-request.md`   |
| Progressive enhancement | `seq-progressive-enhancement.md` |
| Error handling          | `seq-error-handling.md`          |
| Database migration      | `seq-database-migration.md`      |

Diagrams render natively on GitHub and in VS Code with the Markdown Preview Mermaid Support extension. Paste diagram code at [mermaid.live](https://mermaid.live) for interactive editing.
