# C4 Level 2: Container Diagram

Shows the high-level technical building blocks of the system.

```mermaid
C4Container
    title Container Diagram — Project Monorepo

    Person(user, "User", "Web browser user")

    System_Boundary(system, "Project Monorepo") {

        Container(express, "Express Server", "Node.js 24, TypeScript, Express", "Handles HTTP requests, renders Nunjucks templates, serves REST API at /api/v1/")

        Container(templates, "Nunjucks Templates", "Nunjucks (.njk)", "Server-rendered HTML layouts, pages, and partials")

        Container(enhancers, "Enhancement Scripts", "TypeScript, Vite", "Progressive enhancement scripts that bind to data-enhance attributes in rendered HTML")

        Container(static, "Static Assets", "CSS, JS, Images", "Compiled CSS, bundled JS enhancers, and images served from frontend/public/")

        ContainerDb(db, "PostgreSQL", "PostgreSQL 16", "Stores users, sessions, and application data")

        Container(shared, "Shared Package", "TypeScript", "Common types, constants, and utilities used by both frontend and backend")
    }

    System_Ext(sentry, "Sentry", "Error tracking")

    Rel(user, express, "Requests pages and API", "HTTPS")
    Rel(express, templates, "Renders", "res.render()")
    Rel(express, db, "Reads/writes data", "pg connection pool")
    Rel(express, static, "Serves", "express.static()")
    Rel(express, sentry, "Reports errors", "HTTPS")
    Rel(express, shared, "Imports types & utils", "ES modules")
    Rel(enhancers, shared, "Imports types", "ES modules")
    Rel(user, static, "Loads assets", "HTTPS")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Description

| Container               | Technology                      | Purpose                                                                                                                                                                                   |
| ----------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Express Server**      | Node.js 24, TypeScript, Express | Central request handler. Routes page requests to Nunjucks templates and API requests to JSON handlers. Manages middleware chain (auth, validation, logging, compression).                 |
| **Nunjucks Templates**  | Nunjucks                        | Server-side HTML rendering. Templates in `frontend/views/` with layouts, pages, and partials. Rendered by Express via `res.render()`.                                                     |
| **Enhancement Scripts** | TypeScript, Vite                | Client-side progressive enhancement. Built by Vite from `frontend/src/enhancers/` to `frontend/public/js/`. Bind to elements with `data-enhance` attributes.                              |
| **Static Assets**       | CSS, JS, Images                 | Served directly by Express from `frontend/public/`. JS/CSS cached for 1 year, other assets for 1 day. Compression enabled.                                                                |
| **PostgreSQL**          | PostgreSQL 16                   | Relational database. Stores users table. Accessed via `pg` connection pool with parameterized queries.                                                                                    |
| **Shared Package**      | TypeScript                      | `@project/shared` workspace. Provides domain types (`User`), API contract types (`LoginResponse`, `ApiErrorResponse`), constants (`HTTP_STATUS`), and utility functions (`isValidEmail`). |
