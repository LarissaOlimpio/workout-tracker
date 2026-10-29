# AGENTS.md

## Project
- Workout tracker monorepo: React client and NestJS API with user registration/profile and JWT authentication; PostgreSQL persistence.
- Workspace uses pnpm 12.11.2. API: NestJS 12, TypeScript ^6.0.2, TypeORM ^1.1.2, PostgreSQL driver ^8.23.1. Web: React ^19.3.1, Vite ^8.3.4, TypeScript ~7.0.2, TanStack Router ^1.170.45, React Query ^5.104.5, Tailwind ^4.3.3.
- Dependency versions are package manifest ranges; Node.js version is not declared in the inspected configuration.

## Structure
- `apps/api/src`: Nest application, feature modules/controllers/services, DTOs, entities and SQL migrations.
- `apps/api/test`: end-to-end tests; unit specs also live beside API source.
- `apps/web/src/routes`: file-based TanStack routes; `lib`: API/token helpers; `public`: static assets.
- `packages/`: workspace package location; currently no package contents.
- `apps/api/dist` and `apps/web/src/routeTree.gen.ts`: generated output. Do not hand-edit generated artifacts.

## Setup and commands
- Install from repository root: `pnpm install`.
- Start database: `docker compose up -d db` (PostgreSQL 16; provide the DB variables listed in `.env.example`; API also requires `JWT_SECRET`).
- API development: `pnpm --filter api run start:dev`; API build: `pnpm --filter api run build`; production: `pnpm --filter api run start:prod`.
- Web development: `pnpm --filter web run dev`; build: `pnpm --filter web run build`; preview: `pnpm --filter web run preview`.
- API tests: `pnpm --filter api run test`; e2e: `pnpm --filter api run test:e2e`; coverage: `pnpm --filter api run test:cov`.
- Run one API spec: `pnpm --filter api exec vitest run src/app.controller.spec.ts`.
- Lint: `pnpm --filter api run lint` (Oxlint); `pnpm --filter web run lint` (ESLint).
- Root package defines only a placeholder `test` script; no root build/lint/dev scripts are configured.

## Architecture and conventions
- API follows Nest modules contain controllers and services; services use TypeORM repositories; entities map database tables and DTOs validate/shape request data.
- Feature code is grouped under `auth/` and `user/`; tests use `.spec.ts` and `.e2e-spec.ts`.
- TypeScript uses strict checking, ES modules, decorators and explicit `.js` import suffixes in API source. React UI uses TSX, file-based routes and shared query/router providers.
- Preserve existing formatting conventions: API mostly single quotes; web files use mixed quote styles. Run the package formatter only when intended (`pnpm --filter api run format`).

## Testing and agent rules
- API tests use Vitest 4 and Nest testing utilities; e2e uses Supertest. Unit specs are under `apps/api/src`; e2e specs under `apps/api/test`.
- Do not read or commit secrets from `.env`; use `.env.example` for variable names. Avoid generated `dist/` and route tree files; make source changes instead.
- Before finishing, review the diff, run relevant package lint/build/tests, and report commands/results. Do not claim checks ran if they did not.

## Open questions
- No Node.js version or frontend test framework/script is declared.
- No root-level lint, build or run commands are configured; database migration execution workflow is not documented.

