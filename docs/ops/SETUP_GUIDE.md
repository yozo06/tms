# ⚙️ WildArc Automation System — Architecture & Setup Guide

Four autonomous agents work together to keep WildArc healthy, progressing, and continuously improving — with built-in failure detection and human escalation.

---

## The Four Agents

```
08:00 AM  🌿 Daily Steward       — Observes, reports, flags issues, verifies yesterday's agents
10:00 AM  🤖 Autonomous Planner  — Picks tasks, writes code, commits fixes, escalates blockers
03:00 PM  🐕 Watchdog            — Verifies all agents ran, detects silent failures
Sunday    🧠 Meta-Optimizer      — Reads all logs, improves all other agents
```

The **Steward** sees what's wrong and checks the other agents ran yesterday.
The **Planner** fixes it and escalates what it can't.
The **Watchdog** makes sure nobody crashed silently.
The **Optimizer** makes everyone smarter over time.

---

## All Tasks — Status: ✅ Active

| Agent | Task ID | Schedule | Status |
|-------|---------|----------|--------|
| 🌿 Daily Steward | `wildarc-daily-steward` | Daily 8:00 AM | ✅ Active |
| 🤖 Autonomous Planner | `wildarc-autonomous-planner` | Daily 10:00 AM | ✅ Active |
| 🐕 Watchdog | `wildarc-watchdog` | Daily 3:00 PM | ✅ Active |
| 🧠 Meta-Optimizer | `wildarc-meta-optimizer` | Sunday 9:00 AM | ✅ Active |

---

## What Each Agent Does

### 🌿 Daily Steward (8:00 AM)

**Role:** First eyes on the codebase each morning.

- **Section 0 — Cross-agent health check**: Verifies yesterday's planner session log exists, checks for orphaned checkpoint files (planner crash indicator), flags stale human-action items in `docs/ops/NEEDS_HUMAN.md`
- **Section 1 — Vision alignment**: Reads recent commits against vision docs, flags drift, celebrates progress
- **Section 2 — Design consistency**: Scans for color drift, accessibility gaps, inline styles, spec violations
- **Section 3 — Problem journal**: Researches one real-world permaculture problem (themed by day of week)
- **Section 4 — Build health**: Runs builds, TypeScript checks, npm audit, test suite, TODO count

**Output:** `docs/steward/YYYY-MM-DD.md`

### 🤖 Autonomous Planner (10:00 AM)

**Role:** The engineer. Reads the backlog, picks the top task, implements it, verifies, commits.

Key capabilities:
- **Checkpoint system**: Writes `docs/planner/sessions/.checkpoint` at session start — enables crash detection by Watchdog
- **Smart batching**: If primary task is small (<30 min), batches 2–3 tasks in one session
- **Skip-if-blocked**: If top task needs human action (DB migration, API key, design decision), logs to `docs/ops/NEEDS_HUMAN.md` and picks next unblocked task
- **Escalation protocol**: After implementation, checks for items requiring human intervention and surfaces them
- **Recovery protocol**: If previous session crashed (orphaned checkpoint), recovers gracefully before starting new work

**Methodology:** `docs/planner/PLANNER_SKILL.md` (9 phases: Checkpoint → Awareness → Selection → Implementation → Verification → Backlog Update → Commit → Escalation → Session Report → Cleanup)

**Output:** `docs/planner/sessions/YYYY-MM-DD.md` + git commits + backlog updates

### 🐕 Watchdog (3:00 PM)

**Role:** The safety net. Lightweight afternoon verification that nothing failed silently.

Checks (in order):
1. Steward report exists and is substantial (>500 bytes)
2. Planner session log exists and is substantial (>300 bytes)
3. No orphaned checkpoint file (crash indicator)
4. Build still passes
5. Git working tree is clean (no uncommitted changes from crashed session)
6. Human action items aren't going stale (>3 days unresolved)
7. No critical backlog items remaining (should be 0 after planner runs)

**Escalation:** If planner crashed, build is broken, or human items are stale → appends to `docs/ops/NEEDS_HUMAN.md`

**Output:** `docs/ops/WATCHDOG_LOG.md`

### 🧠 Meta-Optimizer (Sunday 9:00 AM)

**Role:** The team lead. Reads the week's outputs and makes the whole system smarter.

Analysis areas:
- **Agent health**: Uptime tracking (reports produced vs. expected), silent failure detection, velocity trends
- **Steward patterns**: Repeated flags, missed themes, reporting quality
- **Planner patterns**: Task completion rate, stuck tasks, build trend, discovery rate
- **Backlog health**: Growth rate, scoring accuracy, stale items, critical clearance time
- **Human items**: Unresolved items older than 3 days, blocking patterns

Actions taken:
- Rescores, splits, and rewrites backlog tasks
- Adds rules to planner methodology to prevent repeated mistakes
- Improves steward check patterns
- Tracks Phase 1 OSS readiness % over time

**Methodology:** `docs/planner/META_OPTIMIZER_SKILL.md`

**Output:** `docs/ops/HEALTH_LOG.md` + `docs/ops/IMPROVEMENTS.md` + backlog/methodology updates

---

## Resilience Architecture

### Failure Detection Chain

```
Planner crashes mid-session
  → Checkpoint file left behind (not cleaned up)
  → Watchdog (3 PM) detects orphaned checkpoint → logs to WATCHDOG_LOG + NEEDS_HUMAN
  → Steward (next 8 AM) verifies missing session log → flags in morning report
  → Next Planner session (10 AM) runs Recovery Protocol → stashes changes, fixes build, resumes
  → Meta-Optimizer (Sunday) tracks uptime trends → improves if pattern emerges
```

### Human Escalation Flow

```
Agent hits something it can't do autonomously
  → Writes to docs/ops/NEEDS_HUMAN.md with specific action needed
  → Watchdog checks daily for stale items (>3 days = re-escalation)
  → Steward surfaces pending items in morning report
  → Meta-Optimizer flags items >5 days as critical in weekly review
  → Yogesh resolves by changing status to ✅ Done
```

### Smart Task Management

```
Planner encounters blocked task (needs DB migration, API key, etc.)
  → Logs blocker to NEEDS_HUMAN.md
  → Skips to next unblocked task (no wasted sessions)
  → Small tasks get batched (2-3 per session when primary <30 min)
  → Large tasks get auto-split (>2-3 hours → sub-tasks in backlog)
```

---

## File Structure

```
docs/
├── vision/                  ← Constitution (read-only by all agents)
├── designs/                 ← Design specs (read-only by all agents)
├── steward/
│   └── YYYY-MM-DD.md       ← Daily steward reports (written by Steward)
├── planner/
│   ├── BACKLOG.md           ← Living task backlog (Planner writes, Optimizer rescores)
│   ├── PLANNER_SKILL.md     ← Planner methodology (Optimizer improves)
│   ├── META_OPTIMIZER_SKILL.md ← Optimizer methodology
│   └── sessions/
│       ├── YYYY-MM-DD.md    ← Planner session logs
│       └── .checkpoint      ← Temporary: exists only during active planner session
└── ops/
    ├── HEALTH_LOG.md        ← Weekly ops health metrics (Optimizer writes)
    ├── IMPROVEMENTS.md      ← Process change log (Optimizer writes)
    ├── WATCHDOG_LOG.md      ← Daily health verification (Watchdog writes)
    ├── NEEDS_HUMAN.md       ← Human action queue (all agents write, Yogesh resolves)
    └── SETUP_GUIDE.md       ← This file
```

---

## Daily Timeline

```
08:00 AM  🌿 Steward runs
          ├── Checks yesterday's agents ran (cross-verification)
          ├── Analyzes vision alignment, design, accessibility
          ├── Researches today's real-world problem
          └── Reports build health

10:00 AM  🤖 Planner runs
          ├── Writes checkpoint (crash detection enabled)
          ├── Reads steward report + backlog
          ├── Picks highest-priority unblocked task(s)
          ├── Implements, verifies, commits
          ├── Escalates human-needed items
          └── Cleans up checkpoint

03:00 PM  🐕 Watchdog runs
          ├── Verifies steward + planner both produced output
          ├── Checks for orphaned checkpoints (crash)
          ├── Verifies build is still green
          └── Flags stale human-action items

Sunday 9:00 AM  🧠 Meta-Optimizer runs
                ├── Reads entire week's outputs
                ├── Tracks agent uptime + velocity
                ├── Rescores and improves backlog
                ├── Updates agent methodologies
                └── Reports health trajectory
```

---

## Feedback Loops

**Daily loop (Mon–Sat):**
Steward flags issue → Planner picks it up same morning → Fixed & committed → Watchdog confirms

**Weekly loop (Sunday):**
Optimizer reads the week → Improves backlog scores → Improves agent prompts → Next week's agents are smarter

**Escalation loop (continuous):**
Agent hits blocker → NEEDS_HUMAN.md → Watchdog reminds daily → Steward surfaces in morning → Yogesh resolves → Planner picks up unblocked task

**Self-healing loop:**
Planner crashes → Checkpoint left behind → Watchdog detects → Next planner recovers automatically

---

## For Yogesh: What You Need to Do

Your role is **vision, direction, and unblocking**. The system handles execution.

**Daily (optional, ~2 min):** Glance at the steward report in `docs/steward/` — it's your morning briefing on what the agents did and found.

**When notified:** Check `docs/ops/NEEDS_HUMAN.md` for items marked `⏳ Waiting`. These are things only you can do (run a Supabase migration, make a design call, provide an API key). Mark them `✅ Done` when resolved.

**Weekly (optional, ~5 min):** Read the optimizer's `docs/ops/HEALTH_LOG.md` entry — it shows trajectory, velocity, and whether the system is getting better.

**Anytime:** Edit `docs/planner/BACKLOG.md` to add tasks, reprioritize, or change direction. The planner respects whatever you put there.

---

*The goal: WildArc improves every single day, automatically, with Yogesh staying in control of vision and direction. The system catches its own failures, escalates what it can't handle, and gets smarter every week.*
