# API Documentation

This document describes the RESTful API endpoints provided by the backend server.

## Base URL

All API endpoints are prefixed with `/api/v1/`

**Development**: `http://localhost:3000/api/v1/`

## Authentication

Most endpoints require JWT (JSON Web Token) authentication. After logging in or registering, you'll receive a token that must be included in subsequent requests.

### Including the Token

Add the token to the `Authorization` header using the Bearer scheme:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

Tokens expire after 7 days by default (configurable via `JWT_EXPIRES_IN` environment variable). When a token expires, the API returns a 401 Unauthorized response, and the client must re-authenticate.

## Response Format

### Success Responses

Successful responses return the requested data with appropriate HTTP status codes:

- `200 OK` — Request succeeded
- `201 Created` — Resource created successfully
- `204 No Content` — Request succeeded with no response body

### Error Responses

All errors follow a consistent JSON format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error description",
  "statusCode": 400
}
```

### HTTP Status Codes

- `200` — OK (request succeeded)
- `201` — Created (resource created successfully)
- `400` — Bad Request (malformed request)
- `401` — Unauthorized (authentication required or failed)
- `404` — Not Found (resource doesn't exist)
- `422` — Unprocessable Entity (validation failed)
- `500` — Internal Server Error (server-side error)

---

## Endpoints

### Authentication

#### Register a New User

Create a new user account and receive an authentication token.

**Endpoint**: `POST /api/v1/auth/register`

**Authentication**: Not required

**Request Body**:

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123"
}
```

**Validation Rules**:

- `email` (string, required): Valid email format
- `name` (string, required): 1-255 characters
- `password` (string, required): Minimum 8 characters

**Success Response** (201 Created):

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

- **422 Unprocessable Entity** — Validation failed

  ```json
  {
    "error": "Validation Error",
    "message": "Invalid email format",
    "statusCode": 422
  }
  ```

- **400 Bad Request** — User already exists
  ```json
  {
    "error": "Bad Request",
    "message": "User with this email already exists",
    "statusCode": 400
  }
  ```

**Example**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

---

#### Login

Authenticate with email and password to receive a JWT token.

**Endpoint**: `POST /api/v1/auth/login`

**Authentication**: Not required

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Validation Rules**:

- `email` (string, required): Valid email format
- `password` (string, required)

**Success Response** (200 OK):

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

- **422 Unprocessable Entity** — Invalid email format

  ```json
  {
    "error": "Validation Error",
    "message": "Invalid email format",
    "statusCode": 422
  }
  ```

- **401 Unauthorized** — Invalid credentials
  ```json
  {
    "error": "Unauthorized",
    "message": "Invalid email or password",
    "statusCode": 401
  }
  ```

**Example**:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

---

### Users

#### Get Current User

Retrieve the authenticated user's profile information.

**Endpoint**: `GET /api/v1/users/me`

**Authentication**: Required (JWT token)

**Request Headers**:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response** (200 OK):

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Error Responses**:

- **401 Unauthorized** — Missing or invalid token

  ```json
  {
    "error": "Unauthorized",
    "message": "Not authenticated",
    "statusCode": 401
  }
  ```

- **404 Not Found** — User not found (token valid but user deleted)
  ```json
  {
    "error": "Not Found",
    "message": "User not found",
    "statusCode": 404
  }
  ```

**Example**:

```bash
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Common Patterns

### Request Validation

All endpoints validate input using middleware. Validation errors return 422 Unprocessable Entity with details:

```json
{
  "error": "Validation Error",
  "message": "Field 'email' is required",
  "statusCode": 422
}
```

### Pagination (Future)

When endpoints support pagination, they'll use query parameters:

```
GET /api/v1/users?page=1&limit=20
```

Response will include metadata:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Filtering and Sorting (Future)

Future endpoints may support filtering and sorting:

```
GET /api/v1/users?sort=createdAt:desc&filter[role]=admin
```

---

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider adding rate limiting middleware to prevent abuse.

Recommended limits:

- Authentication endpoints: 5 requests per 15 minutes per IP
- General API endpoints: 100 requests per 15 minutes per user

---

## CORS

Cross-Origin Resource Sharing (CORS) is configured based on the `CORS_ORIGIN` environment variable.

**Development**: Allows `http://localhost:3000`
**Production**: Set `CORS_ORIGIN` to your frontend domain

---

## Versioning

The API is versioned using URL path prefixes (`/api/v1/`). This allows introducing breaking changes in future versions (e.g., `/api/v2/`) while maintaining backward compatibility.

---

## Development & Testing

### Testing with cURL

```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user (replace TOKEN with actual token from login)
curl -X GET http://localhost:3000/api/v1/users/me \
  -H "Authorization: Bearer TOKEN"
```

### Testing with JavaScript

```javascript
// Register
const registerResponse = await fetch(
  'http://localhost:3000/api/v1/auth/register',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    }),
  }
);
const { token } = await registerResponse.json();

// Get current user
const userResponse = await fetch('http://localhost:3000/api/v1/users/me', {
  headers: { Authorization: `Bearer ${token}` },
});
const { user } = await userResponse.json();
```

---

## Security Considerations

- **HTTPS**: Always use HTTPS in production to encrypt tokens in transit
- **Token Storage**: Store JWT tokens securely (HttpOnly cookies or secure storage)
- **Password Requirements**: Enforce strong passwords (minimum 8 characters, consider complexity requirements)
- **SQL Injection**: All queries use parameterized statements
- **XSS Protection**: API returns JSON only; template rendering handles escaping
- **CSRF**: Not applicable to stateless JWT authentication
- **Rate Limiting**: Implement in production to prevent brute force attacks

---

## Future Endpoints

Planned endpoints for future implementation:

- `PUT /api/v1/users/me` — Update current user profile
- `DELETE /api/v1/users/me` — Delete user account
- `POST /api/v1/auth/refresh` — Refresh JWT token
- `POST /api/v1/auth/logout` — Invalidate token (requires token blacklist)
- `POST /api/v1/auth/forgot-password` — Request password reset
- `POST /api/v1/auth/reset-password` — Reset password with token

---

## Additional Resources

- [README.md](README.md) — Project overview and setup
- [Shared Types](shared/types/) — TypeScript types for API contracts
- [Backend Routes](backend/src/routes/api/v1/) — Route implementations
- [Middleware](backend/src/middleware/) — Authentication and validation logic
