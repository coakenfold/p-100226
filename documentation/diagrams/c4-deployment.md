# C4 Deployment Diagram

Shows the infrastructure for development (Docker Compose) and CI (GitHub Actions).

## Development Environment (Docker Compose)

```mermaid
C4Deployment
    title Development Deployment — Docker Compose

    Deployment_Node(dev, "Developer Machine", "macOS / Linux") {

        Deployment_Node(docker, "Docker Compose") {

            Deployment_Node(nodeContainer, "backend", "node:24") {
                Container(app, "Express Server", "tsx watch", "Live-reloads on source changes<br>Mounts source via volumes")
            }

            Deployment_Node(pgContainer, "db", "postgres:16") {
                ContainerDb(devDb, "PostgreSQL", "Port 5432", "Health-checked, persistent pgdata volume")
            }
        }

        Deployment_Node(host, "Host") {
            Container(vite, "Vite Watcher", "npm run dev:frontend", "Watches src/enhancers/ and rebuilds to public/js/")
            Container(browser, "Browser", "http://localhost:3000", "Accesses backend via port mapping")
        }
    }

    Rel(app, devDb, "Queries", "postgresql://db:5432")
    Rel(browser, app, "HTTP requests", "localhost:3000")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## CI Environment (GitHub Actions)

```mermaid
C4Deployment
    title CI Deployment — GitHub Actions

    Deployment_Node(gh, "GitHub Actions", "ubuntu-latest") {

        Deployment_Node(runner, "CI Runner") {
            Container(ci, "CI Pipeline", "Node.js 24", "Install → Typecheck → Lint → Build → Unit Tests → Integration Tests")
        }

        Deployment_Node(pgService, "Service Container") {
            ContainerDb(ciDb, "PostgreSQL 16", "Port 5432", "Ephemeral test database<br>testuser/testpass/testdb")
        }
    }

    Rel(ci, ciDb, "Integration tests", "postgresql://localhost:5432")

    UpdateLayoutConfig($c4ShapeInRow="2", $c4BoundaryInRow="1")
```

## Environment Comparison

| Aspect             | Development (Docker)   | CI (GitHub Actions)    | Production    |
| ------------------ | ---------------------- | ---------------------- | ------------- |
| **Node.js**        | 24 (container)         | 24 (.node-version)     | 24            |
| **PostgreSQL**     | 16 (container)         | 16 (service container) | 14+ (managed) |
| **Live Reload**    | tsx watch              | N/A                    | N/A           |
| **Frontend Build** | Vite watch mode (host) | npm run build          | npm run build |
| **Logging**        | Pino pretty            | Pino JSON              | Pino JSON     |
| **Error Tracking** | Optional (Sentry)      | Disabled               | Sentry        |
| **Compression**    | Enabled                | N/A                    | Enabled       |
