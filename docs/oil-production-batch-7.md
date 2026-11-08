# Engine Oil Production Batch 7 — Toyota Canada MY2020

Date: 2026-11-08. Base: main a023f70 (Toyota Canada pilot merged by PR #80). AGENTS.md, current field-evidence rules and engine-scoped implementation read. Main synchronized from a clean worktree; branch feature/oil-production-batch-7 created. No technical network requests, source downloads or PDF extraction; saved documents, catalogue responses and prior selected-page reviews reused. No subagents.

## Result

Four appended records; all preliminary / partial. The gate does not upgrade status. Expected baseline 68 / 13 / 59 matched before edits. Final: **72 selectable / 13 research-only / 59 legacy quarantine**. Production recommendation cards: **68**, plus 4 selectable foundation placeholders. Selectable statuses: 25 verified existing Toyota / 43 preliminary / 4 legacyPending. No original record was edited or reordered; all 68 baseline records and public payload, all 13 research records and all 59 quarantine records are identical by frozen hashes. Existing Camry Canada pilot records are unchanged.

| New stable ID | Scoped application | Published requirement | With-filter service fill | Completeness |
| --- | --- | --- | --- | --- |
| toyota-corolla-sedan-2020-ca-2zr-fae | Canada MY2020 Corolla Sedan, non-hybrid, 2ZR-FAE | ILSAC GF-5 AND SAE 0W-20; conditional temporary 5W-20 | 4.2 L | partial, 6/14 |
| toyota-corolla-sedan-2020-ca-m20a-fks | Canada MY2020 Corolla Sedan, non-hybrid, M20A-FKS | API SN/RC AND SAE 0W-16; conditional temporary 0W-20 | 4.6 L | partial, 6/14 |
| toyota-rav4-hybrid-2020-ca-a25a-fxs | Canada MY2020 RAV4 Hybrid, A25A-FXS | API SN/RC AND SAE 0W-16; conditional temporary 0W-20 | 4.5 L | partial, 6/14 |
| toyota-tacoma-2020-ca-2gr-fks | Canada MY2020 Tacoma, non-hybrid, 2GR-FKS | ILSAC GF-5 AND SAE 0W-20; conditional temporary 5W-20 | unknown | partial, 3/14 |

The canonical model is Corolla, matching the official catalogue and cover; its visible engine-scope description explicitly limits these records to Sedan, not Hatchback or Hybrid. Generation remains unknown rather than inventing a platform code. Trim, transmission and drive attributes are absent because the published common engine-oil path is not conditioned on them. No identical FWD/AWD, transmission, trim or traction-battery records are manufactured.

## Source/locator chains

Every record uses the existing engineScoped path without modifying schema, validator, gate, UI or host policy:

Canadian catalogue locator → exact PDF URL + publication ID → cover/colophon model-year locator → positive all-model scope locator → direct engineering identity → engine-specific or explicitly shared oil-section locators. Application links are publication/sameDocument; every confirmed field/operator/condition has an applicabilityRef to the same all-model locator. Record scope declarations alone are not accepted.

Catalogue site: https://www.toyota.ca/en/owners/manuals/ . Cached selected responses:

- https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=corolla
- https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=rav4_hybrid
- https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=tacoma

Locator: data → seriesTitle / year 2020 / documents.allResults → publicationNo / documentUrl. These are official Toyota Canada entries with no production-month restriction attached to the selected Owner’s Manual. Recorded excerpts combine response fields and the Canadian site publisher context, explicitly identified as such; they do not claim to be a single verbatim sentence.

| Manual | Exact URL | Publication/printed code | PDF / printed locators |
| --- | --- | --- | --- |
| Corolla 2020 | https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM12K77U/OM12K77U.pdf | OM12K77U; Part No.01999-12K77; 01-1901-00, retained literally | Cover 1; colophon 592. All-model scope 8/6. Direct engine table 527/525. 2ZR-FAE oil 528–529/526–527. M20A-FKS oil 529–530/527–528. |
| RAV4 Hybrid 2020 | https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM0R031U/OM0R031U.pdf | OM0R031U; Part No.01999-0R031; 01-2006-00, retained literally | Cover 1; colophon 752. All-model scope 10/8. Single engine A25A-FXS 681/679. Drain/refill table 682/680. Selection/temporary SAE and operating warning 682–683/680–681. |
| Tacoma 2020 | https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM04025U/OM04025U.pdf | OM04025U; Part No.01999-04025; 01-1908-00, retained literally | Cover 1; colophon 612. All-model scope 10/8. Identity 538/536. Common oil-selection rule 539–540/537–538. No quantity locator or quantity field is published. |

Corolla has distinct lubrication headings for the two exact engine codes. Its coolant table distinguishes transmissions, but the engine-oil tables do not. RAV4 Hybrid has a single combustion engine table followed by one common lubrication section: technical locators explicitly cite the engine table and shared section across PDF 681–683. Different traction-battery types do not imply different engine oil requirements. Tacoma’s common selection rule follows the engine-labelled lubrication table; the locator quotes the V6 row heading and the shared selection text without its quantity cells. These are explicitly marked non-contiguous section fragments on cited pages, not fabricated single-row quotations. No requirement is borrowed from Camry or another engine just because viscosity is similar.

Previously reviewed Canadian support, not new field-source hosts: Corolla Sedan engine/grade context in https://media.toyota.ca/en/releases/2018/all-new-2020-toyota-corolla-sedan-ready-to-rock-the-sedan-world.html , section Dynamic Force is With You; Canadian V6 lineup in https://media.toyota.ca/en/specifications/2020/2020-tacoma.html , PDF 8–11. The primary publication/market/field chains above use only the already-reviewed www.toyota.ca catalogue/manual hosts. No media host was added.

## Quantities and conditions

Published values are the manual’s explicit Oil capacity (Drain and refill [Reference]), With filter column: Corolla 2ZR-FAE 4.4 qt. (4.2 L, 3.7 Imp. qt.); Corolla M20A-FKS 4.9 qt. (4.6 L, 4.0 Imp. qt.); RAV4 Hybrid A25A-FXS 4.8 qt. (4.5 L, 4.0 Imp. qt.). Production uses litres. The separate without-filter values 3.9 / 4.3 / 4.2 L are not service-fill recommendations. No dry-fill value is substituted.

All three quantities remain reference amounts. Notes preserve warming up, shutdown, waiting more than 5 minutes and checking the dipstick. RAV4 specifically requires turning off the hybrid system; this is not reduced to an engine-off instruction while the hybrid remains active.

Each requirement tree preserves preferred SAE AND its actual grade, OR temporary SAE AND the same grade under the source-backed unavailability condition, with mandatory return to the preferred SAE at the next oil change. The temporary grade is not an unconditional alternative. Conditions and high-speed/extreme-load warnings remain localized EN/ES/FR/DE. Diagrams do not establish hard numeric climate thresholds; the general higher-viscosity warning is not converted into additional approved SAE grades. Toyota Genuine Motor Oil wording does not become a mandatory OEM approval. coverage is documentedPath, not an exhaustive claim about all possible oil choices.

### Tacoma quantities — research/report only

OM04025U PDF 539 / printed 537 explicitly separates V6 towing-package quantities: with filter **5.8 L (6.1 qt.) without towing package**, **5.9 L (6.2 qt.) with towing package**; without filter is 5.6 L. These conditions cannot be lost in a single engine-wide value. No universal quantity is asserted, and no package-specific record is manufactured. The new Tacoma canonical record and public payload contain null quantity/unit/note with unknown assessment; numerical claims and quantity excerpts are absent from its sources, requirements and notes. A regression also rejects their appearance in the generated Tacoma payload and rendered cards.

Tacoma 2TR-FE is not added. Its row in the shared North American manual does not by itself close the Canadian MY2020 offering/application link; prior Canadian lineup review documented V6 entries, leaving this engine-specific market applicability unconfirmed. Omission from a brochure is not treated as proof that the engine could not exist. No further search was performed and the 13 Honda research records are not changed to hold a new Toyota candidate.

## Unknown fields

All four retain unknown displacement assessment, fuel assessment, aspiration, manufacturer approvals, interval, numeric climate limitations and emissions equipment. Source identity wording may describe gasoline engines, but unused optional fields are not auto-confirmed. Generation is unknown. Tacoma additionally has unknown quantity/unit/note. Unknown values stay withheld by the unchanged public generator. Status remains preliminary; completeness is computed separately.

## Integrity hashes (SHA-256)

| Projection | Hash |
| --- | --- |
| Baseline 68 canonical | 3f3f179093ee04a2b6edb23ef90a5bc44a4ea7a2babc432fef79d5b5e2ec31f4 |
| First 68 records | d219e162ddf19c1be6203571c223bc7377cc0a40e7289e4d5ac35052d8c702c3 |
| First 68 order | e7f5f7bacf9e0f16656352b6c460c750d2678384127b5e53b98dccdd22f09f9f |
| First 68 public payload | 56404ca4b50d13edc69a9dd4f41aaba52dcf650d252b45edb92f351e9ee2411c |
| Unchanged 13 research | 50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342 |
| Unchanged 59 quarantine | 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35 |
| New four records | 3886c5ec98647d87e514ce4f170affe7557ea620240a9e9c59aee1f39e239868 |
| Final canonical | 419cd4368880349d76a5824f9efc36e026adb14a1cc9431d3de1fe63e0982123 |
| Final records | 77a5371647f84671a60a8dced366c75a77c7f63054a26148485b5c59a1b92c82 |
| Final public records | ebc5f3649bae391a1491fe5c2229569d4085d0dac4ed1dcc2fbcabc053c0263c |
| https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM12K77U/OM12K77U.pdf | 22d34c6e29501071b28dcb2bbaacba4381f95c9919cd87e24188138c5874f3ce |
| https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=corolla | 731b979b05f561fe918c54e2d9ca382570ae1ee088b41eff1239cfe57286d99e |
| https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM0R031U/OM0R031U.pdf | 6f1afdfd87e62fa8f49806bfdbeea4ef7098c7fcbf673e262914231f77ef0244 |
| https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=rav4_hybrid | 1f9e47607938887259bb005288e899b2d6b4306cca4368d00a89a73be1bfaaad |
| https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM04025U/OM04025U.pdf | 0faf3cdd40e5a3f28dbaf76679c3b75fdf048e6c08d25647e574cd490aa386df |
| https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=tacoma | cbb21ff39b972128864d1e2a66d6a9ce95555e77a4c3d9027e284f20926ced66 |

The Batch 7 fixture freezes 24 protected file hashes including unchanged schema, evidence gate, UI, existing validators/generator, field policy, PCD/Engine datasets and CI. The pre-existing ignored scripts/pcd/research-batch11.mjs is preserved by hash. Historical tests retain record/order/public hashes and exact canonical baseline projections; only current counts/current payload freshness hashes and later-record slice bounds are updated. New completeness, sources and numeric values are separately frozen in the Batch 7 fixture.

## Changed files and validation

- data/oil/canonical.json
- docs/oil-production-batch-7.md
- oil-data.js
- package.json
- tests/oil/fixtures/batch-1-production.json
- tests/oil/fixtures/batch-2-production.json
- tests/oil/fixtures/batch-3-production.json
- tests/oil/fixtures/batch-4-production.json
- tests/oil/fixtures/batch-7-production.json
- tests/oil/fixtures/field-evidence.json
- tests/oil/fixtures/result-ux.json
- tests/oil/oil-batch-2-production.test.mjs
- tests/oil/oil-batch-3-production.test.mjs
- tests/oil/oil-batch-4-production.test.mjs
- tests/oil/oil-batch-5-production.test.mjs
- tests/oil/oil-batch-7-production.test.mjs
- tests/oil/oil-field-evidence.test.mjs
- tests/oil/oil-foundation.test.mjs
- tests/oil/oil-toyota-canada-pilot.test.mjs

Targeted oil:check — PASS (validation, generated freshness and all Oil suites). The latest Batch 7 targeted regression also passes after adding an explicit cross-specification rejection. It covers immutable baseline records/public/order and research/quarantine; source and page chains; engine-specific SAE/specification/quantity; temporary-SAE conditions; hybrid shutdown; Tacoma quantity suppression; rejected market/year/engine/requirement/capacity substitutions; no 2TR-FE insertion; no duplicates; research URL separation; EN/ES/FR/DE selector/URL/card behavior and generated freshness.

Final npm test — PASS, run once after the last code/data/test change. Existing package scripts covered site contract, Oil validation/freshness/all suites including Batch 7, PCD checks/all batch/selector/security suites, Engines UI/policies/validation/freshness/smoke/semantic comparison. No constituent suite was separately rerun after this full pass. Saved source-byte/local-file hash audit and git diff --check passed. Staged-file allowlist audit — PASS: exactly 19 intended Oil/package/test/report files; exact baseline projection, 24 protected hashes, no temporary artifacts, and no unstaged changes. Two extra fixture status entries were content-identical after Git line-ending normalization and introduce no committed change. Only this report validation note was completed after the full pass; no code or data changed.

No UI change or live-browser visual inspection was necessary; rendered-card/controller regressions are not described as visual checks. npm test already includes all required site/Oil/PCD/Engines suites; no separate final constituent reruns are needed. Temporary PDF caches, dumps and one-off research/build scripts remain outside the repository. Final SHA, divergence and clean worktree/staging state are reported after push; no merge or PR API call. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-production-batch-7?expand=1
