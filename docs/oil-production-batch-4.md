# Oil Production Batch 4 — Honda research conversion

Date: 2026-11-07. Main c14b496 contains the Batch 3 merge PR #75; 8dca774 was verified as an ancestor. Main was synchronized with a clean worktree, then feature/oil-production-batch-4 was created. The pre-existing ignored scripts/pcd/research-batch11.mjs is preserved by SHA-256 comparison. No new document downloads, TechInfo retries, new candidates, other makes or subagents.

## Counts and preservation

| Stage | Selectable | Research-only | Legacy quarantine |
| --- | ---: | ---: | ---: |
| Baseline | 42 | 37 | 59 |
| Final | 57 | 22 | 59 |

Reviewed 20 existing candidates, accepted 15 partial cards, retained 5 with specific application ambiguity reasons. Another 17 research records were not reconsidered and remain byte-equivalent as JSON values. The first 42 selectable entries, order and public payload are identical to baseline; all 59 quarantine entries are unchanged. Accepted IDs move once from researchRecords to records; total IDs remain 79 with no duplicates.

Final stored selectable statuses: verified 25 (unchanged Toyota), legacyPending 4, preliminary 28. Of 57 selectable entries, 53 are recommendation cards and 4 are foundation placeholders. No Honda status was raised. The new cards are partial, with computed completeness 6/14; they are not fully verified records. Ford is not published.

Previously declined Batch 3 records were skipped: Civic Type R 2017, CR-V 2017 K24V9/K24W9, Fit 2017 L15B3. Type R 2018/2019 were also skipped because the same oil-applicability gap lacks a new closing source. Their incidental presence on a shared Honda table page is not a new review or publication.

## Accepted scope and direct sources

Every application below is US only, with the stated model year. Other trims, transmissions, drive systems, body styles, hybrid variants and years are excluded. 6M/T and 6A/T are normalized to 6MT and 6AT. Honda's original 4WD wording is retained rather than silently replaced with AWD.

| Stable ID | MY | Published application scope | Honda/NHTSA identity and characteristics | FAQ exact viscosity row |
| --- | --- | --- | --- | --- |
| honda-odyssey-2017-j35z8 | 2017 | RL5H2 ODYSSEY LX 6AT 2WD | [ORG13202](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8b728c8d-3722-43a0-a9ba-97901955bf77) PDF 1, 6, 7 | Odyssey → 2011–2020 |
| honda-pilot-2017-j35y6 | 2017 | YF5H1 PILOT LX 6AT 2WD; YF6H1 PILOT LX 6AT 4WD | [ORG13061](https://vpic.nhtsa.dot.gov/mid/home/displayfile/22ed9662-747f-42c1-aaf1-01cfc140af72) PDF 1, 6, 7 | Pilot → 2012–2020 |
| honda-ridgeline-2017-j35y6 | 2017 | YK2F5 RIDGELINE RTL 6AT 2WD; YK3F5 RIDGELINE RTL 6AT 4WD | [ORG12626](https://vpic.nhtsa.dot.gov/mid/home/displayfile/88c781a0-bb06-4bce-bfde-3c809e2ebe1e) PDF 1, 6, 7 | Ridgeline → 2012–2019 |
| honda-accord-sedan-2018-k20c4 | 2018 | CV2E3 ACCORD Sport 6MT 2WD; CV2F3 ACCORD Sport 10AT 2WD | [ORG14825](https://vpic.nhtsa.dot.gov/mid/home/displayfile/cce7e74c-c2ee-4d31-9bce-fd904f943200) PDF 1, 6, 7 | Accord → 2011–2020 L4 & V6 |
| honda-accord-sedan-2018-l15be | 2018 | CV1F1 ACCORD LX CVT 2WD | [ORG14826](https://vpic.nhtsa.dot.gov/mid/home/displayfile/e750b73e-0b2d-4214-8ca5-08bf1419a1fe) PDF 1, 6, 7 | Accord → 2011–2020 L4 & V6 |
| honda-civic-coupe-2018-k20c2 | 2018 | FC4B5 CIVIC LX CVT 2WD | [ORG14912](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7) PDF 1, 7, 8 | Civic → 2012–2020 All others |
| honda-civic-coupe-2018-l15b7 | 2018 | FC3B3 CIVIC EX-T CVT 2WD | [ORG14912](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7) PDF 1, 7, 8 | Civic → 2012–2020 All others |
| honda-civic-hatchback-2018-l15ba | 2018 | FK7H3 LX HONDA SENSING CVT 2WD | [ORG14121](https://vpic.nhtsa.dot.gov/mid/home/displayfile/2157ff4f-4a84-49e9-b0b4-a9255a90a5fb) PDF 1, 6, 7 | Civic → 2012–2020 All others |
| honda-civic-sedan-2018-k20c2 | 2018 | FC2F5 CIVIC LX CVT 2WD | [ORG14912](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7) PDF 1, 6, 8 | Civic → 2012–2020 All others |
| honda-civic-sedan-2018-l15b7 | 2018 | FC1E3 CIVIC EX-T 6MT 2WD | [ORG14912](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7) PDF 1, 6, 8 | Civic → 2012–2020 All others |
| honda-clarity-plug-in-hybrid-2018-leb3 | 2018 | ZC5F1 CLARITY PLUG-IN HYBRID PHEV CVT 2WD; ZC5F3 CLARITY PLUG-IN HYBRID TOURING CVT 2WD | [ORG14654](https://vpic.nhtsa.dot.gov/mid/home/displayfile/fb670f66-8920-4992-ad57-a54c0be34c71) PDF 1, 6, 7 | Clarity Plug-in → 2018–2019 |
| honda-cr-v-2018-l15be | 2018 | RW1H5 CR-V EX CVT 2WD; RW2H5 CR-V EX CVT 4WD | [ORG14740](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8c68f0cd-5358-4c50-baa2-09e2c1645fe6) PDF 1, 6, 7 | CR-V → 2010–2020 |
| honda-hr-v-2018-r18z9 | 2018 | RU5G3 HR-V LX 6MT 2WD; RU6H3 HR-V LX CVT 4WD | [ORG14120](https://vpic.nhtsa.dot.gov/mid/home/displayfile/a4517625-b4f5-4904-a7ba-f840487a9df8) PDF 1, 6, 7 | HR-V → 2016–2020 |
| honda-pilot-2018-j35y6 | 2018 | YF5H1 PILOT LX 6AT 2WD; YF6H1 PILOT LX 6AT 4WD | [ORG14800](https://vpic.nhtsa.dot.gov/mid/home/displayfile/4ff74c2d-6c0b-4aa3-9614-c3c4362efc03) PDF 1, 6, 7 | Pilot → 2012–2020 |
| honda-ridgeline-2018-j35y6 | 2018 | YK2F5 RIDGELINE RTL 6AT 2WD; YK3F5 RIDGELINE RTL 6AT 4WD | [ORG14645](https://vpic.nhtsa.dot.gov/mid/home/displayfile/9a0bea6f-3c89-4fc8-a7ca-a13a7ccdaec7) PDF 1, 6, 7 | Ridgeline → 2012–2019 |

The VIN documents are original American Honda Motor Co., Inc. submissions on the official NHTSA vPIC host. Saved cover images show Honda letterhead, a signed submission, 49 CFR Part 565 and the model/model year. The cited table images were visually checked, using cached original bytes and existing extraction/OCR once per document. Redacted unrelated areas in the Accord updates were not used as evidence. Source IDs, original-byte SHA-256 values, exact pages, excerpts and scope are retained in canonical data and the Batch 4 fixture.

Oil source: [Honda Brand Knowledge — What type of motor oil should I use in my Honda?](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda). Cached HTML SHA-256: 7327de3b2d9c5ab92ed16a7fcf3ad860ba86c00228af53325a3c9c37fde3481f. SAE locator: Answer → viscosity chart → each family/year row above. Specification/condition locator: Answer → Should I use genuine synthetic or ultimate full synthetic oil in my Honda? No TechInfo manual was fetched for quantity.

Direct evidence: application rows bind engine code to exact model/application code, trim, transmission and drive system; covers bind author, model year and US regulatory scope. Characteristics tables establish the recorded explicit litre displacement, fuel/electrification, cylinder category and aspiration. FAQ rows directly state 0W-20 for the named family/year category; the text directly states the API Certification Seal requirement.

Reviewed applicability joins: ordinary Civic LX/EX-T non-hybrid gasoline applications fall into All others rather than the separately listed GX/Natural Gas, Hybrid or Si categories. Civic Hatch publication is LX Honda Sensing only; the Sport/Sport Touring column and Type R are excluded. Accord Sport K20C4 has its own 6MT/10AT rows; Accord LX L15BE uses its CVT row. Clarity is explicitly Plug-In Hybrid/PHEV in the application table and Plug-in Hybrid in the characteristics, with electricity primary and gasoline secondary; its own Clarity Plug-in FAQ row applies. These are documented manual scope reviews and supplemental identity bindings, not claims that the FAQ itself prints engineering codes.

Special restriction: Civic Sedan L15B7 2018 publishes only FC1E3 EX-T 2WD 6MT. The same filing's CVT L15B7/L15BY pairs and Si rows are excluded. Pilot cards use LX 6AT only; Touring/Elite 9AT are not included. Separate model-year filings were checked for the 2017 and 2018 Pilot/Ridgeline records; applicability was not carried across years by assumption.

## Oil path, unknowns and research claims

One documented path is published: SAE 0W-20 AND API Certification Seal, under the preserved non-Honda-oil condition (premium conventional oil OR ultimate full synthetic blend, specified viscosity, API certification indicating energy conservation and the latest API requirement). Existing localized conditions and allOf structure are reused unchanged. The UI says other manufacturer options may exist; no exhaustive list is claimed. No API SN/SP, numbered ILSAC, ACEA class or OEM approval is invented.

For every new card, service-fill quantity, quantity unit/note, interval, required/preferred OEM approvals, climate limitations and emissions-equipment assessment remain unknown. Captured WORKING COPY capacities and archive notes remain canonically for traceability only; archive provenance and exact-engine quantity applicability remain unproved. The generated recommendation omits the archive source and withholds the disputed numbers, units, quantity notes and interval. The existing localized Not confirmed — check exact manual message is used. No quantity is transferred between engine codes or transmissions.

All fifteen new displacements have an explicit L unit in the cited original table; none was sourced from the archive. The four older Civic displacement assessments that were unknown before this batch remain unknown and unchanged.

## Newly retained candidates

- honda-accord-hybrid-2018-lfb1: Batch 4: ORG15191 PDF 6 lists LFB1/LFB2 together for every Accord Hybrid application; no condition selects exact LFB1. [Original Honda filing](https://vpic.nhtsa.dot.gov/mid/home/displayfile/68416e36-62dd-4e37-a4b1-e02f1c05ac47), PDF 6 (application), 7 (characteristics).
- honda-accord-hybrid-2018-lfb2: Batch 4: ORG15191 PDF 6 lists LFB1/LFB2 together for every Accord Hybrid application; no condition selects exact LFB2. [Original Honda filing](https://vpic.nhtsa.dot.gov/mid/home/displayfile/68416e36-62dd-4e37-a4b1-e02f1c05ac47), PDF 6 (application), 7 (characteristics).
- honda-civic-sedan-2018-l15by: Batch 4: ORG14912 PDF 6 lists L15B7/L15BY together for the CVT applications; no unique application or distinguishing condition for L15BY is proved. [Original Honda filing](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7), PDF 6 (application), 7 (characteristics).
- honda-cr-v-2018-k24v9: Batch 4: ORG14740 PDF 6 lists K24W9/K24V9 together for CR-V LX RW5H3/RW6H3; exact-code selection is unresolved. [Original Honda filing](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8c68f0cd-5358-4c50-baa2-09e2c1645fe6), PDF 6 (application), 7 (characteristics).
- honda-cr-v-2018-k24w9: Batch 4: ORG14740 PDF 6 lists K24W9/K24V9 together for CR-V LX RW5H3/RW6H3; exact-code selection is unresolved. [Original Honda filing](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8c68f0cd-5358-4c50-baa2-09e2c1645fe6), PDF 6 (application), 7 (characteristics).

Only these five research entries receive an appended application-gap reason in researchIssues and their identity source notes; prior URLs, captured technical values and three mandatory archive warnings are retained. The other 17 research entries are untouched. No unresolved application is published, and the evidence gate was not changed to admit these entries. No systemic blocker requiring schema/UI/policy changes was encountered.

## SHA-256 integrity

Hashes use canonical JSON values (or normalized text for protected files).

| Projection | SHA-256 |
| --- | --- |
| Baseline first 42 records | f525cf257c5cc61047627c8ec295a2bbdac992885e807c4e446614c26be6142c |
| Baseline record order | 0bc8f56e79b76ae87bef6e132b97e0e2b9a7a832b0a10f06ec7e0636670e6305 |
| Baseline public records | 77130a72ab4f9ea3bea6ce9eb5d9fcc10af1a46c7f1454b75fca15683d66df01 |
| Baseline canonical content | d4e2d5c34524a36d12d34993d6dfa15a3eeded4cd0ceb482970e9cb865f9fce6 |
| Original 37 research entries | 50877b540fa9d58cb9bc75b3cb622fe67ef1cd41809b4fc0032618464ca93e15 |
| Unchanged 17 research entries | 362d21a09d0ed07dbc2b322d32289a78a29b0f58cb89f9e1a104054fed8bf188 |
| Final 22 research entries | 42a7c1cf6795932cade459c4f24c6bc378602153b91cf3f443f36b2c43983b75 |
| Legacy quarantine | 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35 |
| Final canonical content | 86559d3bfa483d2d9f435496dcba3b1a88365e312b8f4688fb7645f8111f1bcf |
| Final public records | 757c3b3ba19e263985ca04da571e1f848ce54513bf0640e57fc4c67918dd0e11 |

The Batch 4 fixture also pins each original research record, each accepted application, original archive-source hash, original source URLs and cached PDF hashes. Batch 3's historical 42-record/public/canonical hashes remain frozen and match this baseline; its current aggregate overlay tracks the later data without erasing its historical acceptance audit.

## Changes and validation

Changed: data/oil/canonical.json, generated oil-data.js, package.json; new tests/oil/fixtures/batch-4-production.json and tests/oil/oil-batch-4-production.test.mjs; current totals/hashes in Batch 1/2/field fixtures, the Batch 3 current overlay, and foundation/Batch 2/3/field tests; this report. Schema, UI, evidence.mjs, validator/generator implementation, PCD, Engines and CI are unchanged and protected by hashes. The Batch 2 fixture explicitly tracks the original 50 Honda candidates' current disposition (28 partial / 22 research), with all statuses still preliminary.

Targeted npm run oil:test: PASS. Regression covers the unchanged 42-record baseline/order/public payload, legacy quarantine, source IDs/locators/scope, gate rejection for unknown/conflicting requirements/application and bad scope, optional unknowns, disputed-value suppression, computed partial completeness, stable IDs/duplicates, all research-only IDs, annotation-only deferred changes, skipped prior failures, multilingual selector/card/representative URLs and generated freshness. Existing real-controller Reset/Back/Forward/Copy link checks pass. UI is unchanged.

Package scripts inspected: npm test includes site:contract, oil:check (validation, generated freshness, all Oil suites including Batch 4), all PCD suites, Engine UI and engines:check. Final full npm test runs once after final data/test/package changes; included checks are not separately repeated.

Final full npm test: PASS (exit 0), run once after the final data/test/package changes. Includes Oil validation and all regressions, generated freshness, site contracts, all PCD suites (3000 records), Engine UI/policy/validation/generated/smoke/semantic checks (1702 records). No included suite was rerun separately. Successful logs remain temporary. Only this documentation result was updated afterward; git diff --check verifies it.

## Delivery

Commit subject: feat(oil): add Honda application batch 4. The final SHA, divergence and worktree/staging state are reported in the handoff because this report is part of that commit. Push feature/oil-production-batch-4; no merge. Temporary PDFs, renders, dumps and one-use scripts remain outside the repository. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-production-batch-4?expand=1 .
