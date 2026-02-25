# Sequence Diagram — Error Handling

How errors propagate through the middleware stack for validation errors,
not-found routes, and unexpected server errors.

## Validation Error (422)

```mermaid
sequenceDiagram
    participant C as Client
    participant E as Express Router
    participant V as Validation Middleware

    C->>E: POST /api/v1/auth/login
    Note over C: Body: { email: "" } — missing password

    E->>V: validate(rules)
    activate V

    V->>V: Check email — required → empty string fails
    V->>V: Accumulate error: email is required
    V->>V: Check password — required → undefined fails
    V->>V: Accumulate error: password is required

    V->>V: errors.length > 0

    deactivate V
    V-->>C: 422 Validation Error — "email is required; password is required"
```

## Not Found — API Route (404 JSON)

```mermaid
sequenceDiagram
    participant C as Client
    participant E as Express
    participant MW as Middleware Stack
    participant NF as notFoundHandler

    C->>E: GET /api/v1/nonexistent

    E->>MW: Run middleware pipeline
    MW->>MW: No route matches /api/v1/nonexistent

    MW->>NF: Unmatched request falls through

    NF->>NF: Detect path starts with "/api/"

    NF-->>C: 404 Not Found — "Route GET /api/v1/nonexistent not found"
```

## Not Found — Page Route (404 HTML)

```mermaid
sequenceDiagram
    participant B as Browser
    participant E as Express
    participant MW as Middleware Stack
    participant NF as notFoundHandler
    participant NJ as Nunjucks

    B->>E: GET /nonexistent-page

    E->>MW: Run middleware pipeline
    MW->>MW: No page route matches /nonexistent-page

    MW->>NF: Unmatched request falls through

    NF->>NF: Path does NOT start with "/api/"
    NF->>NJ: res.render("pages/404.njk", { title: "Page Not Found" })
    NJ-->>NF: Rendered 404 HTML

    NF-->>B: 404 — text/html (404 error page)
```

## Unexpected Server Error (500)

```mermaid
sequenceDiagram
    participant C as Client
    participant R as Route Handler
    participant EH as errorHandler
    participant L as Logger (Pino)
    participant S as Sentry
    participant NJ as Nunjucks

    C->>R: Request to any endpoint

    R->>R: Unexpected error thrown
    R->>EH: next(error) — passed to error handler

    activate EH
    EH->>EH: Determine status code
    alt AppError (known)
        EH->>EH: Use err.statusCode + err.message
    else Unknown Error
        EH->>EH: Default to 500 + "Internal Server Error"
    end

    EH->>L: logger.error({ err, statusCode }, message)
    L->>L: Log with stack trace

    alt Status >= 500 and Sentry configured
        EH->>S: Sentry.captureException(err)
    end

    alt API request (path starts with /api/)
        EH-->>C: status { error: "...", message: "...", statusCode }
    else Page request
        EH->>NJ: res.render("pages/error.njk", { title, message, statusCode })
        NJ-->>EH: Rendered error HTML
        EH-->>C: status — text/html (error page)
    end
    deactivate EH
```
