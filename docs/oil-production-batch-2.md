# Oil Batch 2: preliminary research quarantine correction

Historical snapshot of the quarantine correction. The current field-level assessment publishes two scoped partial cards without capacities and leaves 48 records research-only; see [the field-evidence report](oil-field-evidence.md). Stored Honda statuses remain preliminary.

Date: 2026-11-07. Existing branch: feature/oil-production-batch-2. Parent implementation: dd08f9289b9d671d7db8ebb097c2158127499bcb. No new source research or document downloads. No merge.

## Actual counts

| Layer | Count | Meaning |
| --- | ---: | --- |
| Public/selectable baseline records | 29 | Unchanged first 29 records, in original order |
| Reviewed production recommendations | 25 | Existing verified Toyota records; no new Honda recommendations |
| Existing selectable placeholders | 4 | Existing legacyPending exact-code placeholders; no oil quantities or specifications published |
| New preliminary research records | 50 | Honda, researchRecords only; excluded from browser payload |
| Existing legacy quarantine | 59 | Unchanged legacyRecords; separate from new research |
| Batch 2 production additions | 0 | All 50 unsupported Honda applications withdrawn from production |

Public statuses: 25 verified + 4 legacyPending. Research statuses: 50 preliminary, 0 verified, 0 corroborated. The former 50 verified claim is withdrawn. Research candidate audit: 54 considered, 0 accepted for production, 50 retained as preliminary, 4 previously excluded.

## Reason for quarantine

All 50 records retain three explicit unresolved issues:

- Archived WORKING COPY provenance is unconfirmed.
- Capacity with filter has no confirmed official source.
- Applicability of capacity to the exact engine code is unproven.

The archived document is titled Vehicle Service Quick Reference Guide — Covering 2013–2020 Honda Vehicles, 38 pages. Printed attribution: American Honda Motor Co., Inc.; printed copyright 2020; publication 01120–15664; Version 25 (2010). The parenthesized label is not treated as a 2010 publication year. Cached PDF metadata: creation 2020-10-15, author Patrick Vizconde, PowerPoint title containing WORKING COPY; no digital signature. The author's relationship to Honda and approval/publication of this edition have not been established.

The file is hosted by downloads.laboratoryb.org, outside Honda domains. Branding, printed copyright and a publication number are not proof that the copy is an authentic approved Honda publication. No official Honda link to this archive or matching official-hosted file was established. SHA-256 identifies the inspected bytes only: 1ba1f55c88fb9091a0eaa8160da2b77bdfcd96fc1ee15237884d9fe7f2d9e5ab.

The archive contains model/year/displacement rows for SAE and quantities marked with filter, but does not directly establish the capacity binding to the exact engine codes in these 50 records. All 50 capacity values depended exclusively on this unconfirmed copy. Therefore all 50 are research claims, not verified recommendations. Two independent reliable capacity sources were not established, so corroborated is also unsupported.

Honda VIN submissions hosted by NHTSA still supply the recorded vehicle/year/engine-code identity evidence. The Honda Brand Knowledge FAQ supplies the generic API certification requirement and model/year SAE chart; it supplies neither exact engine codes nor service-fill capacities. References to API SN or ILSAC GF-5 in marketing descriptions of Honda oil are not treated as mandatory per-engine specifications. An inaccessible TechInfo document is not evidence.

## Preservation and enforcement

Canonical researchRecords retains all 50 IDs, order, captured technical values, source URLs, source page locators and research evidence notes. Notes and capacity notes now carry warnings in EN/ES/FR/DE. The archive is explicitly an unconfirmed technicalReference attributed to Honda, not an authenticated serviceManual. The substantive captured quantities and identity/source mappings remain available for later research. Captured values do not authorize maintenance recommendations.

Existing records and legacyRecords were restored exactly from the preserved Batch 1 baseline. Research is a separate top-level collection; none of its 50 entries is added to the old 59-entry quarantine. Oil UI has no safe status-specific capacity gate, so researchRecords is completely omitted from oil-data.js. The generated browser payload equals the Batch 1 payload byte-for-byte after LF normalization (SHA-256 b55a30822d2bcd78253f07be3188c299dc38d733ed19d32199322892612774b0). No Honda research ID, source URL or disputed capacity record is exposed by selectors, quick search or URL state.

The canonical schema and validator require preliminary status and nonempty researchIssues in researchRecords, reject preliminary or unresolved evidence in public records, and preserve the existing verified/corroborated checks. The generator independently filters preliminary/unconfirmed records even if validation is bypassed. Neither PCD nor Engines data, CI workflows or Oil UI files changed. The excluded local scripts/pcd/research-batch11.mjs remains untouched.

## Affected research applications

Each engine code in each row below identifies a separate preliminary record. Full IDs, captured values, page locators and original document hashes are in tests/oil/fixtures/batch-2-production.json.

| Model year | Model / body style | Exact engine codes retained as research |
| --- | --- | --- |
| 2017 | Accord Coupe | J35Y1, J35Y2, K24W1 |
| 2017 | Accord Sedan | J35Y1, K24W1 |
| 2017 | Civic Coupe | K20C2, L15B7 |
| 2017 | Civic Hatchback | L15BA |
| 2017 | Civic Sedan | K20C2, L15B7 |
| 2017 | Civic Type R | K20C1 |
| 2017 | CR-V | K24V9, K24W9, L15BE |
| 2017 | Fit | L15B1, L15B3 |
| 2017 | HR-V | R18Z9 |
| 2017 | Odyssey | J35Z8 |
| 2017 | Pilot | J35Y6 |
| 2017 | Ridgeline | J35Y6 |
| 2018 | Accord Hybrid | LFB1, LFB2 |
| 2018 | Accord Sedan | K20C4, L15BE |
| 2018 | Civic Coupe | K20C2, L15B7 |
| 2018 | Civic Hatchback | L15BA |
| 2018 | Civic Sedan | K20C2, L15B7, L15BY |
| 2018 | Civic Type R | K20C1 |
| 2018 | Clarity Plug-In Hybrid | LEB3 |
| 2018 | CR-V | K24V9, K24W9, L15BE |
| 2018 | HR-V | R18Z9 |
| 2018 | Pilot | J35Y6 |
| 2018 | Ridgeline | J35Y6 |
| 2019 | Accord Hybrid | LFB2 |
| 2019 | Accord Sedan | K20C4, L15BE |
| 2019 | Civic Coupe | K20C2, L15B7 |
| 2019 | Civic Hatchback | L15BA |
| 2019 | Civic Sedan | K20C2, L15B7, L15BY |
| 2019 | Civic Type R | K20C1 |
| 2019 | Passport | J35Y6 |
| 2019 | Pilot | J35Y6 |

## Source URLs retained

The 27 URLs and their cached document hashes are preserved; no new sources were sought during this correction. Their presence is traceability, not a declaration that every field is verified.

1. [ORG12691](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1e1420e9-41f7-4844-82b5-20981d327d77)
2. [Unconfirmed WORKING COPY](https://downloads.laboratoryb.org/insight/gen3/General/Vehicle%20Service%20Reference%20Guide.pdf)
3. [Honda oil/API FAQ](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda)
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

Previously excluded research candidates remain recorded:

- 2019 Fit L15B1: Unresolved viscosity conflict: Honda FAQ says 0W-16 with 0W-20 top-off, service guide says 0W-20.
- 2019 Fit L15B3: Same unresolved 2019 Fit viscosity conflict; no extrapolation from 2017.
- 2018 Civic Coupe L15BY: Revised VIN filing ORG14912 binds L15BY to CVT sedan rows, not coupe rows.
- 2019 Accord Hybrid LFB1: Use revised ORG16345: only LFB2 appears. Do not carry earlier LFB1/LFB2 mapping into the revised year-specific scope.

## SHA-256 invariants

- Baseline/public semantic: eb3c6712f5bbb8965769e2642bedc9bd3a20dc14e6c1a0d492355f332e804ba0
- Baseline/public order: ec8ca024af97aa8eaa9b10f9f9a94dc7c0d05734fed31075e7b7bd2f2847b48e
- Original 59-entry legacy quarantine: 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35
- Baseline canonical object (researchRecords omitted): 606a917678e6d067a41986d4b18b4001d8676b59e62c3d21da62691d0d54a551
- Corrected complete canonical object: 2cf978f2e4373fe42a52a579a33356abb9b1fd81e033340ff8c621d93e200d07
- Corrected canonical file, LF normalized: c60e6546adfd9f2b38224863ab5ea658297fb91f3c1683212f52de364be41005
- Preliminary research semantic: 0f6c37f563326bb592681adc26360536840b8f8f487f33c4c857fbed4364830d
- Preliminary research order: 0b9f7a4624a844a35c85e287550915a294c852e230efc039d4928b8cd8d89861
- Preserved captured research claims (excluding status/disclaimers/source metadata): cb68852aa4fcec447da72e48fd9020fb5873f73fab4712a399ffd8a51fb56aa5
- Preserved per-record source URL order: 3e6d644bf84b33607792ecedd541ff79c38aa7b5cf897eecb7787600631bfe62

## Verification and delivery

Package scripts inspected: npm test already includes site:contract, oil:check (including the Batch 2 regression suite), PCD checks/tests, Engine UI and engines:check. The correction uses one full npm test run. These included suites are not rerun separately. Targeted Batch 2 regression tests passed during development.

Final full validation: **npm test PASS (one full run)**. Its included site, Oil, PCD and Engine suites all passed; no separate full-suite reruns. Oil regression tests confirm the unchanged 29-record baseline and 59 legacy records, 50 preliminary research records, no Honda research in the browser payload, rejected promotion into production and defensive generator exclusion. PCD remains 3000; Engine data remains 1702 and unchanged.

Pre-commit checks: git diff --check PASS; staged-file allowlist audit PASS (12 Oil data/pipeline/test/report files only). No PCD/Engine datasets, CI, Oil UI, downloaded documents, research scripts or local settings are staged. Final commit SHA and clean worktree/staging are reported after push in the handoff.

The required commit subject is fix(oil): quarantine unsupported Honda batch 2 claims. The final commit SHA and post-push worktree/staging/divergence are supplied in the handoff; the report is included in that same commit. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-production-batch-2 . Push targets the existing branch; merge is not performed.
