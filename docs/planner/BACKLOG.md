# 🗂️ WildArc Autonomous Planner — Living Backlog

> This file is maintained by the WildArc Autonomous Planner. Do not edit by hand.
> Last updated: 2026-03-23 by Planner Session — C-01, C-02 resolved.

---

## How This Works

Each day the Planner reads this file, re-scores tasks based on the current codebase state, picks the top tasks, implements them, and updates this file. Tasks move through:

`🆕 New → 🎯 In Progress → ✅ Done` (or `❌ Dropped` with reason)

Priority scores are recalculated daily using: **Impact × Phase Alignment ÷ Effort** (higher = do sooner).

---

## 🔴 Critical (Build-Breaking / Security / Data Loss)

*No critical tasks remain. Build is green (0 TypeScript errors).*

---

## 🟡 High (Phase 1 Essentials)

| # | Task | Score | Status | Notes |
|---|------|-------|--------|-------|
| H-01 | **Add rate limiting middleware (express-rate-limit)** | 72 | 🆕 New | No rate limiting on any endpoint. Brute-force login vulnerability. ~2 hours effort. |
| H-02 | **Add input sanitization layer (DOMPurify / sanitize-html)** | 68 | 🆕 New | Zod validates shape only; no XSS protection on text inputs. Add sanitization middleware. |
| H-03 | **Add aria-labels to all icon-only buttons** | 65 | 🆕 New | Zero aria-labels in entire codebase. Critical for accessibility + OSS launch. Audit all .tsx files. |
| H-04 | **Add alt text to TreeDetail.tsx img element** | 60 | 🆕 New | Missing alt on photo img. Quick fix. |
| H-05 | **Fix HealthLog checkbox tap targets (w-4 h-4 → w-5 h-5)** | 58 | 🆕 New | Interactive checkboxes too small for field use in bright sunlight. |
| H-06 | **Centralize MapCanvas/MapView action colors into constants file** | 52 | 🆕 New | Create frontend/src/core/constants/actionColors.ts |
| H-07 | **Move config values to config.ts module** | 48 | 🆕 New | JWT expiry, pagination limits, upload size hardcoded. Create src/core/config.ts |
| H-08 | **Fix rollup/vite build (ARM64 native module missing)** | 70 | 🆕 New | npm run build fails with @rollup/rollup-linux-arm64-gnu not found. Run npm install in frontend/ to fix. |

---

## 🟢 Medium (Phase 1 Features — Arbor Completeness)

| # | Task | Score | Status | Notes |
|---|------|-------|--------|-------|
| M-01 | **QR Code generator per tree + print sheet** | 38 | 🆕 New | Use qrcode npm package. Link to /tree/:code public profile. |
| M-02 | **Photo timeline UI in TreeDetail** | 35 | 🆕 New | Horizontal scrollable photo timeline. Photos already stored. |
| M-03 | **Yield / Harvest tracking — DB schema + API + UI** | 33 | 🆕 New | New yields table. Backend CRUD. Frontend: add log button on TreeDetail. |
| M-04 | **Biodiversity index calculator (Shannon H')** | 28 | 🆕 New | Pure calculation from existing species data. Dashboard widget. |
| M-05 | **Carbon sequestration estimate per tree** | 25 | 🆕 New | Allometric formula from Chave et al. Display on TreeDetail. |
| M-06 | **GPS lat/lng columns on trees table** | 22 | 🆕 New | Migration + backend + frontend Geolocation API. |
| M-07 | **Data export (trees + health logs as CSV)** | 20 | 🆕 New | Researcher persona needs data portability. |

---

## 🔵 Low (Phase 2+ / Future)

| # | Task | Score | Status | Notes |
|---|------|-------|--------|-------|
| L-01 | Weather integration (Open-Meteo API) | 15 | 🆕 New | Daily cron to pull weather for farm lat/lng. |
| L-02 | Multi-language support (i18n with react-i18next) | 12 | 🆕 New | Kannada, Hindi. Phase 2. |
| L-03 | Offline sync (IndexedDB + background sync) | 10 | 🆕 New | High effort. Phase 2. |
| L-04 | Phenological calendar (per-species seasonal events) | 8 | 🆕 New | Requires new phenology_events table. |
| L-05 | Notification/alert system (overdue tasks, health drops) | 7 | 🆕 New | Phase 2. Web Push API or email. |

---

## ✅ Completed

| # | Task | Completed | Session |
|---|------|-----------|---------|
| C-01 | Fix frontend build: migrate 14 page files + all components + all API modules to modular structure. Added activeProjectId/setActiveProject to auth store. Fixed 71 TS errors → 0. | 2026-03-23 | Planner 2026-03-23 |
| C-02 | Fix backend: update dangling imports in set_owner_pass.ts (../lib → ../core/lib) | 2026-03-23 | Planner 2026-03-23 |
| — | OSS foundation files (CONTRIBUTING, LICENSE, CODE_OF_CONDUCT, templates) | 2026-03-xx | Manual |
| — | Multi-tenant RBAC backend + project switcher | 2026-03-xx | Manual |
| — | Testing framework setup (Vitest + Jest + Supertest) | 2026-03-xx | Manual |
| — | Arbor V2 UI design overhaul | 2026-03-xx | Manual |

---

## ❌ Dropped

*None yet.*

---

*Scores recalculated daily. This file is the single source of truth for autonomous execution.*
