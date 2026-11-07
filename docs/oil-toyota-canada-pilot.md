# Toyota Canada Camry MY2020 production pilot

Date: 2026-11-08. Base: main 6e8afad (Batch 6 merged via PR #79). Clean worktree before branch feature/oil-toyota-canada-pilot. No technical network research or PDF download/extraction in this production task; the earlier pilot cache and its reviewed catalogue/PDF pages were reused. No subagents. The ignored local scripts/pcd/research-batch11.mjs is preserved by SHA-256.

## Result and status

Two appended engine-scoped applications: toyota-camry-2020-ca-a25a-fks and toyota-camry-2020-ca-2gr-fks. Both remain preliminary and partial (6/14 technical fields confirmed); they are not promoted to verified by the gate. The existing 25 verified Toyota entries are unchanged.

| Collection | Before | After |
| --- | ---: | ---: |
| Selectable | 66 | 68 |
| Production recommendation cards | 62 | 64 |
| Foundation placeholders (within selectable) | 4 | 4 |
| Research-only Honda | 13 | 13 |
| Legacy quarantine | 59 | 59 |

Selectable statuses: legacyPending 4 / verified 25 / preliminary 39. The first 66 canonical records and their public payload, order, 13 research entries and 59 quarantine entries are preserved exactly. No separate duplicate FWD/AWD cards were created.

## Evidence chain and exact source locators

1. Official catalogue: https://www.toyota.ca/en/owners/manuals/ . Its public selector provides literal seriesName camry; the selected response is https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=camry . Locator: data → seriesTitle Camry, year 2020, documents.allResults → publicationNo OM06158U and documentUrl. It binds the exact Canadian model-year catalogue entry to the PDF below. No production-month restriction is attached to the Owner's Manual; the March 2020 restriction belongs to separate multimedia manual OM06159U. The recorded excerpt combines response fields and Canadian site publisher context, as explicitly noted in the source; it does not pretend that this is one verbatim sentence.
2. Manual: https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM06158U/OM06158U.pdf . Publication OM06158U; Part No.01999-06158; printed code 02-2003-01 (retained literally, not interpreted as a date). PDF 1 cover identifies Camry 2020; PDF 624 colophon establishes publication identity. PDF 83 / printed 81 explicitly addresses vehicles sold in Canada; PDF 432 / printed 430 distinguishes Canada/USA. The catalogue identifies Toyota Canada Inc.; the file is its own DAM publication, not an archival third-party copy. Hashes support cache integrity, not source applicability by themselves.
3. PDF 10 / printed 8: manual applies to all models and explains optional equipment. This is the positive all-model scope evidence. PDF 435 / printed 433 distinguishes 2WD/AWD where necessary, and PDF 546–547 / printed 544–545 splits their dimensions; the oil table does not split those dimensions.
4. PDF 549 / printed 547: exact engineering identities A25A-FKS and 2GR-FKS, with their respective gasoline engine headings. No engineering identity is inferred from a VIN symbol or displacement alone.
5. PDF 550 / printed 548: Oil capacity (Drain and refill [Reference]), columns With filter / Without filter. Separate engine rows: A25A-FKS with filter 4.8 qt. (4.5 L, 4.0 Imp. qt.); 2GR-FKS with filter 5.7 qt. (5.4 L, 4.8 Imp. qt.). Production uses the explicitly stated litres. Without-filter values 4.2 L / 5.3 L and dry-fill values are not published as service-fill. The footnote requires warming and stopping the engine, waiting more than 5 minutes, then checking the dipstick. PDF 440 / printed 438 warns against overfilling; both source pages are cited by the capacity note.
6. A25A-FKS: PDF 550 / printed 548, grade API SN/RC and recommended SAE 0W-16. If unavailable, SAE 0W-20 may be used, but must return to 0W-16 at the next oil change.
7. 2GR-FKS: PDF 551–552 / printed 549–550, grade ILSAC GF-5 and recommended SAE 0W-20. If unavailable, SAE 5W-20 may be used, but must return to 0W-20 at the next oil change.

The separately reviewed Canadian brochure https://media.toyota.ca/content/dam/media-toyota/general/unassigned/20145/20-camry-brochure-en.pdf (PDF 10–14; publisher on 20) corroborates the Canadian gasoline and 2.5 AWD offerings. It is not needed to invent trim/katashiki mappings and is not included as a production field source. No V6 AWD application is asserted. No media.toyota.ca host was added because it is not needed by the production evidence chain.

The minimal scope is factory Canada MY2020 Camry with the literal engineering code, not hybrids, engine swaps, other years or other markets. The common engine table applies to documented variants under the manual; it is not an assertion that every engine/drivetrain combination exists. Trim, application code and transmission are not conditions of this table and are left absent. Generation is explicitly unknown, not an invented platform code; the new scope card does not display that marker as a generation claim.

## Gate change

The exact-application single-row path is retained without editing or reassessing any prior record. The new optional applicationEvidence.scopeType engineScoped uses the same source objects, evidenceRefs, source locators and field values. engineScope names the catalogue, publication, all-model coverage and engineering-identity locators, with explicit publication/sameDocument links. A publication link must match both the original PDF URL and publication ID in the catalogue text. The catalogue must establish the record market, model and years. Missing, disconnected or cyclic links fail.

Every confirmed field and every requirement operator/condition must reference the bound manual, an exact single-engine caption and the positive all-model locator. Contradictory engine captions, application exclusions and quantity transfer between engines fail. Filling a source.scope or declaring confirmed alone is insufficient. Adding a narrow condition to the manual requires a separately evidenced narrower application; this broad path rejects it.

Only www.toyota.ca was added, limited to /content/dam/toyota/documents/manuals/en/ and the exact catalogue endpoint /bin/api/get-manuals.toyota.en.json. HTTPS, existing official source types, provenance review, SHA-256, scope, literal value and locator checks remain required. No wildcard, arbitrary subdomain or arbitrary Toyota path is accepted.

The existing requirement tree expresses two complete paths per engine: preferred SAE AND the applicable grade, OR temporary SAE AND the same grade under an explicit condition. The substitution locator stores preferred/temporary indices into the existing SAE values, not duplicate values. Its original text must establish preferred unavailability and mandatory return; every use of the temporary index must inherit that condition. A flat unconditional SAE alternative or reversed substitution fails. coverage remains documentedPath, not an assertion that all possible manufacturer options have been enumerated.

The general high-speed/extreme-load viscosity warning remains visible with the preferred path in EN/ES/FR/DE. It does not create another SAE or a numerical climate threshold. Branded oil is not converted into an OEM approval.

## Unknown fields and UI

Confirmed: engineering identity, SAE, industry specification, service-fill quantity, unit and capacity note. Displacement, fuel assessment, aspiration, manufacturer approvals, interval, climate thresholds and emissions equipment remain unknown in the new field assessment; none are inferred merely to make the card complete. Unknown values stay withheld under the existing generator rules.

UI changes are limited to rendering the localized engine-scope description in the existing application summary and omitting an unknown generation marker for this path. No redesign, dependencies or new URL parameters. Requirement conditions and reference-quantity procedure are visible; detailed sources remain in existing disclosures. Existing exact-application output, selectors, Reset/Back/Forward/Copy-link behavior and mobile styling are unchanged and covered by existing controller/DOM regressions. No live-browser visual inspection was performed; these are not described as visual layout checks.

## Integrity hashes (SHA-256)

| Projection | SHA-256 |
| --- | --- |
| Baseline canonical | ff9955e3881ccb905ef36a753fe5e83ef3d92fe80b517852d81d1549ba032eb6 |
| First 66 records | 6836c7ff5e0d301320efb558c8c19619e6577f1f30d992d64cd1962d5f8054de |
| First 66 order | 5e95430a87bb1a4452d149543dac96f0a4287794b299c1b5ba7b56ecd4b36371 |
| First 66 public payload | f57673e959cfa9ed5fbe0cdb6177c82e62cb53f05808898d318a7ca094d3e59e |
| Unchanged 13 research | 50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342 |
| Unchanged 59 quarantine | 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35 |
| New records | 0a4db4dfdb8be7451b7638629ba05547f17a89569d8721bebf6dffec756ce816 |
| Final canonical | 3f3f179093ee04a2b6edb23ef90a5bc44a4ea7a2babc432fef79d5b5e2ec31f4 |
| Final public records | 56404ca4b50d13edc69a9dd4f41aaba52dcf650d252b45edb92f351e9ee2411c |
| https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM06158U/OM06158U.pdf | 00fac19441e181ae0e4626cc20f61d68731e4d9444699e4ca667d232a8f069d1 |
| https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=camry | 572ab0a01fe46963a53dc44e2a8b5d6bc788facd8ce76c039dd54dedbb16b697 |

Twenty unchanged protected dataset/generator/validator/CI files retain their frozen hashes in the pilot fixture. Historical fixtures update only current counts/current payload hashes and the hashes of explicitly authorized Oil schema/evidence/UI files. Their historical record/order/public hashes remain frozen; Batch 5 additionally reconstructs its exact 66-record canonical projection. No baseline assertion is dropped.

## Validation and delivery

Targeted oil:check passed (validation, generated freshness and all Oil suites including the new pilot). The new regression covers missing scope evidence, unconfirmed market, engine conflicts, excluded variants, cross-engine capacity, broken/cyclic chains, unconditional or reversed temporary SAE, arbitrary hosts/paths, optional capacity suppression, immutable baselines, duplicate prevention, research separation and EN/ES/FR/DE selectors/URLs.

Final npm test — PASS, run once after the final code/data/test changes. Its existing package scripts covered site contract, Oil validation/generated freshness/all regressions (including this pilot), PCD validation/freshness/all batch/selector/security suites, and Engines UI/policies/validation/freshness/smoke/semantic comparison. No constituent suite was separately rerun after this full pass. Read-only source-byte/local-file hash audit and git diff --check passed. Staged-file allowlist audit — PASS: exactly 23 intended files, 20 protected hashes, no temporary artifacts and no unstaged changes. No code or data edits followed the final test; only this validation note was completed.

Changed scope: Oil canonical/generated data, schema/evidence module, the two-line scope UI adaptation, package Oil test registration, Oil fixtures/regressions, this report and field-evidence policy documentation. PCD, Engines and CI are unchanged. Temporary PDFs, catalogue dumps and one-off scripts stay outside the repository. Only explicit task files will be staged. Commit SHA and final divergence/worktree state are reported after push, because a commit cannot contain its own hash. No PR API call and no merge. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-toyota-canada-pilot?expand=1
