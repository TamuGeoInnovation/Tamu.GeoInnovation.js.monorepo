# GitHub Copilot Instructions for Tamu.GeoInnovation.js.monorepo

This guide helps Copilot understand the codebase structure and development practices specific to this repository.

## Architecture Overview

This is an Nx monorepo containing multiple Angular front-end applications and NestJS backend APIs maintained by the Texas A&M GeoInnovation Service Center. The monorepo houses the Aggiemap platform and various derivatives for campus operations and specialized applications.

**Key Structure:**
- **`apps/`** - Application entry points (thin shells with minimal logic). Main app: `aggiemap-angular`
- **`libs/`** - All business logic shared across applications. Organized by feature/domain:
  - `libs/common/` - Shared utilities and components
  - `libs/aggiemap/`, `libs/gisday/`, `libs/cpa/`, etc. - Feature-specific libraries
  - `libs/assets/` - Images, fonts, and static assets
  - `libs/sass/` - Global styles
- **`tools/`** - Workspace automation scripts
- **`stacks/`** - CloudFormation/infrastructure-as-code templates
- **`templates/`** - Nx workspace generators for scaffolding

**Framework Stack:**
- **Frontend:** Angular 15.2.9 with TypeScript, SCSS, Mapbox GL, Esri ArcGIS
- **Backend:** NestJS 9.4.3 with TypeORM, Bull job queues, various database adapters (MySQL, MSSQL, SQLite)
- **Authentication:** Auth0, JWT, OIDC Provider, Passport.js
- **Testing:** Jest (unit), Cypress (e2e)
- **Build Tool:** Nx 16.0.0

## Build, Test, and Lint Commands

### Common Tasks

| Task | Command | Notes |
|------|---------|-------|
| **Serve main app locally** | `npx nx run aggiemap-angular:serve --host 0.0.0.0` | Runs on http://localhost:4200; auto-rebuilds on changes |
| **Build specific project** | `npx nx run [project-name]:build` | Replace `[project-name]` with actual project (e.g., `aggiemap-angular`, `geoservices-nest`) |
| **Test single project** | `npx nx run [project-name]:test` | Runs Jest tests for that project only |
| **Test with coverage** | `npx nx run [project-name]:test --coverage` | Generates coverage report |
| **Lint single project** | `npx nx run [project-name]:lint` | ESLint check for that project |
| **E2E test** | `npx nx run [project-name]-e2e:e2e` | Cypress tests for `-e2e` projects |

### Workspace-Level Tasks

Use these for checking across multiple projects based on what changed:

```bash
npm run affected:build       # Build only affected apps/libs
npm run affected:test        # Test only affected projects
npm run affected:lint        # Lint only affected projects
npm run affected:e2e         # Run e2e tests for affected apps
npm run format:check         # Check code formatting
npm run format:write         # Auto-format all code with Prettier
npm run coverage             # Generate coverage report (all projects)
```

### Viewing Dependencies

```bash
npm run dep-graph            # Open interactive dependency graph
npm run affected:dep-graph   # Show only affected dependencies
```

## Key Conventions

### Project Naming and Scoping

- **NPM Scope:** `@tamu-gisc/`
- **Nx Project Names:** Kebab-case (e.g., `aggiemap-angular`, `geoservices-nest`)
- **E2E Projects:** Named as `[project-name]-e2e` (e.g., `aggiemap-angular-e2e`)

### PR Format

Pull request titles follow this pattern:

```
scope(project-name): Short description
```

**Scopes:**
- `fix` - Bug fixes
- `feat` - New features, refactors, enhancements
- `chore` - Docs, dependency updates
- `ci` - CI/CD pipeline changes

**Examples:**
- `fix(aggiemap-angular): Resolve map pan lag on mobile`
- `feat(geoservices-nest): Add spatial query caching`
- `chore(geoservices-angular): Update dependencies`

When affecting multiple projects or the workspace, the project name can be omitted.

### Code Style

**Formatter:** Prettier (enforced automatically)
- Print width: 125 characters
- Single quotes for JavaScript/TypeScript
- Semicolons required
- Trailing commas disabled
- LF line endings
- HTML/YAML files use increased print width (9999)

**Linter:** ESLint with `@nx/enforce-module-boundaries`
- No cross-lib boundary violations without proper declarations
- Enforces buildable lib dependencies

**Format check:** `npm run format:check`
**Auto-format:** `npm run format:write`

### Library Organization

**Frontend Libraries:**
- Use `@nx/angular` schematics for component/service generation
- SCSS for styles (not CSS)
- Jest for unit tests (`jest.config.ts` in lib root)
- Pattern: `libs/[domain]/src/` contains source code

**Backend Libraries:**
- Use `@nx/nest` schematics for module/controller/service generation
- TypeORM for database access
- Bull for background jobs
- Env vars via `dotenv` or environment files

**Shared Libraries:**
- Place in `libs/common/` for cross-app reuse
- Expose via `src/index.ts` (barrel export)
- Tag appropriately in `project.json` for dependency rules

### Testing

**Unit Tests (Jest):**
```bash
npm run affected:test                    # Test changed projects
npx nx run [project]:test --coverage     # Single project with coverage
npx jest --watch                         # Watch mode for development
```

**E2E Tests (Cypress):**
```bash
npx nx run [app]-e2e:e2e                 # Run Cypress tests
npx nx run [app]-e2e:e2e --watch         # Headed mode for debugging
```

**Note:** Unit test coverage is appreciated but not currently required.

### Dependency Management

- **Package manager:** npm (use `npm ci` to install, not `npm install`)
- **Node version:** Matches `.github/workflows/build.yml` `node-version` (currently 20.18.1)
- **Database drivers:** MySQL, MSSQL, and SQLite are supported via TypeORM
- **Session storage:** `better-sqlite3-session-store` for Express sessions
- **Validation:** `class-validator` + `class-transformer` for DTO validation (NestJS)

### File Structure Examples

**Angular App:**
```
apps/aggiemap-angular/
├── src/
│   ├── app/              # App component and routing
│   ├── environments/      # Environment configs (dev, prod, staging)
│   ├── assets/           # App-specific static files
│   └── main.ts           # Entry point
├── project.json          # Nx targets (build, serve, lint, test)
└── tsconfig.app.json     # TypeScript config
```

**Angular Library:**
```
libs/aggiemap/[feature]/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   ├── services/
│   │   └── guards/
│   └── index.ts          # Barrel export
├── jest.config.ts
└── project.json
```

**NestJS App:**
```
apps/geoservices-nest/
├── src/
│   ├── app/
│   │   ├── [module-name]/  # Feature modules
│   │   ├── app.controller.ts
│   │   └── app.service.ts
│   └── main.ts           # Bootstrap
└── project.json
```

### Environment-Specific Code

- **Environment files:** `apps/[app]/src/environments/environment.ts` (dev), `environment.prod.ts` (production), `environment.staging.ts` (staging)
- **Build configs in `project.json`:** Use fileReplacements to swap environment files
- **Backend:** Use `.env` files or pass via `process.env` (loaded by `dotenv` in package.json postinstall)

### ArcGIS base URL (`gishost`)

- Many frontend modules construct ArcGIS layer/service URLs using a repository-wide variable named `gishost`.
- `gishost` is typically defined in the Angular environment files (`apps/[app]/src/environments/*.ts`) for frontend apps, or read from `process.env.GISHOST` on server-side services. Keep the value as a full base URL (no trailing slash), for example:

  `gishost: 'https://services9.arcgis.com/your-org/ArcGIS/rest/services'`

- Usage notes for Copilot:
  - When modifying or generating code that refers to ArcGIS services, prefer using `gishost` as the canonical base instead of hard-coding provider URLs.
  - Ensure the code appends the service and layer paths (e.g., `\${gishost}/ServiceName/MapServer/0`) and handles missing slashes robustly.
  - Document or create a default local override for developers (in `environment.ts`) to point at test services or a proxy to avoid CORS issues.
  - If generating configuration or tests, respect that `gishost` may be replaced at build time via file replacements or environment variables in CI.

### Import Paths

Use path aliases defined in `tsconfig.base.json`:
```typescript
import { SomeService } from '@tamu-gisc/common/services';
import { AggiemapComponent } from '@tamu-gisc/aggiemap/components';
```

Avoid relative imports across library boundaries.

### Commit Guidelines

- Keep commits **atomic** — one logical change per commit
- First line under 72 characters, descriptive (not "fixes" or "fixed bug")
- Use additional lines for details
- Aim for a commit history that tells a story from start to finish
- Enable clean `git bisect` for debugging

## Working in Devcontainers

This repo strongly recommends using devcontainers for a consistent environment. The `.devcontainer/` configuration provides Node.js, TypeScript, and all dependencies pre-installed. See `GETTING_STARTED.md` for setup instructions.

## Common Pitfalls

- **Breaking downstream dependencies:** Check `npm run dep-graph` before changing shared libs
- **Module boundary violations:** Ensure libraries don't import across boundaries without proper `project.json` tags
- **Inconsistent styling:** Run `npm run format:write` before committing
- **Missing E2E fixtures:** Some apps require secret configuration files for full setup (Aggiemap doesn't)

## Additional Resources

- **Style Guide:** https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/wiki/Style-Guide
- **Contributing Guide:** `CONTRIBUTING.md`
- **Getting Started:** `GETTING_STARTED.md`
- **Nx Documentation:** https://nx.dev/
