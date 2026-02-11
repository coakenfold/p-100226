---
paths:
  - "backend/**/*.ts"
  - "backend/**/*.js"
---

# Backend Development Rules

> PROSE constraints: **Progressive Disclosure** (loaded only when editing backend
> files) + **Safety Boundaries** (enforces API and security patterns).

## API Design

- RESTful endpoints: `/api/v1/resources/:id`
- Validate all request inputs at the controller layer
- Return consistent error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

## Error Handling

- Use custom error classes extending `BaseAPIError`
- Include machine-readable error codes for all failures
- Wrap external API calls in try-catch with specific error types
- Never expose stack traces or internal details in responses

## Database

- Use parameterized queries — never string interpolation for SQL
- Migrations live in `backend/migrations/`
- One migration per schema change

## Security

- Authenticate via JWT middleware on protected routes
- Sanitize all user input before processing
- Rate-limit public endpoints
- Never log sensitive data (tokens, passwords, PII)

## Testing

- Integration tests for all API endpoints
- Mock external services, never call them in tests
- Test both success and error paths
