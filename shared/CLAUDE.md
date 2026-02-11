# Shared Context

> PROSE constraint: **Explicit Hierarchy** — this file provides context for
> shared code consumed by both frontend and backend.

## Purpose

This directory contains types, utilities, and constants shared between
frontend and backend. It is the single source of truth for API contracts.

## Directory Structure

```
shared/
├── types/
│   ├── api.ts          # Request/response types for all endpoints
│   ├── models.ts       # Domain entity types (User, Product, etc.)
│   └── index.ts        # Re-exports all shared types
├── constants/
│   └── index.ts        # Shared constants (status codes, roles, etc.)
└── utils/
    └── index.ts        # Pure utility functions (validation, formatting)
```

## Conventions

- Types here must be serializable (no classes, functions, or Dates — use ISO strings)
- Changes to shared types affect both frontend and backend — update consumers
- Keep utilities pure — no side effects, no platform-specific code
- Run both frontend and backend tests after modifying shared code
