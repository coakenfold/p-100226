---
paths:
  - "backend/**/*.ts"
  - "backend/**/*.js"
---

# Backend Development Rules

> PROSE constraints: **Progressive Disclosure** (loaded only when editing backend
> files) + **Safety Boundaries** (enforces API and security patterns).

## Page Routes

- Render Nunjucks templates via `res.render('pages/<name>', data)`
- Pass typed data conforming to shared types — never ad-hoc objects
- Handle form submissions with POST → Redirect → GET (PRG):
  - Validate input server-side
  - On success: redirect with status 303
  - On failure: re-render the page with validation errors and submitted values
- Use flash messages (via session) for post-redirect feedback

## API Routes

- RESTful endpoints: `/api/v1/resources/:id`
- Used for progressive enhancement (AJAX from enhancer scripts)
- Validate all request inputs at the controller layer
- Return consistent JSON error responses:

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
- Render HTML error pages for page routes (404.njk, 500.njk)
- Return JSON error responses for API routes (content negotiation)

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
