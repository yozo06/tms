# WildArc Revamp — Implementation Plan

> Prioritized breakdown of revamp work. Designed to fit within normal sprint cadence. P0 items are pure visual changes with zero schema/API impact and can ship in a single sprint. P1 adds new UI surfaces. P2–P3 are larger features.

---

## P0 — Quick wins (1 sprint, ~1 day total implementation)

These are CSS/JSX-only changes. Zero backend work. Zero risk. Ship together as `revamp/p0-visual`.

### P0-1 · Warm background + brand tokens

**Files:** `index.css`, `tailwind.config.ts`, `Layout.tsx`

```
tailwind.config.ts: add brand tokens
  brand: {
    forest: '#2A5934', 'forest-light': '#EAF3DE',
    gold: '#D8A419', earth: '#8B5E3C',
    offwhite: '#F7F5EE', night: '#1C2B1F',
    secondary: '#6B7B6F'
  }

index.css: body { background: #F7F5EE; }

Layout.tsx: bg-gray-50 → bg-brand-offwhite
            shadow-xl → border-x border-brand-night/8
```

Estimated time: **30 min**

---

### P0-2 · Dashboard hero + action pill strip

**File:** `frontend/src/modules/arbor/pages/Dashboard.tsx`

Replace the 2×2 stat grid with:

1. Hero number block (total trees + subtitle)
2. Horizontal pill strip (one pill per action type showing count, coloured with action color)
3. Keep existing biodiversity, urgent, and zone cards below

The 4 stat boxes move to a collapsible "Details" section or are dropped (total + completed are readable from pill strip).

Estimated time: **1 hr**

---

### P0-3 · Health score bar on tree cards

**File:** `frontend/src/modules/arbor/components/TreeCard.tsx`

Add a 3px health bar beneath the tree name/code row. Color: green ≥7, amber 4–6, red ≤3. Requires the `lastHealthScore` field already returned by `getTrees()` API — verify or add to query.

Estimated time: **45 min**

---

### P0-4 · Filter chips inline on Tree List

**File:** `frontend/src/modules/arbor/pages/TreeList.tsx`

Replace the collapsible filter panel with a horizontally scrollable chip row that is always visible. Each chip: action type pill. Zone filter stays as a dropdown but moves inline. Eliminates one tap per filter interaction.

Estimated time: **45 min**

---

### P0-5 · Header standardisation

**Files:** all `pages/*.tsx`

Extract a shared `<PageHeader>` component:

```tsx
interface PageHeaderProps {
  title?: string      // omit to show no title (Dashboard uses hero number instead)
  action?: ReactNode  // e.g. Add button
}
```

All pages use this. Ensures consistent top padding and layout.

Estimated time: **45 min**

---

## P1 — New UI surfaces (1–2 sprints)

### P1-1 · GrowMate screen scaffold

**New directory:** `frontend/src/modules/growmate/`

Files:
- `pages/GrowMate.tsx` — chat interface (static mock first, then wired to AI)
- `components/ChatBubble.tsx` — AI + user variants
- `components/GrowMateFab.tsx` — floating button, rendered in `Layout.tsx`
- Route: `/growmate` added to `App.tsx`

Phase 1: static UI only (hardcoded sample conversation). No AI backend yet. Estimated time: **3 hrs**

Phase 2: wire to a backend endpoint `POST /api/growmate/chat` that calls an LLM. Estimated time: **5–8 hrs** (separate sprint)

---

### P1-2 · BottomNav — GrowMate tab + module bar

**File:** `frontend/src/core/components/BottomNav.tsx`

Changes:
1. Replace `Me` (profile) with `GrowMate` tab pointing to `/growmate`
2. Add profile access via avatar in header (top-right pill or small icon)
3. Add module bar above nav items (horizontal scroll, `Arbor` active, others greyed/italic)

Estimated time: **1.5 hrs**

---

### P1-3 · Map — Canvas/GIS toggle + bottom drawer

**File:** `frontend/src/modules/arbor/pages/MapView.tsx`, `MapCanvas.tsx`

1. Add segmented control `Canvas | GIS` at top. GIS shows placeholder overlay with "Coming in Arbor V2".
2. When a tree marker is tapped on canvas, show a slide-up bottom drawer with: name, zone, health score, CO₂, `Log observation` CTA.

Estimated time: **2.5 hrs**

---

### P1-4 · Offline banner

**New component:** `frontend/src/core/components/OfflineBanner.tsx`

```tsx
export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])
  if (!offline) return null
  return <div className="bg-amber-50 text-amber-800 border-b border-amber-200 text-xs text-center py-1.5 px-4">No connection — showing cached data</div>
}
```

Add to `Layout.tsx` above `<main>`. Estimated time: **30 min**

---

### P1-5 · ProjectSwitcher as header pill

**Files:** `ProjectSwitcher.tsx` (restyle), `Layout.tsx` (include in header row)

The ProjectSwitcher is currently only on Dashboard. Move it into a sticky header that appears on every page:

```tsx
<header className="sticky top-0 z-40 bg-brand-offwhite/90 backdrop-blur-sm border-b border-brand-night/5 flex items-center justify-between px-4 py-2.5">
  <ProjectSwitcher />
  <NotificationBell />  {/* P2 */}
</header>
```

Remove from Dashboard component. Estimated time: **1 hr**

---

## P2 — Larger features (2–3 sprints)

### P2-1 · Dark mode

1. Audit all hardcoded colors; replace with CSS variables or Tailwind dark-mode variants
2. Add `DarkModeToggle` in Settings page
3. Persist preference in `localStorage` + apply `class="dark"` on `<html>`
4. Key surface: `bg-brand-offwhite` → `bg-[#121C14]`, text/border inversion

Estimated time: **6–8 hrs**

---

### P2-2 · Notification center

1. Backend: `GET /api/notifications` → returns unread alerts (low health score, overdue action, new employee request)
2. Frontend: `NotificationBell` component with badge count, click opens slide-in drawer
3. Drawer: list of `NotificationCard` components with type icon, timestamp, body, mark-read action

Estimated time: **8–10 hrs**

---

### P2-3 · GrowMate AI backend

1. `POST /api/growmate/chat` — accepts `{ messages, context }`, returns streamed response
2. Context injection per page (see spec §3.6)
3. Connect frontend `GrowMate.tsx` to live endpoint
4. Add conversation history (in-memory per session, no persistence in V1)

Estimated time: **8–12 hrs**

---

## P3 — Future (on roadmap, not this sprint)

- Voice input in GrowMate (Web Speech API)
- GIS map with real satellite imagery (Mapbox or Leaflet + OpenStreetMap)
- Yield tracking dashboard (Arbor V2 spec)
- Flora module scaffold
- Community-facing public species database

---

## Sprint recommendation

Given laptop availability (12:00–17:00 window), suggest:

**Sprint S4 — Revamp P0 + P1 scaffold**

| Day | Work |
|---|---|
| Day 1 | P0-1 + P0-2 (bg + dashboard hero) |
| Day 2 | P0-3 + P0-4 (tree card health bar + filter chips) |
| Day 3 | P0-5 + P1-5 (header standardisation) |
| Day 4 | P1-2 (BottomNav revamp + GrowMate tab) |
| Day 5 | P1-1 (GrowMate static scaffold) + P1-4 (offline banner) |

Each day's work fits in a 3–4 hr planner session. P1-3 (map drawer) and P2 items go in S5.

---

*Plan author: Claude (Cowork session), May 4 2026.*
