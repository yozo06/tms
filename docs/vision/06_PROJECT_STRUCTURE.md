# 📁 Project Structure

> *Recommended folder organization for modular development and easy contributor onboarding.*

---

## Current Structure (As-Is)

```
tms/
├── .env                          # Environment variables
├── .env.example                  # Template for env vars
├── .gitignore
├── README.md
├── package.json                  # Backend dependencies + scripts
├── tsconfig.json                 # Backend TypeScript config
├── vercel.json                   # Deployment config
│
├── api/
│   └── index.ts                  # Vercel serverless entry
│
├── src/                          # ── BACKEND ──
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── lib/
│   │   ├── auth.ts               # JWT + bcrypt utilities
│   │   ├── drive.ts              # Google Drive upload
│   │   └── supabase.ts           # Supabase client
│   ├── middleware/
│   │   ├── authenticate.ts       # JWT auth middleware
│   │   └── validate.ts           # Zod validation middleware
│   ├── routes/
│   │   ├── auth.ts               # Login, signup, refresh
│   │   ├── dashboard.ts          # Stats endpoint
│   │   ├── map.ts                # Map data
│   │   ├── species.ts            # Species CRUD
│   │   ├── trees.ts              # Tree CRUD + sub-resources
│   │   ├── users.ts              # User management
│   │   └── zones.ts              # Zone CRUD
│   ├── schemas/
│   │   └── index.ts              # Zod validation schemas
│   └── scripts/
│       └── (backfill scripts)
│
├── frontend/                     # ── FRONTEND ──
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx               # Router + route guards
│       ├── main.tsx              # React entry
│       ├── index.css             # Tailwind imports
│       ├── api/                  # API client functions
│       │   ├── client.ts
│       │   ├── auth.ts
│       │   ├── trees.ts
│       │   ├── dashboard.ts
│       │   ├── map.ts
│       │   ├── species.ts
│       │   └── users.ts
│       ├── components/           # Shared components
│       │   ├── Layout.tsx
│       │   ├── BottomNav.tsx
│       │   ├── Spinner.tsx
│       │   ├── TreeCard.tsx
│       │   ├── ActionBadge.tsx
│       │   ├── HealthBadge.tsx
│       │   ├── MapCanvas.tsx
│       │   ├── MapPicker.tsx
│       │   ├── SpeciesModal.tsx
│       │   └── ZoneModal.tsx
│       ├── pages/                # All page components
│       │   ├── Login.tsx
│       │   ├── Signup.tsx
│       │   ├── Dashboard.tsx
│       │   ├── TreeList.tsx
│       │   ├── (... 11 more pages)
│       │   └── About.tsx
│       └── store/
│           └── auth.store.ts     # Zustand auth state
│
└── docs/
    ├── 01_multi_tenant_migration.sql
    └── 02_grant_permissions.sql
```

---

## Recommended Structure (To-Be)

This structure is designed for **modular development** where each module is self-contained, multiple developers can work in parallel without conflicts, and new modules can be scaffolded predictably.

```
wildarc/                                    # ← Rename from "tms"
│
├── .github/                                # ── GitHub OSS Config ──
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── module_proposal.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml                          # Lint, type-check, test, build
│       └── deploy.yml                      # Auto-deploy on main push
│
├── .env.example                            # Template with all vars documented
├── .gitignore
├── LICENSE                                 # AGPL-3.0
├── README.md                               # Updated with badges, screenshots
├── CONTRIBUTING.md                         # Contributor quick-start
├── CODE_OF_CONDUCT.md                      # Contributor Covenant
├── CHANGELOG.md                            # Version history
├── SECURITY.md                             # Vulnerability reporting
│
├── docker-compose.yml                      # Local dev stack (optional)
├── Dockerfile                              # Production image
│
├── package.json                            # Root workspace config
├── tsconfig.json                           # Backend TS config
├── vercel.json                             # Deployment config
│
│─── docs/                                  # ── DOCUMENTATION ──
│   ├── vision/                             # Long-term vision (this folder)
│   │   ├── 00_OVERVIEW.md
│   │   ├── 01_VISION_AND_PHILOSOPHY.md
│   │   ├── 02_USE_CASES_AND_PERSONAS.md
│   │   ├── 03_MODULE_ROADMAP.md
│   │   ├── 04_TECHNICAL_ARCHITECTURE.md
│   │   ├── 05_OPEN_SOURCE_AND_CONTRIBUTION.md
│   │   ├── 06_PROJECT_STRUCTURE.md         # ← This file
│   │   └── 07_GAPS_AND_OPPORTUNITIES.md
│   │
│   ├── api/                                # API documentation
│   │   ├── openapi.yaml                    # OpenAPI 3.0 spec (future)
│   │   └── postman/                        # Postman collection (future)
│   │
│   ├── migrations/                         # SQL migration files
│   │   ├── 001_initial_schema.sql          # Base tables
│   │   ├── 002_multi_tenant.sql            # Projects + members
│   │   ├── 003_flora_module.sql            # Flora tables (future)
│   │   └── 004_terra_module.sql            # Terra tables (future)
│   │
│   ├── rfcs/                               # Architecture decision records
│   │   └── 001_module_architecture.md      # RFC template
│   │
│   └── guides/                             # How-to guides
│       ├── local-setup.md
│       ├── adding-a-module.md
│       └── database-conventions.md
│
├── src/                                    # ── BACKEND ──
│   ├── app.ts                              # Express app setup (module router)
│   ├── server.ts                           # Server entry point
│   │
│   ├── core/                               # Shared backend infrastructure
│   │   ├── lib/
│   │   │   ├── supabase.ts                 # Database client
│   │   │   ├── auth.ts                     # JWT + bcrypt
│   │   │   └── drive.ts                    # Google Drive
│   │   ├── middleware/
│   │   │   ├── authenticate.ts             # JWT verification
│   │   │   ├── validate.ts                 # Zod validation
│   │   │   └── projectScope.ts             # Project context (new)
│   │   └── types/
│   │       └── express.d.ts                # Express type extensions
│   │
│   ├── modules/                            # ── MODULE BACKENDS ──
│   │   ├── arbor/                          # 🌳 Tree Management
│   │   │   ├── routes/
│   │   │   │   ├── trees.ts
│   │   │   │   ├── species.ts
│   │   │   │   ├── zones.ts
│   │   │   │   ├── dashboard.ts
│   │   │   │   └── map.ts
│   │   │   ├── schemas/
│   │   │   │   ├── tree.schema.ts
│   │   │   │   ├── species.schema.ts
│   │   │   │   └── zone.schema.ts
│   │   │   └── index.ts                    # Exports module router
│   │   │
│   │   ├── flora/                          # 🌿 Companion Plants (future)
│   │   │   ├── routes/
│   │   │   │   ├── plants.ts
│   │   │   │   ├── guilds.ts
│   │   │   │   └── planting-logs.ts
│   │   │   ├── schemas/
│   │   │   │   ├── plant.schema.ts
│   │   │   │   └── guild.schema.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── terra/                          # 🪨 Soil & Water (future)
│   │   │   ├── routes/
│   │   │   │   ├── soil.ts
│   │   │   │   ├── water.ts
│   │   │   │   └── weather.ts
│   │   │   ├── schemas/
│   │   │   │   ├── soil.schema.ts
│   │   │   │   └── water.schema.ts
│   │   │   └── index.ts
│   │   │
│   │   └── synapse/                        # 🧠 Intelligence (future)
│   │       ├── routes/
│   │       │   ├── analytics.ts
│   │       │   └── export.ts
│   │       └── index.ts
│   │
│   ├── auth/                               # Auth routes (shared)
│   │   └── routes/
│   │       └── auth.ts
│   │
│   └── scripts/                            # Data scripts
│       ├── seed.ts                         # Seed demo data for dev
│       └── backfill.ts                     # Migration helpers
│
├── frontend/                               # ── FRONTEND ──
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   │
│   └── src/
│       ├── App.tsx                          # Root router
│       ├── main.tsx                         # Entry point
│       ├── index.css
│       │
│       ├── core/                            # Shared frontend code
│       │   ├── api/
│       │   │   ├── client.ts               # Axios/fetch wrapper
│       │   │   └── auth.ts                 # Auth API calls
│       │   ├── components/
│       │   │   ├── Layout.tsx
│       │   │   ├── BottomNav.tsx
│       │   │   ├── Spinner.tsx
│       │   │   ├── Modal.tsx               # Reusable modal (needed)
│       │   │   ├── DataTable.tsx           # Sortable table (needed)
│       │   │   ├── StatCard.tsx            # Dashboard card (needed)
│       │   │   └── FormField.tsx           # Form input (needed)
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   └── useProject.ts           # Project context hook
│       │   ├── store/
│       │   │   ├── auth.store.ts
│       │   │   └── project.store.ts        # Project state (needed)
│       │   └── types/
│       │       └── index.ts                # Shared TypeScript types
│       │
│       ├── modules/                        # ── MODULE FRONTENDS ──
│       │   ├── arbor/                      # 🌳 Tree Management UI
│       │   │   ├── api/
│       │   │   │   ├── trees.ts
│       │   │   │   ├── species.ts
│       │   │   │   ├── dashboard.ts
│       │   │   │   └── map.ts
│       │   │   ├── components/
│       │   │   │   ├── TreeCard.tsx
│       │   │   │   ├── ActionBadge.tsx
│       │   │   │   ├── HealthBadge.tsx
│       │   │   │   ├── MapCanvas.tsx
│       │   │   │   ├── MapPicker.tsx
│       │   │   │   ├── SpeciesModal.tsx
│       │   │   │   └── ZoneModal.tsx
│       │   │   ├── pages/
│       │   │   │   ├── Dashboard.tsx
│       │   │   │   ├── FieldHome.tsx
│       │   │   │   ├── TreeList.tsx
│       │   │   │   ├── TreeDetail.tsx
│       │   │   │   ├── TreeAdd.tsx
│       │   │   │   ├── TreeEdit.tsx
│       │   │   │   ├── HealthLog.tsx
│       │   │   │   ├── ActivityLog.tsx
│       │   │   │   ├── MapView.tsx
│       │   │   │   └── PublicTree.tsx
│       │   │   └── index.tsx               # Exports module routes
│       │   │
│       │   ├── flora/                      # 🌿 (future)
│       │   │   ├── api/
│       │   │   ├── components/
│       │   │   ├── pages/
│       │   │   └── index.tsx
│       │   │
│       │   └── terra/                      # 🪨 (future)
│       │       ├── api/
│       │       ├── components/
│       │       ├── pages/
│       │       └── index.tsx
│       │
│       └── settings/                       # Settings pages
│           ├── pages/
│           │   ├── Employees.tsx
│           │   ├── Profile.tsx
│           │   ├── ProjectSettings.tsx     # (needed)
│           │   └── About.tsx
│           └── index.tsx
│
└── tests/                                  # ── TESTS ──
    ├── backend/
    │   ├── arbor/
    │   │   ├── trees.test.ts
    │   │   ├── species.test.ts
    │   │   └── zones.test.ts
    │   ├── core/
    │   │   ├── auth.test.ts
    │   │   └── middleware.test.ts
    │   └── setup.ts                        # Test DB setup
    │
    ├── frontend/
    │   ├── arbor/
    │   │   ├── TreeCard.test.tsx
    │   │   └── Dashboard.test.tsx
    │   └── setup.ts                        # JSDOM setup
    │
    └── e2e/                                # End-to-end tests
        ├── login.spec.ts
        ├── tree-crud.spec.ts
        └── playwright.config.ts
```

---

## Key Design Decisions

### 1. Module Isolation
Each module has its own:
- `routes/` — Backend API handlers
- `schemas/` — Zod validation schemas
- `api/` — Frontend API client functions
- `components/` — Module-specific UI components
- `pages/` — Module-specific page components
- `index.ts` — Single entry point that exports the module's router

This means a contributor working on `flora/` never needs to touch `arbor/` files.

### 2. Shared Core
The `core/` directory (both backend and frontend) contains:
- Authentication logic
- Database client
- Shared middleware
- Reusable UI components (design system)
- Shared TypeScript types

### 3. Migration Files
All SQL migrations live in `docs/migrations/` with sequential numbering:
- `001_initial_schema.sql` — Base tables
- `002_multi_tenant.sql` — Projects + members
- Each new module adds its own migration file

### 4. Tests Mirror Source
The `tests/` directory mirrors the `src/` and `frontend/src/` structure:
- `tests/backend/arbor/trees.test.ts` tests `src/modules/arbor/routes/trees.ts`
- `tests/frontend/arbor/TreeCard.test.tsx` tests `frontend/src/modules/arbor/components/TreeCard.tsx`

---

## How to Add a New Module (Scaffold Template)

```bash
# 1. Create backend module structure
mkdir -p src/modules/{module_name}/{routes,schemas}

# 2. Create the module entry point
cat > src/modules/{module_name}/index.ts << 'EOF'
import { Router } from 'express'
// import routes here

const router = Router()
// router.use('/resource', resourceRoutes)

export default router
EOF

# 3. Register in app.ts
# Add: import moduleRoutes from './modules/{module_name}'
# Add: app.use('/api/{module_name}', moduleRoutes)

# 4. Create frontend module structure
mkdir -p frontend/src/modules/{module_name}/{api,components,pages}

# 5. Create the frontend module entry
cat > frontend/src/modules/{module_name}/index.tsx << 'EOF'
import { Route } from 'react-router-dom'

export const ModuleRoutes = () => (
  <>
    {/* Add routes here */}
  </>
)
EOF

# 6. Create migration file
touch docs/migrations/XXX_{module_name}_schema.sql

# 7. Create test directories
mkdir -p tests/backend/{module_name}
mkdir -p tests/frontend/{module_name}
```

---

## Migration Path (Current → Target)

The restructuring can happen incrementally:

| Step | What Moves | Risk | Effort |
|------|-----------|------|--------|
| 1 | Create `core/` from existing `lib/` + `middleware/` | Low | 1 day |
| 2 | Wrap existing routes into `modules/arbor/` | Low | 1 day |
| 3 | Move schemas into `modules/arbor/schemas/` | Low | 30 min |
| 4 | Create `frontend/src/core/` from shared components | Medium | 1 day |
| 5 | Move Arbor pages into `frontend/src/modules/arbor/` | Medium | 2 hours |
| 6 | Update imports throughout | Medium | 2 hours |
| 7 | Add `docs/`, `.github/`, root files | Low | 1 day |
| 8 | Verify everything builds and runs | — | 1 hour |

> [!TIP]
> **Do this restructuring BEFORE opening the repo for public contributions.** It's much easier to restructure with 1 developer than with 10.

---

*This structure is designed to scale from 1 module to 5, and from 1 contributor to 50.*
