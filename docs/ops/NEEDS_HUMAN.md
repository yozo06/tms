# 🚨 Human Action Required

> This file is the bridge between WildArc's autonomous agents and Yogesh.
> Items here require a human decision, external access, or manual action that agents cannot perform.
>
> **Agents write here. Yogesh resolves here.**
>
> When you resolve an item, change its status from `⏳ Waiting` to `✅ Done` and add the date.
> The Meta-Optimizer will clean up resolved items weekly.

---

## 🔔 [2026-03-23] Fix Vite/Rollup build (ARM64 native module) — Watchdog Escalation
**Detected by:** Watchdog (3 PM health check)
**What's needed:** Run `cd frontend && rm -rf node_modules && npm install` to reinstall the ARM64 rollup native binary. This is a one-time fix. Tracked as H-06 in the backlog.
**Impact if delayed:** `npm run build` continues to fail. CI/CD (H-07) can't be set up until build works. Vite dev server is unaffected.
**Note:** TypeScript (tsc) is clean — 0 errors. This is purely a native binary issue, not a code error.
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-23] Review 49 uncommitted files in working tree — Watchdog Escalation
**Detected by:** Watchdog (3 PM health check)
**What's needed:** Committed in `0429a79` — all migration artifacts, website concepts, and watchdog logs.
**Status:** ✅ Done (2026-03-23)

---

## 🔔 [2026-03-23] Enable GitHub Actions on WildArc repo
**Blocking task:** H-07 (Sprint 2 — CI/CD workflow)
**What's needed:** Yogesh confirmed GitHub Actions is already enabled.
**Status:** ✅ Done (2026-03-23)

---

## 🔔 [2026-03-23] Supabase: Backfill project_id + set NOT NULL
**Blocking task:** C-05 (Sprint 3 — multi-tenant enforcement)
**What's needed:** The planner will write migration SQL to `docs/migrations/004_enforce_project_id.sql`. Yogesh needs to run it in Supabase SQL Editor. This will: (1) create a default project for existing data, (2) assign all existing trees/zones to it, (3) alter columns to NOT NULL.
**Impact if delayed:** Multi-tenancy remains unenforced — any user can see any project's data.
**Sprint:** S3 (starts ~Apr 21)
**Status:** ⏳ Waiting (SQL not yet written — planner will produce it)

---

## 🔔 [2026-03-23] Supabase: Add RLS policies for tenant isolation
**Blocking task:** H-14 (Sprint 3 — row-level security)
**What's needed:** The planner will write RLS policy SQL to `docs/migrations/005_rls_policies.sql`. Yogesh needs to run it in Supabase SQL Editor. This enables row-level security on trees, zones, health_observations, activity_log, tree_photos.
**Impact if delayed:** Data isolation depends only on application code, not database-level enforcement.
**Sprint:** S3 (starts ~Apr 21)
**Status:** ⏳ Waiting (SQL not yet written — planner will produce it)

---

## 🔔 [2026-03-23] Supabase: Create yields table for harvest tracking
**Blocking task:** M-01 (Sprint 4 — yield tracking feature)
**What's needed:** The planner will write migration SQL to `docs/migrations/006_yields_table.sql`. Yogesh needs to run it in Supabase SQL Editor.
**Impact if delayed:** Arbor V2 yield tracking feature can't be built.
**Sprint:** S4 (starts ~May 5)
**Status:** ⏳ Waiting (SQL not yet written — planner will produce it)

---

## 🔔 [2026-03-23] Supabase: Add lat/lng columns to trees table
**Blocking task:** M-02 (Sprint 4 — GPS coordinates)
**What's needed:** The planner will write migration SQL to `docs/migrations/007_gps_columns.sql`. Yogesh needs to run it in Supabase SQL Editor.
**Impact if delayed:** GPS tree mapping feature can't be built.
**Sprint:** S4 (starts ~May 5)
**Status:** ⏳ Waiting (SQL not yet written — planner will produce it)
