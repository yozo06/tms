---
name: tms-conventions
description: Development conventions and patterns for tms. TypeScript Express project with conventional commits.
---

# Tms Conventions

> Generated from [yozo06/tms](https://github.com/yozo06/tms) on 2026-03-23

## Overview

This skill teaches Claude the development patterns and conventions used in tms.

## Tech Stack

- **Primary Language**: TypeScript
- **Framework**: Express
- **Architecture**: feature-based module organization
- **Test Location**: colocated
- **Test Framework**: vitest

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 8 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `fix`
- `docs`
- `chore`
- `test`

### Message Guidelines

- Average message length: ~64 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat(core): add rate limiting middleware (C-03)
```

*Commit message example*

```text
docs(ops): resolve 2 NEEDS_HUMAN items — uncommitted files committed, GitHub Actions confirmed
```

*Commit message example*

```text
chore: clean up migration artifacts + add website concepts + watchdog logs
```

*Commit message example*

```text
fix(frontend): migrate all source files to modular architecture, fix 71 TS errors to 0
```

*Commit message example*

```text
test: setup automated testing frameworks for frontend and backend
```

*Commit message example*

```text
feat(web): add additional Coorg forest website concepts (h, i)
```

*Commit message example*

```text
feat(ops): PR-based workflow + GitHub Actions CI pipeline
```

*Commit message example*

```text
chore(ops): set up 4-agent automation system with resilience + Phase 1 sprint plan
```

## Architecture

### Project Structure: Single Package

This project uses **feature-based** module organization.

### Source Layout

```
src/
├── core/
├── modules/
├── scripts/
```

### Entry Points

- `src/app.ts`

### Configuration Files

- `.github/workflows/ci.yml`
- `frontend/package.json`
- `frontend/tailwind.config.ts`
- `frontend/tsconfig.json`
- `frontend/vite.config.ts`
- `package.json`
- `tsconfig.json`
- `vercel.json`
- `vitest.config.ts`

### Guidelines

- Group related code by feature/domain
- Each feature folder should be self-contained
- Shared utilities go in a common/shared folder

## Code Style

### Language: TypeScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | PascalCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Relative Imports

### Export Style: Mixed Style


*Preferred import style*

```typescript
// Use relative imports
import { Button } from '../components/Button'
import { useAuth } from './hooks/useAuth'
```

## Testing

### Test Framework: vitest

### File Pattern: `*.test.ts`

### Test Types

- **Unit tests**: Test individual functions and components in isolation

### Mocking: vi.mock


*Test file structure*

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Error Handling

### Error Handling Style: Try-Catch Blocks


*Standard error handling pattern*

```typescript
try {
  const result = await riskyOperation()
  return result
} catch (error) {
  console.error('Operation failed:', error)
  throw new Error('User-friendly message')
}
```

## Common Workflows

These workflows were detected from analyzing commit patterns.

### Database Migration

Database schema changes with migration files

**Frequency**: ~9 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `**/schema.*`
- `migrations/*`

**Example commit sequence**:
```
Initial commit of complete Tree Management System
Add README.md
fix(frontend): add vite client types for import.meta.env
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~16 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `frontend/src/*`
- `frontend/src/pages/*`
- `frontend/src/store/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
Add README.md
fix(frontend): add vite client types for import.meta.env
fix(backend): relax CORS for unified production deployment
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Keep feature code co-located in feature folders
- Write tests using vitest
- Follow *.test.ts naming pattern
- Use PascalCase for file names
- Prefer mixed exports

### Don't

- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
