# Toyota Highlander manual scope recognition

Baseline: main `5b7ff98`, after Batch 8 merged. Branch:
`feature/oil-highlander-scope-fix`. Baseline counts **73 / 13 / 59**;
final **74 selectable / 13 research-only / 59 legacy quarantine**.
There are 70 recommendation cards and 4 placeholders; statuses are
25 verified / 45 preliminary / 4 legacyPending.

## Cause and exact change

OM0E108U PDF 7 / printed 5 literally says:

> Please note that this manual applies to explains all models and all equipment, including options. Therefore, you may find some explanations for equipment not installed on your vehicle.

The earlier `/manual applies to all models/i` substring check rejected this
documented typo. The canonical source excerpt above is retained literally.

`scripts/oil/evidence.mjs`: `validateEngineScope()` now calls `hasAllModelScope()`.
It recognizes a direct statement at the start of the excerpt, optionally introduced
by “Please note that” / “this”, using the existing `manual applies to all models`
wording (including the existing equipment/options boilerplate), or the exact
`manual applies to explains all models and all equipment, including options`
wording. A sentence boundary/end is required; it is not a broad search for
“all models”. Whitespace is normalized for matching only, never written back.

The entire excerpt is checked for exclusions and contrary/limited applicability:
only/limited/restricted, negated coverage, exceptions, false statements and
conditional restrictions. A positive phrase buried in a negative statement or
quotation cannot establish coverage. The ordinary optional-equipment disclaimer
“not installed on your vehicle” remains compatible.

All other `validateEngineScope()` checks and `validateEngineField()` are unchanged:
trusted official source and host, edition/model/year/market binding, exact engine
identity, explicit connected acyclic locator chain and each field's applicability.
The host allowlist, schema and UI are unchanged.

## Reassessment and accepted fields

No other blocker was found. One record appended:
`toyota-highlander-2020-ca-2gr-fks` — Canada MY2020 Highlander non-hybrid,
factory 2GR-FKS, one common lubrication table without trim/transmission/drivetrain
splits. No separate FWD/AWD cards or invented application attributes.
Status remains **preliminary**; computed completeness is **partial, 6/14**.

- Official manual: https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM0E108U/OM0E108U.pdf
  — Part No.01999-0E108; printed code 01-2007-00, not interpreted as a date.
- Official catalogue: https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=highlander
  — `data.seriesTitle`, `year`, `documents.allResults → publicationNo/documentUrl`.
- Chain: catalogue → cover/colophon PDF 1/564 and Canada section 72/70 →
  all-model scope 7/5 → engine identity 497/495 → lubrication 497–498/495–496.
- Confirmed: engineering identity; ILSAC GF-5 AND SAE 0W-20; conditional temporary
  SAE 5W-20 only when 0W-20 is unavailable, mandatory return at the next change.
  Existing allOf/anyOf grouping and high-speed/extreme-load warning are retained
  in EN/ES/FR/DE. This is one documented path, not an exhaustive alternatives claim.
- With-filter drain/refill reference quantity: **5.8 qt. (5.5 L, 4.8 Imp. qt.)**;
  publish 5.5 L. Warm up, turn off the engine, wait more than 5 minutes, check the
  dipstick. Without-filter 5.3 L is not substituted; no dry-fill quantity is inferred.
- Unknown: displacement assessment, fuel assessment, aspiration, OEM approvals,
  interval, numerical climate limits, emissions equipment and generation.
  No API class, modern equivalent or OEM approval is inferred from branding.

Only Batch 8 cached PDFs/extractions/catalogue responses and its report were used.
No new research, source requests, PDF downloads or extraction. Source provenance
remains official Toyota Canada manufacturer publication / OEM catalogue.

## Regression coverage and preservation

New `oil-highlander-scope-fix.test.mjs` / fixture cover both accepted wordings,
literal excerpt preservation, rejection of an abbreviated typo or generic
“all models”, exclusions/negations/restricted scope with positive quotations,
missing/disconnected/cyclic application links, wrong market/engine, untrusted
host/provenance, field applicability/quantity mismatches and unconditional temporary
SAE. Baseline order/content/public payload, Volvo reference, partial/unknown fields,
multilingual rendering/URL cases, duplicates and generated freshness are frozen.

Historical tests retain their original data projections, including Batch 8's
then-deferred decision, rather than asserting that Highlander must remain absent
forever. Current counts/freshness expectations and hashes for the explicitly
authorized gate change are updated; historical data/source/reference hashes remain.

Key SHA-256 hashes (compact JSON projections; module hash uses LF text):

| Content | SHA-256 |
| --- | --- |
| First 73 canonical records | `751c41e83c33f2b3eacfa7ce52cb309a05e4e5eef1a54032bb9da8ea389c4d99` |
| First 73 public records | `ec847c049848dcf55d07ff058c2d997e5f1a200f9d43baf55493a7245518df9e` |
| Volvo reference | `b1d672fc3f8c80f9619e6d18a966c09c8c0bc28dd32af8668cb9b51f18fc33c5` |
| Final canonical | `3157e8807b9821405f8937e707ac0d69e03573572fe6e77cdeda3cc9f9505512` |
| Revised gate module | `4f67259ab82e8acefbd68816000b3aea3fbb0e258f9e0f2addcaae2a8d0d61cf` |

Changed: Oil canonical/generated data, the scope predicate, package scripts,
this report, new fixture/regression and existing Oil test expectations.
UI, PCD, Engines, CI, schema, host allowlist and Volvo reference content are unchanged.
No temporary PDFs, dumps or one-off scripts are committed.

Validation: targeted `oil:check`, then one final `npm test` (includes Oil validation,
freshness/all suites, site contracts, PCD and Engines), plus diff/staged-file audit.
No duplicate full run or separately repeated checks already included in `npm test`.
No live-browser visual inspection is claimed; UI is unchanged.
