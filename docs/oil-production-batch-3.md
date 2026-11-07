# Oil Production Batch 3 — Honda partial applications

Date: 2026-11-07. Base: main 004f536 (merge PR #74); 068075f was confirmed as its ancestor. Main synchronized with a clean tracked/untracked worktree before creating feature/oil-production-batch-3. The pre-existing ignored scripts/pcd/research-batch11.mjs is preserved. No source download, TechInfo retry, new candidate or other manufacturer research was performed. No schema, UI, evidence-policy implementation, PCD, Engine or CI file changed.

## Counts

| Stage | Selectable | Research-only | Legacy quarantine |
| --- | ---: | ---: | ---: |
| Baseline | 31 | 48 | 59 |
| Final | 42 | 37 | 59 |

Reviewed 15 existing records: 11 accepted partial cards, 4 retained in research. Another 33 research records were not reviewed. All 37 remaining research records are unchanged. The first 31 selectable records, their order and public payload, and the 59 legacy quarantine entries are unchanged. Final stored statuses: verified 25 (existing Toyota), legacyPending 4, preliminary 13 (the two existing partial cards plus eleven Batch 3 cards). No status was raised. There are 38 oil-recommendation cards plus 4 selectable foundation placeholders; the partial cards do not claim full verification.

## Exact accepted scope

Every row below is US MY2017 only. No other trim, transmission, drivetrain, body style or year is inferred. Transmission spelling is normalized from 6M/T and 6A/T to 6MT and 6AT where necessary. The first Accord Coupe J35Y1 application was checked end to end before applying the same method to the remaining candidates.

| Stable ID | Published applications | Direct Honda identity/application document | FAQ viscosity locator | Completeness |
| --- | --- | --- | --- | --- |
| honda-accord-coupe-2017-j35y1 | CT2B8 EX-L 6AT 2WD | [ORG12691](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1e1420e9-41f7-4844-82b5-20981d327d77) PDF 1, 7, 8 | Accord → 2011–2020 L4 & V6 | 6/14 |
| honda-accord-coupe-2017-j35y2 | CT2A8 EX-L 6MT 2WD | [ORG12691](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1e1420e9-41f7-4844-82b5-20981d327d77) PDF 1, 7, 8 | Accord → 2011–2020 L4 & V6 | 6/14 |
| honda-accord-coupe-2017-k24w1 | CT1A3 LX-S 6MT 2WD; CT1B3 LX-S CVT 2WD | [ORG12691](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1e1420e9-41f7-4844-82b5-20981d327d77) PDF 1, 7, 8 | Accord → 2011–2020 L4 & V6 | 6/14 |
| honda-civic-coupe-2017-k20c2 | FC4B5 CIVIC LX CVT 2WD | [ORG13067](https://vpic.nhtsa.dot.gov/mid/home/displayfile/276a71b1-b16e-4e8e-9df1-2b632fe3a482) PDF 1, 7, 8 | Civic → 2012–2020 All others | 5/14 |
| honda-civic-coupe-2017-l15b7 | FC3B3 CIVIC EX CVT 2WD | [ORG13067](https://vpic.nhtsa.dot.gov/mid/home/displayfile/276a71b1-b16e-4e8e-9df1-2b632fe3a482) PDF 1, 7, 8 | Civic → 2012–2020 All others | 5/14 |
| honda-civic-hatchback-2017-l15ba | FK7H3 LX CVT 2WD | [ORG12791](https://vpic.nhtsa.dot.gov/mid/home/displayfile/3805431c-668c-4728-91ec-9f58b04836a1) PDF 1, 6, 7 | Civic → 2012–2020 All others | 6/14 |
| honda-civic-sedan-2017-k20c2 | FC2E5 CIVIC LX 6MT 2WD; FC2F5 CIVIC LX CVT 2WD | [ORG13067](https://vpic.nhtsa.dot.gov/mid/home/displayfile/276a71b1-b16e-4e8e-9df1-2b632fe3a482) PDF 1, 6, 8 | Civic → 2012–2020 All others | 5/14 |
| honda-civic-sedan-2017-l15b7 | FC1F3 CIVIC EX CVT 2WD | [ORG13067](https://vpic.nhtsa.dot.gov/mid/home/displayfile/276a71b1-b16e-4e8e-9df1-2b632fe3a482) PDF 1, 6, 8 | Civic → 2012–2020 All others | 5/14 |
| honda-cr-v-2017-l15be | RW1H5 CR-V EX CVT 2WD; RW2H5 CR-V EX CVT 4WD | [ORG13749](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d7fff56b-9cb5-4e25-84e1-c1c3cb03b327) PDF 1, 3, 4 | CR-V → 2010–2020 | 6/14 |
| honda-fit-2017-l15b1 | GK5G5 FIT LX 6MT 2WD | [ORG12690](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b942e273-5d1c-4f11-a116-d0bc078d6567) PDF 1, 6, 7 | Fit → 2011–2017 | 6/14 |
| honda-hr-v-2017-r18z9 | RU5G3 HR-V LX 6MT 2WD; RU6H3 HR-V LX CVT 4WD | [ORG12950](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b9edb03d-0e1d-43cb-ade7-cf1b4724f0dd) PDF 1, 6, 7 | HR-V → 2016–2020 | 6/14 |

Honda authored the VIN filings: each retained original PDF cover bears American Honda Motor Co., Inc., its signed regulatory submission and 49 CFR Part 565 / 2017 model-year application. They are hosted by NHTSA, not an independent compilation. Covers and the exact tables were visually checked from saved PDF images; the existing text/OCR extraction was reused. SHA-256 values for the original PDF bytes are in the Batch 3 fixture and canonical sources. Nothing was re-downloaded.

Oil source for every accepted row: [Honda Brand Knowledge — What type of motor oil should I use in my Honda?](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda). Precise locators are Answer → viscosity chart → the family/year row listed above, and Answer → Should I use genuine synthetic or ultimate full synthetic oil in my Honda? The cached HTML was checked once and reused. Its SHA-256 is 7327de3b2d9c5ab92ed16a7fcf3ad860ba86c00228af53325a3c9c37fde3481f.

Direct evidence: the filing rows bind exact engine code to model/application code, trim, transmission and drive system; covers bind author, US regulatory scope and model year. The characteristics tables directly establish gasoline, cylinder class and aspiration; seven accepted records also have explicit litre displacement. The FAQ directly establishes SAE 0W-20 for the stated family/year categories and the API Certification Seal condition.

Reviewed applicability joins: exact Sedan/Coupe/Hatch identities belong to the named Accord/Civic family. The ordinary Civic LX/EX applications are non-hybrid gasoline variants and map to the chart's All others category, outside the separately listed GX/Natural Gas, Hybrid and Si categories. The published hatchback is LX only, excluding the separate Sport/Sport Touring performance column. Supplemental FAQ evidence explicitly binds to the direct identity source. These joins are recorded as reviewed applicability reasoning, not as a claim that the FAQ prints engineering codes.

## Oil path and unknown fields

Each card publishes one documented path: SAE 0W-20 AND API Certification Seal, under the original condition for non-Honda oil (premium conventional oil OR ultimate full synthetic blend, specified viscosity, API certification indicating energy conservation and the latest API requirement). The existing localized condition and allOf structure are retained. This is not an exhaustive list of every manufacturer option. No API SN/SP, ILSAC number, ACEA class or OEM approval is invented.

Capacity, unit, quantity note, interval, required/preferred OEM approvals, climate limitations and emissions-equipment assessment remain unknown for every new card. Archived quantities and source notes are retained canonically as unconfirmed research claims only; the archive source, numbers, units, notes and interval are absent from public recommendations. UI displays the existing localized Not confirmed — check exact manual message.

For four Civic Sedan/Coupe cards (K20C2 and L15B7), the source displacement entries are 1995 and 1496 without a stated unit. This batch does not confirm the previously captured rounded litre values: displacement is unknown and null publicly. Their computed completeness is 5/14; the other seven cards are 6/14. Every card remains partial.

## Retained research candidates

- honda-civic-type-r-2017-k20c1: Identity is directly evidenced (ORG13596 PDF 1,6,7); this batch does not establish Type R-specific applicability of the FAQ All others oil route.
- honda-cr-v-2017-k24v9: ORG13749 PDF 3 lists K24W9/K24V9 for the same LX rows; exact engine-to-application choice is unresolved.
- honda-cr-v-2017-k24w9: ORG13749 PDF 3 lists K24W9/K24V9 for the same LX rows; exact engine-to-application choice is unresolved.
- honda-fit-2017-l15b3: ORG12690 PDF 6 repeats the CVT application codes for L15B1 and L15B3; no distinguishing condition is proven.

Fit L15B1 is accepted only as GK5G5 LX 2WD 6MT, not its ambiguous CVT rows. CR-V L15BE EX RW1H5/RW2H5 has direct single-code rows and is assessed independently from the ambiguous LX variants. No attempt was made to bypass these gaps or expand the search. No blocking schema/UI defect was required to publish the accepted scoped cards; the existing explicit manual review remains necessary to interpret ambiguous source tables.

## Integrity hashes (SHA-256 over canonical JSON values)

| Projection | SHA-256 |
| --- | --- |
| First 31 baseline records | 0d1ff337888cf318c138f53322b84de51d77753802b6dcde24d1772b0b95d8f2 |
| Baseline record order | dde43a44ecd1c3044950d84145ce3907961e322aef08c8ad66413da1095552f5 |
| Baseline public payload | bab33fb180329fe490fcf086cb33171590abfeaf8fa743cec4606612c818dc0c |
| Original 48 research records | 13c264988a7c32a748c0c563616bc5762f5a9dc1674f8bca7a9572595d3363ac |
| Remaining 37 research records | 50877b540fa9d58cb9bc75b3cb622fe67ef1cd41809b4fc0032618464ca93e15 |
| Legacy quarantine | 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35 |
| Final canonical content | d4e2d5c34524a36d12d34993d6dfa15a3eeded4cd0ceb482970e9cb865f9fce6 |
| Final public records | 77130a72ab4f9ea3bea6ce9eb5d9fcc10af1a46c7f1454b75fca15683d66df01 |

The fixture also pins every remaining research record, archived source, accepted exact scope, document hash/locator, confirmed field set, and protected schema/UI/policy/PCD/Engine/CI files. Temporary PDFs, images, extraction dumps and one-use research scripts remain outside the repository.

## Files and validation

Changed: data/oil/canonical.json, generated oil-data.js, package.json; new tests/oil/fixtures/batch-3-production.json and tests/oil/oil-batch-3-production.test.mjs; current aggregate counts/hashes in the existing Batch 1/2 and field-evidence fixtures, foundation/Batch 2/field tests; this report. Prior immutable baseline hashes and strict evidence/verified/corroborated rejection tests remain in force. The Batch 2 fixture explicitly tracks the current disposition of the original 50 candidates (13 partial / 37 research), while the new Batch 3 fixture pins the independent 31-record pre-batch baseline.

Targeted npm run oil:test: PASS. New regression covers immutable baseline/public payload, exact scopes, gate rejection for unknown/conflicting application or requirements and mismatched scope, missing locators, suppression of disputed claims, optional unknowns/completeness, duplicates, all remaining research IDs, selectors, EN/ES/FR/DE URL/card cases and generated freshness. Existing real-controller Reset/Back/Forward/Copy link tests pass. Schema, UI and evidence implementation are unchanged; no new visual UI inspection was needed.

Package scripts inspected: npm test includes site:contract, oil:check (validate, generated check, all Oil suites including Batch 3), all PCD suites, Engine UI and engines:check. Run the final full npm test once; do not separately repeat included suites.

Final full npm test: PASS (exit 0), run once after the final data/test/package changes. Includes Oil validation and all regressions, generated freshness, site contracts, all PCD suites (3000 records), Engine UI/policy/validation/generated/smoke/semantic checks (1702 records). Logs remain temporary and are not committed. Independent comparison against the saved pre-change canonical baseline confirms the first 31 records, all 59 quarantine entries and the remaining 37 research records are identical. git diff --check passes.

## Delivery

Requested commit: feat(oil): add Honda application batch 3. Final SHA, branch divergence and worktree/staging status are reported in the handoff because this report belongs to the same commit. Push only feature/oil-production-batch-3; no merge. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-production-batch-3?expand=1 .
