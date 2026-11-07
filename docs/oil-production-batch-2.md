# Engine Oil Production Batch 2

Checked: 2026-11-07. Branch: feature/oil-production-batch-2. No merge.

## Result

Selectable: **29 → 79**. Quarantine: **59 → 59**. Added: **50 Honda US records**, all **verified**, 0 corroborated, 0 preliminary. Total statuses: 4 legacyPending + 75 verified. Honda is a new selectable make; all 50 additions are non-Toyota. Model years: 2017 = 20, 2018 = 18, 2019 = 12.

Baseline is origin/main merge commit `82e0b20e55a66e46e5e7c5c6b650402317f44f06`, PR #72 (Oil Production Batch 1), containing commit 43bf764. Main was fast-forwarded and a separate branch created from it. Worktree and staging were clean at the start.

The first 29 records retain their values, order and original source formatting. All 59 quarantine records are unchanged. Foundation records changed: **none**. Only the audit selectable count is updated. No PCD/Engine dataset, Oil UI, CI workflow, tire calculator or diagnostic link changed. Local excluded scripts/pcd/research-batch11.mjs was neither edited nor staged.

## Candidate review

Reviewed candidate set: **54** exact oil applications; **50 accepted**, **4 excluded**. Source discovery also screened unrelated motorcycles, electric/fuel-cell models, Acura documents, and repeated/revised filings; these are documents outside the candidate set, not extra rejected oil records.

- 2019 Fit L15B1: Unresolved viscosity conflict: Honda FAQ says 0W-16 with 0W-20 top-off, service guide says 0W-20.
- 2019 Fit L15B3: Same unresolved 2019 Fit viscosity conflict; no extrapolation from 2017.
- 2018 Civic Coupe L15BY: Revised VIN filing ORG14912 binds L15BY to CVT sedan rows, not coupe rows.
- 2019 Accord Hybrid LFB1: Use revised ORG16345: only LFB2 appears. Do not carry earlier LFB1/LFB2 mapping into the revised year-specific scope.

Honda/Acura was the first manufacturer assessed and supplied exact identity mappings in the initial candidate sample. Ford/Lincoln, Hyundai/Kia and Lexus were not researched after Honda proved productive. No engine code was inferred from displacement. Separate body styles, model years and literal codes have separate records; equivalent trim/drivetrain applications use a common record only when the cited service rows have the same oil requirements and fill quantity. L15BY is limited to the documented CVT sedan application. The coupe is not assigned that code.

## Evidence and limitations

All three evidence layers have one publisher: **American Honda Motor Co., Inc.** They are jointly used for verified status and are not claimed to be independent corroboration.

1. Original Honda 49 CFR Part 565 submissions, publicly hosted by NHTSA: model-code tables bind exact engine codes to make/model/model year; Engine Characteristics tables give fuel, displacement and turbocharging. Generation labels are the documented model-code prefixes, not inferred marketing generations. Each fixture row records example full VIN model codes and exact PDF pages.
2. Original Honda Vehicle Service Quick Reference Guide, publication 01120-15664, v25 (2010), copyright 2020: model/year/application-specific SAE and oil-change capacity explicitly including the filter. It is an **archival copy hosted at laboratoryb.org**, not a Honda-hosted URL; the PDF metadata calls its PowerPoint source a working copy. Authorship, publication identifier and per-page Honda copyright are recorded; this hosting/provenance limitation is disclosed for review. NHTSA identity evidence and Honda's live FAQ are separate official-host sources. The mirror is not counted as a second publisher.
3. Honda Brand Knowledge FAQ: API Certification Seal, energy conserving/latest API requirement, and the model/year viscosity chart. No API SN/SP category, numbered ILSAC standard, ACEA class or HTO-06 approval is inferred from marketing claims about Honda-branded oils. Empty OEM-approval arrays are intentional.

The Honda TechInfo server returned a maintenance response; no inaccessible document was used as evidence. SAE 0W-20 is recorded for accepted applications. Capacities use US liquid quarts in this US service publication, not dry-engine or filter-excluded quantities. No service interval is published. Emissions hardware stays unknown with localized VIN warnings: the cited US oil rows do not distinguish emissions-dependent specifications. This batch does not authorize extrapolation to EU/JP or diesel/DPF applications.

Research cache: **87 PDF documents and 3 HTML pages** saved successfully (about 45.1 MiB). Every saved URL was downloaded once; parsing, OCR, rotation, image review and cross-checks reused local bytes. **26 PDFs + 1 HTML source (27 unique URLs)** are cited in production. Those 27 cached documents support 150 record-source associations across 50 records. Old NHTSA filenames have sparse metadata; screening included motorcycle and superseded filings. No PDFs, OCR text, images, caches or research scripts are included in the commit.

OCR errors were checked against original page images where ambiguous (including 2017 CR-V RW6H3, Odyssey RL5H2, Fit L15B1/L15B3 and Accord engine characteristics). Service-table column alignment was visually checked, including Civic 1.5/2.0 and CR-V 1.5/2.4 filter-included rows.

## Distribution of additions

| Make | Records |
| --- | ---: |
| Honda | 50 |

| Model / body style | Records |
| --- | ---: |
| Accord Coupe | 3 |
| Accord Hybrid | 3 |
| Accord Sedan | 6 |
| Civic Coupe | 6 |
| Civic Hatchback | 3 |
| Civic Sedan | 8 |
| Civic Type R | 3 |
| Clarity Plug-In Hybrid | 1 |
| CR-V | 6 |
| Fit | 2 |
| HR-V | 2 |
| Odyssey | 1 |
| Passport | 1 |
| Pilot | 3 |
| Ridgeline | 2 |

| Exact engine code | Records |
| --- | ---: |
| J35Y1 | 2 |
| J35Y2 | 1 |
| J35Y6 | 6 |
| J35Z8 | 1 |
| K20C1 | 3 |
| K20C2 | 6 |
| K20C4 | 2 |
| K24V9 | 2 |
| K24W1 | 2 |
| K24W9 | 2 |
| L15B1 | 1 |
| L15B3 | 1 |
| L15B7 | 6 |
| L15BA | 3 |
| L15BE | 4 |
| L15BY | 2 |
| LEB3 | 1 |
| LFB1 | 1 |
| LFB2 | 2 |
| R18Z9 | 2 |

| Market | Records |
| --- | ---: |
| US | 50 |

## Hashes (SHA-256)

Semantic = JSON.stringify(records); order = JSON.stringify(record IDs); canonical = JSON.stringify(parsed canonical object). CanonicalFile = original file text normalized to LF; unlike canonical, this includes indentation. The initial on-disk canonical byte hash before LF normalization was 2a3ecc703539d05dd1f294c771a032eeed21b632600bc63ea994e55f824aa043 (CRLF checkout).

| Hash | Baseline | Final |
| --- | --- | --- |
| Semantic | `eb3c6712f5bbb8965769e2642bedc9bd3a20dc14e6c1a0d492355f332e804ba0` | `800831cd2c0f5e32441f09cdfcd5dbb7a690569c7567c76e29acf7ff79d97323` |
| Order | `ec8ca024af97aa8eaa9b10f9f9a94dc7c0d05734fed31075e7b7bd2f2847b48e` | `428034181e818ad46052d040141c4cdc9ec274818d27dfdcd1a1c299752b2868` |
| Canonical | `606a917678e6d067a41986d4b18b4001d8676b59e62c3d21da62691d0d54a551` | `8fa525362ad005635458ee81ab60c4a5535f6faa10a730417c90a75a151f1960` |
| CanonicalFile | `851719a475ea1cd4bef69569322a023d222c22a623257f70f7df5c1f778ff8ed` | `51511cbecfdd4c80371e53d55ea9a020ef5b1a5ca6b172314460a2187a3bb407` |

Quarantine semantic hash, unchanged: `429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35`. Protected-file hashes for all PCD/Engine data, Oil UI and CI are fixed in the Batch 2 fixture (19 files).

## Production source URLs

The fixture stores each document's SHA-256 and each record's reviewed source/page/model-code mapping.

1. [ORG12691](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1e1420e9-41f7-4844-82b5-20981d327d77)
2. [Honda service guide (archival copy)](https://downloads.laboratoryb.org/insight/gen3/General/Vehicle%20Service%20Reference%20Guide.pdf)
3. [Honda API/oil FAQ](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda)
4. [ORG13067](https://vpic.nhtsa.dot.gov/mid/home/displayfile/276a71b1-b16e-4e8e-9df1-2b632fe3a482)
5. [ORG12791](https://vpic.nhtsa.dot.gov/mid/home/displayfile/3805431c-668c-4728-91ec-9f58b04836a1)
6. [ORG13596](https://vpic.nhtsa.dot.gov/mid/home/displayfile/0ab40410-03d7-49e1-a287-b37f57769c07)
7. [ORG13749](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d7fff56b-9cb5-4e25-84e1-c1c3cb03b327)
8. [ORG12690](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b942e273-5d1c-4f11-a116-d0bc078d6567)
9. [ORG12950](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b9edb03d-0e1d-43cb-ade7-cf1b4724f0dd)
10. [ORG13202](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8b728c8d-3722-43a0-a9ba-97901955bf77)
11. [ORG13061](https://vpic.nhtsa.dot.gov/mid/home/displayfile/22ed9662-747f-42c1-aaf1-01cfc140af72)
12. [ORG12626](https://vpic.nhtsa.dot.gov/mid/home/displayfile/88c781a0-bb06-4bce-bfde-3c809e2ebe1e)
13. [ORG15191](https://vpic.nhtsa.dot.gov/mid/home/displayfile/68416e36-62dd-4e37-a4b1-e02f1c05ac47)
14. [ORG14825](https://vpic.nhtsa.dot.gov/mid/home/displayfile/cce7e74c-c2ee-4d31-9bce-fd904f943200)
15. [ORG14826](https://vpic.nhtsa.dot.gov/mid/home/displayfile/e750b73e-0b2d-4214-8ca5-08bf1419a1fe)
16. [ORG14912](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7)
17. [ORG14121](https://vpic.nhtsa.dot.gov/mid/home/displayfile/2157ff4f-4a84-49e9-b0b4-a9255a90a5fb)
18. [ORG14654](https://vpic.nhtsa.dot.gov/mid/home/displayfile/fb670f66-8920-4992-ad57-a54c0be34c71)
19. [ORG14740](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8c68f0cd-5358-4c50-baa2-09e2c1645fe6)
20. [ORG14120](https://vpic.nhtsa.dot.gov/mid/home/displayfile/a4517625-b4f5-4904-a7ba-f840487a9df8)
21. [ORG14800](https://vpic.nhtsa.dot.gov/mid/home/displayfile/4ff74c2d-6c0b-4aa3-9614-c3c4362efc03)
22. [ORG14645](https://vpic.nhtsa.dot.gov/mid/home/displayfile/9a0bea6f-3c89-4fc8-a7ca-a13a7ccdaec7)
23. [ORG16345](https://vpic.nhtsa.dot.gov/mid/home/displayfile/6001f75f-398f-4b15-b1c7-d6c650c854c0)
24. [ORG16024](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b)
25. [ORG16023](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1eb6055c-3b42-429b-8dd9-2055c34c301c)
26. [ORG16069](https://vpic.nhtsa.dot.gov/mid/home/displayfile/5bb13080-7d9a-47c3-9a95-cc2846951798)
27. [ORG16052](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b22ac049-4750-4ce5-ab4c-85e914879975)

## Files changed

- data/oil/canonical.json
- data/oil/schema.json
- oil-data.js
- package.json
- scripts/oil/validate.mjs
- tests/oil/fixtures/batch-1-production.json
- tests/oil/fixtures/batch-2-production.json
- tests/oil/oil-batch-1-production.test.mjs
- tests/oil/oil-batch-2-production.test.mjs
- tests/oil/oil-foundation.test.mjs
- tests/oil/oil-ui.test.mjs
- docs/oil-production-batch-2.md

Canonical records are appended; oil-data.js is generated. Schema/validator gain optional evidence notes and unique positive page locators. Batch 1 stays bounded to its original 25 additions, with a current total-count expectation; foundation totals and the selector make expectation are updated. Batch 2 checks counts, baseline/quarantine/final hashes, source mappings, filter fills, duplicates, exact codes, parity, selectors, URL round trips and protected files.

## Validation

Targeted Batch 2 tests and oil validation passed during development. The prescribed final full cycle is recorded below after it runs once.

One final full cycle ran successfully, with no full-cycle rerun:

| Command | Result |
| --- | --- |
| npm run oil:check | PASS |
| npm test | PASS |
| npm run pcd:check | PASS, 3000 records |
| npm run engines:check | PASS, 1702 records unchanged |
| npm run site:contract | PASS |
| git diff --check | PASS |
| staged-file audit | PASS, 12 explicitly allowed files; no research/cache/PCD/Engine/UI/CI changes |

The requested npm test entry point itself invokes oil/PCD/Engine checks internally; each requested top-level command above was issued once. Full logs stayed in the temporary research directory, outside the commit.

PCD target remains 3000; Engine data remains unchanged. The fixture verifies dataset bytes (LF normalized), not just record counts.

## Delivery and usage

Commit SHA, post-push divergence and final worktree/staging state are reported in the handoff because embedding a commit's own SHA in its contents is self-referential. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-production-batch-2 . Merge is not performed.

Weekly-limit change: **not measurable**. No account quota/weekly-limit telemetry is exposed to this session; before/after readings are unavailable, so no percentage is fabricated. No subagents were used. No Fast-mode switch was requested or enabled during this work.
