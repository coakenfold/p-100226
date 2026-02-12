# C4 Level 1: System Context Diagram

Shows how users and external systems interact with the application.

```mermaid
C4Context
    title System Context — Project Monorepo

    Person(user, "User", "Browses pages, registers, authenticates, and uses the application")

    System(app, "Project Monorepo", "Progressively enhanced multipage application<br>Node.js + Express + Nunjucks + PostgreSQL")

    System_Ext(sentry, "Sentry", "Error tracking and monitoring service")
    System_Ext(smtp, "SMTP Server", "Email delivery (planned)")

    Rel(user, app, "Uses", "HTTPS")
    Rel(app, sentry, "Reports errors", "HTTPS")
    Rel(app, smtp, "Sends emails (future)", "SMTP")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Description

- **User**: Interacts with the application via a web browser. Pages are server-rendered HTML; JavaScript provides progressive enhancement.
- **Project Monorepo**: The main application system. Serves HTML pages and a RESTful JSON API. Handles authentication via JWT.
- **Sentry**: External error tracking service. The backend reports 5xx errors and unhandled exceptions.
- **SMTP Server**: Planned external dependency for password reset and notification emails.
