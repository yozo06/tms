# 🚨 Human Action Required

> This file is the bridge between WildArc's autonomous agents and Yogesh.
> Items here require a human decision, external access, or manual action that agents cannot perform.
>
> **Agents write here. Yogesh resolves here.**
>
> When you resolve an item, change its status from `⏳ Waiting` to `✅ Done` and add the date.
> The Meta-Optimizer will clean up resolved items weekly.

---

## 🔔 [2026-04-06] Planner failing consistently — 6 consecutive days missed
**Detected by:** Watchdog 2026-04-06
**What happened:** Planner has not produced a session log since 2026-03-31. Today's run crashed at startup (checkpoint stuck at `status: started`, no task selected). The Meta-Optimizer noted a 5-day blackout Apr 1–5; this has now extended to Apr 6.
**What's needed:** Check the planner scheduled task configuration. Manual re-run recommended. Sprint 2 tasks (H-09, H-10, H-18, M-08) are not progressing.
```bash
# Check scheduled tasks in Cowork to verify planner is configured correctly
```
**Impact if delayed:** Sprint 2 work stalled. Sprint 3 start (~Apr 21) at risk if planner doesn't resume soon.
**Status:** ⏳ Waiting

---

## 🔔 [2026-04-06] Stale NEEDS_HUMAN items — 5 items older than 5 days
**Detected by:** Watchdog 2026-04-06
**Summary:** 5 human action items are now older than 5 days and may be blocking planner progress:
1. **[2026-03-23] Supabase: Backfill project_id + NOT NULL** — 14 days (blocks C-05/Sprint 3)
2. **[2026-03-23] Supabase: Add RLS policies** — 14 days (blocks H-14/H-17, SQL not yet written)
3. **[2026-03-27] Run migration 004** — 10 days (duplicate of #1)
4. **[2026-03-29] Bloom Sunday Vision** — 8 days (content gap)
5. **[2026-03-30] Push H-16 commit** — 7 days (code not on GitHub)
**What's needed:** Triage and resolve the actionable items. Items #1/#3 are the same migration — resolve one and mark the other done. Push items (#5, and the 2026-03-31 C-03/C-04 push) can be batched.
**Status:** ⏳ Waiting

---

## 🔔 [2026-04-06] Run migration 005: RLS policies for multi-tenant isolation
**Blocking task:** H-14 / H-17 (Sprint 3 — row-level security)
**What's needed:** Run `docs/migrations/005_rls_policies.sql` in Supabase SQL Editor.
**Steps:**
1. Open Supabase → SQL Editor → New query
2. Paste full contents of `docs/migrations/005_rls_policies.sql`
3. Run the script — it creates helper functions, enables RLS on 8 tables, and creates 32 policies
4. Verify with: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;`
**Important notes:**
- The Express backend uses `service_role` key which bypasses RLS — this is expected and safe
- RLS protects against direct Supabase client access and is defense-in-depth
- Full rollback script included at bottom of migration file
**Impact if delayed:** No DB-level data isolation between projects for direct client access.
**Status:** ⏳ Waiting

---

## 🔔 [2026-04-06] Run migration 008: Update zone_summary view with project_id
**Blocking task:** H-19 (Sprint 3 — dashboard project isolation)
**What's needed:** Run `docs/migrations/008_zone_summary_project_id.sql` in Supabase SQL Editor.
**Steps:**
1. Open Supabase → SQL Editor → New query
2. Paste full contents of `docs/migrations/008_zone_summary_project_id.sql`
3. Run the script — it recreates zone_summary view with project_id column
4. Verify with: `SELECT * FROM zone_summary LIMIT 5;` — should show project_id
**Impact if delayed:** Dashboard zones endpoint can't filter by project — all zones shown to all projects.
**Status:** ⏳ Waiting

---

## 🔔 [2026-04-06] Push planner/H-17-rls-policies-batch branch and create PR
**Completed tasks:** H-17 (RLS SQL), H-18 (aria-label fix), H-19 (zone_summary SQL)
**What's needed:** Push the branch and create a PR:
```bash
cd <project-root>
git push -u origin planner/H-17-rls-policies-batch
gh pr create --base develop --title "feat(security): RLS policies + accessibility fixes [H-17, H-18, H-19]"
```
**Impact if delayed:** Three completed tasks not visible in GitHub.
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-31] Push C-03/C-04 security commit and create PR — network blocked
**Completed tasks:** C-03 (rate limiting) + C-04 (input sanitization)
**Commit:** `086cbc5` on branch `planner/C05-H15-H11-batch`
**What's needed:** Push the branch and create/update the PR:
```bash
cd <project-root>
git push origin planner/C05-H15-H11-batch
# Then update PR #9 or create a new PR targeting develop
```
**What was done in commit 086cbc5:**
- `src/core/middleware/rateLimit.ts` — new: in-memory sliding-window rate limiter (auth: 5 failed/15min, signup: 3/hour, API: 200/min)
- `src/core/middleware/sanitize.ts` — new: XSS prevention via HTML entity escaping on all string inputs
- `src/app.ts` — global sanitizeInput() + apiRateLimit middleware. Fixed CORS allowedHeaders for X-Project-Id.
- `src/modules/auth/routes/auth.ts` — authRateLimit on /login, signupRateLimit on /signup
- `src/core/config.ts` — added rateLimit config section
**Impact if delayed:** Security middleware committed locally, not yet visible in GitHub or deployable.
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-30] Push H-16 commit and create PR — network blocked
**Completed task:** H-16 (backend query scoping)
**Commit:** `b1d14c3` on branch `planner/C05-H15-H11-batch`
**What's needed:** Push the branch and create/update the PR:
```bash
cd <project-root>
git push origin planner/C05-H15-H11-batch
# Then update PR #9 to include H-16 changes, or gh pr create --base develop
```
**What was done in commit b1d14c3:**
- `src/core/middleware/requireProject.ts` — new middleware, validates X-Project-Id header
- `src/modules/auth/routes/projects.ts` — new GET /api/projects endpoint
- All arbor routes (trees, zones, dashboard, map) now filter by project_id when X-Project-Id header sent
- `frontend/src/core/api/client.ts` — now sends X-Project-Id header from Zustand state
**Impact if delayed:** H-16 work committed locally, not yet visible in GitHub.
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-29] Bloom Sunday Vision run failed — Network unreachable
**Detected by:** Bloom scheduled task (Sunday auto-run)
**What happened:** The automated Bloom content generation task could not reach the Gemini API from the sandbox environment. `generativelanguage.googleapis.com` is blocked in the task runner's network context.
**What's needed:** Run the generation manually on your local machine:
```bash
cd <project-root>
npx ts-node src/modules/bloom/pipeline/cli.ts generate \
  --template infographic-educational \
  --topic "WildArc Vision: Regenerative Living in Coorg" \
  --details "WildArc's four pillars: Grow, Restore, Share, Observe. Coorg's mist-covered hills, coffee agroforestry, bamboo groves, perennial rivers. Show the interconnection of people, land, and biodiversity. Include a hand-drawn map vibe of the land and the vision of a thriving food forest 10 years from now." \
  --ref "content/bloom/references/watercolor-botanical/Screenshot 2026-01-18 at 17.05.16.png"
```
**Alternate template options if preferred:**
- `carousel-tutorial` with steps: "See the land as it is,Map what's already growing,Plant the edges first,Build soil with what you have,Connect water through the land,Harvest gently and observe"
- `data-facts` topic: "Why regenerative land stewardship matters — Coorg facts and figures"
**Impact:** Sunday Vision content not generated. No Instagram content for today.
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-27] Run migration 004 to enforce project_id NOT NULL
**Blocking task:** C-05 (Sprint 3 — multi-tenancy enforcement)
**What's needed:** Run `docs/migrations/004_enforce_project_id.sql` in Supabase SQL Editor.
**Steps:**
1. Open Supabase → SQL Editor → New query
2. Paste full contents of `docs/migrations/004_enforce_project_id.sql`
3. First run the commented-out SELECT statements in STEP 1 to check for NULL rows
4. If STEP 1 shows 0 NULLs, skip to STEP 4 (ALTER TABLE statements only)
5. Run the full script; check NOTICES for backfill counts
**Impact if delayed:** Multi-tenancy not fully enforced at DB level — any code bug could leak cross-project data.
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-28] Stale Supabase action items — reminder
**Summary:** Four Supabase migration items created 2026-03-23 are now 6 days old. These are Sprint 3/4 items (not yet blocking Sprint 1/2 work). Will block Sprint 3 start (~Apr 21) if not addressed by then.
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-23] Supabase: Backfill project_id + set NOT NULL
**Blocking task:** C-05 (Sprint 3 — multi-tenant enforcement)
**What's needed:** Run `docs/migrations/004_enforce_project_id.sql` in Supabase SQL Editor (see [2026-03-27] item above for steps). This will: (1) create a default project for existing data, (2) assign all existing trees/zones to it, (3) alter columns to NOT NULL.
**Impact if delayed:** Multi-tenancy remains unenforced — any user can see any project's data.
**Sprint:** S3 (starts ~Apr 21)
**Status:** ⏳ Waiting

---

## 🔔 [2026-03-23] Supabase: Add RLS policies for tenant isolation
**Blocking task:** H-14 / H-17 (Sprint 3 — row-level security)
**What's needed:** The planner will write RLS policy SQL to `docs/migrations/005_rls_policies.sql` (H-17). Yogesh needs to run it in Supabase SQL Editor once written.
**Impact if delayed:** Data isolation depends only on application code, not database-level enforcement.
**Sprint:** S3 (starts ~Apr 21)
**Status:** ⏳ Waiting (SQL not yet written — planner will produce it in Sprint 3)

---

## 🔔 [2026-03-23] Supabase: Create yields table for harvest tracking
**Blocking task:** M-01 (Sprint 4 — yield tracking feature)
**What's needed:** The planner will write migration SQL to `docs/migrations/006_yields_table.sql`. Yogesh needs to run it in Supabase SQL Editor.
**Impact if delayed:** Arbor V2 yield tracking feature can't be built.
**Sprint:** S4 (starts ~May 5)
**Status:** ⏳ Waiting (SQL not yet written — planner will produce it in Sprint 4)

---

## 🔔 [2026-03-23] Supabase: Add lat/lng columns to trees table
**Blocking task:** M-02 (Sprint 4 — GPS coordinates)
**What's needed:** The planner will write migration SQL to `docs/migrations/007_gps_columns.sql`. Yogesh needs to run it in Supabase SQL Editor.
**Impact if delayed:** GPS tree mapping feature can't be built.
**Sprint:** S4 (starts ~May 5)
**Status:** ⏳ Waiting (SQL not yet written — planner will produce it in Sprint 4)

---

## 📦 Resolved Items (archived 2026-03-29 by Meta-Optimizer)

The following items were resolved and are kept here for reference only. New items go above this section.

| Date | Item | Resolved |
|------|------|---------|
| 2026-03-23 | Fix Vite/Rollup build (ARM64) | ✅ 2026-03-26 — vite-tsconfig-paths + npm install |
| 2026-03-23 | Review 49 uncommitted files | ✅ 2026-03-23 — committed in 0429a79 |
| 2026-03-23 | Enable GitHub Actions | ✅ 2026-03-23 — already enabled |
| 2026-03-24 | Fix esbuild binary version mismatch | ✅ 2026-03-26 — same fix as above |
| 2026-03-24 | Push planner branch (accessibility batch) | ✅ 2026-03-26 — PR #6 at github.com/yozo06/tms/pull/6 |
| 2026-03-25 | Steward + planner both missed — verify tasks | ✅ 2026-03-26 — one-off sandbox downtime; tasks verified running |
| 2026-03-26 | Push H-04 config PR | ✅ 2026-03-26 — PR #7 at github.com/yozo06/tms/pull/7 |
| 2026-03-27 | Build broken at 3 PM (watchdog escalation) | ✅ 2026-03-28 — build:check workaround script added |
| 2026-03-27 | Push C05/H15/H11 batch + create PR | ✅ 2026-03-29 — PR #9 at github.com/yozo06/tms/pull/9 |
| 2026-03-28 | Push M-07 Carbon Profile + create PR | ✅ 2026-03-29 — included in PR #9 |
| 2026-03-29 | Enable billing on Gemini API key | ✅ 2026-03-29 — Bloom running via Desktop Commander |
| 2026-03-29 | Set up HuggingFace free token | ✅ 2026-03-29 — Bloom pipeline resolved as a skill |
