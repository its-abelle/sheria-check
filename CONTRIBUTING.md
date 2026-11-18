# Contributing

Read AGENTS.md, README.md and docs/CONTENT.md first. Sheria Check is an anonymous online legal-information tool, with a shared Expo web/mobile client and Express/PostgreSQL API.

Use strict TypeScript, explicit types, named functional components (Expo route defaults excepted), NativeWind utilities and existing palette tokens. Keep source text distinct from interface strings. Avoid runtime dependencies when the platform already provides the capability.

All HTTP input is validated and SQL values parameterized. Wrap async Express 4 handlers with `asyncHandler`. API responses use `{ data, pagination? }` and `{ error, details? }`. Offset cursors are numeric. Cancel client requests on navigation/query changes and provide visible retry controls.

Never commit secrets or retain identifying user searches, IP addresses or request bodies in logs. Motorists never need accounts. Reporting/offline storage are outside the active product.

Legal data must be sourced lawfully and imported as drafts. Verification dates must reflect completed checks; code or schema validation cannot verify law. Use version-specific source IDs and retain change history. Publish exact source provisions and conditional penalty wording, never invented fine ranges or unsupported legal advice. Seek qualified review before explanatory text, case summaries, translations or AI.

Before review run client/server TypeScript, tests and builds, data validation and relevant export checks from README.md. Test responsive behavior, source links, deep links, accessibility, text scaling, disconnected errors and publication boundaries. Integration tests only target a dedicated `_test` database. Preserve committed migrations and add new ones for schema changes.

Use conventional commits (`feat(client): ...`, `fix(server): ...`, `docs(content): ...`). Keep pull requests focused and describe user behavior, validation and any remaining release limitations. Rebase before merging; no merge commits on main.
