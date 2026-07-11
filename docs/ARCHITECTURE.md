# Sheria Check — Architecture

## Design Philosophy

1. **Transparency is the product.** Every decision — from showing the exact legal citation to listing the course of action — exists to give motorists information symmetry with law enforcement.
2. **Mobile-first, offline-capable.** Most searches happen roadside on a phone with patchy connectivity. The PWA must load, search, and render offense data even on 2G or offline.
3. **Zero friction for the vulnerable user.** No login, no paywall, no data tracking. The app works for anyone with a browser.
4. **Data accuracy is a safety concern.** Wrong fine amounts or outdated penalties could cause real harm. Versioning, audit trails, and a clear disclaimer are non-negotiable.

## User Personas

| Persona | Goal | Pain Point | Device |
|---|---|---|---|
| **Ruth (Matatu passenger, 34)** | Check if the fine the officer quoted for her driver is real | Illiterate in legal jargon, intimidated by officers | Low-end Android, Chrome |
| **James (Private driver, 28)** | Know what he actually owes before the officer names a price | In a hurry, stressed, roadside | Mid-range Android, PWA installed |
| **Grace (Fleet manager, 45)** | Track all offenses across 12 matatus at scale | Needs offline access, bulk lookup | Desktop + iOS PWA |
| **Kip (Boda boda rider, 22)** | Quick voice/visual search, can't read long text | Low literacy, speaks Swahili primarily | Basic smartphone, small screen |

## User Journey Maps

### Primary Flow: Search → View → Act

```
Pull over / incident
        │
        ▼
  Open Sheria Check
        │
        ▼
  Search offense (text or browse category)
        │
        ▼
  View offense detail
   ├── Fine range (min – max KES)
   ├── Legal citation (Act, Section)
   ├── Severity tag
   ├── Course of action (what to say/do)
   └── Share / Print summary
        │
        ▼
  [Optional] Report corrupt incident
   ├── Officer name & badge
   ├── Location
   ├── Amount demanded vs legal amount
   └── Submit (anonymous)
```

### Secondary Flow: Browse by Category

```
Home → Browse Categories → Select Category
        │
        ▼
  List of offenses in category
        │
        ▼
  Tap offense → Offense detail (same as above)
```

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      User                                │
│  (Phone / Desktop / Installed PWA)                       │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────┐
│         Cloudflare / DO App Platform     │
│  (CDN, SSL termination, DDoS protection) │
└────────────────────┬────────────────────┘
                     │
            ┌────────┴────────┐
            ▼                  ▼
┌───────────────────┐  ┌──────────────────┐
│  Client (PWA)     │  │  Server (Node)   │
│  React 18 + Vite  │──│  Express         │
│  Tailwind CSS     │  │  API v1          │
│  react-router v6  │  │  Zod validation  │
│  Workbox (SW)     │  │  Rate-limited    │
└───────────────────┘  └────────┬─────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌──────────────┐       ┌──────────────┐
            │  Redis        │       │  PostgreSQL  │
            │  (cache)      │       │  (primary DB)│
            │  - query TTL  │       │  - offenses  │
            │  - 5 min      │       │  - reports   │
            └──────────────┘       │  - status    │
                                   └──────────────┘
```

## Data Flow (Search)

```
1. User types "speeding" in SearchBar
2. Input debounced (300ms) → GET /api/v1/offenses/search?q=speeding&cursor=0&limit=20
3. Server checks Redis cache for key "search:speeding:0:20"
   ├── Cache HIT → return cached results
   └── Cache MISS → PostgreSQL full-text search:
        SELECT * FROM offenses
        WHERE to_tsvector('english', name || ' ' || description || ' ' || array_to_string(aliases, ' '))
              @@ plainto_tsquery('english', 'speeding')
        ORDER BY similarity, min_fine ASC
        LIMIT 21
       → Store results in Redis with TTL 300s
       → Return response
4. Client renders OffenseCard list with skeleton loader
```

## Database Schema

### `offenses`

| Column | Type | Notes |
|---|---|---|
| `id` | `TEXT PK` | Stable slug (e.g. `speeding-excess`) |
| `name` | `TEXT NOT NULL` | Offense name |
| `aliases` | `TEXT[]` | Alternative names for fuzzy search |
| `description` | `TEXT NOT NULL` | Plain English explanation |
| `category` | `TEXT NOT NULL` | FK-like to category enum |
| `severity` | `TEXT CHECK(minor,serious,felony)` | Determines course of action style |
| `citation` | `TEXT NOT NULL` | Full legal citation |
| `act` | `TEXT NOT NULL` | Act name |
| `section` | `TEXT NOT NULL` | Section number |
| `min_fine` | `INTEGER NOT NULL` | Minimum penalty in KES |
| `max_fine` | `INTEGER NOT NULL` | Maximum penalty in KES |
| `max_imprisonment` | `TEXT NULLABLE` | e.g. "3 years" |
| `course_of_action` | `TEXT NOT NULL` | What the motorist should do |
| `law_version` | `TEXT DEFAULT '2024'` | Version of the law |
| `created_at` | `TIMESTAMPTZ` | Auto |
| `updated_at` | `TIMESTAMPTZ` | Auto |

### `reports`

| Column | Type | Notes |
|---|---|---|
| `id` | `SERIAL PK` | |
| `offense_id` | `TEXT FK → offenses.id` | Nullable |
| `officer_name` | `TEXT` | Optional |
| `officer_badge` | `TEXT` | Optional |
| `location` | `TEXT` | Free text |
| `amount_demanded` | `INTEGER` | KES |
| `description` | `TEXT NOT NULL` | Required |
| `created_at` | `TIMESTAMPTZ` | Auto |

### `status`

| Column | Type | Notes |
|---|---|---|
| `id` | `INTEGER PK DEFAULT 1` | Singleton row |
| `data_version` | `TEXT` | e.g. "2024.1" |
| `statutes_covered` | `TEXT[]` | e.g. `{Traffic Act Cap 403}` |
| `total_offenses` | `INTEGER` | Count |
| `last_updated` | `TIMESTAMPTZ` | |

## API Contract

All endpoints prefixed with `/api/v1`.

### `GET /offenses/search?q=<query>&cursor=<int>&limit=<int>`

```json
{
  "data": [
    {
      "id": "speeding-excess",
      "name": "Exceeding Speed Limit",
      "description": "Driving a motor vehicle at a speed exceeding...",
      "category": "speeding-reckless",
      "severity": "minor",
      "citation": "Traffic Act Cap 403, Section 44",
      "min_fine": 500,
      "max_fine": 5000,
      "max_imprisonment": null,
      "course_of_action": "The officer may issue a charge sheet..."
    }
  ],
  "pagination": {
    "cursor": 20,
    "limit": 20,
    "has_more": true,
    "total": 47
  }
}
```

### `GET /offenses/categories`
### `GET /offenses/:id`
### `GET /offenses?category=<slug>`
### `GET /status`
### `POST /reports`

```json
{
  "officer_name": "optional",
  "officer_badge": "optional",
  "location": "optional",
  "amount_demanded": 2000,
  "description": "Officer demanded KES 2000 for a KES 500 fine"
}
```

### Admin endpoints (Bearer token required)
- `POST /admin/offenses` — create/update single
- `POST /admin/offenses/bulk` — bulk upsert
- `DELETE /admin/offenses/:id`

## Frontend Component Tree

```
<App>
  <BrowserRouter>
    <Layout>                     ← Header nav + footer
      <Outlet>
        <Home />                  ← Hero search + categories grid + data freshness
        <CategoryBrowse />        ← Category heading + offense list
        <OffenseDetail />         ← Full offense card + report modal
        <Disclaimer />            ← Legal disclaimer page
        <NotFound />              ← 404
      </Outlet>
    </Layout>
    <ReportModal />               ← Overlay, portal
  </BrowserRouter>
</App>
```

### State Management
- No global state library. Each page uses custom hooks (`useSearch`, `useOffenses`) that wrap the API client.
- React Router handles URL state (category, offense ID).
- Modal open/close managed by local `useState`.

### Key Components
| Component | Responsibility |
|---|---|
| `SearchBar` | Debounced input, emits query changes |
| `OffenseCard` | Summary card (fine range, severity badge, citation) |
| `CategoryCard` | Category card with icon + count |
| `DisclaimerBanner` | Dismissable banner, stores dismiss in sessionStorage |
| `ReportModal` | Anonymous incident form, 5 fields |
| `LoadingSkeleton` | Pulse animation for loading states |

## Performance Targets

| Metric | Target | How |
|---|---|---|
| First Contentful Paint | < 1.5s | Code splitting, preload, SW caching |
| Largest Contentful Paint | < 2.0s | Server-side search, skeleton screens |
| First Input Delay | < 50ms | No blocking JS, lazy routes |
| Time to Interactive | < 3.0s | Route-based code splitting |
| Offline | Full offense browse | Service worker caches API + static assets |
| Lighthouse PWA Score | > 90 | Manifest, SW, HTTPS, responsive |

## Security Model

1. **No user authentication.** Anonymous access by design. No sessions, tokens, or cookies for motorists.
2. **Admin auth.** Bearer token (env var `ADMIN_PASSWORD`) for admin endpoints. Plain password is intentional — this is a single-admin tool. Upgrade to OAuth if multi-admin needed.
3. **Rate limiting.** 100 req/min per IP on search, 10 req/min on report submission.
4. **Input validation.** All inputs validated with Zod on the server. SQL injection prevented by parameterized queries.
5. **CORS.** Restricted to known origins in production.
6. **Headers.** Helmet.js for security headers (XSS, content-type sniffing, referrer policy).
7. **No secrets in client.** API keys, tokens, and DB credentials are server-side only.

## Caching Strategy

| Layer | What | TTL | Invalidation |
|---|---|---|---|
| **Browser (Service Worker)** | App shell, static assets | Cache-first, swr | New SW version on deploy |
| **Browser (SW)** | API search responses | Network-first, cache fallback | — |
| **Server (Redis)** | Search results | 300s | On offense data update |
| **Server (Redis)** | Category lists | 600s | On offense data update |
| **CDN (DigitalOcean)** | Static assets | 1y (fingerprinted) | On deploy |
