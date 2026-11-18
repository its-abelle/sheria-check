# Legal source and publication workflow

## Initial collection and coverage

The target reference library is the Constitution, Traffic Act and verified relevant regulations, Penal Code, Criminal Procedure Code, Evidence Act and Legal Aid Act. Structured lookup starts with traffic plus theft, common assault, malicious damage to property, trespass, affray and handling stolen property. These are **coverage targets**, not a claim that all records have been verified or imported.

Current source bundle: 153 unverified Traffic Act sections, version 26 April 2024, and five draft offense links. It excludes the demerit schedule and subsidiary legislation. No general criminal penalties, rights provisions or judgment records have been fabricated to fill coverage gaps. The broader official reference directory remains available in the app.

## Obtain sources lawfully

Use original official legislation/judgments. Check publisher terms and download/access conditions before collecting. Public availability does not by itself authorize copying publisher headnotes, commentary, compilations, formatting or personal data. Never bypass blocked sources, sealed decisions or anonymization. Prefer permitted original machine-readable material; retain original public anonymization in case citations. Do not ingest party documents, private records or identifying user histories.

The local Traffic Act PDF identifies its version and states there is no copyright in its legislative content. Its PDF copy carries separate CC BY-NC-SA 4.0 terms. The prepared bundle extracts original legislative wording, with source attribution; it does not redistribute the PDF layout, cover or publisher commentary. Reassess terms before any commercial use or redistribution of publisher material. Starting points: [Kenya Law terms](https://kenyalaw.org/terms-of-use/), [ODPC data-protection laws](https://www.odpc.go.ke/data-protection-laws-kenya/).

The source manifest records the local PDF's SHA-256. The local PDF is ignored by Git. `scripts/prepare_legal_content.py` uses `pdftotext` and produces drafts, never a verification claim. PDF extraction can have wrapping/heading defects: compare every section before publishing it.

For authorized official XML downloads:

```sh
python3 scripts/fetch_legal_source.py --url OFFICIAL_HTTPS_URL --output /tmp/source.xml
python3 scripts/import_akn.py --input /tmp/source.xml --id penal-code-YYYY-MM-DD --title 'Penal Code' --version YYYY-MM-DD --source OFFICIAL_VERSION_URL --rights-basis 'Document the exact permission/basis and attribution' --output /tmp/bundle.json
```

The downloader stops on access restrictions or empty files. The XML importer rejects missing bodies/headings and leaves all verification dates null. Check extracted paragraph order, tables, schedules, repealed provisions and amendment notes. Do not treat extraction as legal interpretation or currency verification.

## Review and publish

1. Obtain and retain the official source/version and record its retrieval date and rights basis. Use a **new instrument ID for each version**, and version-specific provision IDs. Do not overwrite historical versions.
2. Compare the original provision, heading, all subsections, exceptions, alternative penalties, provisos and cross-references. Check amendments and relevant court decisions before claiming current coverage. Fix extraction defects before approval.
3. Set `verified_at` to the actual completed source-check timestamp. Add rights-topic tags only to provisions actually covering that topic. For offenses link both the defining and penalty provisions; keep full conditions rather than converting to a fixed fine. Do not invent a statutory minimum of zero.
4. For judgments verify the original citation, court, date, public URL and published anonymization. Link only genuinely related decisions. No headnotes, summaries, outcome predictions or claims about appeal status without a separate reviewed feature.
5. Validate and import the bundle through `/admin` or `npm run seed`. Every import is still draft even with verification dates. Imported data cannot set publication state.
6. Publish instruments first, then provisions, then offenses and judgment references. The API refuses missing verification/rights/parent requirements. Review the public screens and source links. The admin page lets you inspect full JSON and publish/withdraw individual records. Fix records by importing a corrected draft and republishing.

```sh
npm --prefix server run validate:data
python3 scripts/verify_data.py
# Running API; keep the admin token in an environment variable, never a command argument:
SHERIA_API_URL=https://your-domain.example/api/v1 python3 scripts/import_to_api.py --data /tmp/bundle.json
```

Set `SHERIA_ADMIN_TOKEN` separately in a protected environment. Seeds are idempotent upserts but **reimporting published content withdraws it**. Do not rerun a seed on every deploy. Content history preserves import and publication snapshots, not personal user activity.

## Future features

Plain-language explanations, translations and case summaries require qualified Kenyan legal review before public release. AI remains deferred until a reviewed corpus and a citation/accuracy evaluation exist. No API provider, embeddings or chatbot dependencies are introduced in this release.
