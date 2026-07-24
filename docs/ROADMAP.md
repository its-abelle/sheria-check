# Sheria Check — Milestones & Checklist

Status key: **✓** Done &nbsp;&nbsp; **◐** Partial &nbsp;&nbsp; **○** Not started

---

## 1. Backend — Express API (`server/`)

### 1.1 Core API Endpoints

| ✓ | `GET /api/v1/offenses/search?q=&cursor=&limit=` — full-text search with cursor pagination |
| ✓ | `GET /api/v1/offenses/categories` — category list with counts |
| ✓ | `GET /api/v1/offenses?category=<slug>` — browse by category |
| ✓ | `GET /api/v1/offenses/:id` — offense detail |
| ✓ | `POST /api/v1/reports` — anonymous incident report (Zod validated) |
| ✓ | `GET /api/v1/status` — data freshness (version, coverage, last-updated, count) |
| ✓ | **Wire per-route rate limiters** — `searchLimiter` (100/min) on search, `reportLimiter` (10/min) on reports |
| ○ | **Input sanitization middleware** — strip HTML, trim strings, normalize whitespace before controllers |
| ◐ | **Response envelope consistency** — `/status` standardized to `{ data }`; health check intentionally flat |
| ○ | **Sub-category filtering** — e.g., `?category=license-documents&severity=serious` |
| ○ | **Full-text search with Swahili** — add Swahili stop-words dictionary, Swahili tsvector config |

### 1.2 Admin API

| ✓ | `POST /api/v1/admin/offenses` — create single offense (Bearer auth) |
| ✓ | `POST /api/v1/admin/offenses/bulk` — bulk upload (Bearer auth) |
| ✓ | `DELETE /api/v1/admin/offenses/:id` — delete offense (Bearer auth) |
| ✓ | `GET /admin` — basic dashboard page (offense count, version, last-updated) |
| ◐ | **Bearer token** is plain env var comparison — acceptable for single-admin; upgrade to proper token hash for multi-user |
| ○ | `GET /api/v1/admin/offenses` — list all offenses with pagination (for admin review) |
| ○ | `PUT /api/v1/admin/offenses/:id` — update single offense |
| ○ | `GET /api/v1/admin/reports` — list submitted reports |
| ○ | **Admin dashboard enhancements** — searchable offense table, edit-in-place, re-seed button |

### 1.3 Data Layer

| ✓ | PostgreSQL connection pool (`pg`) with configurable pool size |
| ✓ | Schema auto-creation on startup (`initDb()`) |
| ✓ | `npm run migrate` — standalone migration script |
| ✓ | `npm run seed` — seed script with upsert (INSERT ON CONFLICT DO UPDATE) |
| ✓ | Indexes on `category` and `severity` |
| ✓ | **Seed script reads unified JSON** — pulls 61 offenses from `scripts/seed_data_unified.json` |
| ○ | **Database backup strategy** — pg_dump cron, restore procedure documented |
| ○ | **Migration versioning** — track applied migrations in a `_migrations` table instead of idempotent re-run |
| ○ | **Connection retry on startup** — if DB is slow to start (Docker Compose race), retry with backoff |

### 1.4 Security & Infrastructure

| ✓ | Helmet.js security headers (XSS, content-type sniffing, referrer policy) |
| ✓ | Rate limiting (express-rate-limit) — global 200 req/min |
| ✓ | CORS configurable via `CORS_ORIGIN` env var |
| ✓ | Response compression (gzip/deflate) |
| ✓ | Request body size limit (10 MB JSON) |
| ✓ | SQL injection prevention — all queries use parameterized `$1, $2` |
| ✓ | No authentication for motorist-facing endpoints |
| ○ | **CSP (Content Security Policy)** — Helmet's CSP defaults are permissive; tighten for production |
| ○ | **CSRF protection** — currently none (acceptable for read-heavy API, but reports endpoint could be abused) |
| ○ | **Request timeout** — no global timeout on requests; long-running queries hold connections |

### 1.5 Observability

| ✓ | Structured JSON logging (pino + pino-http) |
| ✓ | Configurable log level (`LOG_LEVEL` env var) |
| ✓ | Authorization header redaction in logs |
| ✓ | Health check endpoint (`GET /api/v1/health`) with DB ping |
| ✓ | Graceful shutdown (SIGTERM / SIGINT handler with 10s forced exit) |
| ○ | **Sentry error monitoring** — not set up; unhandled errors only go to console |
| ✓ | **Request ID tracing** — `x-request-id` header on all responses, available in `req.requestId` |
| ○ | **Performance metrics** — no response time histograms, no DB query latency tracking |
| ○ | **Uptime monitoring** — no external health-check ping (e.g., UptimeRobot, BetterStack) |

### 1.6 Testing (server)

| ○ | **Unit tests for controllers** — search, category, report, status logic |
| ○ | **API integration tests** — Supertest against test DB, verify response shapes and status codes |
| ○ | **Admin endpoint tests** — auth rejection, bulk upload validation |
| ○ | **Zod schema tests** — edge cases for report payload, offense schema |
| ○ | **Database query tests** — full-text search accuracy, pagination edge cases |
| ○ | **Rate limiter tests** — verify 429 after exceeding limits |

---

## 2. Frontend — Expo Mobile App (`client/`)

> **Migration note:** The React PWA was replaced by an Expo/React Native mobile app on the `feat/expo-migration` branch. PWA-specific items (service worker, offline caching, Web Share API) are archived below and no longer applicable. The Expo app uses offline-first architecture (bundled offenses snapshot + fuse.js in-memory search).

### 2.1 Routing & Pages

| ✓ | `/` — Home page with search bar + category cards |
| ✓ | `/category/:categoryId` — browse offenses by category |
| ✓ | `/offense/:offenseId` — offense detail (fine range, citation, severity, course of action) |
| ✓ | `/disclaimer` — legal disclaimer page |
| ✓ | `*` — 404 Not Found page |
| ✓ | `/insights` — incident insights (anonymized aggregate stats) |

### 2.2 Components

| ✓ | `SearchBar` — text input with search icon (ported to RN) |
| ✓ | `CategoryCard` — icon + name + description + count (ported) |
| ✓ | `OffenseCard` — name, fine range, severity badge (ported) |
| ✓ | `ReportModal` — anonymous incident report form (ported to RN Modal) |
| ✓ | `LoadingSkeleton` / `LoadingSpinner` — skeleton cards, spinner (ported) |
| ✓ | `EmptyState` — illustrated empty results (ported) |
| ✓ | `DisclaimerBanner` — persistent warning (ported) |
| ✓ | `BalanceScale` — scales of justice (ported, lucide-react-native) |
| ✓ | `ErrorBoundary` — class component wrapping routes (ported) |
| ✓ | `Toast` — notification system (ported, Animated + context) |

### 2.3 Hooks & Services

| ✓ | `useSearch` — local fuse.js search, debounced input (ported) |
| ✓ | `useOffenses` — fetch by category, fetch by ID via repository (ported) |
| ✓ | `useShare` — React Native Share API (ported) |
| ✓ | `api.ts` — typed API client with error handling (ported, EXPO_PUBLIC_API_URL) |
| ✓ | `OffenseRepository` — offline-first data layer (NEW: bundled snapshot + AsyncStorage + fuse.js) |
| ✓ | `offlineDb.ts` — IndexedDB (archived, replaced by OffenseRepository) |

### 2.4 PWA & Offline (archived — replaced by Expo app)

| ✓ | Service worker via `vite-plugin-pwa` (autoUpdate) |
| ✓ | Web manifest (name, icons, theme color, standalone display) |
| ✓ | PWA icons (192px, 512px) |
| ✓ | Offline notice banner when `navigator.onLine` is false |
| ✓ | **Offline caching** — IndexedDB cache of offenses populated on search and category browse |
| ✓ | **Offline search** — search works offline via IndexedDB, API failures fall back to cache |
| ○ | **Install prompt** — no custom "Add to Home Screen" prompt |
| ○ | **Background sync** — reports submitted offline are not queued for later sync |

### 2.5 Styling & UX

| ✓ | Tailwind CSS (NativeWind v4) utility classes only |
| ✓ | `cn()` conditional class utility (clsx wrapper) |
| ✓ | Custom color palette — `primary-*` (brown `#6B3A2A`) with warm earth tones |
| ✓ | `BalanceScale` — scales of justice (ported, lucide-react-native) |
| ✓ | Responsive design (Tailwind breakpoints) |
| ✓ | WCAG 2.1 AA — keyboard navigation, focus traps |
| ✓ | Empathetic copy throughout |
| ✓ | **Loading state for ReportModal submit** — spinner wired into confirm button |
| ◐ | **Empty states** — no category-specific empty art |
| ○ | **Dark mode** — not implemented |
| ○ | **Reduced motion** — no `AccessibilityInfo` reduced-motion support yet |

### 2.6 Testing (client)

| ○ | **Component unit tests** — jest-expo: SearchBar, OffenseCard, CategoryCard rendering |
| ○ | **Page integration tests** — Home renders categories, search returns results |
| ○ | **Hook tests** — useSearch debounce, useShare fallback |
| ○ | **API client tests** — error handling, response parsing |
| ○ | **Offline tests** — OffenseRepository bundled fallback, fuse.js ranking |

### 2.7 Performance & Optimization

| ○ | **Expo build audit** — verify Android APK/IPA sizes |
| ○ | **Bundle size analysis** — check offense snapshot impact on binary |
| ○ | **Code splitting** — not applicable (Expo Router handles screen lazy loading) |
| ○ | **Font loading** — using local variable fonts (Fraunces, Source Sans 3) via expo-font |

### 2.8 Internationalization

| ○ | **i18n framework** — not installed |
| ○ | **Swahili translations** — all offense names, descriptions, course of action |
| ○ | **Language toggle** — no UI for switching languages |

---

## 3. Data Pipeline (`scripts/`)

### 3.1 Traffic Act Cap 403

| ✓ | `scrape_traffic_act.py` — multi-source scraper (HTML, PDF, cached JSON) |
| ✓ | Section text parsing with fine extraction |
| ✓ | Category classification + severity assignment |
| ✓ | Local PDF fallback when online sources are blocked |
| ✓ | Caching layer to avoid re-downloading |
| ✓ | Output in API-compatible JSON schema |
| ◐ | **Coverage: 61 offenses extracted** — target is 100+ (missing sections 42, 44 sub-sections, 46 variations) |
| ○ | **Sub-section parsing** — `44(1)`, `44(2)` with different penalties for first vs subsequent conviction |
| ○ | **Demerit points** (Section 117A) — not extracted |
| ○ | **Act cross-references** — citations linking to subsidiary legislation not parsed |

### 3.2 Subsidiary Legislation

| ✓ | `scrape_subsidiary.py` — scraper for subsidiary legislation |
| ✓ | `seed_data_subsidiary.json` — output dataset |
| ◐ | **Content coverage unknown** — need to verify which regulations are included |
| ○ | **NTSA Act (No. 33 of 2012)** — enforcement powers, PSV license penalties |
| ○ | **Traffic (Speed Limiter) Regulations 2022** — tampering, non-installation |
| ○ | **Traffic (Inspection) Rules** — inspection certificates, fake stickers |
| ○ | **PSV (Public Service Vehicle) Regulations** — overloading, fare violations, conductor offenses |
| ○ | **Traffic (School Zones) Regulations** — school zone speeding, signage |

### 3.3 Kenya Roads Act & Road Authorities

| ○ | **Kenya Roads Act (No. 2 of 2007)** — KURA/KENHA/KeRRA offenses |
| ○ | **Weighbridge Regulations** — axle load limits, overweight penalties |
| ○ | **Toll Regulations** — Nairobi Expressway violations |
| ○ | **Road Reserve offenses** — encroachment, drainage damage |

### 3.4 County By-Laws

| ○ | **Nairobi City County Traffic By-Laws** |
| ○ | **Mombasa County Traffic By-Laws** |
| ○ | **Kisumu County By-Laws** |

### 3.5 Data Pipeline Tooling

| ✓ | `verify_data.py` — validates JSON against API schema |
| ✓ | `merge_data.py` — merges multiple source JSONs into unified dataset |
| ✓ | `import_to_api.py` — bulk imports via admin API |
| ✓ | `seed_data_unified.json` — 61 merged offenses (6 categories) |
| ○ | **CI data validation** — run verify_data.py in CI on every PR that touches seed data |
| ○ | **Diff tool** — show what changed between seed data versions before import |
| ○ | **Monthly re-scrape automation** — cron job or GitHub Action to check for legislative updates |

---

## 4. DevOps & Deployment

### 4.1 Docker

| ✓ | `docker-compose.yml` — PostgreSQL + server services (client removed, now Expo app) |
| ✓ | DB health check (`pg_isready`) with service dependency ordering |
| ✓ | Server health check (HTTP wget) |
| ✓ | Named volume for PostgreSQL data persistence |
| ✓ | `server/Dockerfile` — multi-stage: `tsc` build → production deps only → `node dist/index.js` |
| ✓ | `.dockerignore` — excludes node_modules, dist, .env, .git, logs |
| ✓ | `docker-compose.prod.yml` — production config with configurable secrets |
| ○ | **Client distribution** — Expo app distributed via app stores, not Docker |

### 4.2 CI/CD

| ✓ | GitHub Actions — TypeScript check + build on client |
| ✓ | GitHub Actions — TypeScript check on server |
| ✓ | CI runs server tests — PostgreSQL service container |
| ◐ | **Lint step in CI** — ESLint configured locally but not in CI workflow |
| ○ | **Data validation in CI** — no verify_data.py run |
| ○ | **Docker build in CI** — images are not built or pushed in CI |
| ○ | **Deploy on merge to main** — no CD pipeline to DigitalOcean |

### 4.3 Deployment

| ○ | **DigitalOcean App Platform / Droplet deployment** — not deployed |
| ○ | **Domain & SSL** — not configured |
| ○ | **Environment variable management** — no DO App-level env vars or .env for production |
| ○ | **Database provisioning** — no managed PostgreSQL on DO; currently only Docker-based |
| ✓ | **Deployment guide** — `docs/DEPLOY.md` covers Docker Compose, DO App Platform, Nginx |

### 4.4 Monitoring & Alerting

| ○ | **Sentry** — not configured |
| ○ | **Uptime monitoring** — no external health check ping |
| ○ | **Database monitoring** — no slow query logging, no connection pool metrics |
| ○ | **Error alerting** — no notification channel for 5xx spike or DB connection failure |

### 4.5 Performance

| ○ | **Redis caching** — search queries and category listings are not cached |
| ○ | **CDN for static assets** — no CDN in front of the client build or PWA icons |
| ○ | **Response caching headers** — no `Cache-Control` or `ETag` headers set on API responses |
| ○ | **Database read replicas** — not needed at current scale, but architecture should document when to add |

---

## 5. Documentation

| ✓ | `ARCHITECTURE.md` — design philosophy, personas, user journeys, system architecture, DB schema, API contract |
| ✓ | `CONTRIBUTING.md` — code standards, PR checklist, commit conventions |
| ✓ | `AGENTS.md` — AI agent workflow guide with tech stack, directory structure, conventions |
| ✓ | `ROADMAP.md` — this file |
| ○ | **API reference** — no standalone API docs (endpoints are listed in ARCHITECTURE.md but no request/response examples) |
| ○ | **Deployment guide** — not written |
| ○ | **Data dictionary** — no explanation of category slugs, severity levels, or act/section values |
| ○ | **README.md** — exists but should include quickstart, screenshots, and links to docs |
| ○ | **Changelog** — not maintained |

---

## Summary — Gaps by Priority

### Done (since last review)

| Item | Detail |
|---|---|
| ✓ Tests | 27 server API integration tests |
| ✓ Production Docker | Multi-stage server Dockerfile, docker-compose.prod.yml |
| ✓ Deployment guide | `docs/DEPLOY.md` — Docker Compose, DO App Platform, Nginx |
| ✓ Rate limiters wired | searchLimiter (100/min), reportLimiter (10/min) |
| ✓ Seed script | Reads 61 offenses from unified JSON |
| ✓ Request ID | x-request-id header on all responses |
| ✓ Error boundary | Brown-themed crash fallback with Go Home / Try Again |
| ✓ Toast system | Slide-up notifications for success/error/info |
| ✓ Offline search | OffenseRepository with Fuse.js, AsyncStorage, bundled snapshot |
| ✓ Mobile responsive | Full-width buttons, stacked grids, touch targets |
| ✓ Brown theme | #6B3A2A primary palette via NativeWind |
| ✓ CI runs tests | Server tests with PostgreSQL service container |
| ✓ ESLint + Prettier | Code quality tooling configured for server |

### High (should ship with)

1. **Data coverage at 61 offenses** — target 100+ from Traffic Act, subsidiary legislation
2. **No production deployment** — Dockerfiles and deploy guide exist, but not deployed live
3. **No Redis caching** — search results and categories recomputed on every request
4. **No Sentry error monitoring** — unhandled errors only go to console
5. **No CSRF protection** — reports endpoint has no anti-forgery protection
6. **No CSP tightening** — Helmet CSP defaults are permissive

### Medium (v1.1)

7. **Admin dashboard is read-only** — no edit/delete/list UI beyond API calls
8. **No dark mode, no reduced-motion support**
9. **No CDN for static assets**
10. **No install prompt** for PWA
11. **No ESLint/lint step in CI**
12. **Data validation not in CI** — verify_data.py not run automatically

### Low (post-v1 or never)

13. **Swahili i18n** — important for reach, large translation effort
14. **USSD channel** — requires Africa's Talking integration
15. **Community features** — heatmap, corruption crowdsourcing, court finder
16. **County by-laws** — requires scraping each county individually
17. **Monetization** — fleet tier, M-Pesa donations
