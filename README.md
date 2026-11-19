# Sheria Check

An anonymous, online Kenyan legal-information tool for web, Android and iOS. Find source-backed offense provisions, read statutory penalty wording, browse legislation and rights references, and open related public judgments.

**Sheria Check provides legal information, not legal advice. It is not a lawyer. Seek advice from a qualified advocate about your circumstances.**

## Current implementation

- Shared Expo/React Native interface for offense lookup, a law library, rights and judgment references.
- Express/PostgreSQL API with private draft imports, source verification metadata, publication controls and content history.
- Source texts rather than generated legal explanations. No motorist accounts, persistent offline store, personal-case histories or identifying analytics.
- Reporting and insights have been removed. Migration `002` permanently drops the reports table and its rows in the connected database. Existing external backups are governed by the operator's retention policy; this migration does not silently rewrite backup archives.
- The supplied Traffic Act bundle contains **153 unverified draft sections and five draft offense references**, extracted from the local official 26 April 2024 PDF. It is **not** an approved launch corpus. All imports remain unpublished until reviewed and explicitly published.
- The initial reference directory links to the Constitution, Traffic Act, Penal Code, Criminal Procedure Code, Evidence Act and Legal Aid Act. In-app texts for the broader collection require authorized source imports. AI, translations, case summaries and further offense coverage are deferred.

## Local development

Use Node 22 and npm, Docker Compose, and Expo Go or a development build compatible with the pinned Expo SDK.

```sh
docker compose up db -d
cd server
npm ci
cp .env.example .env
npm run migrate:dev
npm run seed:dev
npm run dev
```

In another terminal:

```sh
cd client
npm ci
# For a device, create .env with EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:4000/api/v1
# For local web, also set EXPO_PUBLIC_API_URL=http://localhost:4000/api/v1
npm start
```

Without `EXPO_PUBLIC_API_URL`, web uses same-origin `/api/v1` (appropriate behind the production proxy); native uses localhost for development. Release mobile builds require an explicit HTTPS URL. Never place secrets in `EXPO_PUBLIC_` variables.

Open `/admin` on the API host to import and publish reviewed content. The admin token is held only in memory. See [content workflow](docs/CONTENT.md), [architecture/API](docs/ARCHITECTURE.md), [deployment](docs/DEPLOY.md), and [roadmap](docs/ROADMAP.md).

For populated visual previews without publishing unverified law, use the isolated [visual testing guide](docs/VISUAL_TESTING.md).

## Checks

```sh
npm --prefix client run typecheck
npm --prefix client test -- --runInBand
npm --prefix server run validate:data
npm --prefix server run build
# Dedicated PostgreSQL test database whose name ends in _test:
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/sheria_check_test npm --prefix server test
python3 scripts/verify_data.py
```

Integration tests create isolated schemas and never drop the database. TypeScript, tests, data validation, web/native JavaScript exports and Docker image builds run in CI. Exports do not replace signed builds and real-device validation.
