# WildArc UI Revamp Specification — May 2026

> Design direction for the next major frontend iteration. Covers visual system, UX/IA changes, new feature surfaces, and mobile improvements. All decisions are grounded in the existing stack (React + Vite + Tailwind) and live usage context (field workers in Coorg).

---

## 1. Design Principles (unchanged from V1, refined)

1. **Information density without clutter** — every pixel earns its place; use expandable drawers, not nested pages.
2. **Field-first mobile** — bright sunlight, dirty hands, one thumb. Min 44 × 44 px tap targets. High contrast. Offline-aware.
3. **Earthy but technical** — not rustic, not sterile. The land has real data; show it crisply.
4. **Action-oriented** — the first glance tells you what needs doing today.
5. **Module-aware** — the app is growing. Every screen should feel like it belongs to a larger, coherent ecosystem.

---

## 2. Visual System Changes

### 2.1 Color palette

| Token | Current | Revamp | Notes |
|---|---|---|---|
| Page background | `#f9fafb` (gray-50, cold) | `#F7F5EE` (off-white, warm) | Matches brand Off-White |
| Primary | `#16a34a` (green-600) | `#2A5934` (Forest Deep) | Stronger brand presence |
| Primary light | `#f0fdf4` (green-50) | `#EAF3DE` | Warmer tint |
| Primary mid | `#22c55e` (green-500) | `#639922` | More earthy |
| Text primary | `#1f2937` (gray-800) | `#1C2B1F` (Forest Night) | Slightly green-tinted |
| Text secondary | `#6b7280` (gray-500) | `#6B7B6F` | Slightly green-tinted |
| Card border | none / `border-gray-100` | `0.5px solid rgba(#1C2B1F, 0.10)` | Subtler, warmer |

Action colors (`actionColors.ts`) are **not changing** — they are functional, not brand.

### 2.2 Typography

No new typeface needed. Tailwind's `font-sans` is fine. Tighten hierarchy:

| Use | Size | Weight | Color |
|---|---|---|---|
| Hero number | 36px | 500 | `text-primary` |
| Screen title | 16px | 500 | `text-primary` |
| Card heading | 12px | 500 | `text-primary` |
| Meta / label | 10px | 400 | `text-secondary` |
| Section heading | 10px | 500 | `text-secondary`, uppercase, `tracking-widest` |

### 2.3 Spacing & radius

| Surface | Radius |
|---|---|
| Page background | — |
| Cards | `rounded-[14px]` (from `rounded-2xl`) |
| Chips / pills | `rounded-full` |
| Icon containers | `rounded-[8px]` |
| Inputs | `rounded-[10px]` |
| Bottom nav | `rounded-t-[16px]` |
| Phone frame | `rounded-[28px]` |

### 2.4 Shadows

Remove heavy `shadow-xl` on the outer Layout wrapper. Replace with:
- Cards: `border border-[rgba(28,43,31,0.10)]` — no box-shadow
- Modals / drawers: `border-t border-[rgba(28,43,31,0.12)]`
- Bottom nav: `border-t border-[rgba(28,43,31,0.08)]`

---

## 3. Information Architecture Changes

### 3.1 Bottom navigation — revised

**Current:** Home | Trees | Map | Team | Me (role-gated)

**Revamp:**

```
Home | Trees | Map | Team | GrowMate
```

- `Me` (profile) moves to a menu reachable from the header avatar
- `GrowMate` replaces `Me` as the 5th nav item (always visible, always one tap away)
- A **module bar** appears above the bottom nav (inside the safe-area padding) showing `Arbor` (active) and greyed-out coming modules: `Flora`, `Terra`, `Synapse`

### 3.2 Header — revised

**Current:** Ad-hoc per page (some have ProjectSwitcher, some have a title).

**Revamp — consistent header pattern:**

```
[ Project pill ▾ ]              [ 🔔 ]
```

- Left: `ProjectSwitcher` always present, styled as a pill (`bg-green-50 text-green-800 border border-green-200 rounded-full`)
- Right: notification bell with unread badge
- Page title removed from header — let the content lead
- No "Welcome, Yogesh" greeting (wastes vertical space on mobile)

### 3.3 Dashboard — revised layout

**Current flow:** Welcome → 2×2 stat grid → Progress bar → Urgent list → Biodiversity → Zones → Export → QR

**Revamp flow:**

1. **Hero stat** — large number `347` with subtitle `trees · Coorg Estate · May 2026`
2. **Action pill row** — horizontal scrollable: ✂ Cut 12 · ✦ Trim 29 · ✓ Healthy 247 · ◎ Watch 38 · ⬡ Treat 21
3. **Module bar** — Arbor (active) | Flora | Terra | Synapse
4. **Biodiversity card** — Shannon H' score prominently, then species bars
5. **Urgent / attention list** — max 3 rows, tap to navigate
6. **Zone summary** — compact; tap a zone to filter Tree List
7. **Progress bar** — moved lower; less critical than action status
8. **Export & QR** — collapsed into a `···` overflow menu or Settings

### 3.4 Tree List — revised

- Search bar: wider placeholder `Search trees, codes, species…`
- Filter chips: horizontal scroll (not collapsible panel) — always visible, no extra tap
- Tree cards: add health score bar beneath name row
- Count label: `347 trees` shown above list in `text-secondary`
- FAB: `+` add-tree button floats bottom-right (only for owners)

### 3.5 Map — new toggle

Add a segmented control at the top: `Canvas | GIS`

- **Canvas** — current implementation (X/Y coordinate grid)
- **GIS** — future satellite-backed map (Phase 1 of Arbor V2 GIS spec); show placeholder with `Coming soon` overlay until implemented

When a tree marker is tapped, a **bottom drawer** slides up (already partially designed in Arbor V2 spec) showing: name, zone, health score, CO₂ estimate, and a large `Log observation` CTA.

### 3.6 GrowMate — new screen

Full nav tab pointing to `/growmate`. Chat interface:

- Header: avatar + "GrowMate · AI field assistant · online/offline" status
- Context chip (top-right): active tree code if navigated from a tree detail page
- Chat thread with AI bubbles (left) and user bubbles (right)
- Quick-action buttons appear after AI responses (`Log observation ↗`, `View tree ↗`)
- Input: bottom sticky with mic icon for voice input (Phase 2)
- Floating FAB on all pages (green circle, chat icon) that opens GrowMate pre-seeded with current page context

**GrowMate context injection rules:**

| Page | Context sent to AI |
|---|---|
| Dashboard | Today's date, project stats, top 3 urgent trees |
| Tree Detail | Full tree record (species, health history, action, zone) |
| Map | Currently selected tree if any |
| Activity Log | Recent 10 entries |

---

## 4. Component Changes

### 4.1 TreeCard (list view)

Add below the name/code row:

```tsx
<div className="mt-1.5">
  <p className="text-[10px] text-gray-500 mb-1">Health · {score}/10</p>
  <div className="h-[3px] rounded-full bg-gray-100 overflow-hidden">
    <div className="h-full rounded-full" style={{ width: `${score * 10}%`, background: healthColor(score) }} />
  </div>
</div>
```

`healthColor`: `#639922` (≥7), `#BA7517` (4–6), `#E24B4A` (≤3)

### 4.2 BottomNav — module bar addition

```tsx
{/* Module bar — above nav items */}
<div className="flex gap-1.5 px-4 pt-2 pb-1 overflow-x-auto">
  <span className="...active chip...">Arbor</span>
  <span className="...muted chip... opacity-50 italic">Flora</span>
  <span className="...muted chip... opacity-50 italic">Terra</span>
  <span className="...muted chip... opacity-50 italic">Synapse</span>
</div>
```

### 4.3 Dashboard hero — replace 2×2 grid

```tsx
<div className="mb-3">
  <p className="text-[36px] font-medium text-[#1C2B1F] leading-none">{stats.total}</p>
  <p className="text-[11px] text-[#6B7B6F] mt-1">trees · {projectName} · {month}</p>
</div>
<div className="flex gap-1.5 flex-wrap mb-4">
  {actionPills.map(p => <ActionPill key={p.key} {...p} />)}
</div>
```

### 4.4 Page background

In `index.css`, change:

```css
/* from */
body { @apply bg-gray-50; }

/* to */
body { background: #F7F5EE; }
```

And in `Layout.tsx`:

```tsx
/* from */
className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto shadow-xl"

/* to */
className="min-h-screen bg-[#F7F5EE] flex flex-col max-w-md mx-auto border-x border-[rgba(28,43,31,0.08)]"
```

---

## 5. Mobile / Responsive Improvements

| Issue | Fix |
|---|---|
| Dashboard: stat grid not scannable in sunlight | Hero number + pill strip — high contrast, larger text |
| Filter panel requires extra tap | Inline chip scroll — always visible |
| No offline indicator | Add `OfflineBanner` component: `bg-amber-50 text-amber-800` strip below header |
| Map has no field context | Bottom drawer on tree tap (already specced in Arbor V2 GIS) |
| No voice input | GrowMate mic icon (Phase 2) |
| No dark mode | Implement via CSS `prefers-color-scheme` using CSS variables from core spec |

---

## 6. New Features — Summary

| Feature | Surface | Priority | Effort |
|---|---|---|---|
| GrowMate AI chat | New screen `/growmate` + FAB | P0 | High |
| Health score bar on tree cards | TreeCard component | P0 | Low |
| Warm background + brand tokens | Global CSS | P0 | Low |
| Action pill strip on dashboard | Dashboard | P0 | Low |
| Module bar in nav | BottomNav | P1 | Low |
| Header standardization | Layout + pages | P1 | Medium |
| Canvas / GIS toggle on map | MapView | P1 | Low (placeholder ok) |
| Bottom drawer on map tap | MapCanvas | P1 | Medium |
| Offline banner | Core component | P1 | Low |
| Dark mode | Global CSS + token audit | P2 | High |
| Notification center | New drawer + bell | P2 | High |
| Voice input in GrowMate | GrowMate | P3 | High |

---

## 7. Files to Change

```
frontend/src/index.css                        — page bg color
frontend/tailwind.config.ts                   — add brand tokens
frontend/src/core/constants/actionColors.ts   — no change
frontend/src/core/components/Layout.tsx       — bg, shadow → border
frontend/src/core/components/BottomNav.tsx    — add GrowMate tab + module bar
frontend/src/modules/arbor/pages/Dashboard.tsx — hero + pill strip
frontend/src/modules/arbor/components/TreeCard.tsx — health bar
frontend/src/modules/arbor/pages/TreeList.tsx — filter chips inline
frontend/src/modules/arbor/pages/MapView.tsx  — toggle + drawer
frontend/src/modules/growmate/                — NEW module directory
```

---

*Spec author: Claude (Cowork session), May 4 2026. Review with Yogesh before implementation sprint.*
