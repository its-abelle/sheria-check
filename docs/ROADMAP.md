# Sheria Check — Roadmap

## Status Key
- ✓ = Done
- ▶ = In progress
- ○ = Not started

---

## Phase 1: Core MVP  *(Complete)*

**Goal:** Working PWA for searching and browsing traffic offenses.

### Deliverables
- [x] React + Vite + Tailwind PWA scaffold
- [x] Express + PostgreSQL backend scaffold
- [x] Search with fuzzy full-text matching
- [x] 6-category browsing flow
- [x] Offense detail page (fine range, citation, severity, course of action)
- [x] Anonymous incident report form
- [x] Legal disclaimer banner + page
- [x] Data freshness indicator
- [x] 12 seed offenses + 44 scraped offenses from Traffic Act
- [x] Docker Compose for local development
- [x] Admin panel (basic dashboard + bulk upload API)
- [x] Python scraper for Traffic Act Cap 403 (auto, HTML, PDF, cache)

---

## Phase 2: Full Data & Accuracy  *(Current — Priority)*

**Goal:** Every road-related fine and penalty in Kenya, verified and in one place.

### Track A — Traffic Act Depth  (44 → 100+ offenses)

The current scraper extracts 44 sections but misses key ones (42, 44, 46, etc.) due to PDF formatting quirks.

- [ ] **Fix section detection** — handle sub-sections like `44(1)`, `44(2)` and section headers that span multiple lines
- [ ] **Add subsection penalty parsing** — many sections have different fines for first vs subsequent conviction
- [ ] **Manual aliases for every offense**
  - Common Kenyan names: "drink driving" → DUI, "yellow line" → overtaking on yellow line
  - Street slang: "kitu kidogo" offenses, "cowboy" driving
  - Police terminology: "PB Form", "defect notification"
- [ ] **Verify all fine amounts** against printed Traffic Act
- [ ] **Add `citations` field** for cross-references to subsidiary legislation
- [ ] **Add demerit points** from Section 117A (points system for repeat offenders)
- [ ] **Release v0.1.0 tag**

**Target:** All penal sections of Cap 403 extracted, verified, and aliased.

### Track B — NTSA Regulations  (New)

NTSA does not publish a penalty schedule online, but penalties are defined in:
- **NTSA Act (No. 33 of 2012)** — NTSA enforcement powers, penalty for operating without PSV license
- **Traffic (School Zones) Regulations** — school zone speeding, dropping off violations
- **Traffic (Speed Limiter) Regulations, 2022** — speed limiter tampering, non-installation
- **Traffic (Inspection) Rules** — vehicle inspection certificates, fake inspection stickers
- **PSV (Public Service Vehicle) Regulations** — overloading, fare violations, conductor offenses, route violations

- [ ] **Build unified subsidiary legislation scraper** — `scripts/scrape_subsidiary.py`
  - Fetches from Kenya Law subsidiary legislation pages
  - Parses Legal Notices, Rules, and Regulations
  - Same output format as main scraper
- [ ] **Scrape NTSA Act penalties** — operating without license, unroadworthy vehicles
- [ ] **Scrape PSV Regulations** — 14-seater matatu offenses, overloading, touts
- [ ] **Scrape Speed Limiter Regulations** — tampering, non-compliance
- [ ] **Scrape Inspection Rules** — fake stickers, expired inspection
- [ ] **Scrape School Zones Regulations** — school zone speeding, signage violations
- [ ] **Merge all into unified dataset** — `scripts/merge_data.py`

**Target:** 50+ additional offenses from subsidiary legislation.

### Track C — Kenya Roads Act / Road Authority Penalties  (New)

KURA, KENHA, and KeRRA penalties are defined in:
- **Kenya Roads Act (No. 2 of 2007)** — establishes the three authorities
- **KENHA Toll Regulations** — expressway toll violations, overweight vehicles
- **Weighbridge Regulations** — axle load limits, overweight penalties
- **Road Reserve Offenses** — encroachment, damage to roads

- [ ] **Scrape Kenya Roads Act** — road authority offenses, penalties
- [ ] **Scrape Weighbridge penalties** — axle load excess, heavy vehicle overweight
- [ ] **Scrape Toll violation penalties** — Nairobi Expressway, non-payment
- [ ] **Scrape Road Reserve offenses** — encroachment, drainage damage

**Target:** 25+ additional offenses from road authority legislation.

### Track D — County & By-Laws  (Future)

- [ ] **Nairobi City County Traffic By-Laws** — county parking fines, pavement parking
- [ ] **Mombasa County Traffic By-Laws** — port-related traffic offenses
- [ ] **Kisumu County By-Laws** — county-specific road offenses
- [ ] **County parking fee schedules** — verified against county websites

---

## Phase 3: Production Hardening  *(Complete)*

**Goal:** Platform is stable, fast, and safe for real users.

### Delivered
- [x] Rate limiting (express-rate-limit)
- [x] Response compression (compression)
- [x] Structured logging (pino)
- [x] Cursor-based pagination on search
- [x] Helmet.js security headers
- [x] Graceful shutdown (SIGTERM handler)
- [x] Health check endpoint with DB ping
- [x] API versioning (/api/v1/)
- [x] WCAG 2.1 AA compliant keyboard navigation
- [x] Skeleton loading states
- [x] Web Share API integration (WhatsApp, Twitter)
- [x] Illustrated empty/error states
- [x] Offline notice banner
- [x] Page transition loading bar
- [x] Skip-to-content link, focus traps
- [x] Empathetic copy throughout
- [x] GitHub Actions CI
- [x] Docker health checks
- [x] .env.example files
- [x] Data scraping scripts with retry logic + verification

### Pending
- [ ] Redis caching for search + category queries
- [ ] Sentry error monitoring setup
- [ ] DigitalOcean App Platform deployment guide
- [ ] Lighthouse audit and score optimization

---

## Phase 4: Reach & Scale  *(Weeks 7–10)*

**Goal:** Every Kenyan motorist can use Sheria Check regardless of phone, language, or literacy.

### Deliverables
- **Swahili translation**
  - [ ] All offense names, descriptions, and course of action translated
  - [ ] i18n framework (react-i18next)
  - [ ] Language toggle
- **USSD channel**
  - [ ] USSD gateway integration (Africa's Talking)
  - [ ] *384*xxx# lookup flow: code → offense → fine via SMS
  - [ ] Works on any phone, no data required
- **Performance scaling**
  - [ ] CDN for static assets (DigitalOcean Spaces + CDN)
  - [ ] Read replicas for PostgreSQL (if needed)
  - [ ] Redis cluster for search cache
- **Community features**
  - [ ] Public anonymous incident heatmap (aggregated)
  - [ ] "Rate this road" — corruption hotspot crowdsourcing
  - [ ] Traffic court location finder
  - [ ] "Nearest legal aid" contact list
  - [ ] IPOA contacts and reporting instructions

---

## Phase 5: Monetization & Sustainability  *(Weeks 11+)*

**Goal:** Sustainable revenue that does not compromise the free tier.

### Deliverables
- **Fleet / Pro tier** (KES 1,000/month)
  - Bulk offense lookup API (up to 10,000 lookups/month)
  - Fleet dashboard with analytics
  - Export to PDF/CSV
- **NGO / grant partnerships**
  - Anonymized corruption data for advocacy
  - Grant funding for USSD costs and server scaling
- **Optional donations**
  - M-Pesa Paybill for user donations

---

## Priority Cheat Sheet (What to Start Tomorrow)

```
HIGH:   Track A (fix scraper sections 42, 44, 46)
HIGH:   Track B (subsidiary legislation scraper for NTSA/PSV)
MEDIUM: Track C (Kenya Roads Act penalties)
MEDIUM: Manual aliases for all 44 existing offenses
LOW:    Track D (county by-laws)
```

### How to Work

1. One batch of offenses at a time — scrape, verify, import
2. Run `scripts/verify_data.py` after every scrape
3. Import with `python scripts/import_to_api.py --api http://localhost:4000/api/v1`
4. Keep adding aliases — they power the fuzzy search
