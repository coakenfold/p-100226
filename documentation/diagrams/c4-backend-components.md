# C4 Level 3: Backend Component Diagram

Shows the internal structure of the Express server container.

```mermaid
C4Component
    title Backend Components — Express Server

    Container_Boundary(backend, "Express Server") {

        Component(entry, "Entry Point", "index.ts", "Bootstraps the app, starts HTTP server, handles graceful shutdown")

        Component(app, "App Factory", "app.ts", "Creates and configures the Express instance with middleware chain")

        Component(pageRoutes, "Page Routes", "routes/pages.ts", "File-system router: auto-generates GET routes from Nunjucks templates in frontend/views/pages/")

        Component(apiRoutes, "API Routes", "routes/api/v1/index.ts", "RESTful JSON endpoints: auth/login, auth/register, users/me")

        Component(authMw, "Auth Middleware", "middleware/auth.ts", "JWT token verification, user extraction from Bearer header, token generation")

        Component(validationMw, "Validation Middleware", "middleware/validation.ts", "Request body field validation (required, type, min/max length)")

        Component(errorMw, "Error Handler", "middleware/errorHandler.ts", "Catches errors, returns JSON for API or renders error template for pages, reports to Sentry")

        Component(authService, "Auth Service", "services/auth.ts", "Login/register logic, bcrypt password hashing, user lookup")

        Component(dbModule, "Database Module", "db.ts", "PostgreSQL connection pool, parameterized query helper, pool lifecycle")

        Component(loggerUtil, "Logger", "utils/logger.ts", "Pino structured logging, pino-http request logger, pino-pretty for dev")

        Component(fsRouter, "FS Router", "utils/fsRouter.ts", "Scans frontend/views/pages/ at startup, maps .njk files to Express routes")

        Component(config, "Config", "config.ts", "Centralized environment configuration from .env, validates required vars")
    }

    ContainerDb(db, "PostgreSQL", "PostgreSQL 16")
    Container(templates, "Nunjucks Templates", "frontend/views/")
    Container(shared, "Shared Package", "@project/shared")
    System_Ext(sentry, "Sentry", "Error tracking")

    Rel(entry, app, "Creates app")
    Rel(entry, config, "Reads config")
    Rel(app, pageRoutes, "Mounts at /")
    Rel(app, apiRoutes, "Mounts at /api/v1")
    Rel(app, authMw, "Uses")
    Rel(app, errorMw, "Uses")
    Rel(app, loggerUtil, "Uses")
    Rel(apiRoutes, validationMw, "Validates requests")
    Rel(apiRoutes, authMw, "Authenticates requests")
    Rel(apiRoutes, authService, "Calls")
    Rel(authService, dbModule, "Queries")
    Rel(dbModule, db, "SQL queries", "pg pool")
    Rel(pageRoutes, fsRouter, "Uses")
    Rel(pageRoutes, templates, "Renders", "res.render()")
    Rel(errorMw, sentry, "Reports 5xx errors")
    Rel(authService, shared, "Imports types & constants")
    Rel(apiRoutes, shared, "Imports types & utils")

    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

## Component Responsibilities

| Component                 | File                                     | Responsibility                                                                                                                   |
| ------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Entry Point**           | `backend/src/index.ts`                   | Initializes Sentry, creates the Express app, starts the HTTP server, and handles graceful shutdown (SIGTERM/SIGINT).             |
| **App Factory**           | `backend/src/app.ts`                     | Configures the Express middleware chain: compression, static files, request logging, body parsing, CORS, routes, error handling. |
| **Page Routes**           | `backend/src/routes/pages.ts`            | Uses the file-system router to auto-generate GET routes from `.njk` template files.                                              |
| **API Routes**            | `backend/src/routes/api/v1/index.ts`     | Defines REST endpoints: `POST /auth/login`, `POST /auth/register`, `GET /users/me`.                                              |
| **Auth Middleware**       | `backend/src/middleware/auth.ts`         | Verifies JWT Bearer tokens and attaches `req.user`. Also exports `generateToken()`.                                              |
| **Validation Middleware** | `backend/src/middleware/validation.ts`   | Generic field-level request body validation (required, type, min/max length).                                                    |
| **Error Handler**         | `backend/src/middleware/errorHandler.ts` | Catches all errors. Returns JSON for `/api/` routes, renders error template for page routes. Reports 5xx to Sentry.              |
| **Auth Service**          | `backend/src/services/auth.ts`           | Business logic for login, register, and user lookup. Uses bcrypt for password hashing.                                           |
| **Database Module**       | `backend/src/db.ts`                      | Manages the PostgreSQL connection pool via `pg`. Provides `query()` and `getClient()` helpers.                                   |
| **Logger**                | `backend/src/utils/logger.ts`            | Pino logger instance with pino-http for request logging. Pretty-prints in development.                                           |
| **FS Router**             | `backend/src/utils/fsRouter.ts`          | Scans `frontend/views/pages/` at startup and generates Express routes. Maps `index.njk` to `/`, `about.njk` to `/about`, etc.    |
| **Config**                | `backend/src/config.ts`                  | Loads and validates environment variables. Single source for database URL, JWT secret, port, CORS origin, Sentry DSN, etc.       |

## Middleware Chain (request order)

1. `compression` — gzip responses
2. `express.static` — serve static files from `frontend/public/`
3. `pino-http` — log all requests
4. `express.json` / `express.urlencoded` — parse request bodies
5. `cors` — CORS headers
6. Routes (page routes + API routes)
7. `notFoundHandler` — 404 for unmatched routes
8. `errorHandler` — catch-all error handler
