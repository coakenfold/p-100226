---
paths:
  - "backend/src/middleware/**"
  - "backend/src/auth/**"
  - "**/*auth*"
  - "**/*security*"
  - "**/*token*"
---

# Security Rules

> PROSE constraint: **Safety Boundaries** — strict guardrails activated when
> working on security-sensitive code.

## Authentication

- JWT tokens must have expiration (`exp` claim)
- Implement token refresh rotation — invalidate old refresh tokens
- Hash passwords with bcrypt (cost factor >= 12)
- Never store plaintext credentials anywhere

## Authorization

- Check permissions at the middleware level, not in business logic
- Use role-based access control (RBAC) with least-privilege defaults
- Deny by default — explicitly grant access, never deny

## Input Validation

- Validate and sanitize all external input at system boundaries
- Use schema validation (e.g., Zod) for request bodies
- Reject unexpected fields — don't silently ignore them

## Secrets Management

- Never hardcode secrets, tokens, or API keys
- Use environment variables via `.env` (excluded from git)
- Rotate secrets on suspected compromise

## OWASP Awareness

- Parameterized queries only — no string concatenation for SQL
- Escape output to prevent XSS
- Set security headers (CORS, CSP, X-Frame-Options)
- Validate redirect URLs against an allowlist
