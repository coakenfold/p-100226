# Project Monorepo

A progressively enhanced multipage application built with Node.js, TypeScript, Express, and Nunjucks templates.

## Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Architecture Overview](#architecture-overview)

## Architecture

This is a monorepo with three packages:

- **Backend** (`backend/`) — Express + TypeScript + PostgreSQL server
- **Frontend** (`frontend/`) — Nunjucks templates + TypeScript progressive enhancement + Vite
- **Shared** (`shared/`) — Common types, constants, and utilities

### Key Technologies

- **Runtime**: Node.js 24
- **Language**: TypeScript (strict mode)
- **Backend Framework**: Express
- **Database**: PostgreSQL 14+
- **Template Engine**: Nunjucks
- **Build Tool**: Vite (frontend assets)
- **Testing**: Vitest (unit), Playwright (E2E)
- **Authentication**: JWT

## Prerequisites

- Node.js 24+ (specified in `.nvmrc`)
- PostgreSQL 14+
- Git
- npm (comes with Node.js)

## Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd project-monorepo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Copy the example file
   cp .env.example backend/.env

   # Edit backend/.env with your configuration
   # At minimum, update:
   # - DATABASE_URL with your PostgreSQL connection string
   # - JWT_SECRET with a secure random string
   ```

4. **Set up the database**

   ```bash
   # Create the database (adjust connection details as needed)
   createdb your-database-name

   # Run migrations
   npm run migrate

   # Optional: Seed with sample data
   npm run seed
   ```

5. **Start development servers**

   ```bash
   # Terminal 1: Start backend server
   npm run dev:backend

   # Terminal 2: Start frontend asset watcher
   npm run dev:frontend
   ```

The application will be available at http://localhost:3000

## Development

### Development Workflow

For the best development experience, run both the backend server and frontend watcher simultaneously in separate terminals:

```bash
# Terminal 1: Backend with hot reload
npm run dev:backend

# Terminal 2: Frontend asset compilation
npm run dev:frontend
```

The backend server will:

- Start on http://localhost:3000
- Watch TypeScript files and restart on changes
- Serve Nunjucks templates
- Provide API endpoints at `/api/v1/`

The frontend watcher will:

- Compile TypeScript enhancers with Vite
- Watch for changes and rebuild automatically
- Output compiled assets to `frontend/public/js/`

### Available Commands

```bash
# Development
npm run dev                 # Start backend dev server
npm run dev:backend         # Start backend dev server with hot reload
npm run dev:frontend        # Start frontend asset watcher

# Building
npm run build               # Build all packages (shared → backend → frontend)
npm run build:shared        # Build shared package only
npm run build:backend       # Build backend package only
npm run build:frontend      # Build frontend assets only

# Testing
npm test                    # Run all tests (unit + integration + E2E)
npm run test:unit           # Run unit tests across all packages
npm run test:integration    # Run backend integration tests
npm run test:e2e            # Run Playwright E2E tests (requires running server)

# Code Quality
npm run lint                # Lint all code with ESLint
npm run typecheck           # Type check all TypeScript files
npm run format              # Format all code with Prettier
npm run format:check        # Check code formatting without modifying

# Database
npm run migrate             # Run database migrations
npm run seed                # Seed database with sample data

# Utilities
npm run clean               # Remove all build artifacts and node_modules
```

### Testing Instructions

**Unit Tests** (Vitest):

```bash
# Run all unit tests
npm run test:unit

# Run tests for a specific package
npm test -- backend/
npm test -- frontend/

# Run a specific test file
npm test -- path/to/test.ts

# Run in watch mode
npm test -- --watch
```

**Integration Tests**:

```bash
# Run backend integration tests
npm run test:integration
```

**E2E Tests** (Playwright):

```bash
# Start the server first
npm run dev:backend

# Then in another terminal, run E2E tests
npm run test:e2e

# Run in headed mode (see the browser)
npm run test:e2e -- --headed

# Run specific browser only
npm run test:e2e -- --project=chromium
```

### Project Structure

```
.
├── backend/                # Express backend
│   ├── src/
│   │   ├── routes/        # HTTP route handlers
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic
│   │   ├── models/        # Database models
│   │   └── utils/         # Backend utilities
│   ├── migrations/        # Database migrations
│   └── tests/            # Backend tests
├── frontend/              # Frontend assets and templates
│   ├── views/            # Nunjucks templates
│   ├── src/              # TypeScript enhancers
│   ├── public/           # Static assets
│   └── tests/            # Frontend tests
└── shared/               # Shared code
    ├── types/            # Shared TypeScript types
    ├── constants/        # Shared constants
    └── utils/            # Shared utilities
```

## Code Style

- Use ES modules (`import`/`export`), never CommonJS (`require`)
- Prefer named exports over default exports
- Use 2-space indentation
- Strict TypeScript — no `any` types (use `unknown` with type guards)

## Git Workflow

- Branch naming: `feat/*`, `fix/*`, `docs/*`
- Write concise commit messages focusing on "why" not "what"
- Run `npm run lint && npm test` before committing

## Testing

See [Testing Instructions](#testing-instructions) in the Development section above.

## Deployment

### Build for Production

```bash
# Build all packages
npm run build

# Or build individually
npm run build:shared
npm run build:backend
npm run build:frontend
```

### Environment Variables

Ensure all production environment variables are set in `backend/.env`:

- `NODE_ENV=production`
- `DATABASE_URL` — Production PostgreSQL connection string
- `JWT_SECRET` — Secure random string (minimum 32 characters)
- `PORT` — Server port (default: 3000)
- `CORS_ORIGIN` — Allowed CORS origin for API requests

See [`.env.example`](.env.example) for all available options.

### Running in Production

```bash
# After building
cd backend
node dist/index.js
```

### Deployment Guidelines

- Always run migrations before deploying new code: `npm run migrate`
- Use environment variables for all configuration (never hardcode)
- Enable PostgreSQL SSL in production
- Use a process manager like PM2 or systemd for the Node.js process
- Set up reverse proxy (nginx/Apache) in front of Express
- Enable HTTPS/TLS at the reverse proxy level
- Configure logging to a persistent location
- Set up monitoring and error tracking (e.g., Sentry)

## API Documentation

### Base URL

All API endpoints are prefixed with `/api/v1/`

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication

**POST /api/v1/auth/register**

Register a new user account.

Request body:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

Validation rules:

- `email`: Required, valid email format
- `name`: Required, 1-255 characters
- `password`: Required, minimum 8 characters

Response (201 Created):

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T12:00:00Z"
  },
  "token": "jwt-token-string"
}
```

**POST /api/v1/auth/login**

Authenticate and receive a JWT token.

Request body:

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

Response (200 OK):

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt-token-string"
}
```

#### Users

**GET /api/v1/users/me**

Get the currently authenticated user's information.

Authentication: Required

Response (200 OK):

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T12:00:00Z"
  }
}
```

### Error Responses

All endpoints return errors in a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "statusCode": 400
}
```

Common status codes:

- `400` — Bad Request (invalid input)
- `401` — Unauthorized (missing or invalid token)
- `404` — Not Found (resource doesn't exist)
- `422` — Unprocessable Entity (validation failed)
- `500` — Internal Server Error

## Architecture Overview

### Progressive Enhancement Philosophy

This application follows progressive enhancement principles:

- **HTML First**: Every page works fully without JavaScript
- **Server-Rendered**: Nunjucks templates render complete HTML on the server
- **JavaScript Enhances**: TypeScript enhancers add interactivity to existing markup
- **Native Forms**: Forms submit natively; JavaScript validation is supplemental
- **Standard Navigation**: Uses normal links and full page loads (no client-side routing)

### Request Flow

#### Page Requests

1. Browser requests a page (e.g., `GET /`)
2. Express route handler in `backend/src/routes/pages.ts` receives request
3. Handler calls service layer for data
4. Service layer queries database via models
5. Handler calls `res.render()` with Nunjucks template and data
6. Nunjucks renders HTML with embedded data
7. HTML response sent to browser with CSS and deferred JS

#### API Requests (AJAX Enhancement)

1. Browser JavaScript makes API request (e.g., `POST /api/v1/auth/login`)
2. Express route handler in `backend/src/routes/api/v1/` receives request
3. Middleware validates request and authenticates user (if required)
4. Handler calls service layer for business logic
5. Service layer returns data or throws error
6. Handler sends JSON response
7. Browser JavaScript enhances UI based on response

### Directory Architecture

```
.
├── .claude/                # AI assistant configuration
│   ├── rules/             # Path-scoped coding rules
│   └── skills/            # Specialized AI workflows
├── backend/               # Express server
│   ├── src/
│   │   ├── routes/       # HTTP route handlers
│   │   │   ├── pages.ts  # Server-rendered pages
│   │   │   └── api/v1/   # JSON API endpoints
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── services/     # Business logic layer
│   │   ├── models/       # Database access layer
│   │   └── utils/        # Backend utilities
│   ├── migrations/       # SQL schema migrations
│   └── tests/           # Backend tests
├── frontend/             # Templates and client assets
│   ├── views/           # Nunjucks templates
│   │   ├── layouts/     # Base HTML layouts
│   │   ├── pages/       # Page templates
│   │   └── partials/    # Reusable components
│   ├── src/
│   │   └── enhancers/   # TypeScript progressive enhancement
│   ├── public/          # Static assets (served directly)
│   │   ├── css/         # Stylesheets
│   │   ├── js/          # Compiled enhancer scripts
│   │   └── images/      # Images, fonts, etc.
│   └── tests/
│       ├── unit/        # Vitest unit tests
│       └── e2e/         # Playwright E2E tests
└── shared/              # Code shared between frontend/backend
    ├── types/          # Shared TypeScript types
    ├── constants/      # Shared constants
    └── utils/          # Pure utility functions
```

### Data Flow & Type Safety

The `shared/` package ensures type safety across the full stack:

1. **Domain types** (`shared/types/models.ts`) define entities like `User`
2. **API types** (`shared/types/api.ts`) define request/response shapes
3. Backend imports these types for:
   - Service function signatures
   - Database query results
   - Template data passed to `res.render()`
   - API response bodies
4. Frontend imports these types for:
   - Progressive enhancement TypeScript
   - Type-safe access to server-rendered data
   - API request/response handling

This creates a **single source of truth** — changing a type in `shared/` causes type errors in both frontend and backend, catching integration bugs at compile time.

## Progressive Enhancement

This application follows progressive enhancement principles:

- Every page works fully without JavaScript
- JavaScript enhances existing server-rendered markup
- Forms submit natively with server-side validation
- Navigation uses standard links and full page loads

## Code Style

- Use ES modules (`import`/`export`), never CommonJS (`require`)
- Prefer named exports over default exports
- Use 2-space indentation
- Strict TypeScript — no `any` types (use `unknown` with type guards)

## Git Workflow

- Branch naming: `feat/*`, `fix/*`, `docs/*`
- Write concise commit messages focusing on "why" not "what"
- Run `npm run lint && npm test` before committing

## License

[Your License Here]
