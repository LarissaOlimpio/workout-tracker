# AGENTS.md

## Project

- Workout tracker monorepo: React web app and NestJS API, PostgreSQL, JWT auth in an HttpOnly cookie.
- Users sign up, fill a training profile, track weight and body measurements on a dashboard, and get recommended workout videos they rate with like/dislike. Videos come from a seeded catalog for now (YouTube integration is planned).
- UI copy is pt-BR. Code, API values and database enums are English.
- Workspace uses pnpm 12.11.2. API: NestJS 12, TypeScript ^6.0.2, TypeORM ^1.1.2, PostgreSQL driver ^8.23.1. Web: React ^19.3.1, Vite ^8.3.4, TypeScript ~7.0.2, TanStack Router ^1.170.45, React Query ^5.104.5, Tailwind ^4.3.3, Recharts.
- Versions are manifest ranges (see each `package.json`); the Node.js version is not declared.
- Endpoint list and project decisions live in `README.md`; do not duplicate them here.

## Structure

- `apps/api/src`: Nest modules, each with controller, service, DTOs and entities.
  - `auth/`: login, logout, password recovery.
  - `user/`: account data (create, me, update, delete, change password). `user/profile/` holds the training profile with its own controller, DTOs, entity, service and enums (`types/user-profile.enums.ts`).
  - `video/`: video catalog (seeded), recommendations and per-user feedback.
  - `measurement/`: `body_measurements` history.
  - `dashboard/`: aggregated data for the dashboard.
  - SQL migrations for schema changes.
- `apps/api/test`: e2e tests. Unit specs live beside the source.
- `apps/web/src/routes`: file-based TanStack routes, folder style.
  - `_auth.tsx`: pathless layout for authenticated pages. It checks the session in `beforeLoad` and renders the shared header and `<main><Outlet /></main>`.
  - `_auth/`: dashboard (`/`), profile setup and summary (`/profile/setup`, `/profile/summary`), account settings (`/account`).
  - Public routes (login, signup, forgot/reset password) stay outside `_auth`. `/profile-setup` redirects to `/profile/setup`.
- `apps/web/src/lib`: API client and token helpers. `public`: static assets.
- Shared components (such as the header), feature components, hooks and API functions live outside `routes/`. Only route files go inside `routes/`.
- `packages/`: workspace package location; currently empty.
- `apps/api/dist` and `apps/web/src/routeTree.gen.ts`: generated output. Never hand-edit.

## Setup and commands

- Install from the repository root: `pnpm install`.
- Start local services: `docker compose up -d db mailpit` (PostgreSQL 16 and Mailpit). Provide the DB variables from `.env.example`; the API also requires `JWT_SECRET`.
- Migrations: use the TypeORM migration scripts in `apps/api/package.json`. Every schema change needs a migration.
- API: `pnpm --filter api run start:dev`; build: `pnpm --filter api run build`; production: `pnpm --filter api run start:prod`.
- Web: `pnpm --filter web run dev`; build: `pnpm --filter web run build`; preview: `pnpm --filter web run preview`.
- API tests: `pnpm --filter api run test`; e2e: `pnpm --filter api run test:e2e`; coverage: `pnpm --filter api run test:cov`.
- One API spec: `pnpm --filter api exec vitest run src/user/user.service.spec.ts`.
- Lint: `pnpm --filter api run lint` (Oxlint); `pnpm --filter web run lint` (ESLint).
- The root package defines only a placeholder `test` script; there are no root build, lint or dev scripts.

## API conventions

- TypeScript is strict, ES modules with decorators and explicit `.js` import suffixes. API code mostly uses single quotes.
- Services use TypeORM repositories. DTOs validate input with class-validator; response DTOs are separate from request DTOs.
- Authenticated routes use `JwtAuthGuard`. The user id always comes from the token (`req.user.userId`), never from the URL or body. Self-service routes live under `/users/me`.
- Enums are `Object.freeze` constants plus a derived type, with English snake_case values (for example `lose_weight`). Reuse the profile enums from other modules instead of redefining them.
- Every table owned by a user references it with `ON DELETE CASCADE`.
- Avoid circular module dependencies. When two modules need each other's data (profile and measurement), register the other entity with `TypeOrmModule.forFeature` and use its repository, not the other service.
- Profile and measurements: the profile holds the current state; `body_measurements` holds the history, unique per (user, date). Posting a measurement updates the profile when it is the latest one. Saving the profile creates a measurement for today when weight or measures differ from the latest one (and creates the first one if none exists).
- Video feedback is unique per (user, video). Recommendations filter by the profile (goal, level, equipment), hide disliked videos and rank liked ones and similar tags first.
- The dashboard endpoint computes BMI and its category (as codes) and returns the chart series and history. Training frequency stays `null` until workout logging exists.

## Web conventions

- Form state keeps API values (English codes) and is rendered through the single PT label map (`profile.labels.ts`). Do not translate values at the API layer.
- Form types are separate from API types. Forms hold strings; convert at the boundary when sending (dd/mm/aaaa to yyyy-mm-dd, comma decimals to numbers). Measurement dates are sent as the local date.
- Fetch server data with TanStack Query (shared `queryOptions`). Do not use `useEffect` to copy server data into state: derive values, or initialize form state from props. After a mutation that returns the entity, update the cache with `setQueryData`.
- Requests use `credentials: "include"`. The client's global 401 handling (logout and redirect) must not run for `POST /users/me/password`, where 401 means a wrong current password.
- The auth cookie is HttpOnly, so the web cannot clear it. Logout calls `POST /auth/logout`; after deleting an account, call `DELETE /users/me`, then logout, then clear the query cache.
- Pages under `_auth` render only their content: no own header, `<main>`, `min-h-screen` or page-wide padding wrapper.
- Charts use Recharts. Keep components small and in files separate from route files.
- Web files use mixed quote styles; match the file being edited.

## Testing and agent rules

- API tests use Vitest 4 and Nest testing utilities; e2e uses Supertest. The web has no test framework.
- Do not read or commit secrets from `.env`; use `.env.example` for variable names.
- Read only the files needed for the task. No repo-wide scans, no `node_modules` or lockfiles.
- No docs and no new tests unless asked. Never edit generated files (`routeTree.gen.ts`, `dist`).
- No refactors outside the task. Preserve existing formatting; run a formatter only when intended (`pnpm --filter api run format`).
- Before finishing, review the diff and run lint and build for the app you changed. Do not claim checks ran if they did not.
- Final report: the list of changed files and one line with the lint/build result; mention only errors.

## Open questions

- No Node.js version or frontend test framework is declared.
- No root-level lint, build or run commands are configured.
