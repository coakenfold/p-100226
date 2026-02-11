# Project Monorepo

A progressively enhanced multipage application built with Node.js, TypeScript, Express, and Nunjucks templates.

## Architecture

This is a monorepo with three packages:

- **Backend** (`backend/`) — Express + TypeScript + PostgreSQL server
- **Frontend** (`frontend/`) — Nunjucks templates + TypeScript progressive enhancement + Vite
- **Shared** (`shared/`) — Common types, constants, and utilities

## Prerequisites

- Node.js 24+
- PostgreSQL 14+
- Git

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
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations** (once backend is set up)
   ```bash
   npm run migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:3000

## Development

### Available Commands

```bash
# Development
npm run dev                 # Start backend dev server
npm run dev:backend         # Start backend dev server
npm run dev:frontend        # Start frontend asset watcher

# Building
npm run build               # Build all packages
npm run build:shared        # Build shared package
npm run build:backend       # Build backend package
npm run build:frontend      # Build frontend assets

# Testing
npm test                    # Run all tests
npm run test:unit           # Run unit tests
npm run test:integration    # Run integration tests
npm run test:e2e            # Run end-to-end tests

# Code Quality
npm run lint                # Lint all code
npm run typecheck           # Type check all TypeScript
npm run format              # Format all code
npm run format:check        # Check code formatting

# Utilities
npm run clean               # Remove all build artifacts and node_modules
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

## Progressive Enhancement

This application follows progressive enhancement principles:

- Every page works fully without JavaScript
- JavaScript enhances existing server-rendered markup
- Forms submit natively with server-side validation
- Navigation uses standard links and full page loads

## License

[Your License Here]
