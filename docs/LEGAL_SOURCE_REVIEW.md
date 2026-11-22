# Traffic Act draft review — 22 November 2026

## Result and limits

The 153 draft sections match normalized wording extracted in both layout and raw modes from the supplied local PDF. This is a **mechanical historical-snapshot audit**, not current-law certification or legal advice. All `verified_at` values remain null, and no publication has occurred. Sheria Check provides legal information, is not a lawyer, and users should seek a qualified advocate's advice about their circumstances.

Source: Traffic Act, Cap. 403, version **26 April 2024**, Kenya Law/Laws.Africa. Local PDF SHA-256: `635fe5293117085eacddc74906bac815154e9a45f342498a68a6c3fe716c7855`. The local file is not committed. Machine-generated PDF creation metadata is not an effective-law/version date.

Reproducible evidence: `server/data/traffic-source.json`, `server/data/traffic-review.json`, and `python3 scripts/audit_traffic_snapshot.py`. The audit records physical PDF page numbers, independent extraction alignment and heading/body hashes; `verify_data.py` checks that the bindings remain current with the drafts. Two extraction modes can share a source defect and cannot replace a visual/source/legal review.

## Corrections made

| Section | Correction                                                                                                                                                                                    | Physical PDF pages |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| 11      | Restored the bracketed amendment reference dropped by the old blanket uppercase-line filter.                                                                                                  | 16                 |
| 48      | Joined the complete wrapped heading using the PDF's own table of contents; removed its continuation from body text. The source's spelling “trail” is retained rather than silently rewritten. | 30                 |
| 118A    | Restored the bracketed amendment reference dropped by the uppercase-line filter.                                                                                                              | 64–65              |

The extractor now removes only identified page footers and headers, preserving numbers and uppercase text inside provisions. Part-title continuation cleanup is limited to actual Part headings. No fine, sentence, legal interpretation, formal offense name or amount owed was invented or adjusted.

## Initial offense mapping review

The five draft links point to full historical sections, preserving conditions, alternatives, exceptions and disqualification wording. This confirms the stored reference targets in the local snapshot, not their present applicability or a charge against a person.

| Draft topic                            | Definition | Penalty reference | Publication status |
| -------------------------------------- | ---------- | ----------------- | ------------------ |
| Speed of motor vehicles                | Section 42 | Section 43        | Hold               |
| Driving under influence of drink       | Section 44 | Section 44        | Hold               |
| Reckless driving                       | Section 47 | Section 47        | Hold               |
| Driving without due care and attention | Section 49 | Section 49        | Hold               |
| Signals and signs                      | Section 52 | Section 52        | Hold               |

The `careless driving` search alias requires particular care: a colloquial search term is not a formal charge or a declaration that the legal elements match section 49. Qualified review is needed before treating synonyms as legal equivalents.

## Research leads requiring resolution

These are **review leads**, not incorporated law or approved case examples:

- The live consolidated Traffic Act page returned a bot challenge/access restriction during this review. No workaround or bulk retrieval was attempted. Current consolidation history could not be established from that response.
- The [Kenya Law legislation catalog](https://new.kenyalaw.org/legislation/?page=10) is indexed with 2026 Traffic (Drink-Driving), School Transport and Motor Vehicle Inspection instruments. The complete texts, commencement and applicable status still require an authorized source review.
- [National Assembly Hansard, 11 November 2026](https://parliament.go.ke/sites/default/files/2026-11/The%20Hansard%20-%20Wednesday%2C%2011%20November%202026%20%28A%29.pdf) discusses a Traffic (Amendment) Bill. A Bill/debate is not proof of an enacted or commenced amendment; do not import its proposals as law.
- The indexed official reference to [Kenya Human Rights Commission v NTSA and others, [2025] KEHC 4389 (KLR)](https://new.kenyalaw.org/akn/ke/judgment/kehc/2025/4389/eng@2025-04-03) identifies litigation relevant to the 2022 amendment. The full decision and subsequent history were not verified, so no outcome or precedent claim is recorded.
- The indexed official reference to [Nicholas Munge Kasuku v Republic, [2020] KEHC 6718 (KLR)](https://new.kenyalaw.org/akn/ke/judgment/kehc/2020/6718/eng@2020-04-09) flags charge-description issues relevant to the section 49 alias. Complete source and subsequent-treatment review remain pending. No case summary has been published.

## Requirements before publication

1. Record an applicable acquisition/reuse basis. Current [Kenya Law terms](https://kenyalaw.org/terms-of-use/) require arranging authorized bulk/API access; no project agreement is recorded. The old PDF notice does not establish collection permission under today's service terms.
2. Clarify the treatment and reuse of bracketed publisher/source amendment annotations. Do not present those annotations as operative statutory text or assume their reuse terms are identical to raw law.
3. Review a permitted current consolidation and relevant enacted amendments, commencement provisions, subsidiary instruments and judgments. Preserve historical IDs; use new version IDs where needed.
4. Complete visual comparison, source/date/permission evidence and any qualified review needed for interpretation or aliases. Only then set actual verification dates and publish through the existing controls.

Until these conditions are satisfied, the local text-alignment report must not be used to bypass draft/publication gates. The next collection and real case publication remain pending; the fictional visual demo can still be used for product testing.
