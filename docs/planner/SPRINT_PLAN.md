# 🗓️ WildArc Phase 1 — Sprint Plan

> Target: OSS-ready launch by August 2026
> Current readiness: ~35% (as of 2026-03-23)
> Methodology: Autonomous daily execution via Planner agent, guided by this plan.

---

## Sprint Overview

| Sprint | Focus | Weeks | Target Dates | Tasks | Goal |
|--------|-------|-------|-------------|-------|------|
| **S1** | Security & Accessibility | 2 | Mar 24 – Apr 6 | C-03, C-04, H-01–H-06 | No security vulns, WCAG basics, clean config |
| **S2** | CI/CD & Testing | 2 | Apr 7 – Apr 20 | H-07–H-11, M-08 | CI pipeline, 30%+ test coverage, Docker dev |
| **S3** | Multi-Tenant & API Docs | 2 | Apr 21 – May 4 | C-05, H-12–H-14 | Real tenant isolation, seed data, Swagger docs |
| **S4** | Arbor V2 Features | 4 | May 5 – Jun 1 | M-01–M-05 | Yields, GPS, QR codes, photo timeline, CSV export |
| **S5** | Polish & Launch Prep | 2 | Jun 2 – Jun 15 | H-15, M-06, M-07, L-06 | Clean up legacy code, calculators, public README |

**Buffer:** Jun 16 – Aug 2026 for overflow, community feedback, and Flora/Terra scaffolding.

---

## Sprint 1: Security & Accessibility (Mar 24 – Apr 6)

**Theme:** "Stop being vulnerable, start being accessible."

### Tasks (in priority order):

| # | Task | Est. | Batchable? |
|---|------|------|-----------|
| C-03 | Rate limiting middleware | 1-2 hrs | No (security-critical, do alone) |
| C-04 | Input sanitization middleware | 2 hrs | No (security-critical) |
| H-06 | Fix rollup/vite ARM64 build | 15 min | Yes — batch with H-02 |
| H-01 | Aria-labels on all icon buttons | 2 hrs | Yes — batch with H-02, H-03 |
| H-02 | Alt text on all images | 30 min | Yes — batch with H-01, H-03 |
| H-03 | Fix tap targets (44px min) | 1 hr | Yes — batch with H-01, H-02 |
| H-04 | Centralize config.ts | 1-2 hrs | Yes — batch with H-05 |
| H-05 | Centralize actionColors.ts | 1 hr | Yes — batch with H-04 |

**Expected velocity:** 2 critical + 2-3 batched tasks per week = all done in ~8 sessions.

**Yogesh action needed:** None for S1. Pure autonomous execution.

### Success criteria:
- [ ] express-rate-limit active on all routes
- [ ] All text inputs sanitized before DB write
- [ ] Zero icon buttons without aria-label
- [ ] Zero images without alt text
- [ ] All interactive elements ≥44px
- [ ] Config values in one file, not scattered
- [ ] Color palette centralized

---

## Sprint 2: CI/CD & Testing (Apr 7 – Apr 20)

**Theme:** "Make the repo trustworthy for contributors."

### Tasks:

| # | Task | Est. | Batchable? |
|---|------|------|-----------|
| H-07 | GitHub Actions CI workflow | 2 hrs | No (infra setup) |
| H-08 | Test auth API routes (Supertest) | 3 hrs | No (focused test writing) |
| H-09 | Test arbor API routes (Supertest) | 4 hrs | Split: 2 sessions |
| H-10 | Test critical UI components | 3 hrs | No (focused test writing) |
| M-08 | Test frontend modules (pages) | 4 hrs | Split: 2 sessions |
| H-11 | Docker Compose setup | 2 hrs | No (infra setup) |

**Expected velocity:** 1 task per day (test writing is thorough work, not batchable).

**Yogesh action needed:**
- Enable GitHub Actions on the repo (if not already)
- Review + approve CI workflow PR
- Verify Docker Compose works on your Mac

### Success criteria:
- [ ] Every PR triggers: lint → typecheck → test → build
- [ ] Auth routes: 100% happy path + error coverage
- [ ] Arbor routes: CRUD happy paths covered
- [ ] Frontend: TreeCard, Dashboard, Login, TreeList tested
- [ ] `docker-compose up` starts full dev environment
- [ ] Test coverage ≥30% (up from <5%)

---

## Sprint 3: Multi-Tenant & API Docs (Apr 21 – May 4)

**Theme:** "Real data isolation, real developer experience."

### Tasks:

| # | Task | Est. | Batchable? |
|---|------|------|-----------|
| C-05 | Enforce project_id NOT NULL + backfill | 3 hrs | No (migration work) |
| H-14 | Supabase RLS policies | 3 hrs | No (security-critical) |
| H-12 | Seed data script | 3 hrs | No (needs careful data modeling) |
| H-13 | OpenAPI / Swagger docs | 4 hrs | Split: 2 sessions |

**Expected velocity:** ~1 task per day. Migration tasks produce SQL that Yogesh runs.

**Yogesh action needed (critical for this sprint):**
- Run migration SQL for C-05 (backfill project_id, set NOT NULL)
- Run migration SQL for H-14 (RLS policies)
- Run seed data script to verify it works on your Supabase instance
- Provide any missing env vars for Swagger (API base URL, etc.)

### Success criteria:
- [ ] project_id is NOT NULL on trees, zones
- [ ] RLS prevents cross-tenant data access
- [ ] `npm run seed` populates demo project with realistic data
- [ ] `/api/docs` serves interactive Swagger UI
- [ ] All endpoints documented with request/response examples

---

## Sprint 4: Arbor V2 Features (May 5 – Jun 1)

**Theme:** "The features that make WildArc useful in the field."

### Tasks:

| # | Task | Est. | Batchable? |
|---|------|------|-----------|
| M-01 | Yield / Harvest tracking (full stack) | 6 hrs | Split: DB+API (day 1), UI (day 2) |
| M-02 | GPS coordinates on trees (full stack) | 4 hrs | Split: DB+API (day 1), UI (day 2) |
| M-03 | QR code generator + print sheet | 3 hrs | No |
| M-04 | Photo timeline UI | 2 hrs | Yes — batch with M-05 |
| M-05 | CSV data export | 2 hrs | Yes — batch with M-04 |

**Expected velocity:** Feature tasks are larger. 1 feature per 1-2 days. 4 weeks gives comfortable buffer.

**Yogesh action needed:**
- Run migration SQL for M-01 (yields table)
- Run migration SQL for M-02 (lat/lng columns)
- Test GPS accuracy on your phone at Chettimani
- Print test QR sheet and verify scanning works in field conditions

### Success criteria:
- [ ] Harvest log: record date, quantity, quality per tree
- [ ] GPS: capture lat/lng on tree add/edit, show on map
- [ ] QR: generate per tree, batch print, scan opens public profile
- [ ] Photos: scrollable timeline by date on TreeDetail
- [ ] Export: download trees + health logs as CSV

---

## Sprint 5: Polish & Launch Prep (Jun 2 – Jun 15)

**Theme:** "Clean, documented, ready for the world."

### Tasks:

| # | Task | Est. | Batchable? |
|---|------|------|-----------|
| H-15 | Delete legacy duplicate frontend files | 2 hrs | No (careful import verification) |
| M-06 | Biodiversity index calculator | 2 hrs | Yes — batch with M-07 |
| M-07 | Carbon sequestration estimator | 2 hrs | Yes — batch with M-06 |
| L-06 | Public README rewrite | 2 hrs | No (writing, not code) |

**Yogesh action needed:**
- Review public README before publishing
- Decide on demo instance (deploy a public-facing demo?)
- Write or approve the "About WildArc" section

### Success criteria:
- [ ] No legacy duplicate files in frontend/src
- [ ] Dashboard shows Shannon diversity index
- [ ] TreeDetail shows CO₂ estimate
- [ ] README: screenshots, architecture, quickstart, feature list
- [ ] Repo looks professional to an external contributor

---

## Post-Sprint Buffer (Jun 16 – Aug 2026)

Use this time for:
- Community feedback integration (issues from early adopters)
- Flora module scaffolding (L-07)
- Terra module scaffolding (L-08)
- Performance optimization if needed
- Bug fixes from real field use at Chettimani
- Phase 2 planning

---

## How the Planner Uses This Plan

The planner reads `BACKLOG.md` daily and picks the highest-score task. Sprint tags in the backlog ensure tasks execute in roughly the right order:

1. S1 tasks have the highest scores (C-03=90, C-04=88, etc.)
2. S2 tasks score slightly lower (H-07=82, H-08=76, etc.)
3. As S1 tasks complete, S2 tasks naturally rise to the top
4. The Meta-Optimizer rescores weekly if velocity differs from plan

**If the planner gets blocked** (e.g., S3 needs a migration Yogesh hasn't run yet), it skips to the next unblocked task from any sprint. No wasted sessions.

**If the planner finishes early**, it pulls tasks from the next sprint. Ahead of schedule is always welcome.

---

## Tracking

The Meta-Optimizer updates `docs/ops/HEALTH_LOG.md` weekly with:
- Tasks completed vs. planned
- Sprint progress %
- Phase 1 readiness estimate
- Velocity trends

Yogesh can check progress anytime by reading the health log or the latest steward report.

---

*Phase 1 is 26 tasks across 12 weeks. At 1-2 tasks/day, the autonomous planner has comfortable margin. The system improves itself weekly. By August, WildArc should be a repo any permaculture developer would be proud to contribute to.*
