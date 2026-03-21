# Core UI & Settings Design Specifications

The "Core" module contains the shared infrastructure that sits underneath the Arbor, Flora, Terra, and Synapse applications.

## 1. Multi-Tenant Project Switcher

**Goal:** Allow users (especially farm owners) to seamlessly switch between different farms or different sub-projects without logging out.

### Key UI Elements:
- **Location**: Top-left corner of the sidebar, replacing the static "WildArc" logo.
- **Closed State**: Shows the current active project name (e.g., "Meadowbrook Farm") with a dropdown arrow.
- **Open State (Dropdown)**:
  - List of accessible projects, showing their name and your role (e.g., `Owner`, `Contributor`).
  - Search bar to filter projects (for users with many).
  - Action button: "+ Create New Project".
- **Visual Distinction**: When switching projects, the app should fetch new data but maintain the current route if possible (e.g., staying on the `Dashboard` but refreshing data for the new project).

---

## 2. Notification Center

**Goal:** Provide an inbox for system alerts (e.g., weather warnings, low health score on a tree, new employee request).

### Key UI Elements:
- **Location**: Top-right corner of the top nav bar (Bell icon).
- **Badge**: Tiny red dot with unread count.
- **Drawer / Popover**: Clicking the bell opens a side drawer or dropdown list of recent alerts.
- **Notification Cards**:
  - Icon type (Warning triangle, Info circle, Weather cloud).
  - Timestamp (e.g., "2 hours ago").
  - Title and Body snippet.
  - "Mark as Read" action.
  - Clicking the notification navigates to the relevant entity (e.g., the specific Tree Detail page that needs attention).

---

## 3. Dark Mode & Theming

**Goal:** Improve visibility in bright sunlight (high contrast light mode) and reduce eye strain when reviewing data at night (dark mode).

### Key UI Elements:
- **Toggle**: Found in `Settings > App Appearance`.
- **Colors**:
  - Light mode: White backgrounds, earthy green accents (`#2A5934`), highly legible dark gray text (`#1F2937`).
  - Dark mode: Very dark gray or "forest night" green-black background (`#0F172A` or `#121C14`). Accents shift to slightly brighter, neon tones (e.g., `#4ADE80`) to maintain contrast ratios.
  - Shadows in light mode switch to borders in dark mode to preserve depth perception.
