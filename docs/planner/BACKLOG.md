# 🗂️ WildArc Autonomous Planner — Living Backlog

> This file is maintained by the WildArc Autonomous Planner + Meta-Optimizer.
> Last updated: 2026-03-27 by Planner — Completed C-05 (migration SQL written), H-15 (legacy frontend untracked from git), H-11 (Docker Compose created); marked H-06 done (build fix was already committed in abfe3a0).
>
> **Sprint plan:** See `docs/planner/SPRINT_PLAN.md` for phased timeline.

---

## How This Works

Each day the Planner reads this file, re-scores tasks based on the current codebase state, picks the top tasks, implements them, and updates this file. Tasks move through:

`🆕 New → 🎯 In Progress → ✅ Done` (or `❌ Dropped` with reason)

Priority scores are recalculated daily using: **Impact × Phase Alignment ÷ Effort** (higher = do sooner).

**Sprint tags:** Each task is tagged with its target sprint (S1–S5). The planner should prefer tasks from the current sprint but can pull ahead if blocked.

---

## 🔴 Critical (Build-Breaking / Security / Data Loss)

| # | Task | Score | Sprint | Status | Notes |
|---|------|-------|--------|--------|-------|
| C-03 | **Add rate limiting middleware (express-rate-limit)** | 90 | S1 | 🆕 New | Zero rate limiting on any endpoint. Login brute-forceable. Install express-rate-limit, add to auth + API routes. ~1-2 hours. |
| C-04 | **Add input sanitization middleware (express-validator / sanitize-html)** | 88 | S1 | 🆕 New | Zod validates shape only; no XSS protection on text fields. Add sanitization middleware to all POST/PATCH handlers. ~2 hours. |
| C-05 | **Enforce project_id on trees/zones (NOT NULL + RLS)** | 85 | S3 | 🎯 In Progress | Migration SQL written: `docs/migrations/004_enforce_project_id.sql`. ⚠️ Needs Yogesh to run in Supabase SQL Editor. Application code side done; awaiting DB migration. |

---

## 🟡 High (Phase 1 Essentials)

| # | Task | Score | Sprint | Status | Notes |
|---|------|-------|--------|--------|-------|
| H-01 | **Add aria-labels to all icon-only buttons** | 78 | S1 | ✅ Done | Added aria-labels to 13 icon-only buttons across SpeciesModal, ZoneModal, TreeDetail, TreeEdit, Dashboard, TreeList, ActivityLog, HealthLog, Employees, MapView. Also added role+aria-label to StatusDot and MapCanvas. |
| H-02 | **Add alt text to all img elements** | 75 | S1 | ✅ Done | Added descriptive alt text to TreeDetail photo gallery images. Cover image already had alt. |
| H-03 | **Fix tap targets (w-4 h-4 → w-5 h-5 min)** | 72 | S1 | ✅ Done | Increased icon button sizes from w-9 h-9 → w-11 h-11 (44px) on Dashboard, TreeList, ActivityLog, HealthLog, TreeEdit, MapView. Increased checkbox sizes from w-4 h-4 → w-5 h-5 in HealthLog. |
| H-04 | **Centralize config values into config.ts** | 68 | S1 | ✅ Done | Created `src/core/config.ts` with server.port, cors.frontendUrl/appUrl, auth.jwtExpiry/jwtRefreshExpiry/bcryptRounds, uploads.maxFileSizeBytes, pagination.defaultLimit/activityLogLimit. Updated auth.ts, server.ts, app.ts, trees.ts. |
| H-05 | **Centralize color constants (actionColors.ts)** | 65 | S1 | ✅ Done | Created `frontend/src/core/constants/actionColors.ts` with ACTION_COLORS, LEGEND_ITEMS, CANVAS_COLORS. Updated MapCanvas, MapPicker, MapView to import from centralized file. |
| H-06 | **Fix rollup/vite build (ARM64 native module)** | 70 | S1 | ✅ Done | Fixed 2026-03-26 — added vite-tsconfig-paths@4.3.2 dev dep, reinstalled node_modules. Committed as abfe3a0. |
| H-07 | **GitHub Actions CI workflow (lint + typecheck + test)** | 82 | S2 | ✅ Done | `.github/workflows/ci.yml` already exists (created in feat(ops) commit e643e77). Runs backend TS check + tests + frontend TS check + vitest + build on PRs to develop/main. |
| H-08 | **Expand test coverage: auth API routes** | 76 | S2 | 🆕 New | Only 5 test files exist. Add tests for /api/auth/login, /signup, /refresh using Supertest. Target: all auth happy paths + error cases. ~3 hours. |
| H-09 | **Expand test coverage: arbor API routes** | 74 | S2 | 🆕 New | Add tests for /api/arbor/trees CRUD, /species, /zones, /dashboard using Supertest. Target: happy paths + validation errors. ~4 hours (split if needed). |
| H-10 | **Expand test coverage: critical UI components** | 70 | S2 | 🆕 New | Add React Testing Library tests for: TreeCard, TreeList (filter logic), Dashboard (stats rendering), Login form. ~3 hours. |
| H-11 | **Docker Compose for local dev** | 65 | S2 | ✅ Done | Created Dockerfile (production), Dockerfile.dev (dev targets), docker-compose.yml (api+frontend with hot-reload), .dockerignore. 2026-03-27. |
| H-12 | **Seed data script for fresh deployments** | 72 | S3 | 🆕 New | Fresh clone starts empty — unusable for testing/demo. Create `scripts/seed.ts`: demo project, 20 trees (varied species/zones/health), sample activity + health logs. ~3 hours. |
| H-13 | **API documentation (OpenAPI / Swagger)** | 68 | S3 | 🆕 New | No way for contributors to discover endpoints. Add swagger-jsdoc + swagger-ui-express. Document all routes with request/response schemas. ~4 hours (split if needed). |
| H-14 | **Supabase RLS policies for multi-tenant isolation** | 80 | S3 | 🆕 New | No row-level security — any authenticated user can read all projects' data via service role. Write RLS policies for trees, zones, health_observations, activity_log. ⚠️ Migration needs Yogesh to run. |
| H-15 | **Clean up legacy duplicate files in frontend** | 60 | S5 | ✅ Done | Removed 35 tracked files from git index (frontend/src/api/, components/, pages/, store/). Added .gitignore rules for legacy dirs + backend ghost files (src/lib/, routes/, middleware/, schemas/). FUSE mount prevents physical rm — Yogesh can run: `rm -rf frontend/src/api/ frontend/src/components/ frontend/src/pages/ frontend/src/store/ src/lib/ src/routes/ src/middleware/ src/schemas/`. 2026-03-27. |

---

## 🟢 Medium (Phase 1 Features — Arbor V2)

| # | Task | Score | Sprint | Status | Notes |
|---|------|-------|--------|--------|-------|
| M-01 | **Yield / Harvest tracking — DB schema + API + UI** | 45 | S4 | 🆕 New | New `yields` table (tree_id, harvest_date, quantity_kg, quality_rating, notes). Backend CRUD. Frontend: log button on TreeDetail + yield history. Design spec in `docs/designs/arbor-v2/`. ⚠️ Migration needs Yogesh. |
| M-02 | **GPS lat/lng on trees — DB + API + UI** | 42 | S4 | 🆕 New | Add `latitude`, `longitude` columns to trees table. Backend: accept in create/update. Frontend: Geolocation API button on TreeAdd/TreeEdit. Update MapView to use real coords. ⚠️ Migration needs Yogesh. |
| M-03 | **QR Code generator per tree + print sheet** | 40 | S4 | 🆕 New | Use `qrcode` npm package. Generate QR linking to `/tree/:code/public`. Print sheet: grid layout of QR + tree_code + species for batch printing. ~3 hours. |
| M-04 | **Photo timeline UI in TreeDetail** | 38 | S4 | 🆕 New | Horizontal scrollable timeline showing tree photos by date. Photos already stored via Google Drive. Pure frontend. ~2 hours. |
| M-05 | **Data export (trees + health logs as CSV)** | 36 | S4 | 🆕 New | Backend: GET /api/arbor/trees/export?format=csv. Use `json2csv` or manual serialization. Frontend: download button on Dashboard. Researcher persona needs this. ~2 hours. |
| M-06 | **Biodiversity index calculator (Shannon H')** | 30 | S5 | 🆕 New | Pure calculation from existing species data. `H' = -Σ(pi × ln(pi))`. Dashboard widget showing index + species diversity chart. ~2 hours. |
| M-07 | **Carbon Profile tab: biomass + CO₂ estimate + monitoring report** | 52 | S4 | 🆕 New | **Pure frontend — no migration needed.** `trunk_diameter_cm`, `height_m`, `approx_age_yrs`, `planting_date` already on the Tree type. Implementation: (1) create `frontend/src/modules/arbor/utils/carbonCalc.ts` with ICFRE allometric equations; (2) add "Carbon" tab to TreeDetail showing AGB estimate, CO₂ absorbed, annual sequestration rate, carbon credit pre-qualification badge; (3) "Download Report" button generating a formatted text/CSV monitoring report (Verra VM0047 style). Species-specific wood density table for 12 common Coorg species (silver oak, coffee, pepper, areca, teak, eucalyptus, jackfruit, mango, neem, bamboo, coconut, cardamom). See design spec: `docs/designs/arbor-v2/carbon-profile.md`. ~3 hours. |
| M-08 | **Expand test coverage: frontend modules** | 35 | S2 | 🆕 New | Add Vitest tests for Arbor pages: TreeList filtering, TreeDetail rendering, Dashboard stat calculations. Target: 30%+ frontend coverage. ~4 hours (split across sessions). |

---

## 🔵 Low (Phase 2+ / Future)

| # | Task | Score | Sprint | Status | Notes |
|---|------|-------|--------|--------|-------|
| L-01 | Weather integration (Open-Meteo API) | 18 | — | 🆕 New | Daily cron to pull weather for farm lat/lng. Display on dashboard. Phase 2. |
| L-02 | Multi-language support (i18n with react-i18next) | 12 | — | 🆕 New | Kannada, Hindi. Phase 2. |
| L-03 | Offline sync (IndexedDB + background sync) | 10 | — | 🆕 New | High effort. Phase 2. PWA already caches; this adds write-back. |
| L-04 | Phenological calendar (per-species seasonal events) | 18 | — | 🆕 New | Requires new phenology_events table. Useful for planting guidance. Phase 2. |
| L-05 | Notification/alert system (overdue tasks, health drops) | 7 | — | 🆕 New | Phase 2. Web Push API or email. |
| L-06 | Public README rewrite for OSS launch | 20 | S5 | 🆕 New | Current README is basic. Rewrite with: screenshots, architecture diagram, quickstart guide, contributing guide link, feature overview. ~2 hours. |
| L-07 | Flora module — initial schema + API scaffold | 15 | — | 🆕 New | Phase 2 start. Design spec exists at `docs/designs/flora/`. DB tables: plants, guilds, guild_members. |
| L-08 | Terra module — initial schema + API scaffold | 12 | — | 🆕 New | Phase 2. Design spec at `docs/designs/terra/`. DB tables: soil_profiles, water_sources, topography. |

---

## ✅ Completed

| # | Task | Completed | Session |
|---|------|-----------|---------|
| C-01 | Fix frontend build: migrate 14 page files + all components + all API modules to modular structure. Added activeProjectId/setActiveProject to auth store. Fixed 71 TS errors → 0. | 2026-03-23 | Planner 2026-03-23 |
| C-02 | Fix backend: update dangling imports in set_owner_pass.ts (../lib → ../core/lib) | 2026-03-23 | Planner 2026-03-23 |
| H-01 | Add aria-labels to all 13 icon-only buttons across entire frontend | 2026-03-24 | Planner 2026-03-24 |
| H-02 | Add alt text to TreeDetail photo gallery images | 2026-03-24 | Planner 2026-03-24 |
| H-03 | Fix tap targets — icon buttons to w-11 h-11 (44px), checkboxes to w-5 h-5 | 2026-03-24 | Planner 2026-03-24 |
| H-05 | Centralize color constants into `core/constants/actionColors.ts`, update MapCanvas/MapPicker/MapView | 2026-03-24 | Planner 2026-03-24 |
| H-04 | Centralize backend config into `src/core/config.ts`; updated auth.ts, server.ts, app.ts, trees.ts | 2026-03-26 | Planner 2026-03-26 |
| H-06 | Fix rollup/vite ARM64 build — vite-tsconfig-paths@4.3.2 + npm install | 2026-03-26 | Planner 2026-03-26 |
| H-07 | GitHub Actions CI workflow — already existed in `.github/workflows/ci.yml` (commit e643e77) | 2026-03-26 | Planner 2026-03-26 |
| H-11 | Docker Compose: Dockerfile + Dockerfile.dev + docker-compose.yml + .dockerignore | 2026-03-27 | Planner 2026-03-27 |
| H-15 | Remove 35 tracked legacy frontend files from git; .gitignore excludes legacy dirs | 2026-03-27 | Planner 2026-03-27 |
| — | OSS foundation files (CONTRIBUTING, LICENSE, CODE_OF_CONDUCT, templates) | 2026-03-xx | Manual |
| — | Multi-tenant RBAC backend + project switcher | 2026-03-xx | Manual |
| — | Testing framework setup (Vitest + Jest + Supertest) | 2026-03-xx | Manual |
| — | Arbor V2 UI design overhaul | 2026-03-xx | Manual |

---

## ❌ Dropped

*None yet.*

---

*Scores recalculated daily. Sprint tags guide execution order. This file is the single source of truth for autonomous execution.*
