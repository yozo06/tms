# 🐕 WildArc Watchdog Log

> Daily health verification at 3:00 PM. Each entry confirms whether the steward and planner ran successfully, flags silent failures, and surfaces items needing human attention.

---

## 🐕 Watchdog — 2026-03-28

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | ✅ | `docs/steward/2026-03-28.md` exists, 17,280 bytes — steward ran fully |
| Planner session log | ✅ | `docs/planner/sessions/2026-03-28.md` exists, 3,577 bytes — planner ran and completed M-07 (Carbon Profile tab) |
| Orphaned checkpoint | ✅ | No active `.checkpoint` file — planner finished cleanly (`.checkpoint.done` present, as expected) |
| Build health | ✅ | `npm run build:check` PASSED — esbuild 0.27.3 + tsc --noEmit. New `build:check` script added (2026-03-28) as permanent fix: uses backend's persisted esbuild binary, bypasses volatile rollup ARM64 binary. |
| Git status | ⚠️ | 15 modified files + 4 untracked. Modified includes arbor components (planner M-07 + prior batch work) + ops logs. Untracked: `coorg-forest.html`, `coorg.html` (website prototypes), `docs/designs/arbor-v2/carbon-profile.md`, `.checkpoint.done`. Push pending. |
| Human items pending | 7 items (oldest: 5 days) | 2 actionable push items from 2026-03-27 (C-05/H-15/H-11 branch + M-07 branch). 1 from today (M-07 push). 4 Supabase migration items from 2026-03-23 (5 days old — Sprint 3/4, not yet blocking). |
| Critical backlog items | 3 remaining | C-03 (rate limiting 🆕), C-04 (sanitization 🆕), C-05 (multi-tenancy — SQL written, awaiting Supabase run). No new critical items added today. |

**Overall: ⚠️ Attention Needed**

Both agents ran and build health is now ✅ — a new `build:check` script (esbuild 0.27.3 + tsc) permanently replaces the broken Vite/Rollup build check for automated agents. Two planner branches are ready to push: `planner/C05-H15-H11-batch` (2026-03-27) and M-07 Carbon Profile branch (today). Those are the priority actions for Yogesh.

---

## 🐕 Watchdog — 2026-03-27

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | 🔴 | `docs/steward/2026-03-27.md` does not exist — steward did not run today |
| Planner session log | 🔴 | `docs/planner/sessions/2026-03-27.md` does not exist — planner did not run today |
| Orphaned checkpoint | ✅ | Checkpoint from 2026-03-26 has `status: completed` and note: "FUSE mount prevents deletion — NOT an orphaned crash." No new crash. |
| Build health | 🔴 | `@rollup/rollup-linux-arm64-gnu` not found — same ARM64 native binary issue. Node modules are volatile in FUSE mount; need `cd frontend && npm install` at start of each session. Build was fixed 2026-03-26 (commit `abfe3a0`) but requires re-running npm install every new session. |
| Git status | ⚠️ | 35 uncommitted/untracked items. 17 modified frontend arbor files (ActionBadge, MapCanvas, SpeciesModal, ZoneModal, ActivityLog, Dashboard, HealthLog, MapView, TreeDetail, TreeEdit, TreeList) + modified docs + 4 untracked (`.claude/`, `coorg-forest.html`, arbor-v2 design docs). Branch: `planner/H04-centralize-config`. |
| Human items pending | 4 items (oldest: 4 days) | 4 items from 2026-03-23 all `⏳ Waiting` — Supabase migrations (C-05, RLS policies, yields table, lat/lng columns). None past 5-day stale threshold (tomorrow would be day 5). |
| Critical backlog items | 0 remaining | 🔴 Critical section exists but table is empty — no build-breaking/security/data-loss tasks outstanding. |

**Overall: 🔴 Action Required**

Neither steward nor planner ran today (2026-03-27). The build is broken again due to the FUSE-volatile node_modules issue — needs `cd frontend && npm install` at the start of each session before agents can run. 17 frontend arbor module files are modified but uncommitted, likely from yesterday's planner session on the arbor v2 rework. The 4 Supabase migration items will hit the 5-day stale threshold tomorrow (2026-03-28).

---

## 🐕 Watchdog — 2026-03-26

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | ✅ | `docs/steward/2026-03-26.md` exists, 11,968 bytes — steward ran successfully |
| Planner session log | ✅ | `docs/planner/sessions/2026-03-26.md` exists, 3,261 bytes — planner ran successfully |
| Orphaned checkpoint | ✅ | Checkpoint exists but `status: completed` — FUSE mount prevents deletion; planner noted this explicitly. Not a crash. |
| Build health | 🔴 | esbuild binary version mismatch (day 4). `npm run build` still fails. Pre-existing issue unrelated to today's H-04 work. Needs `cd frontend && rm -rf node_modules && npm install` with npm registry access. |
| Git status | ⚠️ | 15 modified frontend files + ~16 untracked entries. H-04 backend config.ts committed (per checkpoint), but H-01–H-05 accessibility files remain unstaged on this branch. Two branches with open PRs waiting for push. |
| Human items pending | 9 items (oldest: 3 days) | Oldest actionable: Fix Vite/Rollup build (2026-03-23, 3 days). Two PR pushes pending (H-01–H-05 batch, H-04 config). No items yet past 5-day stale threshold. |
| Critical backlog items | 3 remaining | C-03 (rate limiting), C-04 (sanitization), C-05 (project_id NOT NULL). None addressed today — planner correctly focused on H-04 (hygiene) while build is blocked. |

**Overall: ⚠️ Attention Needed**

Both agents ran today — the pipeline recovered from yesterday's missed run. The build remains broken (day 4, pre-existing esbuild mismatch) which is the single most important blocker. Two planner branches are sitting locally with uncommitted/unpushed work: `planner/H01-H05-accessibility-batch` and `planner/H04-centralize-config`. Priority actions: (1) Fix the build — `cd frontend && rm -rf node_modules && npm install`, (2) Push both branches and create PRs (instructions in NEEDS_HUMAN.md).

---

## 🐕 Watchdog — 2026-03-23

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | ✅ | `docs/steward/2026-03-23.md` exists, 14,101 bytes |
| Planner session log | ✅ | `docs/planner/sessions/2026-03-23.md` exists, 1,915 bytes |
| Orphaned checkpoint | ✅ | No checkpoint file — planner completed cleanly |
| Build health | 🔴 | Rollup ARM64 native binary missing — `@rollup/rollup-linux-arm64-gnu not found`. **Pre-existing issue**, documented in backlog as H-06. TypeScript (tsc) passes 0 errors. Fix: `cd frontend && npm install`. |
| Git status | ⚠️ | 49 uncommitted changes: 19 modified `frontend/src/` files, 12 deleted `src/` backend files (migrated to `core/`), 18 modified frontend config/other files, 4 untracked files (wildarc-website/, move-files.js). Planner's last commit (`4397f9f`) did not capture all working tree changes. |
| Human items pending | 5 items (oldest: 0 days) | All 5 items created today (2026-03-23). None are stale. Oldest: "Enable GitHub Actions" — sprint S2. |
| Critical backlog items | 3 remaining | C-03 (rate limiting), C-04 (input sanitization), C-05 (project_id NOT NULL). C-01 and C-02 resolved by planner today. |

**Overall: ⚠️ Attention Needed**

Two items need eyes: (1) 49 uncommitted files in working tree — planner's session did substantial migrations but the working tree has additional untracked/modified files that were never committed; verify nothing important is lost. (2) Vite/Rollup build failure is pre-existing (H-06 in backlog, not introduced today), but remains unresolved — fix with `cd frontend && npm install`.

---

## 🐕 Watchdog — 2026-03-23 (Pass 2, afternoon)

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | ✅ | `docs/steward/2026-03-23.md` exists, 14,101 bytes — unchanged since morning |
| Planner session log | ✅ | `docs/planner/sessions/2026-03-23.md` exists, 1,915 bytes — unchanged |
| Orphaned checkpoint | ✅ | No checkpoint file — clean |
| Build health | 🔴 | Still failing: `@rollup/rollup-linux-arm64-gnu` not found. Pre-existing H-06. TypeScript compiles clean. |
| Git status | ⚠️ | Still 49 uncommitted changes (30 modified, 13 deleted, 6 untracked including `wildarc-website/` concepts). No new changes since last check. |
| Human items pending | 7 items (oldest: 0 days) | All 7 from today. Includes 2 watchdog escalations (build fix + uncommitted files) + 5 planner items (GitHub Actions, Supabase migrations). None stale yet. |
| Critical backlog items | 3 remaining | C-03 (rate limiting), C-04 (input sanitization), C-05 (project_id NOT NULL). No change. |

**Overall: ⚠️ Attention Needed (unchanged)**

No new failures since the first pass. The two issues flagged earlier remain open: (1) 49 uncommitted files in working tree, (2) Rollup ARM64 build failure (H-06). No escalation needed — already in NEEDS_HUMAN.md.

---

## 🐕 Watchdog — 2026-03-25

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | 🔴 | `docs/steward/2026-03-25.md` does not exist — steward did not run today |
| Planner session log | 🔴 | `docs/planner/sessions/2026-03-25.md` does not exist — planner did not run today |
| Orphaned checkpoint | ✅ | Checkpoint exists from 2026-03-24 with `status: completed` — not orphaned, just leftover from yesterday's successful run |
| Build health | 🔴 | esbuild binary version mismatch (day 3). `npm run build` fails. TypeScript status unknown (build crashes before tsc). Root cause unchanged: needs `cd frontend && rm -rf node_modules && npm install` with npm registry access. |
| Git status | ⚠️ | 16 modified files + 12 untracked entries. Same state as yesterday — no new commits today since neither agent ran. Branch: `feature/modularize-and-yields`. |
| Human items pending | 7 items (oldest: 2 days) | 3 actionable now: (1) Fix esbuild/vite build — Mar 23, (2) Push planner branch & create PR — Mar 24, (3) Fix esbuild binary mismatch — Mar 24. 4 future-dependent (Supabase migrations — SQL not yet written). None over 5-day stale threshold yet. |
| Critical backlog items | 3 remaining | C-03 (rate limiting), C-04 (sanitization), C-05 (project_id NOT NULL). All still blocked — no progress possible without build fix + npm registry access. |

**Overall: 🔴 Action Required**

Neither steward nor planner ran today (2026-03-25). This is the first missed day for both agents. Build has been broken for 3 consecutive days. The esbuild binary mismatch (H-06) is the root blocker — until `cd frontend && rm -rf node_modules && npm install` is run on a machine with npm registry access, no agent can make forward progress on C-03/C-04 and build verification is impossible. Priority: fix the build, then verify scheduled tasks are configured correctly for today's missed runs.

---

## 🐕 Watchdog — 2026-03-24

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | ✅ | `docs/steward/2026-03-24.md` exists, 12,057 bytes |
| Planner session log | ✅ | `docs/planner/sessions/2026-03-24.md` exists, 2,692 bytes |
| Orphaned checkpoint | ✅ | Checkpoint exists but `status: completed` — planner finished cleanly (commit 25c7d59, push blocked by network) |
| Build health | 🔴 | esbuild binary version mismatch — same root cause as H-06. `npm run build` fails. TypeScript (tsc) is clean. Requires `cd frontend && rm -rf node_modules && npm install` on a machine with npm registry access. |
| Git status | ⚠️ | 15 modified files + 12 untracked entries. Planner committed accessibility batch (25c7d59) but couldn't push (network blocked). Docs (steward/planner logs) and `.claude/` are untracked. |
| Human items pending | 7 items (oldest: 1 day) | 3 actionable now: (1) Fix esbuild/vite build — Mar 23, (2) Push planner branch & create PR — Mar 24, (3) Fix esbuild binary mismatch — Mar 24. 4 future-dependent (Supabase migrations — SQL not yet written). None stale (oldest is 1 day). |
| Critical backlog items | 3 remaining | C-03 (rate limiting), C-04 (sanitization), C-05 (project_id NOT NULL). All blocked by build fix (C-03/C-04 need npm install for dependencies). |

**Overall: ⚠️ Attention Needed**

Build remains broken (day 2) due to esbuild binary mismatch — this is the single blocker for all forward progress. Planner ran successfully today (completed H-01, H-02, H-03, H-05 accessibility batch) but couldn't push due to network restrictions. Priority action: `cd frontend && rm -rf node_modules && npm install` then push the planner branch.

---

## 🐕 Watchdog — 2026-03-29

| Check | Status | Detail |
|-------|--------|--------|
| Steward report | 🔴 | `docs/steward/2026-03-29.md` does not exist — steward did not run today |
| Planner session log | 🔴 | `docs/planner/sessions/2026-03-29.md` does not exist — planner did not run today |
| Orphaned checkpoint | ✅ | No `.checkpoint` file — no mid-session crash detected. Agents simply did not start. |
| Build health | ✅ | `npm run build:check` PASSED in 0.8s — esbuild 0.27.3 + tsc --noEmit. Code is healthy. |
| Git status | ⚠️ | 17 modified files + 1 untracked (`./playwright-profile/`). Uncommitted arbor component work from 2026-03-28 planner session persists. Modified: 11 arbor components/pages, NEEDS_HUMAN.md, WATCHDOG_LOG.md, 2× package files, MODULE_ROADMAP.md. |
| Human items pending | 11 items (oldest: 6 days) | 4 Supabase items from 2026-03-23 are 6 days old (>5 day stale threshold — already escalated 2026-03-28). 2 push items from 2026-03-27 await Yogesh. 3 new items today from Bloom failure + Gemini billing. |
| Critical backlog items | 1 remaining | 1 × 🔴 item found; 0 with 🆕 New status — no unaddressed critical tasks in backlog. |

**Overall: ⚠️ Attention Needed**

Today is Sunday — both steward and planner missed their scheduled runs (no crash detected, likely sandbox unavailability on Sunday). Build is healthy and code is intact. Priority for Yogesh: (1) Push `planner/C05-H15-H11-batch` branch + create PR, (2) Push M-07 Carbon Profile branch + create PR, (3) Enable Gemini billing or set up HuggingFace token for daily Bloom image generation.
