# Sheria Check — AI Agent Workflow Guide

## Project Overview

Sheria Check is a mobile app (Expo/React Native) for Kenyan motorists to look up traffic offense fines and penalties. It uses React Native + NativeWind (Tailwind) on the client, Express + PostgreSQL on the backend, and is deployed on DigitalOcean. The app ships offline-first: offenses are bundled in the app binary and refreshed from the API in the background.

**Core principle:** Transparency is the product. Users are anonymous. No login. No tracking.

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React Native (Expo SDK 57), NativeWind (Tailwind CSS 4), Expo Router v4 | Offline-first with bundled offense snapshot |
| Backend | Node.js 20, Express 4 | ES Modules (`"type": "module"`) |
| Database | PostgreSQL 16 | Pooled via `pg` library |
| Cache | Redis (via Upstash or ioredis) | Optional, for query caching |
| Forms/Validation | Zod | Server-side only |
| Language | TypeScript (strict mode) | Both client and server |
| Package Manager | npm | |

---

## Directory Structure

```
sheria_check/
├── client/                    # Expo mobile app (React Native)
│   ├── app/                   # Expo Router routes (file-based routing)
│   │   ├── (tabs)/            # Tab navigator screens
│   │   │   ├── index.tsx      # Home (search + categories)
│   │   │   ├── insights.tsx   # Incident insights (anonymized stats)
│   │   │   └── disclaimer.tsx # Legal disclaimer
│   │   ├── category/[id].tsx  # Category browse screen
│   │   ├── offense/[id].tsx   # Offense detail screen
│   │   ├── +not-found.tsx     # 404 screen
│   │   └── _layout.tsx        # Root layout (providers, fonts, Stack)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API client (fetch wrapper)
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utility functions (cn, format)
│   │   ├── data/             # Static data (category defaults)
│   │   └── repositories/     # OffenseRepository (offline-first data layer)
│   ├── assets/
│   │   ├── fonts/            # Custom typefaces (Fraunces, Source Sans 3)
│   │   └── images/           # App icon, splash, adaptive icon layers
│   ├── app.css               # NativeWind/Tailwind CSS entry
│   ├── app.json              # Expo config (name, scheme, plugins)
│   ├── babel.config.js       # NativeWind babel preset
│   ├── metro.config.js       # NativeWind metro integration
│   ├── tailwind.config.js    # NativeWind theme (primary-*, caution-* palette)
│   └── package.json
├── server/                    # Express API backend
│   ├── src/
│   │   ├── routes/           # Express route definitions
│   │   ├── controllers/      # Route handler functions
│   │   ├── middleware/        # Express middleware (auth, error handler)
│   │   ├── models/           # TypeScript interfaces for DB rows
│   │   ├── db/               # DB connection, migrations, seeds
│   │   ├── admin/            # Admin dashboard HTML page
│   │   ├── utils/            # Server utilities
│   │   ├── app.ts            # Express app setup
│   │   └── index.ts          # Server entry point
│   ├── Dockerfile
│   └── package.json
├── scripts/                   # Data scraping scripts
│   └── scrape_traffic_act.py
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   └── ROADMAP.md
├── AGENTS.md                  # This file
├── CONTRIBUTING.md
├── docker-compose.yml
└── .gitignore
```

---

## How to Run Locally

```bash
# 1. Start PostgreSQL
docker compose up db -d

# 2. Install and start server
cd server && npm install && npm run migrate && npm run seed && npm run dev

# 3. Install and start client (separate terminal)
cd client && npm install && npx expo start
```

Scan the QR code with Expo Go on your phone, or press `a` for Android emulator / `i` for iOS simulator.
Set `EXPO_PUBLIC_API_URL` in `client/.env` to your machine's LAN IP (e.g. `http://192.168.1.100:4000/api/v1`) for device testing.

---

## AI Coding Conventions

### TypeScript

- **Strict mode enabled.** No `any` unless absolutely unavoidable and documented with a comment.
- Prefer `interface` over `type` for object shapes. Use `type` for unions/intersections.
- All function parameters and return types must be explicitly annotated.
- Use `const` for imports and values. Never `var`.

### React

- **Functional components only.** No class components.
- Name files in PascalCase for components: `SearchBar.tsx`, `OffenseCard.tsx`.
- Use `.tsx` extension for files containing JSX.
- One component per file. No index files except barrel exports.
- Hooks go in `hooks/` prefixed with `use` (e.g., `useSearch.ts`).
- Types go in `types/index.ts` (co-located near the domain).

### Component Structure

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return <div>...</div>;
}
```

### CSS

- **Tailwind utility classes only.** No custom CSS files or CSS modules.
- Use `cn()` from `src/utils/cn.ts` (wraps `clsx`) for conditional classes.
- Custom colors defined in `tailwind.config.js` as `primary-*` and `caution-*`.
- Never use arbitrary values (`w-[123px]`) unless no Tailwind token exists.
- Responsive design uses Tailwind breakpoints (`sm:`, `md:`, `lg:`).

### API Client

- All API calls go through `src/services/api.ts`.
- Every function has a typed return: `Promise<Offense[]>`.
- Base URL is configured via `EXPO_PUBLIC_API_URL` env var (defaults to `http://localhost:4000/api/v1`).

### Backend Patterns

- Routes define the HTTP method + path only. Controllers contain the logic.
- All input validated with Zod schemas at the controller level.
- SQL queries are parameterized (always use `$1`, `$2` placeholders).
- Errors are thrown as `Error` objects and caught by the error handler middleware.
- Environment variables read at startup, validated with defaults.

---

## What to Never Do

1. **Never commit `.env` files, secrets, tokens, or passwords.** Use `.env.example` for documentation.
2. **Never introduce authentication for motorists.** Sheria Check is anonymous by design.
3. **Never add analytics/tracking that identifies individual users.** Privacy-preserving analytics only (e.g., page view counts without IPs).
4. **Never hardcode fine amounts without a source citation.** Every offense must reference the Act and Section.
5. **Never display unverified officer identities in public views.** Incident stats are aggregate/anonymized only (cells <5 suppressed).
6. **Never skip error handling.** Every API call must handle network errors, empty results, and 4xx/5xx responses.
7. **Never add runtime dependencies without evaluating bundle size impact** (frontend) or security audit (backend).

---

## Testing

- Unit tests: jest-expo (client), Vitest (backend)
- Run: `npm test`
- API integration tests: Supertest + PostgreSQL test DB
- E2E: Playwright (future)
- Test files co-located with source: `searchBar.test.tsx` next to `SearchBar.tsx`

---

## Git Workflow

```
main ← production-ready
  └── feat/* ← feature branches
  └── fix/* ← bug fixes
```

- Commit format: `type(scope): message`
  - `feat(server): add pagination to search endpoint`
  - `fix(client): correct fine range display on mobile`
  - `chore(deps): upgrade express to 4.21`
- Always rebase before merging. No merge commits on main.

---

## Environment Variables

### Client (`client/.env`)
| Variable | Default | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://localhost:4000/api/v1` | API base URL (set to LAN IP for device testing) |

### Server (`server/.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Server port |
| `DATABASE_URL` | `postgres://sheria:sheria_dev@localhost:5432/sheria_check` | PostgreSQL connection string |
| `ADMIN_PASSWORD` | `admin123` | Bearer token for admin endpoints |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `info` | Pino log level |
| `PG_POOL_SIZE` | `20` | PostgreSQL connection pool size |
| `REDIS_URL` | (none) | Upstash/Redis connection URL (optional) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated in production) |
