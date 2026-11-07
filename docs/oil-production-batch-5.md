# Engine Oil Production Batch 5 — Honda applications

Date: 2026-11-07. AGENTS.md and the current Oil field-evidence policy/validator were read before editing. PR #77 is merged at main 3f0646d; its feature commit e29b32f is an ancestor. Main was safely fast-forwarded with a clean worktree before creating feature/oil-production-batch-5. The pre-existing ignored scripts/pcd/research-batch11.mjs is preserved by hash. PR creation API will not be retried; the known 403 is handled with the compare link below.

## Counts and disposition

| Stage | Selectable | Research-only | Legacy quarantine |
| --- | ---: | ---: | ---: |
| Expected and actual baseline | 57 | 22 | 59 |
| Final | 66 | 13 | 59 |

Considered 10 existing research records: 9 accepted as scoped partial cards, 1 retained. Each new card has one exact application code (9 applications total); no new candidate or duplicate ID was created. Twelve unselected research entries remain unchanged. The selected rejected record only receives an appended mapping-gap reason in researchIssues and its identity-source notes; original values, source URLs and archive warnings are retained.

The first 57 selectable records, their order and public records payload are unchanged, as are all 59 quarantine entries. Final selectable statuses: verified 25 (existing Toyota), legacyPending 4 (existing placeholders), preliminary 37 (28 existing partial cards plus 9 new). No Honda status was raised. Of 66 selectable records, 62 are recommendation cards and 4 are foundation placeholders. Completeness for each new card is computed partial, 6/14 technical fields confirmed.

## Accepted scope and exact locators

All rows are US MY2019 only. Only the listed trim, transmission and drive system is published. 10A/T, 9A/T and 6A/T source spellings normalize to 10AT, 9AT and 6AT where applicable; no unlisted application is inferred.

| Stable ID | Exact application | Original Honda identity/application/characteristics | Honda FAQ viscosity row |
| --- | --- | --- | --- |
| honda-accord-hybrid-2019-lfb2 | CV3F4 · Accord Hybrid EX · CVT · 2WD | [ORG16345](https://vpic.nhtsa.dot.gov/mid/home/displayfile/6001f75f-398f-4b15-b1c7-d6c650c854c0) PDF 1, 4, 5 | Accord → 2014–2020 Hybrid or Plug-in |
| honda-accord-sedan-2019-k20c4 | CV2E3 · Accord Sedan Sport · 6MT · 2WD | [ORG16345](https://vpic.nhtsa.dot.gov/mid/home/displayfile/6001f75f-398f-4b15-b1c7-d6c650c854c0) PDF 1, 3, 5 | Accord → 2011–2020 L4 & V6 |
| honda-accord-sedan-2019-l15be | CV1F1 · Accord Sedan LX · CVT · 2WD | [ORG16345](https://vpic.nhtsa.dot.gov/mid/home/displayfile/6001f75f-398f-4b15-b1c7-d6c650c854c0) PDF 1, 3, 5 | Accord → 2011–2020 L4 & V6 |
| honda-civic-coupe-2019-k20c2 | FC4B6 · CIVIC COUPE LX · CVT · 2WD | [ORG16024](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b) PDF 1, 7, 8 | Civic → 2012–2020 All others |
| honda-civic-coupe-2019-l15b7 | FC3B3 · CIVIC COUPE EX · CVT · 2WD | [ORG16024](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b) PDF 1, 7, 8 | Civic → 2012–2020 All others |
| honda-civic-hatchback-2019-l15ba | FK7H3 · CIVIC HATCH LX · CVT · 2WD | [ORG16023](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1eb6055c-3b42-429b-8dd9-2055c34c301c) PDF 1, 6, 7 | Civic → 2012–2020 All others |
| honda-civic-sedan-2019-k20c2 | FC2F6 · CIVIC SEDAN LX · CVT · 2WD | [ORG16024](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b) PDF 1, 6, 8 | Civic → 2012–2020 All others |
| honda-passport-2019-j35y6 | YF7H2 · PASSPORT SPORT · 9AT · 2WD | [ORG16069](https://vpic.nhtsa.dot.gov/mid/home/displayfile/5bb13080-7d9a-47c3-9a95-cc2846951798) PDF 1, 6, 7 | Passport → 2019 |
| honda-pilot-2019-j35y6 | YF5H1 · PILOT LX · 6AT · 2WD | [ORG16052](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b22ac049-4750-4ce5-ab4c-85e914879975) PDF 1, 3, 4 | Pilot → 2012–2020 |

For each source, PDF page 1 is the signed American Honda Motor Co., Inc. cover under 49 CFR Part 565 identifying the MY2019 model. The first remaining page in each row binds the exact application code, trim, drive system, transmission and engine model; the final page provides engine characteristics. These are Honda-authored documents on official NHTSA vPIC hosting. The engineering identity is the literal Engine Model/Engine Type table value, not a VIN engine symbol.

Original cached PDF bytes and existing extracted text were reused. No PDF was downloaded, text-extracted or OCR-processed again. Because those five documents had no saved page images, only the necessary covers/table pages were rasterized once to inspect column alignment, removed trims and signatures. No TechInfo attempt, new technical-source search, other-brand research or subagent was used.

Oil source: [Honda Brand Knowledge — What type of motor oil should I use in my Honda?](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda). Cached HTML SHA-256: 7327de3b2d9c5ab92ed16a7fcf3ad860ba86c00228af53325a3c9c37fde3481f. Exact SAE locator: Answer → viscosity chart → family/year/category row above. Exact specification and condition locator: Answer → Should I use genuine synthetic or ultimate full synthetic oil in my Honda? Source/locator IDs, original-byte document SHA-256, declared fields, reviewed source scope and supplemental identity binding are stored for each accepted field.

Direct evidence covers application, engine model, model year/US regulatory scope, explicit litre displacement, fuel/electrification and aspiration. SAE/specification applicability uses a documented review join from the direct Honda identity source to the corresponding FAQ category: ordinary non-hybrid Civic LX/EX uses All others (not GX, Hybrid, Si, Sport or Type R); LFB2 Strong Hybrid uses the explicit Accord Hybrid or Plug-in row; Passport uses its own 2019 row, not the Pilot row. The FAQ itself does not claim to print exact engineering codes.

## Scope boundaries checked independently

- Accord Hybrid LFB2: the MY2019 CV3F4 EX CVT row names LFB2 alone. This does not resolve or publish the MY2018 LFB1/LFB2 pair. The cover removes CV3F6, which is excluded.
- Accord Sedan: CV2E3 Sport 6MT and CV1F1 LX CVT are separately bound to K20C4 and L15BE. Removed CV1F6/CV1F9/CV2F6 and other transmissions are excluded.
- Civic Coupe LX is FC4B6 in MY2019, not the MY2018 FC4B5. Civic Sedan LX CVT is FC2F6, not MY2018 FC2F5. MY2019 Hatch LX does not inherit the prior-year Honda Sensing label. Sport and Si/Type R variants are excluded.
- Coupe EX FC3B3 directly names L15B7. The non-Si L15B7/L15BY characteristics column provides the shared cited traits; the separate Si/Si HPT performance column is not used or published.
- Passport Sport YF7H2 is 2WD 9AT; Pilot LX YF5H1 is independently evidenced as 2WD 6AT. No quantity or transmission applicability is transferred between these J35Y6 applications. The struck-out Pilot Black trim YF6H7 is excluded.

## Requirements and unknown fields

Each card publishes one documented path: SAE 0W-20 AND API Certification Seal. The original localized condition is retained: if Honda Genuine Motor Oil is not used, premium conventional oil OR ultimate full synthetic blend may be used with the specified viscosity and the API seal indicating energy conservation and the latest API requirement. The allOf expression, source-backed condition reference and documentedPath coverage are preserved. This is not an exhaustive list of every Honda-permitted option. No API SN/SP, numbered ILSAC, ACEA class or OEM approval is inferred.

Confirmed fields: typed engine identity, displacementLiters, fuelType, aspiration, allowedSaeViscosities and industrySpecifications. Application evidence is independently confirmed. All new litre values have an explicit L unit in the exact characteristics table; hybrid classification uses the stated Strong Hybrid electrification.

Unknown fields: serviceFillCapacity, capacityUnit, capacityNote, serviceInterval, required/preferred manufacturer approvals, climate limitations and emissions-equipment assessment. Archive-derived quantities and notes remain canonical-only as unconfirmed research claims. The archive WORKING COPY provenance and exact-engine/applicability of its quantities are not established; it supplies no production quantity. Public records contain null/empty unknown fields and no archive source, disputed numbers, units, quantity notes or interval. Partial cards retain preliminary status and the existing UI shows the manual-check warning.

## Retained candidate

honda-civic-sedan-2019-l15b7: Batch 5: ORG16024 PDF 6 lists L15B7/L15BY for the existing FC1F3 Sedan EX CVT application. The only single-code 6MT row is Si/Si HPT FC1E5, a materially different trim, and is not substituted. Exact CVT engine selection remains unresolved.

[Exact original filing](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b), PDF 6 (application rows), 8 (characteristics). The existing EX CVT application FC1F3 is paired L15B7/L15BY. FC1E5 is a different Si/Si HPT 6MT application; this batch deliberately does not substitute it into the CVT candidate. No alternate document or repeated failed request was sought. The reason is appended to that research entry only.

Previous declined candidates and Type R were not reconsidered without a new source closing their gaps. The other twelve research records are preserved in full. No systemic schema/UI/gate change was needed or made.

## Integrity hashes (SHA-256 over canonical JSON values)

| Projection | SHA-256 |
| --- | --- |
| Baseline 57 records | 92f197e2d4fe8d4b4920e133dae000c6ab95d8cd433faa40368d3e54d9f1ac3c |
| Baseline record order | 05264acb606c3eee3c183ac0eb4b2fe4bbac3d69b1c86b42d6784e7d3483f93a |
| Baseline public records | 757c3b3ba19e263985ca04da571e1f848ce54513bf0640e57fc4c67918dd0e11 |
| Baseline canonical content | 86559d3bfa483d2d9f435496dcba3b1a88365e312b8f4688fb7645f8111f1bcf |
| Original 22 research records | 42a7c1cf6795932cade459c4f24c6bc378602153b91cf3f443f36b2c43983b75 |
| Unchanged 12 research records | a76c178093eaddbce43148f7510d5fedf343fe6e9c0a07eaaad62c7161b045be |
| Final 13 research records | 50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342 |
| Legacy quarantine | 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35 |
| Final canonical content | ff9955e3881ccb905ef36a753fe5e83ef3d92fe80b517852d81d1549ba032eb6 |
| Final public records | f57673e959cfa9ed5fbe0cdb6177c82e62cb53f05808898d318a7ca094d3e59e |

The fixture also pins every original research record, accepted scope, original source URLs, archive-source hash, original PDF-byte hashes and protected UI/schema/gate/PCD/Engine/CI files. Batch 3/4 historical baselines remain frozen; their separate current overlays track later counts/hashes and annotation-only research changes.

## Files and checks

Changed: data/oil/canonical.json, generated oil-data.js, package.json; new tests/oil/fixtures/batch-5-production.json and tests/oil/oil-batch-5-production.test.mjs; current counts/hashes in Batch 1/2/3/4/field/UX fixtures and foundation/Batch 2/4/field tests; this report. The UX fixture updates only its two authorized Oil data hashes and counts; its other protected datasets/schema/gate/CI hashes are unchanged. The field-evidence suite now selects its original stable partial-card fixture instead of assuming the last appended card always cites PDF page 6.

No schema, UI, evidence-gate/validator/generator implementation, PCD, Engines or CI change. No new dependency. Temporary PDFs/images, dumps, logs and one-use research scripts are outside the repository and not committed.

Targeted npm run oil:check: PASS (validator, generated freshness and all Oil suites). Batch 5 regression checks the unchanged 57-record/order/public baseline and legacy quarantine, exact application/source locators, scoped gate rejection, optional unknowns and partial completeness, disputed-value suppression, unchanged statuses and IDs, no duplicate applications, research/production separation, the CVT-versus-Si refusal, removed-trim exclusions, MY2019 code changes, Hybrid FAQ applicability, independent Passport/Pilot transmissions, multilingual selectors/representative URLs and generated freshness. Existing UX and real-controller Reset/Copy link/Back/Forward regressions pass.

Package scripts inspected: npm test already includes site contracts, oil:check with Batch 5, all PCD suites, Engine UI and engines:check. Run the final full npm test once after the final changes; do not separately repeat included suites.

Final full npm test: PASS (exit 0), run once after final data/test/package changes. Includes site contracts, all Oil validation/generated/evidence/batch/UX/controller suites, all PCD suites (3000 records), Engine UI/policy/validation/generated/smoke/semantic checks (1702 records). Included suites were not separately repeated after this full run. Only this documentation result was updated afterward; git diff --check verifies it. Successful logs remain temporary and are not committed.

## Delivery

Commit subject: feat(oil): add Honda application batch 5. Final SHA, divergence and worktree/staging state are reported in the handoff because this report is part of that commit. Push feature/oil-production-batch-5 only, no merge. No PR creation API attempt, per user instruction. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-production-batch-5?expand=1 .
