# Tools Platform Frontend

Next.js application foundation for the Wisemen Soft Tools Platform, a consumer-facing catalog
of fast, privacy-conscious online utilities. Tool processing is browser-first to reduce latency,
protect user data, and keep infrastructure costs predictable.

The product is currently in Phase 0: research and foundation. The application contains the
tested platform scaffold and first tool vertical slice, not the final brand or complete catalog.
Shared scope and sequencing live in the parent [`docs`](../docs/) directory; check
[`TRACKING.md`](../docs/TRACKING.md) before starting implementation work.

## Available routes

| Route | Purpose |
|---|---|
| `/` | Registry-backed product entry point |
| `/categories/developer-tools` | Developer tool category and planned tool states |
| `/tools/json-formatter` | Worker-based JSON formatting, minification, validation, and copy workflow |

The tool and category pages are generated from the typed registry in `lib/tools/`. New tools
should extend that registry and use the reusable tool-page shell rather than duplicating route
layout and metadata logic.

The JSON Formatter uses a Web Worker so parsing and serialization do not block the interface.
Its current local-processing limit is five million characters.

## Technology

- Next.js 16 App Router and React 19
- Strict TypeScript
- Material UI and Emotion
- Server Components by default
- Zod environment validation
- Vitest, React Testing Library, and jsdom
- ESLint and TypeScript validation
- Multi-stage Docker build and GitHub Actions CI

## Requirements

- Node.js 22+
- npm 11+
- Docker Desktop, only when using the container workflow

## Environment variables

Copy `.env.example` to `.env.local` before starting the application locally.

| Variable | Purpose | Local example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Versioned backend base URL | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_SITE_URL` | Canonical frontend origin | `http://localhost:3000` |

Both values are public browser configuration and must be valid URLs. They are validated when
the application loads.

## Local development

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the local Next.js development server |
| `npm run build` | Create the production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint with warnings treated as errors |
| `npm run type-check` | Run TypeScript without emitting files |
| `npm run test` | Run the test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:ci` | Run the CI coverage suite |

Coverage has a 70% minimum threshold for branches, functions, lines, and statements. The
generated `coverage/` directory is local test output and is excluded from Git.

## Project structure

```text
app/                 App Router pages, layouts, and route-level states
components/
`-- providers/       Application-level React providers
lib/                 Environment configuration and shared utilities
public/              Static assets
theme/               Typed Material UI theme configuration
```

As product work begins, shared UI, layouts, tool modules, workers, and registry code should be
added by responsibility rather than placed directly into route files.

## Frontend conventions

- Prefer Server Components; use Client Components only for interaction or browser APIs.
- Keep tool processing in the browser whenever safe and practical.
- Move expensive processing off the main thread with Web Workers when measurements justify it.
- Use the typed Material UI theme and `sx` or theme variants instead of scattered style values.
- Provide responsive loading, empty, success, and error states with accessible semantics.
- Do not expose secrets through `NEXT_PUBLIC_*` variables.

## Docker

Start the development container with:

```bash
docker compose up --build
```

The production image uses the Next.js standalone output, runs as a non-root user, and includes
an HTTP health check.

## Continuous integration

GitHub Actions runs on pushes and pull requests targeting `main` or `uat`. The pipeline checks:

1. Linting
2. Strict type-checking
3. Tests and coverage
4. Production build
5. Production dependency audit
6. Container build

## Planned product architecture

The approved direction is a central tool registry, reusable tool-page contract, consistent SEO
metadata, privacy-safe analytics, accessible interactions, and related-tool navigation. The
launch catalog and first implementation category remain research decisions and should not be
hardcoded from the provisional blueprint.
