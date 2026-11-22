# Sheria Check roadmap

## Implemented in the legal-information expansion

- Shared online-only Expo web/Android/iOS interface: offenses, laws, provision reading, rights-topic references, sources and judgment links.
- Source-based penalty wording; no public inferred fine ranges/severity or personalized sentencing/payment claim.
- Versioned source models, private draft imports, publication gates, withdrawals, review UI and content history.
- Removal of incident reporting/insights, offline snapshots/cache and invalid font assets. System fonts avoid blocking startup.
- Versioned SQL migrations, Express 4 error forwarding, request validation, configuration checks and privacy-conscious logs.
- Production server/web images, SPA direct links, proxy configuration, CI validation/exports and EAS build profiles.
- Regression tests for the public/admin contract, publication/privacy boundaries and client request lifecycle.

## Legal source review progress (22 November 2026)

- Corrected section 48's wrapped heading and restored source amendment references dropped from sections 11 and 118A.
- Added a reproducible, hash-bound mechanical audit: 153 sections align across layout/raw extraction of the supplied 2024 PDF. All records remain unverified drafts.
- Added permission-referenced source fetching with provenance and challenge rejection. No new corpus downloads or publication took place.
- Publication remains pending: authorized acquisition/reuse route, handling of source annotations, and current-law/amendment/judgment review. See LEGAL_SOURCE_REVIEW.md and SOURCE_ACCESS_REQUEST.md.

## Content and release work still required

- Compare and approve the 153 Traffic Act draft sections/five draft offense links, including extraction layout and later amendments.
- Lawfully obtain/import the remaining core Acts and selected traffic regulations; map and verify the six initial common criminal offenses.
- Add verified rights topic tags and curated public judgment references. No records should be published simply to avoid an empty screen.
- Configure a real HTTPS domain/API, protected production secrets, backup retention, uptime checks and hosting privacy settings.
- Link the Expo project, configure Apple/Google credentials, generate signed binaries, and validate on actual devices and browsers before store submission.
- Obtain qualified review before introducing explanatory legal material. A source-check timestamp does not certify current legal advice.

## Deferred

Human-reviewed Kiswahili/other Kenyan-language translations, plain-language legal explanations and case summaries, then a source-grounded AI assistant with citations and uncertainty evaluation. Broader legislation/county coverage follows verified demand. Reporting is absent from the active product and can only return under a separately defined privacy/operating model.
