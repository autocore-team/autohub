# Engine Oil Production Batch 6 — remaining Honda disposition audit

Date: 2026-11-07. AGENTS.md and the current Oil field-level rules were read. Batch 5 is merged by PR #78 at main 920651c; 3347f7d was verified as an ancestor. Main was fast-forwarded from a clean worktree, then feature/oil-production-batch-6 was created. The expected baseline was checked before edits and matched exactly. The pre-existing ignored scripts/pcd/research-batch11.mjs is unchanged by SHA-256 comparison.

## Result

**13 audited / 0 accepted / 13 retained. Report-only change.** No canonical/generated data, source/evidence entry, status, scope or record order changed. No new fixture/regression or generated payload was needed because no record was accepted.

| Collection | Before | After |
| --- | ---: | ---: |
| Selectable | 66 | 66 |
| Research-only Honda | 13 | 13 |
| Legacy quarantine | 59 | 59 |

All first 66 selectable entries and their public records payload are identical to baseline; all 13 research entries and all 59 quarantine entries are also identical. Selectable statuses remain verified=25 (existing Toyota), preliminary=37 (existing partial Honda), legacyPending=4. There are 62 recommendation cards and 4 selectable placeholders. All 13 research statuses remain preliminary; no field is newly declared confirmed. Total selectable + research IDs remains 79, without duplicates.

## Audit method and re-investigation decision

This pass reconciled the saved Batch 3/4/5 rejection notes, fixtures and previously extracted source snippets. It did not reopen the rejected technical investigations: no new official source closing an existing gap or available concrete discriminator was identified in the saved evidence. Therefore no new technical network request, repeat TechInfo attempt, PDF download, extraction/OCR or rendering was performed. No subagents.

The cached source manifest contains the existing Honda oil FAQ and an unrelated 2015 Accord manuals landing page; that page supplies no closing evidence for these MY2017–2019 applications. The saved NHTSA documents below were already reviewed in prior batches. The newly accepted MY2019 LFB2 filing was checked for scope relevance and does not cover MY2018. Existing OCR artifacts (for example RW6H3 spelling) are not promoted to new identity evidence; prior visual table review and exact source locators are retained as the audit basis.

New official evidence: **none**. New production evidence/locators: **none**. The locators below are reused audit pointers. The three entries previously covered only by category/shared-table findings (Type R MY2018/MY2019 and Sedan L15BY MY2019) now have explicit individual decisions in this report, without modifying their data entries.

## Decision for each of the 13 records

Every decision is retain research-only. Missing application binding affects 10 entries; unclosed Type R oil-path applicability affects 3. These are unknown/ambiguous mandatory evidence links, not newly discovered conflicting oil specifications.

| Record ID | Saved exact application context | Existing official document and locator | Decision and unresolved link |
| --- | --- | --- | --- |
| honda-civic-type-r-2017-k20c1 | US MY2017; FK8G7 Type-R Touring · 2WD · 6MT | [ORG13596](https://vpic.nhtsa.dot.gov/mid/home/displayfile/0ab40410-03d7-49e1-a287-b37f57769c07) — PDF 1, 6–7 | Retain research-only. T: identity is supported; Type R-specific SAE/path applicability remains unconfirmed. Prior: Batch 3. |
| honda-cr-v-2017-k24v9 | US MY2017; RW5H3/RW6H3 LX · 2WD/4WD · CVT | [ORG13749](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d7fff56b-9cb5-4e25-84e1-c1c3cb03b327) — PDF 3 (application), 4 (traits) | Retain research-only. C: the same LX rows list K24W9/K24V9; K24V9 cannot be selected uniquely. Prior: Batch 3. |
| honda-cr-v-2017-k24w9 | US MY2017; RW5H3/RW6H3 LX · 2WD/4WD · CVT | [ORG13749](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d7fff56b-9cb5-4e25-84e1-c1c3cb03b327) — PDF 3 (application), 4 (traits) | Retain research-only. C: the same LX rows list K24W9/K24V9; K24W9 cannot be selected uniquely. Prior: Batch 3. |
| honda-fit-2017-l15b3 | US MY2017; GK5H5 LX CVT and other repeated CVT codes · 2WD | [ORG12690](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b942e273-5d1c-4f11-a116-d0bc078d6567) — PDF 6 (application), 7 (traits) | Retain research-only. F: GK5H5 and other CVT codes repeat for L15B1 and L15B3; no distinguishing condition. Prior: Batch 3. |
| honda-accord-hybrid-2018-lfb1 | US MY2018; CV3F1/CV3F4 and other Hybrid CVT rows · 2WD | [ORG15191](https://vpic.nhtsa.dot.gov/mid/home/displayfile/68416e36-62dd-4e37-a4b1-e02f1c05ac47) — PDF 6 (application), 7 (traits) | Retain research-only. H: all Hybrid rows list LFB1/LFB2 together; exact LFB1 application unresolved. Prior: Batch 4. |
| honda-accord-hybrid-2018-lfb2 | US MY2018; CV3F1/CV3F4 and other Hybrid CVT rows · 2WD | [ORG15191](https://vpic.nhtsa.dot.gov/mid/home/displayfile/68416e36-62dd-4e37-a4b1-e02f1c05ac47) — PDF 6 (application), 7 (traits) | Retain research-only. H: all Hybrid rows list LFB1/LFB2 together; exact LFB2 application unresolved. Prior: Batch 4. |
| honda-civic-sedan-2018-l15by | US MY2018; FC1F3 EX-T CVT and related CVT rows · 2WD | [ORG14912](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7) — PDF 6 (application), 8 (traits) | Retain research-only. S18: CVT rows list L15B7/L15BY; no unique L15BY binding. Prior: Batch 4. |
| honda-civic-type-r-2018-k20c1 | US MY2018; FK8G3 Type R · 2WD · 6MT | [ORG14121](https://vpic.nhtsa.dot.gov/mid/home/displayfile/2157ff4f-4a84-49e9-b0b4-a9255a90a5fb) — PDF 1, 6–7 | Retain research-only. T: identity is supported; Type R-specific SAE/path applicability remains unconfirmed. Prior: Batch 4 category audit; shared filing already saved. |
| honda-cr-v-2018-k24v9 | US MY2018; RW5H3/RW6H3 LX · 2WD/4WD · CVT | [ORG14740](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8c68f0cd-5358-4c50-baa2-09e2c1645fe6) — PDF 6 (application), 7 (traits) | Retain research-only. C: LX rows list K24W9/K24V9; no discriminator for K24V9. Prior: Batch 4. |
| honda-cr-v-2018-k24w9 | US MY2018; RW5H3/RW6H3 LX · 2WD/4WD · CVT | [ORG14740](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8c68f0cd-5358-4c50-baa2-09e2c1645fe6) — PDF 6 (application), 7 (traits) | Retain research-only. C: LX rows list K24W9/K24V9; no discriminator for K24W9. Prior: Batch 4. |
| honda-civic-sedan-2019-l15b7 | US MY2019; FC1F3 EX CVT and related CVT rows · 2WD | [ORG16024](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b) — PDF 6 (application), 8 (traits) | Retain research-only. S19: CVT rows list L15B7/L15BY. FC1E5 Si/Si HPT 6MT is a different application and is not substituted. Prior: Batch 5. |
| honda-civic-sedan-2019-l15by | US MY2019; FC1F3 EX CVT and related CVT rows · 2WD | [ORG16024](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b) — PDF 6 (application), 8 (traits) | Retain research-only. S19: the same CVT L15B7/L15BY pair does not uniquely establish L15BY. Prior: Same saved Batch 5 table; this report makes the per-record gap explicit. |
| honda-civic-type-r-2019-k20c1 | US MY2019; FK8G3 Civic Hatch Type R · 2WD · 6MT | [ORG16023](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1eb6055c-3b42-429b-8dd9-2055c34c301c) — PDF 1, 6–7 | Retain research-only. T: identity is supported; Type R-specific SAE/path applicability remains unconfirmed. Prior: Batch 4/5 category audit; shared filing already saved. |

The identity values above are Honda Engine Model/Engine Type entries, not VIN engine symbols. An engine family, displacement, shared oil grade, VIN symbol or matching application-code prefix does not distinguish a paired engineering code.

## What would close the gaps

- **T — Type R (3 entries):** an official Honda oil document explicitly applicable to the US K20C1 Type R for the exact model year, establishing the conditional SAE/specification path. The saved VIN filings support identity/application but do not contain oil requirements. The existing FAQ has Civic GX/Natural Gas, Hybrid, Si and All others categories, but no Type R-specific row or newly reviewed Type R applicability. This audit does not reinterpret All others as new closing evidence. A Type R-specific manual or service requirement with matching scope is the concrete missing artifact; no reachable new closing document was identified, so blocked resources were not retried.
- **C — CR-V LX (4 entries):** an official same-model-year US LX CVT crosswalk distinguishing K24V9 from K24W9 for RW5H3/RW6H3, or an authoritative discriminator bound to the exact application. The slash-pair rows and equal technical traits do not select either code. Broader CR-V FAQ coverage cannot repair ambiguous identification. Codes are not merged into one record.
- **F — Fit L15B3 (1 entry):** an official discriminator binding the exact CVT application to L15B3 rather than L15B1. Existing GK5H5 and other CVT rows are repeated for both codes. The accepted L15B1 6MT scope does not resolve CVT L15B3.
- **H — Accord Hybrid MY2018 (2 entries):** an official MY2018-specific discriminator for LFB1 versus LFB2. The 2018 filing lists both codes for the same CVT rows. ORG16345 proves MY2019 LFB2 only; its newer date and shared CV3 application prefix do not extend it to MY2018. No application or requirement is carried between years.
- **S18 — Civic Sedan L15BY MY2018 (1 entry):** an official CVT-specific discriminator for the L15B7/L15BY pair. The published L15B7 EX-T 6MT application is a different transmission and does not resolve the L15BY CVT candidate.
- **S19 — Civic Sedan MY2019 (2 entries):** an official discriminator for the ordinary EX/EX-L/Touring CVT rows listing L15B7/L15BY. The single-code FC1E5 row is Si/Si HPT 6MT, not the existing ordinary EX CVT application. Neither its trim nor its oil path is substituted, and no new Si candidate is created.

Any future discriminator must permit an unambiguous, reviewed and visible application scope under the existing policy. No hidden plant/date/VIN assumption, alias merge or schema/gate workaround is added here. Identification of such a source can justify a later focused re-investigation; this report does not claim that no closing source could exist elsewhere.

## Existing oil evidence and optional unknowns

[Honda oil FAQ](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda): exact existing viscosity locators are Answer → viscosity chart → Civic → 2012–2020 All others (supporting only for unresolved Type R/CVT records); CR-V → 2010–2020; Fit → 2011–2017; Accord → 2014–2020 Hybrid or Plug-in. The existing requirement locator is Answer → Should I use genuine synthetic or ultimate full synthetic oil in my Honda?

The saved non-Honda-oil condition, API Certification Seal wording and allOf/anyOf semantics remain unchanged. No SN/SP, numbered ILSAC or OEM approval is invented. No single documented path is relabeled an exhaustive manufacturer option list. For these research records the mandatory application/path links are still unclosed, so background FAQ values are not emitted as recommendations.

Capacity, interval and approvals are optional for partial publication. Their absence alone is **not** the reason for these 13 refusals: each record has a mandatory application or oil-path gap identified above. Archived WORKING COPY provenance and exact-application service-fill quantities remain unconfirmed; no archival quantity is promoted or used to resolve an engine pair. Unknown/conflicting technical values remain outside production recommendations. Existing preliminary statuses are not upgraded.

## Reused source integrity

Ten cached official-source files (9 NHTSA Honda PDFs and the Honda FAQ HTML) were hash-checked against the existing Batch 2 document manifest. This verifies consistency with saved evidence, not a new source discovery or a substitute for applicability review.

| Existing source | Exact URL | SHA-256 of cached original bytes |
| --- | --- | --- |
| ORG13596 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/0ab40410-03d7-49e1-a287-b37f57769c07) | af400d958e494840df02513ccfc6af91ab38553d7f34db78305b47424067d787 |
| Honda oil FAQ | [Original source](https://crmshonda.my.salesforce-sites.com/hondaknowledge/articles/Knowledge/What-type-of-motor-oil-should-I-use-in-my-Honda) | 7327de3b2d9c5ab92ed16a7fcf3ad860ba86c00228af53325a3c9c37fde3481f |
| ORG13749 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d7fff56b-9cb5-4e25-84e1-c1c3cb03b327) | 6e37d566a72735867e55e29dc019bbde5e652352a84b47f1f33780b0d0d31d9e |
| ORG12690 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/b942e273-5d1c-4f11-a116-d0bc078d6567) | abb7899cf6de4790c602f5100adeb4b30181fcc422e12d039ac28530befd0f36 |
| ORG15191 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/68416e36-62dd-4e37-a4b1-e02f1c05ac47) | 175f45bde5ee6ef3b12e1f7f2e619fe03223b45e2850b241247cafe430de58d1 |
| ORG14912 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/f90daf7a-a0e4-4491-b095-2072e21e23c7) | fb7be801099c5c86eb6c863fc6e6f48086e5907e8429dab748df2247a0e1a032 |
| ORG14121 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/2157ff4f-4a84-49e9-b0b4-a9255a90a5fb) | 097f9e4cb0a8db7bc33127a4923b91096d7fcda66466abee1268d5a517321c2c |
| ORG14740 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/8c68f0cd-5358-4c50-baa2-09e2c1645fe6) | 40d1828cf709e640b384230a6c41645deba50614b339e6418eec79b3bb1cd5dc |
| ORG16024 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/d915bb55-0977-4892-a634-88eb0d11b59b) | a0c56625e20fd5df4636cc2030545aee3d0eba6908b23c6cda4efd23093f6339 |
| ORG16023 | [Original source](https://vpic.nhtsa.dot.gov/mid/home/displayfile/1eb6055c-3b42-429b-8dd9-2055c34c301c) | 84b1a70480c667aba856f5c0ebe8c8f8bdde4ac008f7586dffc1583da6735dbe |

## Baseline and final integrity hashes

Before and after hashes are identical; hashes below use canonical JSON values.

| Projection | SHA-256 |
| --- | --- |
| Entire canonical content | ff9955e3881ccb905ef36a753fe5e83ef3d92fe80b517852d81d1549ba032eb6 |
| All first 66 selectable records | 6836c7ff5e0d301320efb558c8c19619e6577f1f30d992d64cd1962d5f8054de |
| Selectable order | 5e95430a87bb1a4452d149543dac96f0a4287794b299c1b5ba7b56ecd4b36371 |
| Public records payload | f57673e959cfa9ed5fbe0cdb6177c82e62cb53f05808898d318a7ca094d3e59e |
| All 13 research records | 50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342 |
| All 59 legacy quarantine entries | 429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35 |

Twenty-five existing normalized-text hash guards passed across datasets/generated payloads, UI, Oil schema/evidence gate/validator/generator and CI. No PCD, Engines or CI file changed. No package script or dependency changed. Temporary audit scripts and local logs remain outside the repository.

## Appropriate report-only checks

- Read-only audit: counts 66/13/59, all 13 research entries still preliminary and ineligible, no research ID in public recommendations, 79 unique selectable/research IDs, entire canonical and public records equal saved baseline and frozen Batch 5 hashes — PASS.
- Existing protected-file hashes (25) and cached official-source hashes (10) — PASS. The pre-existing ignored local script is preserved.
- npm run oil:validate — PASS: 66 selectable / 62 recommendation cards / 13 research / 59 quarantine.
- npm run oil:generate:check — PASS: generated payload is current; no regeneration was performed.
- Full npm test was deliberately not run because this batch changes only the report, as requested. No UI/browser or technical-source network investigation was necessary.

- Report coverage audit — PASS: all 13 research IDs appear once in canonical order; all 10 exact source URLs and SHA-256 values, six integrity hashes and per-record PDF locators are present. Staged-file scope and git diff --check are required before commit.

## Delivery

Only docs/oil-production-batch-6.md is changed. Commit subject: docs(oil): audit remaining Honda batch 6 candidates. Final SHA, divergence and worktree/staging status are reported in the handoff because this report is part of that commit. Push feature/oil-production-batch-6 only; no merge. PR API is not called. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-production-batch-6?expand=1 .
