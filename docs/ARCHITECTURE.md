# Sheria Check architecture

## Product boundaries

Kenyan legal information for everyone, online, English first. Motorists remain one audience. Public pages present approved original source text and curated judgment references; they do not diagnose crimes, determine guilt, calculate a personal amount owed, predict sentencing or provide individualized legal advice.

The Constitution anchors rights; offense definitions and penalty provisions are linked from the appropriate Acts/regulations. Bail/bond is distinct from a fine. Judgment links do not imply similar outcomes or current precedential status. The persistent legal-information notice appears across every screen.

## System

Expo Router serves the shared web/Android/iOS interface. Web exports as a client-rendered SPA so published records and deep links do not require rebuilding static routes. An Nginx proxy serves web assets and forwards `/api/v1` and `/admin` to Express. PostgreSQL holds source versions, provisions, offenses and judgment references.

There is no Redis dependency, service worker, bundled legal snapshot, persistent query store, chatbot, motorist authentication or reporting API. API GETs require connectivity and use cancellation, a 15-second timeout, no-store responses and explicit retry controls. Public library/provision/offense lists have clear empty states.

## Data and publication

- `legal_instruments`: immutable version identity, official URL, retrieval/verification dates, rights basis, draft/publication state.
- `legal_provisions`: original wording, heading/number, instrument reference, rights topic tags, official anchor, verification date and publication state. New versions use new IDs.
- `offenses`: public display name/aliases/category and links to defining and penalty provisions. Historical scraper fields remain private for migration compatibility and are excluded from the public view.
- `judgment_references` and `offense_judgments`: original citation, court, decision date, official link and verification/publication state. No generated summaries or findings about precedent.
- `content_history`: import snapshots and publication actions. Revisions remain available for audit.
- `_migrations`: applied SQL files, serialized with a database advisory lock. Startup finishes migrations before accepting requests.

All imported content is draft. Importing changes to a published record withdraws that record until republished. Publication requires a verification date, an instrument rights basis, and published parents/referenced provisions. Withdrawing a law hides its provisions and offenses immediately through shared query gates. Admin content writes are transactional and serialized. A content revision UUID changes after imports/publication actions.

Original source and version dates are displayed. A verification timestamp is not a claim that no later legislation or court decisions exist. Structural validation is not legal verification. See [CONTENT.md](CONTENT.md).

## API contract

All paths are under `/api/v1`. Success is `{ data: T, pagination?: { cursor, limit, has_more, total? } }`; errors are `{ error: string, details?: object }`. Cursors are numeric offsets with deterministic ordering, not opaque/keyset cursors. Invalid inputs return 400. Missing/unpublished records return 404. Draft access requires admin authentication. The health endpoint is intentionally flat.

| Method/path                                 | Behavior                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------ |
| `GET /offenses/search?q=&cursor=0&limit=20` | Published offense search; empty query lists approved records; limit 1–50       |
| `GET /offenses/categories`                  | Published categories and counts                                                |
| `GET /offenses?category=...`                | Published category browse                                                      |
| `GET /offenses/:id`                         | Exact defining/penalty wording and provenance; no inferred fine range/severity |
| `GET /legislation?q=`                       | Published law/version catalog, published provision counts                      |
| `GET /legislation/:id`                      | Published law metadata and its published provisions                            |
| `GET /provisions?q=&topic=&cursor=0`        | Text search or rights-topic filter; pages of 20                                |
| `GET /provisions/:id`                       | Original provision and source metadata                                         |
| `GET /judgments?offense_id=`                | Published curated references for a published offense                           |
| `GET /status`                               | Content revision, published offense count, covered published statutes          |
| `GET /health`                               | Database readiness                                                             |
| `POST /admin/content/import`                | Atomic source-bundle import; always drafts                                     |
| `GET /admin/content/:kind?cursor=0`         | Protected review list, 50 per page                                             |
| `POST /admin/content/:kind/:id/publish`     | Enforce source/publication requirements                                        |
| `POST /admin/content/:kind/:id/unpublish`   | Withdraw content while retaining audit history                                 |
| `POST /admin/offenses` / `/bulk`            | Import new-contract offense records as drafts                                  |
| `DELETE /admin/offenses/:id`                | Withdraw offense; preserve source history                                      |

Kinds: `instruments`, `provisions`, `offenses`, `judgments`. Import bundle arrays: `instruments`, `provisions`, `offenses`, `judgments`, `links`. Payload schemas live in `server/src/utils/contentSchema.ts`. Source URLs must use approved official HTTPS hosts. No server-side fetching of arbitrary admin URLs occurs.

## Privacy and operations

No search, URL, IP, user-agent, request-body or authorization-header logging. Request IDs are generated locally rather than trusting user-supplied trace text. Errors log a generic event plus request ID. Rate limiting uses transient in-memory network keys for one minute; these are not analytics and are never persisted. Hosting/CDN/proxy logs require equivalent operator configuration.

Production validates secrets/origins, disallows default admin credentials, limits pool/request sizes, applies SQL statement/connect timeouts and forwards rejected Express 4 handlers to the error middleware. Docker health checks and graceful HTTP/database shutdown are provided. TLS, uptime checks, backup storage/access and store credentials are operational responsibilities documented in DEPLOY.md.

## Repository tooling

The root package provides Prettier through `npm run format` and `npm run format:check`. The server provides TypeScript-aware ESLint through `npm run lint`; these tools are retained from main alongside the legal-library implementation.
