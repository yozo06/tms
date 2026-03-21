# 🤝 Open Source & Contribution Guide

> *How to set up WildArc for open-source development, attract contributors, and maintain quality.*

---

## Open-Source Readiness Checklist

### Repository Essentials

| File | Purpose | Status |
|------|---------|--------|
| `LICENSE` | MIT or AGPL-3.0 license | ❌ Needed |
| `README.md` | Project overview, quick start, screenshots | ✅ Exists (needs update) |
| `CONTRIBUTING.md` | How to contribute, code style, PR process | ❌ Needed |
| `CODE_OF_CONDUCT.md` | Community behavior standards (Contributor Covenant) | ❌ Needed |
| `CHANGELOG.md` | Version-by-version change history | ❌ Needed |
| `SECURITY.md` | How to report security vulnerabilities | ❌ Needed |
| `.github/ISSUE_TEMPLATE/` | Bug report + feature request templates | ❌ Needed |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR checklist template | ❌ Needed |
| `.github/workflows/ci.yml` | GitHub Actions CI pipeline | ❌ Needed |

---

## License Recommendation

> [!IMPORTANT]
> **Recommended: AGPL-3.0** (GNU Affero General Public License)
> 
> This ensures that anyone who deploys a modified WildArc as a service must share their changes back to the community. This protects the open-source nature while allowing free use.
> 
> Alternative: **MIT** if you prefer maximum permissiveness (anyone can use without sharing back).

---

## GitHub Issue Labels

Organize issues by **module**, **type**, and **difficulty** for easy contributor navigation:

### By Module
| Label | Color | Description |
|-------|-------|-------------|
| `module:core` | `#0052CC` | Shared infrastructure (auth, projects, deployment) |
| `module:arbor` | `#2EA44F` | Tree management module |
| `module:flora` | `#7DDA58` | Companion plants & guilds module |
| `module:terra` | `#A0522D` | Soil, water, & topography module |
| `module:myco` | `#FF6347` | Fungi & microbiology module |
| `module:synapse` | `#9B59B6` | Intelligence & analytics module |
| `module:docs` | `#0075CA` | Documentation improvements |

### By Type
| Label | Color | Description |
|-------|-------|-------------|
| `type:bug` | `#D73A4A` | Something isn't working |
| `type:feature` | `#A2EEEF` | New functionality |
| `type:enhancement` | `#7057FF` | Improvement to existing feature |
| `type:chore` | `#E4E669` | Maintenance, refactoring, CI/CD |
| `type:question` | `#D876E3` | Needs discussion or clarification |

### By Difficulty
| Label | Color | Description |
|-------|-------|-------------|
| `good-first-issue` | `#7057FF` | Simple task, great for newcomers |
| `help-wanted` | `#008672` | Needs community help |
| `advanced` | `#B60205` | Requires deep understanding of architecture |

---

## Contribution Workflow

### For First-Time Contributors

```
1. Fork the repository on GitHub
2. Clone your fork locally
   $ git clone https://github.com/<your-username>/wildarc.git
   $ cd wildarc

3. Set up the development environment
   $ cp .env.example .env      # Configure your Supabase keys
   $ npm install
   $ cd frontend && npm install && cd ..
   $ npm run dev

4. Create a feature branch
   $ git checkout -b feature/your-feature-name

5. Make your changes
   - Follow the code style guide (ESLint + Prettier)
   - Write/update tests if applicable
   - Update documentation if needed

6. Commit with conventional commit messages
   $ git commit -m "feat(arbor): add yield tracking to tree detail page"
   $ git commit -m "fix(core): handle expired tokens in auth middleware"
   $ git commit -m "docs: update setup instructions for Docker"

7. Push and create a Pull Request
   $ git push origin feature/your-feature-name
   → Open a PR against the `main` branch

8. Address code review feedback
   → Maintainers will review within 48 hours
```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, test, chore
Scope: core, arbor, flora, terra, myco, synapse, ci
```

Examples:
```
feat(arbor): add CSV export for tree list
fix(core): prevent duplicate project member entries
refactor(arbor): extract tree filter logic into utility
docs(flora): add guild designer wireframes
test(arbor): add integration tests for tree CRUD
chore(ci): add ESLint to GitHub Actions workflow
```

### Branch Naming Convention
```
feature/<module>-<short-description>    → feature/flora-guild-designer
fix/<module>-<short-description>        → fix/arbor-health-score-validation
docs/<description>                      → docs/api-documentation
chore/<description>                     → chore/ci-pipeline-setup
```

---

## CI/CD Pipeline Plan

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    # ESLint + Prettier check on all TypeScript files

  type-check:
    # tsc --noEmit for backend
    # tsc --noEmit for frontend

  test-backend:
    # Run backend unit + integration tests (Jest/Vitest)
    # Requires test Supabase instance or mock

  test-frontend:
    # Run frontend component/unit tests (Vitest)

  build:
    # npm run build (verify production build succeeds)
    # Depends on: lint, type-check, test-backend, test-frontend
```

### Planned Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| **Development** | `develop` | localhost:3000 | Local development |
| **Staging** | `staging` | staging.wildarc.app (TBD) | Pre-release testing |
| **Production** | `main` | wildarc.app (TBD) | Live application |

---

## Code Style Guide

### TypeScript
- **Strict mode** enabled in `tsconfig.json`
- Use `interface` for API shapes, `type` for unions/intersections
- Export Zod schemas alongside TypeScript types:
  ```typescript
  export const treeSchema = z.object({ ... })
  export type Tree = z.infer<typeof treeSchema>
  ```

### React Components
- **Functional components** with hooks (no class components)
- **One component per file** (except tiny helpers)
- Use **named exports** for components
- State management: Zustand stores in `store/` directory
- API calls: dedicated functions in `api/` directory

### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| React page | PascalCase.tsx | `TreeDetail.tsx` |
| React component | PascalCase.tsx | `TreeCard.tsx` |
| Route handler | camelCase.ts | `trees.ts` |
| Schema | camelCase.ts | `index.ts` (in schemas/) |
| Utility | camelCase.ts | `formatDate.ts` |
| Test | `*.test.ts` or `*.spec.ts` | `trees.test.ts` |

---

## Docker Development Setup (To Create)

For contributors who don't have Supabase credentials:

```dockerfile
# docker-compose.yml (proposed)
services:
  postgres:
    image: supabase/postgres:15
    ports: ["5432:5432"]
    environment:
      POSTGRES_PASSWORD: postgres
    volumes:
      - ./docs/migrations:/docker-entrypoint-initdb.d

  supabase-studio:
    image: supabase/studio
    ports: ["8080:3000"]

  app:
    build: .
    ports: ["3000:3000", "5173:5173"]
    depends_on: [postgres]
    volumes: [".:/app"]
    environment:
      SUPABASE_URL: http://postgres:5432
```

---

## Governance

### Roles
| Role | Permissions | Assigned To |
|------|-------------|-------------|
| **Creator / Maintainer** | Merge PRs, set roadmap, final decisions | Yogesh |
| **Core Contributor** | Review PRs, triage issues | Earned after 3+ merged PRs |
| **Contributor** | Open PRs, report issues | Anyone |

### Decision Making
- **Small changes** (bug fixes, docs): Maintainer approval
- **New features**: Discuss in issue first, get approval before building
- **Architecture changes**: RFC (Request for Comments) in `docs/rfcs/`
- **New module**: Full design doc reviewed by core contributors

---

## Good First Issues (Starter List)

When the repo goes public, these pre-created issues help onboard new contributors:

| # | Title | Module | Difficulty |
|---|-------|--------|------------|
| 1 | Add loading skeletons to TreeList page | Arbor | Easy |
| 2 | Improve mobile responsiveness of Dashboard | Arbor | Easy |
| 3 | Add input validation error messages to TreeAdd form | Arbor | Easy |
| 4 | Create `CONTRIBUTING.md` with development setup | Docs | Easy |
| 5 | Add dark mode toggle | Core | Medium |
| 6 | Implement CSV export for tree list | Arbor | Medium |
| 7 | Add pagination controls to TreeList | Arbor | Medium |
| 8 | Replace canvas map with Leaflet.js interactive map | Arbor | Hard |
| 9 | Create Flora module scaffold (empty routes + pages) | Flora | Hard |
| 10 | Add GitHub Actions CI pipeline | CI | Medium |

---

*A healthy open-source project is built on clear processes, not just good code.*
