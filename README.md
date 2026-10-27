# TechX Todo List Backend

NestJS 12 API with Prisma ORM 8/PostgreSQL, JWT cookie authentication, and owner-scoped task CRUD.

## Setup

1. Copy `.env.example` to `.env`.
2. Set a PostgreSQL connection string and a strong `JWT_SECRET`.
3. Install dependencies: `npm install`.
4. Review and apply the Prisma migration: `npm run migration:plan`, then `npm run migrate`.
5. Start the API: `npm run dev`.

The API listens on port `3000` by default.

## Environment

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: signing secret; required in production.
- `JWT_EXPIRES_IN`: JWT lifetime, for example `24h`.
- `CORS_ORIGINS`: comma-separated allowed browser origins.
- `PORT`: server port.
- `NODE_ENV`: use `production` for secure cookies.

## Authentication

`POST /auth/register` and `POST /auth/login` set an HTTP-only `access_token` cookie. The cookie is used automatically by browsers and is also accepted via `Authorization: Bearer <token>` for SSR and API clients. Logout clears the cookie. Registration and login return public user data without password hashes.

## API

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks`
- `PATCH /tasks/:id`
- `PATCH /tasks/:id/completion`
- `DELETE /tasks/:id`

Every task endpoint requires authentication. Task queries always include the authenticated user ID, preventing cross-user access.

## Validation

Run `npm run build` and `npm run db:verify` after changes.
