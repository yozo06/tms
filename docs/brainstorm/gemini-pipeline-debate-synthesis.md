# WildArc Content Pipeline — Multi-Model Brainstorm Synthesis

**Date:** 2026-03-29
**Debate:** 3 rounds, 4 models (Opus, Sonnet, Haiku, Host)
**Duration:** ~550s | **Status:** Final Architecture Decided

---

## VERDICT

Implement the Planner extension with InfographicWorkflow as the single source of truth for generation, lock in the 9:30am timing window, and make human review mandatory but time-boxed to 15 minutes. The factual accuracy gate (OCR + knowledge base validation) is non-negotiable for educational credibility; delay auto-posting until Phase 2 when confidence is proven.

---

## CONSENSUS ARCHITECTURE (All 4 models agreed)

### 1. Agent Structure: Extend Planner (NOT a 5th agent)
- Add `content_generation` as a task type within Planner's existing methodology
- Reuses existing checkpoint/recovery mechanisms
- Steward/Watchdog already know how to verify Planner output
- Keeps the four-agent system (Steward → Planner → Watchdog → Meta-Optimizer) intact

### 2. Pipeline Timing
```
8:00 AM  — Steward verifies system health
9:30 AM  — Planner.InfographicWorkflow: Attempt 1 (topic → Gemini → quality check)
9:50 AM  — Attempt 2 if failed (adjusted prompt based on failure type)
11:30 AM — Attempt 3 if still failing (different seed + temperature shift)
12:00 PM — Human review gate (15 min eyeball test, Yogesh's laptop window opens)
12:15 PM — Approved → Discord webhook post
3:00 PM  — Watchdog monitors engagement, checks for failures
Sunday   — Meta-Optimizer analyzes weekly performance, promotes best prompt templates
```

### 3. Gemini API Strategy
- **Reference images**: PNG multipart upload (not PDF, not URL) — direct inline in prompt
- **Versioned references**: Supabase Storage with `{style_era, season, color_palette_hex[], suitable_topics[]}`
- **Monthly rotation**: 2-3 reference images rotated to prevent Gemini mode collapse
- **Seasonal theming**: Monsoon palette in June, harvest warm-tones in October
- **Prompt structure**: Three layers:
  1. System context (style rules, color palette, typography)
  2. Reference image anchoring (PNG multipart)
  3. Dynamic topic prompt (objectives, layout, negative prompts)
- **Negative prompts**: "Avoid: photorealism, 3D rendering, clipart, gradients, drop shadows"
- **Seed tokens**: Include exact hex colors in JSON blob to reduce color drift

### 4. Quality Gates: Checklist-Based (Not Numeric Scores)
Five binary checks:
1. **Text legible** via OCR? (non-negotiable)
2. **No visual artifacts** / corruption / half-rendered elements?
3. **Correct aspect ratio** (1080×1350 Discord, ±2% tolerance)?
4. **Color palette** within WildArc brand range?
5. **FACTUAL ACCURACY** — OCR extract all text → cross-check claims against Supabase knowledge base

Rules:
- All 5 pass → approve for posting (pending human review in Phase 1)
- 4/5 pass → post with review flag
- <4 pass → retry
- **Factual accuracy failure = HARD BLOCK** (never publish educational content with wrong facts)

### 5. Discord Integration: Pure Webhook Phase 1
- Webhook for posting (zero infrastructure, stateless, retry-safe)
- Store `discord_message_id` in Supabase for future upgrades
- Abstract behind `DiscordPoster` interface (10 min investment now)
  - Phase 1: `WebhookPoster implements DiscordPoster`
  - Phase 3: `BotPoster implements DiscordPoster` (reactions, threads, commands)
- Channel structure: `#infographics` (public), `#generation-log` (dev), `#content-feedback` (community)

### 6. Instagram Future-Proofing (Build Now, Connect Later)
- `DistributionQueue` table NOW:
  ```sql
  CREATE TABLE distribution_queue (
    id UUID PRIMARY KEY,
    image_id UUID REFERENCES generated_images,
    platform TEXT, -- 'discord' | 'instagram_feed' | 'instagram_story'
    status TEXT, -- 'pending' | 'approved' | 'posted' | 'failed'
    scheduled_for TIMESTAMPTZ,
    posted_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- Generate Discord variant only at generation time
- Instagram variants (1080×1080 feed, 1080×1920 story) derived post-approval via Sharp.js resize
- Caption templates stored per-platform in Supabase
- Stub function for Instagram posting — swap in Meta Graph API when ready

### 7. Prompt Template Versioning (Self-Improving System)
- **Supabase table**: `prompt_templates`
  ```sql
  CREATE TABLE prompt_templates (
    id UUID PRIMARY KEY,
    version INT,
    category TEXT, -- 'bamboo' | 'coffee' | 'permaculture' | 'ecology' | 'building'
    template_text TEXT,
    reference_image_ids UUID[],
    avg_quality_score FLOAT,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ```
- Git-tracked in `/prompts/infographic/` with INDEX.yaml for active version
- Every generation logs `{template_id, version, git_hash}`
- **Meta-Optimizer weekly**: Compare quality scores across versions, auto-promote best-performing, archive underperformers
- **A/B testing**: Run two template versions on same topic, compare quality + engagement

### 8. Retry Strategy: 2 Retries, Escalating Modifications

| Attempt | Timing | Strategy | Failure Action |
|---------|--------|----------|----------------|
| 1 | 9:30 AM | Original prompt + seed | Check quality gate |
| 2 | 9:50 AM | Adjusted prompt based on failure type | Check quality gate |
| 3 | 11:30 AM | Different seed + temperature shift | Escalate to NEEDS_HUMAN.md |

Failure-type adjustments:
- **Text illegible** → "Increase all text sizes, use high-contrast colors"
- **Visual artifacts** → Same prompt, different seed + higher temperature
- **Off-brand colors** → Re-embed hex codes explicitly, add negative color prompts
- **Factual error** → Re-prompt with corrected baseline data from knowledge base
- **Sparse layout** → "Add more labeled components, include 5 distinct sections"

### 9. Factual Accuracy Pipeline (Educational Content Critical)
- **Tier 1 (Planner, during generation)**: Prompt includes baseline data from Supabase knowledge tables
- **Tier 2 (Quality gate)**: Claude Vision OCR → extract all text claims → cross-reference against `plant_data`, `soil_data`, `seasonal_calendar` tables
- **Tier 3 (Human escalation)**: Any unverifiable or mismatched claim → block publication, flag for Yogesh
- **Rule**: Educational content MUST pass Tier 2 before posting. No exceptions.

### 10. Storage: Three-Tier Architecture

| Tier | Location | Retention | Purpose |
|------|----------|-----------|---------|
| **Hot** | Supabase Storage | 90 days | Discord posting, human review, active pipeline |
| **Warm** | Google Drive `/infographics/YYYY-MM/` | Indefinite | Backup, team sharing, seasonal re-use |
| **Reference** | Supabase + Git | Indefinite | Style references, prompt templates, versioned |

### 11. Agent Integration Map

| Agent | Content Pipeline Role |
|-------|----------------------|
| **Steward (8am)** | Verify system health before generation. Poll yesterday's Discord reactions. Log engagement metrics. Check for stale failures. |
| **Planner (9:30am)** | Execute InfographicWorkflow: topic selection → Gemini generation → quality gate → store results. |
| **Watchdog (3pm)** | Monitor Discord engagement. Check generation failures. Verify factual accuracy spot-check. Alert if queue < 3 days ahead. |
| **Meta-Optimizer (Sunday)** | Analyze weekly engagement by topic type. Promote best prompt templates. Adjust topic weights. Suggest next week's calendar. |

State machine via Supabase status fields:
```
scheduled → generating → quality_check → pending_review → approved → posted_discord → posted_instagram
```

---

## KEY TRADEOFFS

1. **Timing vs. Planner completion**: 9:30am generation starts before Planner's regular 10am tasks. This enables parallel workflow but means content generation gets its own scheduling slot within Planner.

2. **Human review burden**: Mandatory 15-min daily review prevents design drift and catches factual errors that checklists miss. This is a non-negotiable investment in credibility for educational content about permaculture practices.

3. **Quality gates layering**: Start with pure 5-item checklist (fast, deterministic). Only add dynamic thresholds or rubrics if checklist misses real failures during Phase 1 data collection.

---

## STRONGEST DISAGREEMENT: Auto-Post vs. Human Review

**For auto-posting (Sonnet)**: If all 5 checklist items pass, auto-posting saves 15 minutes daily and removes a single point of failure (human fatigue/forgetfulness). The system should earn trust through early wins.

**For mandatory review (Opus)**: Design quality degrades silently without human eyes. A bot can pass every heuristic and still produce tone-deaf, culturally misaligned, or visually jarring infographics. 15 minutes of review is the only gate that protects brand coherence.

**Decision**: Mandatory human review in Phase 1. Auto-post only after 4+ weeks of data shows checklist reliability >95% with zero post-publication corrections needed.

---

## IMPLEMENTATION ROADMAP

### Phase 1: MVP (Weeks 1-4)
- Week 1: Planner InfographicWorkflow module + Supabase schema + prompt templates
- Week 2: Gemini API wrapper + quality checklist + retry logic
- Week 3: Discord webhook integration + message ID storage
- Week 4: Human review gate + factual accuracy pipeline

### Phase 2: Automation (Weeks 5-8)
- Content calendar auto-seeding (Planner + Meta-Optimizer)
- Google Drive backup integration
- Instagram DistributionQueue activation + Sharp.js variant generation
- A/B testing for prompt templates
- Conditional auto-post (if checklist reliability >95%)

### Phase 3: Scale (Month 3+)
- Discord bot upgrade (reactions, community topic suggestions, thread replies)
- Instagram Graph API integration
- Analytics dashboard in WildArc frontend
- Multi-image carousel generation
- Seasonal content awareness + cross-platform performance synthesis

---

## ENVIRONMENT VARIABLES NEEDED

```env
# Gemini
GEMINI_API_KEY=              # Google AI Studio → Get API Key

# Discord
DISCORD_WEBHOOK_URL=         # Server Settings → Integrations → Webhooks
DISCORD_WEBHOOK_DRAFTS=      # Optional: separate webhook for staging channel

# Future (Phase 3)
INSTAGRAM_ACCESS_TOKEN=      # Meta Developer Portal
INSTAGRAM_USER_ID=           # Instagram Business account ID
```

---

*Synthesized from 3-round debate between Opus, Sonnet, Haiku, and Host. All models converged on core architecture; strongest remaining tension (auto-post vs human review) resolved in favor of mandatory Phase 1 review with path to earned autonomy.*
