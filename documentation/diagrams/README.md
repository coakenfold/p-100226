# Architecture Diagrams

C4 model diagrams for the Project Monorepo, written in Mermaid syntax.

## Diagrams

| Level | Diagram                                          | Description                                                                    |
| ----- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| 1     | [System Context](c4-system-context.md)           | Users, the application, and external systems (Sentry, SMTP)                    |
| 2     | [Container](c4-container.md)                     | Express server, PostgreSQL, Nunjucks templates, Vite enhancers, shared package |
| 3     | [Backend Components](c4-backend-components.md)   | Routes, middleware, services, database module, config, logger                  |
| 3     | [Frontend Components](c4-frontend-components.md) | Templates, partials, stylesheets, enhancer pipeline, Vite build                |
| —     | [Deployment](c4-deployment.md)                   | Docker Compose (dev), GitHub Actions (CI), environment comparison              |

## Viewing

These diagrams use [Mermaid](https://mermaid.js.org/) syntax with the [C4 extension](https://mermaid.js.org/syntax/c4.html). They render natively in:

- **GitHub** — Mermaid blocks render in markdown preview
- **VS Code** — With the [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) extension
- **Mermaid Live Editor** — Paste diagram code at [mermaid.live](https://mermaid.live)

## C4 Model Overview

The [C4 model](https://c4model.com/) provides a hierarchical way to describe software architecture:

1. **System Context** (Level 1) — Who uses the system and what external systems it depends on
2. **Container** (Level 2) — The major technical building blocks (applications, databases, file systems)
3. **Component** (Level 3) — The internal structure of each container (modules, classes, services)
4. **Code** (Level 4) — Class/function-level detail (not included — code itself serves this purpose)
