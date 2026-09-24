# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The numbered `*_Day_*` directories are static learning material (markdown + React exercises). The only full-stack application is `engineering-manager-dashboard/`, which has a NestJS backend and an Angular 20 frontend.

---

## engineering-manager-dashboard

### Running the stack

**Full stack (recommended):**
```bash
cd engineering-manager-dashboard
docker compose up          # postgres + backend + frontend (nginx)
```

**Frontend dev server** (hot-reload, proxies API to localhost:3000):
```bash
cd engineering-manager-dashboard/frontend
npm start                  # ng serve on :4200
# or on a different port:
npx ng serve --port 4201
```

**Backend dev server:**
```bash
cd engineering-manager-dashboard/backend
npm run start:dev          # nest start --watch on :3000
```
Required env vars (defaults work locally):
```
DB_HOST=127.0.0.1  DB_PORT=5432  DB_USERNAME=postgres
DB_PASSWORD=postgres  DB_NAME=engineering_manager_dashboard
JWT_SECRET=any-32-char-string
```

**Seed the database:**
```bash
cd engineering-manager-dashboard/backend
npm run seed
```
The seed service checks for existing data and skips if already seeded. Demo credentials use `Password@123` for all accounts.

### Testing

```bash
# Frontend (Karma + Jasmine)
cd engineering-manager-dashboard/frontend
npm test                   # ng test (watch mode)

# Backend (Jest)
cd engineering-manager-dashboard/backend
npm test                   # jest, matches *.spec.ts
npm run test:watch
npm run test:cov
npm run test:e2e           # uses test/jest-e2e.json
```

### Linting / formatting

```bash
# Backend only (ESLint 9 flat config + Prettier)
cd engineering-manager-dashboard/backend
npm run lint               # eslint --fix
npm run format             # prettier --write

# Frontend: no lint script defined; use ng build to catch TS errors
cd engineering-manager-dashboard/frontend
npx ng build               # type-checks the whole app
```

### Build

```bash
cd engineering-manager-dashboard/frontend && npm run build    # Vite/esbuild output in dist/
cd engineering-manager-dashboard/backend  && npm run build    # tsc output in dist/
```

---

## Frontend architecture

**Angular 20, standalone components, strict TypeScript.**

### Key constraint: no arrow functions in templates
Angular's template compiler (strict mode) rejects arrow functions inside `@if`, `@for`, `[binding]` etc. Move any derived value into a `computed()` signal on the class instead:
```typescript
// ✗ in template: items().filter(i => i.active).length
// ✓ in class:
readonly activeCount = computed(() => this.items().filter(i => i.active).length);
```

### State pattern
`AuthStore` (`core/stores/auth.store.ts`) is the only NgRx Signals store — it holds the authenticated user, JWT, and loading/error state. All other features use plain `inject()`-ed services and local `signal()`/`computed()` on the component.

### HTTP + Auth
`authInterceptor` (`core/interceptors/auth.interceptor.ts`) is a functional interceptor registered in `app.config.ts`. It reads the token from `AuthStore` and attaches `Authorization: Bearer {token}` to every outgoing request. The `apiUrl` (`http://localhost:3000`) comes from `environments/environment.ts`.

### Routing + guards
All routes lazy-load via `loadComponent`. Two guards:
- `authGuard` — redirects to `/login` if no token
- `roleGuard` — restricts manager-only routes (`/employees`, `/promotion-readiness`, `/talent-matrix`, `/risk`, `/reports`) to `ENGINEERING_MANAGER` and `DIRECTOR` roles

### UI layer
Angular Material 3 (MDC-based). When styling Material list items, the rendered text lives in `.mdc-list-item__primary-text` — parent `color` is overridden by Material internals, so target that internal class explicitly in SCSS.

Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`). The global design tokens are defined as Tailwind utilities: `kpi-tile`, `kpi-tile--primary/success/warning/danger/info`, `page-header`, `filter-pill`.

### Dashboard home
`DashboardHome` shows different content based on role: managers get KPI tiles + ECharts charts (loaded via `DashboardService`); employees see quick-link cards only. Charts use `ngx-echarts` with `[options]` and `[theme]` bindings.

---

## Backend architecture

**NestJS 11, TypeORM, PostgreSQL 16, Passport JWT.**

### Auth flow
Every route except `POST /auth/login` is protected by `JwtAuthGuard` (extends Passport's `AuthGuard('jwt')`) + `RolesGuard`. Apply them at the controller level:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ENGINEERING_MANAGER, Role.DIRECTOR)
@Controller('dashboard')
```
`@CurrentUser()` is a param decorator that extracts `AuthenticatedUser` (sub, email, role, employeeId) from the JWT payload.

### Module structure
One NestJS module per domain (`employees`, `evaluations`, `goals`, `achievements`, `development-plans`, `one-on-ones`, `learning`, `promotion-readiness`, `talent-matrix`, `risk`, `dashboard`, `reports`, `notifications`). Each module has a controller + service + `entities/` subfolder. Shared guards, decorators, and enums live in `common/`.

### Config
All configuration flows through `@nestjs/config`. Read values via `inject(ConfigService)`, not `process.env` directly. The `typeorm.config.ts` factory builds the TypeORM connection from `ConfigService`.

### TypeORM
`synchronize: true` in development (auto-migrates from entity definitions). Entities use UUID primary keys (`@PrimaryGeneratedColumn('uuid')`). The database is `engineering_manager_dashboard`.

### Seed
`src/database/seeds/seed.service.ts` checks for existing user rows and skips if found. To force a re-seed, clear the database first.

---

## Env vars reference

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | |
| `DB_PORT` | `5432` | |
| `DB_USERNAME` | `postgres` | |
| `DB_PASSWORD` | `postgres` | |
| `DB_NAME` | `engineering_manager_dashboard` | |
| `DB_SYNCHRONIZE` | `true` | Auto-migrate from entities |
| `JWT_SECRET` | `change-this-secret-in-production` | |
| `JWT_EXPIRES_IN` | `8h` | |
| `PORT` | `3000` | Backend listen port |
| `CORS_ORIGIN` | `http://localhost:4200` | |
