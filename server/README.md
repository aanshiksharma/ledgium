# Household Ledger — Server

Express + TypeScript backend.

## Current scope

This first pass establishes:

- Express application
- TypeScript configuration
- Environment validation
- CORS
- Helmet
- Rate limiting
- JSON/body parsing
- Central error handling
- API versioning at `/api/v1`
- Authentication module boundaries
- Email/password authentication contracts
- Google authentication contract
- JWT middleware
- Health endpoint

The authentication service deliberately does not connect to PostgreSQL yet. The PostgreSQL schema and repository layer will be added before authentication is made functional.

## Run

```bash
npm install
```

Copy `.env.example` to `.env` and fill in the values.

Then:

```bash
npm run dev
```

Health check:

```text
GET http://localhost:5000/health
```

API base:

```text
http://localhost:5000/api/v1
```

## Authentication endpoints

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/google
GET  /api/v1/auth/me
```
