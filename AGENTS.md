# AGENTS.md

Guidance for coding agents working in this repository.

## Repository Overview

- Monorepo-style layout with separate backend and frontend projects.
- Root project orchestrates both apps with npm scripts.
- Backend: Node.js + Express 5 + Sequelize + Apollo Server (CommonJS).
- Frontend: Next.js 16 + React 19 + TypeScript + Apollo Client + Ant Design.

## Directory Map

- `backend/` - REST + GraphQL API, Sequelize models/migrations/seeders.
- `backend/src/controllers/` - REST handlers.
- `backend/src/routes/` - Express routers.
- `backend/src/graphql/` - GraphQL schema + resolvers.
- `backend/src/models/` - Sequelize models + associations.
- `frontend/` - Next.js app.
- `frontend/app/` - App Router entrypoints.
- `frontend/components/` - UI components.
- `frontend/lib/` - shared client utilities.

## Tooling & Package Manager

- Use `npm` (lockfile is `package-lock.json`).
- Install deps:
  - Root: `npm install`
  - Backend: `npm install --prefix backend`
  - Frontend: `npm install --prefix frontend`

## Build / Lint / Test Commands

### Root

- Start both backend + frontend in dev mode:
  - `npm run dev`
- Start only backend:
  - `npm run dev:backend`
- Start only frontend:
  - `npm run dev:frontend`

### Backend (`backend/`)

- Dev server (nodemon):
  - `npm run dev --prefix backend`
  - or `cd backend && npm run dev`
- Current `test` script is a placeholder and always fails:
  - `npm test --prefix backend`
- There is no configured backend lint script yet.

### Frontend (`frontend/`)

- Dev server:
  - `npm run dev --prefix frontend`
- Production build:
  - `npm run build --prefix frontend`
- Run production server:
  - `npm run start --prefix frontend`
- Lint whole frontend:
  - `npm run lint --prefix frontend`

### Running a Single Test (Important)

There is currently no real test framework configured in either app (no Jest/Vitest test suites).
So “run a single test” is not available yet in this repository.

If/when tests are added, document exact one-test commands here.

## DB / Sequelize Commands (Backend)

Sequelize CLI is installed in backend devDependencies and configured via `backend/.sequelizerc`.

Run from `backend/` (recommended):

- Apply migrations:
  - `npx sequelize-cli db:migrate`
- Undo last migration:
  - `npx sequelize-cli db:migrate:undo`
- Run seeders:
  - `npx sequelize-cli db:seed:all`
- Undo all seeders:
  - `npx sequelize-cli db:seed:undo:all`

Configuration file used: `backend/src/config/config.js`.

## Environment Variables

Do not hardcode secrets. Use env vars.

Backend expects (from `backend/src/config/config.js`):

- `DB_USER`
- `DB_PASS`
- `DB_NAME`
- `DB_HOST`
- `DB_PORT`
- `DB_DIALECT`
- `PORT` (optional, defaults to `8000`)

Frontend expects:

- `NEXT_PUBLIC_API_URL` (default `http://localhost:8000/api`)
- `NEXT_PUBLIC_GRAPHQL_URL` (default `http://localhost:8000/graphql`)

## Code Style Guidelines

Follow existing local conventions instead of introducing new styles.

### General

- Prefer small, focused changes.
- Preserve current architecture (REST controllers + GraphQL resolvers).
- Avoid broad refactors unless requested.
- Keep comments concise and useful; do not over-comment obvious code.

### Imports / Module System

Backend:

- Uses CommonJS (`require`, `module.exports`).
- Keep `require` statements at top of file.
- Use relative imports with explicit `.js` extension where already used.

Frontend:

- Uses ESM imports and TypeScript.
- Prefer alias imports with `@/` (configured in `frontend/tsconfig.json`) for app-local modules.
- Group imports by source (React/third-party/internal), consistent with existing files.

### Formatting

- Match existing formatting style:
  - double quotes,
  - semicolons,
  - trailing commas where present,
  - 2-space indentation.
- Do not introduce a different formatter style in touched files.
- Run frontend lint after frontend edits.

### Types (TypeScript / JS)

Frontend TS:

- `strict` mode is enabled; keep code type-safe.
- Add explicit interfaces/types for API/GraphQL response shapes.
- Avoid `any`; prefer precise interfaces or utility types.
- Type component props explicitly.

Backend JS:

- No TypeScript; rely on clear naming and validation.
- Keep request/response payload shapes consistent.

### Naming Conventions

- JS/TS variables and functions: `camelCase`.
- React components: `PascalCase`.
- Sequelize models: `PascalCase` model names, snake_case DB columns.
- API/DB fields currently use snake_case (`customer_id`, `pickup_location`, etc.); keep consistent.
- Route/controller names should mirror resource names (`customer`, `order`, `item`).

### Error Handling

Backend:

- Wrap async controller logic in `try/catch`.
- For known Sequelize errors, return explicit 4xx JSON responses.
- Forward unexpected errors with `next(error)` so `errorHandler` can format output.
- Keep response shape consistent (`status`, `message`, optional `data`).

Frontend:

- Catch network/mutation failures and surface user-friendly feedback (`message.error`).
- Log unexpected errors for debugging (`console.error`) without exposing sensitive details.
- Handle loading and error states explicitly in pages/components.

### API & Data Consistency

- Keep REST response contracts stable for existing frontend usage.
- Keep GraphQL schema field names consistent with current schema (`pickup_location`, etc.).
- Preserve Sequelize associations aliases (`orders`, `customer`, `items`, `order`).

### Next.js Notes

- This project uses Next.js 16; verify APIs against local docs if behavior is uncertain.
- Preserve App Router conventions in `frontend/app/`.

## Required Agent Rules Imported from Existing AGENTS

Copied from `frontend/AGENTS.md`:

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor / Copilot Rules Check

- `.cursorrules`: not found.
- `.cursor/rules/`: not found.
- `.github/copilot-instructions.md`: not found.

If those files are added later, update this AGENTS.md and merge their directives here.

## Practical Workflow for Agents

1. Inspect existing patterns in the specific folder before editing.
2. Make minimal changes that solve the task.
3. Run relevant checks:
   - Frontend: `npm run lint --prefix frontend`
   - Frontend build when needed: `npm run build --prefix frontend`
   - Backend: at least run dev server for smoke validation.
4. Do not commit secrets or `.env` files.
5. Update this document when commands or conventions change.
