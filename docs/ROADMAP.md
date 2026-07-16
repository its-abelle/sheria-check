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
| ◐ | **Wire per-route rate limiters** — `searchLimiter` and `reportLimiter` exist but are unused; only the generic `generalLimiter` is applied globally |
| ○ | **Input sanitization middleware** — strip HTML, trim strings, normalize whitespace before controllers |
| ○ | **Response envelope consistency** — some endpoints return `{ data }`, others return raw object; standardize |
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
| ✓ | GIN index on full-text search vector |
| ✓ | Indexes on `category` and `severity` |
| ◐ | **Seed script uses hardcoded sample data** (12 offenses) instead of the scraped unified JSON (61 offenses); should read from `scripts/seed_data_unified.json` |
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
| ○ | **Request ID tracing** — no correlation ID on requests for tracing through logs |
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

## 2. Frontend — React PWA (`client/`)

### 2.1 Routing & Pages

| ✓ | `/` — Home page with search bar + 6 category cards |
| ✓ | `/category/:categoryId` — browse offenses by category |
| ✓ | `/offense/:offenseId` — offense detail (fine range, citation, severity, course of action) |
| ✓ | `/disclaimer` — legal disclaimer page |
| ✓ | `*` — 404 Not Found page |
| ○ | **Server-side meta tags / OG images** — currently no Open Graph tags; links shared on WhatsApp/Twitter show no preview |

### 2.2 Components

| ✓ | `SearchBar` — text input with search icon |
| ✓ | `CategoryCard` — icon + name + description + count |
| ✓ | `OffenseCard` — name, fine range, severity badge |
| ✓ | `OffenseDetail` — full offense with share button, report button |
| ✓ | `Layout` — persistent header, disclaimer banner, footer |
| ✓ | `DisclaimerBanner` — persistent warning at page bottom |
| ✓ | `ReportModal` — anonymous incident report form |
| ✓ | `LoadingSkeleton` / `LoadingSpinner` — skeleton cards on search, spinner for buttons |
| ✓ | `EmptyState` — illustrated empty results |
| ✓ | `OfflineNotice` — banner when network is lost |
| ✓ | `SkipToContent` — keyboard accessibility skip link |
| ✓ | `PageTransitionBar` — loading bar on route change |
| ○ | **Toast / notification system** — no success/error toasts (report submission, API errors are silent) |
| ○ | **Confirm dialog** — no confirmation before report submission |
| ○ | **Error boundary** — no React error boundary; uncaught errors crash the whole tree |

### 2.3 Hooks & Services

| ✓ | `useSearch` — search state, debounced API calls, pagination |
| ✓ | `useOffenses` — fetch by category, fetch by ID |
| ✓ | `useShare` — Web Share API (WhatsApp, Twitter, native) |
| ✓ | `api.ts` — typed API client with error handling |
| ○ | **Retry / offline queue** — failed API calls are not retried; no offline-first strategy |
| ○ | **useStatus** — no hook for data freshness (stale data indicator is not connected to API) |
| ○ | **useDebounce** — debounce logic is inlined in `useSearch`; extract to reusable hook |

### 2.4 PWA & Offline

| ✓ | Service worker via `vite-plugin-pwa` (autoUpdate) |
| ✓ | Web manifest (name, icons, theme color, standalone display) |
| ✓ | PWA icons (192px, 512px) |
| ✓ | Offline notice banner when `navigator.onLine` is false |
| ◐ | **Offline caching strategy** — default workbox precache only; no runtime caching for API responses |
| ○ | **Install prompt** — no custom "Add to Home Screen" prompt |
| ○ | **Offline search** — no offline-capable search (needs local IndexedDB cache of offenses) |
| ○ | **Background sync** — reports submitted offline are not queued for later sync |

### 2.5 Styling & UX

| ✓ | Tailwind CSS utility classes only (no custom CSS files) |
| ✓ | `cn()` conditional class utility (clsx wrapper) |
| ✓ | Custom color palette (`primary-*`, `caution-*`) |
| ✓ | Responsive design (sm, md, lg breakpoints) |
| ✓ | WCAG 2.1 AA — keyboard navigation, focus traps, skip-to-content |
| ✓ | Empathetic copy throughout |
| ◐ | **Empty states have fixed illustrations** — no category-specific empty art |
| ○ | **Dark mode** — not implemented |
| ○ | **Reduced motion** — no `prefers-reduced-motion` support |
| ○ | **Loading state for ReportModal submit** — spinner exists but not wired to the submit button |

### 2.6 Testing (client)

| ○ | **Component unit tests** — SearchBar, OffenseCard, CategoryCard rendering |
| ○ | **Page integration tests** — Home renders categories, search returns results |
| ○ | **Hook tests** — useSearch debounce, useShare fallback |
| ○ | **API client tests** — error handling, response parsing |
| ○ | **Accessibility tests** — axe-core / jest-axe audits on key pages |
| ○ | **PWA / offline tests** — service worker registration, offline fallback |

### 2.7 Performance & Optimization

| ○ | **Lighthouse audit** — no audit has been run; target 90+ on all categories |
| ○ | **Bundle size analysis** — no `vite-bundle-visualizer` or size-limit check |
| ○ | **Image optimization** — PWA icons are the only images; no WebP/AVIF pipeline needed currently |
| ○ | **Code splitting** — no `React.lazy` / `Suspense` on route-level components |
| ○ | **Font loading** — using system font stack (no render-blocking web fonts) — good, but confirm |

### 2.8 Internationalization

| ○ | **i18n framework** (react-i18next) — not installed |
| ○ | **Swahili translations** — all offense names, descriptions, course of action |
| ○ | **Language toggle** — no UI for switching languages |
| ○ | **RTL support** — not needed for Swahili (uses Latin script), but i18n framework should support it |

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

| ✓ | `docker-compose.yml` — PostgreSQL + server + client services |
| ✓ | DB health check (`pg_isready`) with service dependency ordering |
| ✓ | Server health check (HTTP wget) |
| ✓ | Named volume for PostgreSQL data persistence |
| ✓ | `server/Dockerfile` — Node 20 Alpine |
| ✓ | `client/Dockerfile` — Node 20 Alpine |
| ◐ | **Dockerfiles are dev-only** — both run `npm run dev` (tsx watch / Vite dev server); no production multi-stage builds |
| ○ | **Production server Dockerfile** — multi-stage: `tsc` build → production deps only → `node dist/index.js` |
| ○ | **Production client Dockerfile** — build step → Nginx serving static `dist/` with API proxy |
| ○ | **`.dockerignore`** — not present; node_modules, dist, .env could leak into images |

### 4.2 CI/CD

| ✓ | GitHub Actions — TypeScript check + build on client |
| ✓ | GitHub Actions — TypeScript check on server |
| ◐ | **No test step in CI** — CI only runs `tsc --noEmit` and `vite build` (no tests exist to run) |
| ○ | **Lint step in CI** — no ESLint or Prettier check |
| ○ | **Data validation in CI** — no verify_data.py run |
| ○ | **Docker build in CI** — images are not built or pushed in CI |
| ○ | **Deploy on merge to main** — no CD pipeline to DigitalOcean |

### 4.3 Deployment

| ○ | **DigitalOcean App Platform / Droplet deployment** — not deployed |
| ○ | **Domain & SSL** — not configured |
| ○ | **Environment variable management** — no DO App-level env vars or .env for production |
| ○ | **Database provisioning** — no managed PostgreSQL on DO; currently only Docker-based |
| ○ | **Deployment guide** — no step-by-step deploy documentation |

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

### Critical (ship blockers)

1. **Zero tests** — no unit, integration, or API tests exist anywhere (backend or frontend)
2. **No production deployment** — not live, no deploy guide, Dockerfiles are dev-only
3. **Seed script uses hardcoded data** — reads 12 sample offenses instead of 61 unified scraped offenses

### High (should ship with)

4. **Per-route rate limiters not wired** — `searchLimiter` and `reportLimiter` defined but unused
5. **No error boundary on frontend** — one uncaught React error crashes the whole app
6. **No toast/notification system** — report submissions and API errors are silent to the user
7. **No Lighthouse audit** — PWA score, performance, a11y, and SEO scores unknown
8. **No Redis caching** — search results and categories recomputed on every request

### Medium (v1.1)

9. **Admin dashboard is read-only** — no edit/delete/list UI beyond API calls
10. **Data coverage at 61 offenses** — target is 100+ from Traffic Act alone, plus subsidiary legislation
11. **No offline search** — PWA works offline for cached pages but search requires network
12. **No CI test/lint/data-validation steps**
13. **No dark mode, no reduced-motion support**

### Low (post-v1 or never)

14. **Swahili i18n** — important for reach, large translation effort
15. **USSD channel** — requires Africa's Talking integration
16. **Community features** — heatmap, corruption crowdsourcing, court finder
17. **County by-laws** — requires scraping each county individually
18. **Monetization** — fleet tier, M-Pesa donations
