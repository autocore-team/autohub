# Volvo XC40 2021: official-source feasibility pilot

Research only; no production record, status, schema, gate, allowlist or UI change.
The S70 B5202S placeholder/reference material is outside this source's scope.

## Sources and acquisition boundary

- **S1 — Engine oil — specifications**: https://www.volvocars.com/uk/support/car/xc40/20w46/article/1f2a2f75c7fab5e2c0a81f6f0da34d7b_f40a54afc7fb5bf5c0a81f6f74c5b3b7_2e59ea811f1db4b3c0a8015127c730d9/
  Breadcrumb explicitly identifies **XC40 2021**; page update **27/10/2020**.
  Model year is established by that content, not the `20w46` URL segment.
  Locators: breadcrumb; article heading/update; main table columns Engine,
  Engine code, Oil grade, approximate litres including filter; footnote 1.
- **S2 — Engine oil**, one additional official source:
  https://www.volvocars.com/uk/support/car/xc40/20w46/article/1f2a2f75c7fab5e2c0a81f6f0da34d7b/f40a54afc7fb5bf5c0a81f6f74c5b3b7/f3b1008c702536a3c0a801512a28b7da/
  Same XC40 2021 breadcrumb/update. Locators: Important callout; final paragraph
  before Related articles. Prescribed grade/viscosity applies to filling and oil
  change; oil and filter are changed under the Service and Warranty Booklet.
  Car decals, rather than approximate manual illustrations, identify the car's
  applicable information. Higher oil quality is permitted/recommended in the
  described adverse-use context; no extra numbered grade or SAE is established.
- **S3 — Adverse driving conditions for engine oil**, second additional attempt:
  https://www.volvocars.com/uk/support/car/xc40/20w46/article/b0804d54c7fc096bc0a81f6f065ad63e/8899be1dc7fc78b1c0a81f6f5a01b4ab/fe700ba37feaac87c0a8015173a5c6d4/
  Linked by S1 but unavailable to the reader tool (cache miss). Not retried and
  not evidence. No particular driving examples or temperature conditions are
  inferred from its title. No third additional source was opened.

S1/S2 are official manufacturer publications on `www.volvocars.com`, not copies
attributed to Volvo on a club/reference host. `/uk/` identifies the localized
support resource; it does not prove each listed engine was offered in the UK,
nor establish an EU or GLOBAL vehicle-market scope.

## Visual cell-span check and six selected candidate rows

Browser host and native computer-use access were unavailable. A local headless
Chrome render of the cached **original HTML table markup** was inspected instead;
only inspection CSS was supplied, original cells/rowSpan attributes retained.
This verifies cell merging, not a screenshot of the live Volvo site's styling.
Oil-grade cells span **4 / 6 / 2 / 2 rows** respectively. Volume cells are separate
per row. No empty grade cell was treated as an unknown or a different requirement.

Shared literal oil-grade alternative G:
**Castrol Edge Professional V 0W-20 or VCC RBS0-2AE 0W-20**.
Keep the named-product alternative and specification alternative distinct; the
brand is not simultaneously mandatory. No API/ACEA/ILSAC equivalent is inferred.

Each candidate scope below is **XC40 MY2021, factory engine/variant as listed
by S1**. Country sales availability and additional trim/transmission restrictions
are not established. Unqualified T2/T3 labels do not independently prove drivetrain.
Rows explicitly pairing base/AWD are retained together, not split for volume.

| Candidate application | Literal engine identity | Oil requirement | Document quantity, including filter | Exact S1 locator and remaining limits |
| --- | --- | --- | --- | --- |
| T2 | B3154T9 | G | Approx. 5.6 L | Body row 1; grade cell spanning rows 1–4. |
| T3 | B3154T4 | G | Approx. 5.6 L | Body row 2; inherits that same grade cell. No transfer to other T3 codes. |
| T4 / T4 AWD | B4204T31 | G | Approx. 5.6 L | Body row 5; grade cell spanning rows 5–10. |
| D3 / D3 AWD | D4204T16 | G | Approx. 5.2 L | Body row 11; grade cell spanning rows 11–12. |
| B4 / B4 AWD | B420T6 | G | Approx. 6.1 L | Body row 13; grade cell spanning rows 13–14. No hybrid subtype inferred from badge. |
| B5 AWD | B420T2 | G | Approx. 6.1 L | Body row 14; inherits that grade cell. No other drivetrain asserted. |

S1's Engine code heading and footnote directly establish the identifier type;
these are not VIN symbols or engine identities inferred from displacement.
Exactly six rows were assessed. Other listed rows have not received a candidate
assessment and are not additional verified applications.

## Documentary sufficiency versus uncertainty

**Direct:** content-defined model/year, each selected badge/code pairing,
explicit AWD alternatives, grade-cell applicability, SAE 0W-20, the documented
OR relation and approximate filter-inclusive quantities. S1 contains no factory
temperature chart or temporary SAE substitution to expand into additional choices.

**Composite:** S1 is a maintenance/manual specification section; S2 explicitly
discusses routine oil/filter changes and prescribed oil for filling/change. This
supports servicing relevance, but does not explicitly identify S1's numbers as
drain/refill amounts rather than another capacity convention. Therefore retain
the literal approximate filter-inclusive volumes as documented claims; assessed
**service-fill quantity remains unknown** for a recommendation until that specific
link is closed. This is a content assessment, not a demand for one magic phrase.
No dipstick/electronic-level procedure or numeric interval is invented from S2.

No national lineup is established, and no cross-market difference is demonstrated
either. That limits a national-sales assertion; it is not proof that the technical
table is inapplicable to a matching factory installation elsewhere. Compare the
actual car's identity/decals with the document rather than treating locale as market.

## What the current model can express, and what blocks publication

Already expressible: engineering-code identity, model year, field-specific source
locators, SAE separate from the existing API/ACEA/ILSAC/approval fields, nested
AND/OR, localized source conditions, optional unknown quantity/interval and
independently computed partial completeness. One
reviewed source can be reused across records without pretending every field has
the same scope. No architecture redesign is proposed.

Concrete implementation restrictions, distinct from source reliability:

1. `context().trusted()` in `scripts/oil/evidence.mjs` does not include
   `www.volvocars.com` in reviewedHosts. Official provenance alone does not change
   the implemented host restriction.
2. `validateEngineScope()` currently requires one market binding, an exact
   catalogue/publication link and an all-model sentence accepted by
   `hasAllModelScope()`. A model/year-labelled Support article with exact engine
   rows is not that catalogue/manual contract. Do not invent a publication ID,
   the missing all-model wording or a country lineup to satisfy it.
3. The exact-application path instead demands trim/application-code/transmission/
   drivetrain bindings absent from this table. Their absence does not itself
   establish that they affect this oil rule.
4. No evidenced national market has been selected. Existing enum tokens OTHER,
   UNKNOWN or GLOBAL do not manufacture evidence; they must not be used as a
   shortcut around the current gate. The unknown service-fill link is a separate
   documentary limitation, not a reason to erase confirmed oil-quality information.
5. `validateRequirements()` permits only SAE, API/ACEA/ILSAC and required-approval
   leaves. It has no named-product alternative or explicitly separate generic OEM
   oil-quality leaf. Do not recast the Castrol product as a compulsory approval or
   label the Volvo quality specification API/ACEA/ILSAC. The appropriate existing
   field meaning must be reviewed before encoding a specification-only path.
6. The same function requires literal conjunctive wording for an `allOf` locator.
   S1 prints the Volvo specification and SAE together in one grade phrase, not as
   an explicit quality-AND-SAE sentence. Its introductory conjunction relates
   grade to volume, not quality to viscosity. S2 discusses prescribed quality and
   viscosity, but `validateEngineField()` requires technical locators from the
   bound manual source. Do not manufacture an AND excerpt or borrow an unrelated
   conjunction to satisfy that parser. This is another implementation/content-
   expression question, not a contradiction in the published grade.

## Next production direction and preserved research

Recommend **one bounded XC40 MY2021 batch from these same six reviewed rows**,
starting with the specification-based SAE 0W-20 / VCC RBS0-2AE path and retaining
that this is one documented alternative, not the exhaustive list. Leave quantity
unknown if its servicing interpretation is still unresolved. A production task
must first resolve the specific source/scope/requirement compatibility restrictions
above and establish how an actual matching application is represented; no
current-gate publication is claimed
here and no minimum accepted count is promised. Do not expand to S70 or other years.

Cache: `%TEMP%/autohub-volvo-xc40-policy-pilot/` retains original S1 HTML,
table markup and inspection PNG. S1 HTML SHA-256:
`80f614eadce466f003db7bf9464318f5086b912a0ad7257c6a37dff1753aa30c`.
The hash identifies the saved response, not applicability or permanent page content.
S2 locators/decisions and the failed S3 attempt are preserved above for reuse.
No need to reread the completed table or retry S3 without new grounds.

Validation for this change is documentation-only review and `git diff --check`.
No npm tests, production data generation, commit, push, merge or PR operation.
