# QuicklySorted Frontend

Next.js application foundation for QuicklySorted, a Wisemen Soft product and consumer-facing catalog
of fast, privacy-conscious online utilities. Tool processing is browser-first to reduce latency,
protect user data, and keep infrastructure costs predictable.

The product is currently in Phase 0: research and foundation. The application contains the
tested platform scaffold and initial tool vertical slices, not the final brand or complete catalog.
Shared scope and sequencing live in the parent [`docs`](../docs/) directory; check
[`TRACKING.md`](../docs/TRACKING.md) before starting implementation work.

## Available routes

| Route | Purpose |
|---|---|
| `/` | Registry-backed product entry point |
| `/categories/developer-tools` | Developer tool category and planned tool states |
| `/tools/json-formatter` | Worker-based JSON formatting, minification, validation, and copy workflow |
| `/tools/base64-encoder-decoder` | Worker-based UTF-8 Base64 encoding and decoding workflow |
| `/tools/url-encoder-decoder` | Worker-based URL component encoding and decoding workflow |
| `/tools/uuid-generator` | Secure browser-native UUID v4 batch generator |
| `/tools/jwt-decoder` | Local JWT header and payload decoder with explicit non-verification warnings |

The tool and category pages are generated from the typed registry in `lib/tools/`. New tools
should extend that registry and use the reusable tool-page shell rather than duplicating route
layout and metadata logic.

The JSON Formatter, Base64 Encoder / Decoder, and URL Encoder / Decoder use Web Workers so
large conversions do not block the interface. Their current local-processing limit is five
million input characters.

The JWT Decoder accepts tokens up to 100,000 characters and decodes their header and payload
locally. It does not verify signatures or token authenticity, so decoded claims remain untrusted.

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
| `NEXT_PUBLIC_API_URL` | Versioned backend base URL | `http://localhost:4000/api/v1` |
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
|-- layout/          Shared site navigation and footer
|-- providers/       Application-level React providers
|-- states/          Reusable loading and error states
`-- tools/           Tool workspaces and shared editor components
lib/
`-- tools/           Pure transformations, worker clients, and the tool registry
public/              Static assets
theme/               Typed Material UI theme configuration
types/               Shared application and worker contracts
workers/             Browser worker entry points for expensive processing
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

## Adding a tool or category

The registry in `lib/tools/tool-registry.ts` is the single source of truth. Pages, the home
grid, the categories hub, breadcrumbs, the footer, the sitemap, and structured data all read
from it, so a new entry shows up everywhere with the shared visual language.

### Add a category

1. Add an entry to `TOOL_CATEGORIES` with a unique `id` and `slug`, a `name`, `description`,
   `eyebrow`, an `icon` key, and `status: "planned"` until it has a tool.
2. Set `status: "available"` once the first tool in it ships. Only available categories get a
   page and a sitemap entry; planned ones appear on the hub as "Coming soon".

### Add a tool

1. Build the workspace component in `components/tools/`. Compose the shared pieces:
   `ToolWorkspace` (toolbar and body), `TextEditorPanel`, `ToolFooter`, and for two-way text
   converters `BidirectionalTextTool`. Put the logic in `lib/tools/` and test it.
2. Add an entry to `TOOL_DEFINITIONS` with a unique `id` and `slug`, a short and a long
   description (the long one becomes the meta description), `keywords`, `categoryId`,
   `processingMode`, `relatedToolIds`, and an `icon` key. Use `status: "planned"` until it ships.
3. Register the component against the tool `id` in `components/tools/tool-components.ts` and
   set `status: "available"`. `tool-components.test.ts` fails if a live tool has no component.
4. If you need a new icon, add it once to `TOOL_ICONS` in `components/ui/tool-icon.tsx`; the
   icon key type is derived from that map.

### SEO

Every page sets a canonical URL, Open Graph, and Twitter metadata through
`buildPageMetadata` in `lib/seo.ts`. Tool pages add `WebApplication` and `BreadcrumbList`
structured data, category pages add `ItemList` and `BreadcrumbList`, and the home page adds
`WebSite`. `app/sitemap.ts` and `app/robots.ts` are generated from the registry. Keep each page
to a single `h1`, and use `HiddenHeading` when the design omits a section title but the
heading outline would otherwise skip a level.

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
