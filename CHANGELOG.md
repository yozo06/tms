# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Docs**: Comprehensive long-term vision plan with use cases, personas, and module roadmaps in `docs/vision/`.
- **Docs**: Open-source infrastructure files (`LICENSE`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`).
- **Core**: Multi-tenant database migrations (`projects`, `project_members`).
- **Core**: ProjectSwitcher UI component for managing multiple farms under one account.

### Changed
- Refactored routes to use multi-tenant `project_id` scoping (WIP).

## [0.1.0] - 2026-03-?? (Current Beta)

### Added
- **Arbor**: Core tree lifecycle management (add, edit, delete trees).
- **Arbor**: Ability to log tree health observations and activity tasks.
- **Arbor**: Google Drive integration for seamless tree photo uploads.
- **Arbor**: Custom canvas map picker with X/Y coordinate placement.
- **Arbor**: Dedicated `PublicTree` page viewable via randomized access code.
- **Arbor**: Species dictionary management.
- **Arbor**: Land zones management.
- **Auth**: JWT-based authentication with `owner`, `employee`, and `volunteer` roles.
- **UI**: Farm owner dashboard with high-level statistics.
- **UI**: Field worker landing page with assigned tasks.
- **PWA**: Configured as a Progressive Web App (PWA) with install manifest.
