# Sheria Check — Roadmap

## Phase 1: Core MVP  *(Current — Weeks 1–2)*

**Goal:** A working PWA that lets motorists search and browse offenses with accurate legal data.

### Deliverables
- [x] React + Vite + Tailwind PWA scaffold
- [x] Express + PostgreSQL backend scaffold
- [x] Search with fuzzy full-text matching
- [x] 6-category browsing flow
- [x] Offense detail page (fine range, citation, severity, course of action)
- [x] Anonymous incident report form
- [x] Legal disclaimer banner + page
- [x] Data freshness indicator
- [x] 12 seed offenses covering all categories and severity levels
- [x] Docker Compose for local development
- [x] Admin panel (basic dashboard + bulk upload API)
- [x] Python scraper skeleton for Traffic Act Cap 403
- [ ] Context files (ARCHITECTURE.md, ROADMAP.md, AGENTS.md, CONTRIBUTING.md)

### Acceptance Criteria
- Search returns relevant results within 500ms (local)
- All 6 categories display seeded offenses
- Offense detail shows exact legal citation and fine range
- Report form submits to database and returns confirmation
- PWA installs to home screen on Android Chrome
- TypeScript compiles with zero errors in strict mode

---

## Phase 2: Full Data & Accuracy  *(Weeks 3–4)*

**Goal:** Complete dataset of every penal offense in the Traffic Act, verified and accurate.

### Deliverables
- [ ] Run scraper against Kenya Law for full Cap 403 extraction
- [ ] Manual verification pass: cross-check every offense against printed Traffic Act
- [ ] Add all extracted offenses to database (target: 80–150 offenses)
- [ ] Write aliases for every offense (common Kenyan street names)
- [ ] Implement severity classification review (ensure correct)
- [ ] Add `citations` field for cross-references to subsidiary legislation
- [ ] Build course of action validation — ensure each one matches current legal procedure
- [ ] Release v0.1.0 tag

### Risks
- Scraper may miss offenses buried in subsections — manual oversight required
- Some penalty amounts may be outdated or ambiguous — legal consultation may be needed

---

## Phase 3: Production Hardening  *(Weeks 5–6)*

**Goal:** Platform is stable, fast, and safe for real users.

### Deliverables
- **Backend**
  - [ ] Rate limiting (express-rate-limit)
  - [ ] Response compression (compression)
  - [ ] Structured logging (pino)
  - [ ] Cursor-based pagination on search
  - [ ] Redis caching for search + category queries
  - [ ] Helmet.js security headers
  - [ ] API versioning (/api/v1/)
  - [ ] Graceful shutdown (SIGTERM handler)
  - [ ] Health check endpoint with DB + cache ping
- **Frontend**
  - [ ] WCAG 2.1 AA compliance audit (keyboard nav, ARIA, focus management)
  - [ ] Skeleton loading states replace spinners
  - [ ] Web Share API integration (WhatsApp, Twitter)
  - [ ] Illustrated empty/error states
  - [ ] Offline fallback page for disconnected state
  - [ ] Page transition loading bar
  - [ ] Skip-to-content link, focus trap in modals
  - [ ] Empathetic copy review — all error messages rewritten for clarity
- **Infrastructure**
  - [ ] GitHub Actions CI (lint, typecheck, build)
  - [ ] Docker health checks
  - [ ] Production .env.example
  - [ ] Sentry error monitoring setup
  - [ ] DigitalOcean App Platform deployment guide

### Acceptance Criteria
- Lighthouse score > 90 on mobile
- All flows keyboard-navigable
- Offline search works from service worker cache
- Rate limiting returns 429 for abusive traffic
- CI passes on every PR

---

## Phase 4: Reach & Scale  *(Weeks 7–10)*

**Goal:** Make Sheria Check accessible to every Kenyan motorist regardless of phone, language, or literacy level.

### Deliverables
- **Swahili translation**
  - [ ] All offense names, descriptions, and course of action translated
  - [ ] i18n framework (react-i18next)
  - [ ] Toggle between English and Swahili
- **USSD channel**
  - [ ] USSD gateway integration (e.g., Africa's Talking)
  - [ ] *384*xxx# lookup flow: code → offense → fine via SMS
  - [ ] No data required — works on any phone
- **Performance scaling**
  - [ ] CDN for static assets (DigitalOcean Spaces + CDN)
  - [ ] Read replicas for PostgreSQL (if needed)
  - [ ] Redis cluster for search cache (if needed)
- **Content expansion**
  - [ ] Add traffic court location finder
  - [ ] Add "nearest legal aid" contact list
  - [ ] Add IPOA contacts and reporting instructions
- **Community features**
  - [ ] Public anonymous incident heatmap (aggregated, no individual data)
  - [ ] "Rate this road" — corruption hotspot crowdsourcing

---

## Phase 5: Monetization & Sustainability  *(Weeks 11+)*

**Goal:** Sustainable revenue that does not compromise the free tier.

### Deliverables
- **Fleet / Pro tier** (KES 1,000/month)
  - Bulk offense lookup API (up to 10,000 lookups/month)
  - Fleet dashboard with analytics (most common offenses, trends)
  - Export to PDF/CSV
- **NGO / grant partnerships**
  - Anonymized corruption data for advocacy (IPOA, TI-Kenya)
  - Grant funding for USSD costs and server scaling
- **Optional donations**
  - M-Pesa Paybill for user donations
  - "Buy a motorist a lookup" campaign

### Non-goals (explicitly out of scope)
- Legal advice or representation — Sheria Check is informational only
- Payment processing for fines — that is the court's domain
- User accounts or profiles — privacy is core to the product
