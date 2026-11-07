# Oil field-level evidence and partial Honda application cards

Date: 2026-11-07. Base: origin/main 86c4961, clean worktree. Branch: feature/oil-field-evidence. No merge. Research reused the already cached Honda documents; no new source downloads.

## Actual counts and status

| Collection | Count | Assessment/status |
| --- | ---: | --- |
| Selectable records | 31 | Original 29 plus 2 scoped partial cards |
| Existing Toyota records | 25 | Values, evidence, scope, IDs, order and stored verified status unchanged; new field assessment explicitly notAssessed |
| Existing foundation placeholders | 4 | Unchanged; no unsupported oil claims added |
| New field-assessed partial cards | 2 | Stored status remains preliminary; no automatic status upgrade |
| Research-only Honda records | 48 | Unchanged, preliminary, not exposed by URL/search/selector |
| Legacy quarantine | 59 | Unchanged and separate from researchRecords |

Ford is not published. No duplicate record is retained in records and researchRecords after the two moves. The selectable status distribution is verified=25, legacyPending=4, preliminary=2. Publication eligibility for the two partial cards is independent of stored record status. Legacy compatibility does not imply a new field-level confirmation: the UI explicitly labels it as unassessed.

## Honda publication scope

| Stable ID | Exact permitted scope | Identity/application evidence | Published oil path |
| --- | --- | --- | --- |
| honda-accord-sedan-2017-k24w1 | US MY2017 Accord Sedan LX; CR2E3 2WD 6MT or CR2F3 2WD CVT; K24W1 | Honda submission PDF 1 (author/US 49 CFR Part 565), 6 (exact application rows), 8 (engine characteristics) | SAE 0W-20 and API Certification Seal, subject to the displayed non-Honda-oil condition |
| honda-accord-sedan-2017-j35y1 | US MY2017 Accord Sedan EX-L CR3F8 or Touring CR3F9; both 2WD 6AT; J35Y1 | Same PDF pages 1, 6, 8; exact V6 rows, not an extrapolation from K24W1 | Same documented path; other applications and alternatives are not asserted |

Identity document: [American Honda 2017 Accord VIN submission ORG12691](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1e1420e9-41f7-4844-82b5-20981d327d77). The cached original page images were reviewed in the prior pilot; exact source rows, author and model-year scope were rechecked against the saved extraction for this change. The restricted scopes do not include other trims, Hybrid, Coupe or other markets/years.

Oil document: [Honda Brand Knowledge oil FAQ](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda). Exact HTML locators: Answer → viscosity chart → Accord → 2011–2020 L4 & V6; and Answer → Should I use genuine synthetic or ultimate full synthetic oil in my Honda? Source IDs, per-source SHA-256, excerpts, provenance, scoped identity binding and locator IDs are recorded in the two canonical entries.

The published API value is literally API Certification Seal. No API SN/SP, numbered ILSAC standard, ACEA class or Honda OEM approval is invented from branded-oil marketing. For non-Honda oil, the FAQ's premium-grade conventional oil / ultimate full synthetic blend condition, specified viscosity and API certification meaning are retained and localized. The UI calls this one documented path; it does not claim an exhaustive list of every manufacturer-permitted route.

## Unknown and withheld fields

For both partial cards, serviceFillCapacity, capacityUnit, capacityNote, serviceInterval, separate required/preferred OEM approvals, climate limitations and emissions equipment remain unknown in the new assessment. Capacity and interval show Not confirmed — check exact manual, with EN/ES/FR/DE equivalents.

The historical archive-derived quantities remain in the canonical entries only as unknown research claims. Their unconfirmed WORKING COPY source and captured notes remain traceable there. The generator omits that source and removes the quantities, units, capacity notes and interval from the public recommendation payload. Neither quantity is transferred between engine codes. Public source locators have no dangling archive references.

Known identity, displacement, fuel and aspiration are backed by the Honda submission. Known SAE and API certification requirement are backed by the scoped FAQ. Completeness is computed as partial (6 of 14 assessed technical fields confirmed), separately from credibility and record status.

## Implementation

- Existing values and sources remain the single source of truth. fieldEvidence references source/locator IDs, not a parallel table of duplicate technical values.
- The original exact-application path requires an explicit unambiguous review and exact application-code, trim, transmission, drivetrain and identity binding within a single cited row. Its behavior and existing records are preserved.
- The optional engineScoped path permits a manufacturer engine table covering all models in a documented market/model/year manual. It requires a catalogue-to-publication binding, the manual's all-model coverage, direct engineering identity and an explicit connected, acyclic locator chain. Every confirmed technical and requirement locator must identify that same engine, reference the all-model coverage and belong to the bound manual. Application exclusions or contradictory engine captions block this broad path. Trim/transmission/drivetrain are omitted only on this source-backed path; they are not populated with invented values. See [Toyota Canada production pilot](oil-toyota-canada-pilot.md).
- Conditional temporary SAE replacements retain nested anyOf/allOf, localized source-backed branch conditions, a structured locator substitution mapping and the mandatory return at the next oil change. Removing the condition, reversing the source path or publishing the temporary SAE outside that condition fails the engine-scoped gate. Passing either application path never upgrades record.status.
- engineIdentity distinguishes engineeringCode, officialVariantDesignation and vinEngineSymbol. Engineering identity reuses engineCode without a duplicate value; other identifier types store their literal value. Non-engineering identifiers cannot occupy engineCode or borrow an engineering-code locator.
- Confirmed fields require a supported scoped official source, reviewed official host, document hash, declared fields, exact page/section locator and matching evidence text. Declaring confirmed alone does not pass validation. This validates recorded evidence consistency; manual review of the original source is still required and is not replaced by a hash.
- Oil-selection allOf/anyOf operators require source-backed relations. Values are referenced by field/index. Localized conditions remain attached to the source locator; operator grouping and conditions are preserved in the UI.
- Unknown/conflicting application or oil requirements block the card. Optional unknown/conflicting quantity does not block a fully confirmed oil path, but its disputed value and source are withheld. Confirmed quantities require explicit service-fill-with-filter evidence and confirmed units.
- Completeness is derived. Legacy records without the new assessment are explicitly legacyUnassessed/notAssessed; existing Toyota values and sources are preserved, not silently relabeled confirmed.
- New field sources are accessible beside their fields. The global Verified badge is replaced by application/field assessments and independent completeness. Existing responsive layout, selectors and URL handling are retained.

SchemaVersion remains compatible; new assessment structures are optional for legacy data, but all four are required together for a new assessed entry. Existing verified/corroborated source minimums remain intact. Source domain/hash/text checks are deliberately conservative, not a universal automatic authenticity detector.

## Preservation hashes

- Original 29 records: eb3c6712f5bbb8965769e2642bedc9bd3a20dc14e6c1a0d492355f332e804ba0
- Toyota records: b1fe98b1f36d96c4a7275a1a0e039145b0acd93d6f7fd9da3c93ec9dc135d7ea
- Foundation placeholders: 9d941181bfaef945c133446d308a0eb6f4a946125acdeba0c581f9a14630840b
- Legacy quarantine: 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35
- Remaining 48 research records: 13c264988a7c32a748c0c563616bc5762f5a9dc1674f8bca7a9572595d3363ac

Protected PCD/Engine dataset and CI hashes remain tested. Only Oil UI hashes were removed from the old Batch 2 protected-file list because UI modification is explicitly part of this task.

## Files and validation

- assets/js/oil-guide.js
- data/oil/canonical.json
- data/oil/schema.json
- docs/oil-field-evidence.md
- docs/oil-production-batch-2.md
- oil-data.js
- oil-guide.html
- package.json
- scripts/oil/evidence.mjs
- scripts/oil/generate.mjs
- scripts/oil/validate.mjs
- tests/oil/fixtures/batch-1-production.json
- tests/oil/fixtures/batch-2-production.json
- tests/oil/fixtures/field-evidence.json
- tests/oil/oil-batch-1-production.test.mjs
- tests/oil/oil-batch-2-production.test.mjs
- tests/oil/oil-field-evidence.test.mjs
- tests/oil/oil-foundation.test.mjs
- tests/oil/oil-ui.test.mjs

Targeted Oil regression tests passed, including malformed references, unsupported literal values, row-level scope, unknown/conflicting application and requirements, source provenance, optional conflicting capacity suppression, typed identities, nested conditional allOf/anyOf, computed completeness and the actual browser controller with an in-memory DOM. Controller checks cover language switching, URL restoration, Back/Forward, Reset, Copy link, Enter search and blocked research URLs. Mobile CSS contract checks retain the existing single-column breakpoints and wrapping. No live-browser visual inspection was available; UI verification is structural/controller-based.

Package scripts inspected: npm test includes site:contract, oil:check (including the new field suite), all required PCD suites, Engine UI and engines:check. The first full run was interrupted during Engine UI when final review found a duplicated engineering identifier. After removing that duplication, one final full npm test run validates the final implementation; included suites are not run separately.

Final validation: PASS — npm test (exit 0) on the final implementation, including all Oil suites, site contracts, all PCD suites (3000 records) and Engine UI/policy/validation/generated/smoke/semantic checks (1702 records). Generated Oil data is current. The full successful log is retained only in the local temporary directory. git diff --check passes. Protected datasets/CI and the pre-existing ignored scripts/pcd/research-batch11.mjs are unchanged.

## Delivery

Commit subject: feat(oil): add field-level evidence and partial application cards. The final SHA, divergence and clean worktree/staging are reported in the handoff because this report is part of that same commit. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-field-evidence . Push targets this feature branch; merge is not performed. No downloaded PDF, cache, research script or local setting is included.
