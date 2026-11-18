# Sheria Check agent guide

## Product

An online Kenyan legal-information tool for web, Android and iOS. Anonymous motorists and the wider public can find approved offense/penalty provisions, read legislation and rights references, and open public judgment references. Transparency and source accuracy are central. No motorist login, identifying analytics, offline persistence, personal-case history, payment collection, reporting or insights.

Release one is English and sources-only. Explanations, translations, summaries and AI are deferred until qualified review. Always state that the product provides legal information, is not a lawyer, and that users should seek a qualified advocate's advice.

## Stack

Expo SDK 57 / React Native / Expo Router / NativeWind v4 (Tailwind 3); Express 4 / PostgreSQL 16; strict TypeScript and npm. Node 22 in CI/production. Keep system fonts and the existing primary brown/caution palette. Web is a client-rendered SPA with same-origin API proxy; native releases require an absolute HTTPS API URL.

## Conventions

- Functional React components (ErrorBoundary lifecycle exception), PascalCase component files, hooks under `client/src/hooks`, shared object interfaces under domain types. Explicit function parameter and return types. No `any` or TypeScript error suppression.
- Use NativeWind utility classes and `cn()` for conditional classes. Preserve semantic labels, readable contrast, 44px+ targets, keyboard/assistive access, text scaling and clear error/empty/retry states. Keep UI strings separate from original legal text for later reviewed translation.
- All client requests go through `client/src/services/api.ts`; cancel stale/unmounted requests, bound request duration, and never silently return an empty array for a failure.
- Express 4 async routes must use `asyncHandler`. Validate inputs with Zod, use parameterized SQL, return consistent `{ data, pagination? }` or `{ error, details? }`. Cursors currently mean numeric offsets.
- Never log IPs, query/search text, URLs, request bodies, authorization or personal case information. Do not trust incoming trace headers as log IDs. Rate-limit network keys are transient only.
- Do not add runtime dependencies without considering frontend size or backend security. Do not commit secrets, signing files or `.env` files.

## Legal content

Imports are private drafts. Publication requires actual source verification, official HTTPS source references, a documented rights basis, version/retrieval/check dates and published parent/referenced provisions. Do not invent amounts or interpret generic maxima as fixed fines. Do not infer severity labels, determine guilt or predict outcomes. Separate bail/bond from fines. Preserve original judgment anonymization and distinguish publisher commentary from original source text.

Use version-specific instrument/provision IDs; preserve history. Never edit a committed migration. New migrations apply once through `_migrations`. Migration 002 intentionally deletes legacy report data. Read docs/CONTENT.md before sourcing/importing legal material; structural validation is not legal verification.

## Development and verification

See README.md for quickstart and docs/DEPLOY.md for production. Core commands:

- `docker compose up db -d`
- `npm --prefix server run migrate:dev`, `npm --prefix server run seed:dev`, `npm --prefix server run dev`
- `npm --prefix client start`
- `npm --prefix client run typecheck`, `npm --prefix client test -- --runInBand`
- `npm --prefix server run validate:data`, `npm --prefix server run build`
- `DATABASE_URL=.../sheria_check_test npm --prefix server test`

Integration tests require a dedicated database ending in `_test` and create isolated schemas. Add meaningful tests for API contracts, publication gates, source/version integrity and client request races. Do not claim device/production/legal verification from compilation or JavaScript exports alone.

Use feat/* or fix/* branches and conventional commits. Preserve existing user changes and validate changes before committing or deploying. Current implementation/release gaps live in docs/ROADMAP.md.
