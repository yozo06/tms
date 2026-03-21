# 🔭 Gaps & Opportunities

> *Features and capabilities you may not have considered yet — researched from FarmOS, LiteFarm, iNaturalist, TreeNavigator, and modern agroforestry platforms.*

---

## Overview

After analyzing the WildArc codebase and researching existing platforms in the permaculture/agroforestry space, here are **critical gaps**, **missing features**, and **opportunities** organized by priority and effort.

---

## 🔴 Critical Gaps (Must Fix for Open-Source Launch)

### 1. No Automated Testing
**Current state:** Zero tests (no unit, integration, or E2E tests)  
**Risk:** Contributors can break features without knowing. You can't confidently merge PRs.  
**Fix:** Add Vitest for frontend, Jest+Supertest for backend, Playwright for E2E.  
**Effort:** Medium (2-3 days for initial coverage)

### 2. No API Documentation
**Current state:** APIs are only documented in source code  
**Risk:** Front-end developers and third-party integrators can't discover endpoints  
**Fix:** Generate OpenAPI 3.0 spec; serve via Swagger UI at `/api/docs`  
**Effort:** Medium (1-2 days)

### 3. No Input Sanitization Beyond Zod
**Current state:** Zod validates types/shapes, but no XSS or SQL injection protection  
**Risk:** Security vulnerability with user-submitted HTML/scripts  
**Fix:** Add `express-validator` or a sanitization layer; sanitize all text inputs  
**Effort:** Low (1 day)

### 4. No Rate Limiting
**Current state:** No rate limiting on any endpoint  
**Risk:** API abuse, brute-force login attacks  
**Fix:** Add `express-rate-limit` middleware  
**Effort:** Low (2 hours)

### 5. No Database Migration Tool
**Current state:** Raw SQL files run manually in Supabase SQL Editor  
**Risk:** Migration order confusion, no rollback, no version tracking  
**Fix:** Adopt a migration tool like `dbmate`, `knex`, or Supabase CLI migrations  
**Effort:** Medium (1 day to set up + retroactively create migration files)

### 6. Hardcoded Configuration
**Current state:** JWT expiry, upload limits, and pagination defaults are hardcoded  
**Risk:** Difficult to configure per deployment  
**Fix:** Move to a `config.ts` module that reads from env vars with sensible defaults  
**Effort:** Low (2 hours)

---

## 🟡 Important Features Missing

### 7. Yield / Harvest Tracking
**What:** Log fruit/timber/product yields per tree per season with quantities, quality grades, and monetary value  
**Why:** This is the #1 most-requested feature on FarmOS and LiteFarm. Without it, WildArc can't prove economic viability of food forests  
**Platforms with this:** FarmOS, LiteFarm, TreeNavigator  
**DB Design:**
```sql
yields (
  id serial PRIMARY KEY,
  tree_id integer REFERENCES trees(id),
  product_name text NOT NULL,         -- "Mango", "Pepper", "Compost"
  quantity numeric NOT NULL,
  unit text NOT NULL,                  -- "kg", "liters", "bundles"
  quality_grade text,                  -- "A", "B", "C" or descriptive
  market_value numeric,               -- Optional monetary value
  harvested_by integer REFERENCES users(id),
  harvested_at timestamptz DEFAULT now(),
  season text,                         -- "monsoon-2026", "winter-2026"
  notes text
)
```

### 8. GPS Coordinates (Real Geolocation)
**What:** Replace canvas-based X/Y coordinates with real latitude/longitude  
**Why:** Enables integration with satellite imagery, weather APIs, and real mapping tools. Makes public tree profiles embeddable on Google Maps  
**Current limitation:** MapCanvas uses arbitrary pixel coordinates  
**Fix:** Add `lat` and `lng` columns to `trees` table; use browser Geolocation API  
**Effort:** Medium (2 days)

### 9. Notification / Alert System
**What:** Push notifications or in-app alerts when:
- A tree's health drops below a threshold
- A task is overdue
- A new team member joins
- Weather conditions require attention  
**Why:** Without notifications, users must manually check the app daily  
**Platforms with this:** LiteFarm, FarmOS  
**Options:** Web Push API (PWA-native), email notifications, in-app notification center  
**Effort:** Medium-High (3-5 days)

### 10. Proper Offline Sync
**What:** True offline data entry with queue-and-sync when back online  
**Current state:** PWA shell caches assets, but API requests fail offline  
**Why:** Field workers are often in areas with no signal  
**Approach:** IndexedDB for local storage → background sync → conflict resolution  
**Platforms with this:** FarmOS (offline forms), CyberTracker  
**Effort:** High (5-7 days)

### 11. Data Export / Import
**What:** Export tree data, health logs, yields as CSV/JSON; bulk import from spreadsheet  
**Why:** Researchers need data portability; large operations need bulk data entry  
**Platforms with this:** FarmOS, LiteFarm, OpenForis  
**Effort:** Medium (2-3 days)

### 12. Multi-Language Support (i18n)
**What:** UI available in Kannada, Hindi, Tamil, and other local languages  
**Why:** Field workers in Coorg may not be comfortable with English  
**Approach:** `react-i18next` with JSON translation files  
**Platforms with this:** LiteFarm (10+ languages)  
**Effort:** Medium (3-4 days for infrastructure + 1-2 days per language)

---

## 🟢 Valuable Opportunities (Medium-Term)

### 13. Weather Integration
**What:** Auto-pull local weather data (rainfall, temperature, humidity) from free APIs (Open-Meteo, OpenWeatherMap)  
**Why:** Correlate tree health with weather events; alert before storms/frost  
**Approach:** Background cron job or daily API call; store in `weather_logs` table  
**Effort:** Low-Medium (1-2 days)

### 14. QR Code Generator & Print
**What:** Auto-generate QR codes for each tree that link to `/tree/:code`. Bulk-print as labels  
**Why:** Currently QR codes must be generated manually. Label printing would let field workers tag trees physically  
**Approach:** `qrcode` npm package + PDF generation for print sheets  
**Effort:** Low (1 day)

### 15. Photo Timeline / Visual Growth Tracking
**What:** Display tree photos chronologically to visually show growth over months/years  
**Why:** One of the most powerful ways to demonstrate food forest transformation  
**UI:** Horizontal scrollable timeline of photos per tree  
**Effort:** Low (1 day for UI, photos already stored)

### 16. Carbon Sequestration Calculator
**What:** Estimate CO₂ captured per tree based on species, age, diameter, and height  
**Why:** Carbon credits are increasingly valuable; data-backed estimates add credibility  
**Approach:** Use established allometric equations (e.g., Chave et al. 2014 for tropical trees)  
**Formula example:** `Biomass = 0.0673 × (density × DBH² × height)^0.976`  
**Effort:** Medium (2 days for calculator + UI display)

### 17. Biodiversity Index
**What:** Calculate Shannon diversity index (H') or Simpson's index per zone  
**Why:** Quantitative measure of ecosystem health; valuable for research and reporting  
**Formula:** `H' = -Σ(pi × ln(pi))` where pi = proportion of species i  
**Effort:** Low (1 day — pure calculation from existing species data)

### 18. Species Recommendation Engine
**What:** Given a tree species, soil type, and climate zone, suggest the best companion plants  
**Why:** New farmers don't know which plants work together  
**Approach (Phase 1):** Rule-based lookup from curated Guild templates  
**Approach (Phase 2):** ML-based recommendations from aggregated companion success scores  
**Effort:** Phase 1: Medium (3 days), Phase 2: High (research project)

---

## 🔵 Forward-Looking Opportunities (Long-Term)

### 19. IoT Sensor Integration
**What:** Accept data from soil moisture sensors, temperature probes, rain gauges  
**Why:** Automated data collection reduces manual logging effort  
**Approach:** MQTT broker → webhook → database ingestion  
**Platforms with this:** Tania (IoT farm platform), FarmOS  
**Effort:** High (requires hardware + software + protocol design)

### 20. Satellite / Drone Imagery
**What:** Overlay satellite imagery (Sentinel-2 free, Google Earth Engine) or drone photos on the map  
**Why:** NDVI (vegetation index) analysis can quantify canopy cover and track greening over years  
**Approach:** Leaflet + WMS tile layers from Sentinel Hub  
**Effort:** High (requires GIS expertise)

### 21. Community Marketplace
**What:** Allow WildArc users to list and exchange seeds, saplings, mushroom spawn, and produce  
**Why:** Permaculture communities actively trade genetic material  
**Risk:** Adds complexity; may be better as a separate service  
**Effort:** High

### 22. Academic Data API
**What:** Standardized REST API following Darwin Core or DwC-A format for biodiversity data  
**Why:** Enables data sharing with GBIF (Global Biodiversity Information Facility) and academic databases  
**Platforms doing this:** iNaturalist → GBIF pipeline  
**Effort:** Medium (API mapping layer)

### 23. Time-Lapse Visualization
**What:** Animated visualization showing how the food forest has grown from barren land to dense canopy  
**Why:** Extremely powerful for storytelling, fundraising, and education  
**Approach:** Combine satellite imagery snapshots or drone photos over time  
**Effort:** High (requires consistent satellite/drone data capture)

### 24. Gamification & Achievements
**What:** Badges, streaks, and milestones to encourage consistent data logging  
**Examples:**
- "🌱 First Tree Planted" — Log first tree
- "📊 Data Champion" — 30-day logging streak
- "🏆 Guild Master" — Create 5 successful guild templates
- "🌍 Carbon Hero" — 1 ton CO₂ sequestered  
**Why:** Increases volunteer engagement; similar to iNaturalist's observer rankings  
**Effort:** Medium (2-3 days for infrastructure + ongoing badge design)

---

## Gap Priority Matrix

| # | Gap/Feature | Priority | Effort | Module | Phase |
|---|-------------|----------|--------|--------|-------|
| 1 | Automated Testing | 🔴 Critical | Medium | Core | Phase 1 |
| 2 | API Documentation | 🔴 Critical | Medium | Core | Phase 1 |
| 3 | Input Sanitization | 🔴 Critical | Low | Core | Phase 1 |
| 4 | Rate Limiting | 🔴 Critical | Low | Core | Phase 1 |
| 5 | Migration Tool | 🔴 Critical | Medium | Core | Phase 1 |
| 6 | Config Module | 🔴 Critical | Low | Core | Phase 1 |
| 7 | Yield Tracking | 🟡 Important | Medium | Arbor | Phase 1 |
| 8 | GPS Coordinates | 🟡 Important | Medium | Arbor | Phase 1 |
| 9 | Notifications | 🟡 Important | High | Core | Phase 1-2 |
| 10 | Offline Sync | 🟡 Important | High | Core | Phase 2 |
| 11 | Data Export/Import | 🟡 Important | Medium | Core | Phase 1 |
| 12 | Multi-Language | 🟡 Important | Medium | Core | Phase 2 |
| 13 | Weather Integration | 🟢 Valuable | Low | Terra | Phase 2 |
| 14 | QR Generator | 🟢 Valuable | Low | Arbor | Phase 1 |
| 15 | Photo Timeline | 🟢 Valuable | Low | Arbor | Phase 1 |
| 16 | Carbon Calculator | 🟢 Valuable | Medium | Synapse | Phase 3 |
| 17 | Biodiversity Index | 🟢 Valuable | Low | Synapse | Phase 3 |
| 18 | Recommendation Engine | 🟢 Valuable | High | Synapse | Phase 3 |
| 19 | IoT Sensors | 🔵 Future | High | Terra | Phase 4 |
| 20 | Satellite Imagery | 🔵 Future | High | Terra | Phase 4 |
| 21 | Marketplace | 🔵 Future | High | Community | Phase 4 |
| 22 | Academic Data API | 🔵 Future | Medium | Synapse | Phase 4 |
| 23 | Time-Lapse | 🔵 Future | High | Synapse | Phase 4 |
| 24 | Gamification | 🔵 Future | Medium | Core | Phase 3 |

---

## Comparison with Existing Platforms

| Feature | WildArc | FarmOS | LiteFarm | iNaturalist | TreeNavigator |
|---------|:-------:|:------:|:--------:|:-----------:|:-------------:|
| Tree lifecycle management | ✅ | ❌ | ❌ | ❌ | ✅ |
| Companion planting / Guilds | 🔜 | ❌ | ❌ | ❌ | ❌ |
| Soil monitoring | 📋 | ✅ | ✅ | ❌ | ❌ |
| Yield tracking | ❌ | ✅ | ✅ | ❌ | ✅ |
| GPS mapping | ❌ | ✅ | ✅ | ✅ | ✅ |
| Public species profiles | ✅ | ❌ | ❌ | ✅ | ❌ |
| Worker task management | ✅ | ❌ | ✅ | ❌ | ❌ |
| Photo management | ✅ | ✅ | ❌ | ✅ | ❌ |
| Offline support | 🔄 | ✅ | ❌ | ✅ | ❌ |
| Multi-tenant / projects | 🔄 | ❌ | ❌ | ✅ | ❌ |
| Citizen science / community | 🔜 | ❌ | ❌ | ✅ | ❌ |
| Open source | 🔜 | ✅ | ✅ | ✅ | ✅ |
| Self-hostable | ✅ | ✅ | ✅ | ❌ | ❌ |

> [!TIP]
> **WildArc's unique differentiation** lies in the **Guild-based companion planting intelligence** and the **modular ecosystem approach** (Arbor + Flora + Terra + Myco). No other platform combines tree management with structured companion planting data at this level.

---

*These gaps represent opportunities. Each one is a potential GitHub issue, a potential community contribution, and a step toward making WildArc the definitive platform for regenerative land management.*
