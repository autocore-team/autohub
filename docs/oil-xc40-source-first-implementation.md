# Source-first evidence support and XC40 production pilot

Branch `feature/oil-source-first-policy`, baseline main `fc8701d`:
**75 selectable / 13 research-only / 59 quarantine**. The policy and completed
research pilot are retained in this same change, not replaced or re-researched:
[policy](oil-evidence-policy.md), [source assessment](oil-volvo-xc40-source-pilot.md).
The pilot's implementation limitations describe the pre-change gate; this report
records how the bounded support was implemented. No network research or repeat
source download was performed. No subagents.

## Result

**Six accepted, all preliminary / partial; final 81 / 13 / 59.**
There are 77 recommendation cards and 4 foundation placeholders. Existing statuses
and records are unchanged; total statuses are 25 verified / 52 preliminary /
4 legacyPending. New completeness is 3 of 15 assessed technical fields; the old
records retain their original 14-field calculation and identical public payload.

| Stable ID | Exact source-defined application, MY2021 | Identity |
| --- | --- | --- |
| `volvo-xc40-2021-b3154t9` | XC40 T2 | B3154T9 |
| `volvo-xc40-2021-b3154t4` | XC40 T3 | B3154T4 |
| `volvo-xc40-2021-b4204t31` | XC40 T4 / T4 AWD | B4204T31 |
| `volvo-xc40-2021-d4204t16` | XC40 D3 / D3 AWD | D4204T16 |
| `volvo-xc40-2021-b420t6` | XC40 B4 / B4 AWD | B420T6 |
| `volvo-xc40-2021-b420t2` | XC40 B5 AWD | B420T2 |

Each publishes one **SAE 0W-20 + OEM oil-quality specification VCC RBS0-2AE**
path. It is not a formal approval, mandatory Castrol brand, API/ACEA/ILSAC class
or exhaustive alternatives list. The original cell's product/specification OR
wording remains available in its evidence. No extra SAE, temperature threshold,
hybrid subtype, interval or installation attribute is inferred.

`market: ["UNKNOWN"]` is deliberately retained and geography is assessed as
unknown independently of confirmed technical application. No UK sales, EU scope
or GLOBAL applicability is claimed. Variants sharing a source row are not split.

## Minimal model/gate changes

- Optional `oemOilSpecifications` uses the existing fieldEvidence/reference and
  requirements machinery, separately from manufacturer approvals. Only records
  carrying this field receive the extra assessed field; no legacy reassessment.
- `documentRow` application scope links an official model/year context to the
  exact variant/engine row. The row's table/column roles are evidenced in the
  context; identity, exclusion, contradiction and connected acyclic link checks
  remain required. This path does not pretend a table is an all-model catalogue.
  Existing exactApplication and engineScoped behavior is preserved by baseline
  hashes and their full regression suites.
- Field locators reference that row. A composite source must additionally bind
  its own evidenced model/year context and literal engine identity back to the
  direct row. Its source ID need not equal the primary source ID. Dependency
  locators are retained in the generated payload, preventing dangling links.
- Structural `allOf` requires exact cell coordinates, selected-row coverage,
  evidenced column roles and reviewed interpretation. The selected literal
  alternative must exactly pair the specification with SAE and match both tree
  leaves and their field references. Words elsewhere, a different column or a
  generic `confirmed` declaration do not establish the combination. Existing
  conditional-SAE validation is reused.
- `www.volvocars.com` is restricted to HTTPS UK Support car-article paths with
  model/edition segments and three article identifiers. Arbitrary subdomains,
  other site paths, credentials, non-default ports, queries and fragments are
  rejected. Source trust/hash/scope/locator checks remain mandatory for every
  confirmed field. Other reviewed source namespaces retain their behavior.

## Quantity and supporting context

Approximate **filter-inclusive document volumes** remain solely in unknown-field
evidence locators, typed `volumeIncludingFilter`. They are not written into a
service-fill value. All six service-fill quantity/unit/note values are null and
unknown. These locators and their numbers are excluded from the public payload;
there is no new quantity subsystem. A document-row service-fill claim would need
the distinct evidenced fill type plus existing servicing/filter/value checks.

The previously read Engine oil chapter supports contextual notes about the car's
label, prescribed oil and higher quality in adverse use. It has no retained raw
response hash; none is invented. Its source is explicitly notes-only, cannot
confirm a technical field or eligibility, and remains linked in record notes.
Critical application/SAE/specification evidence uses the cached primary article
and its original HTML hash. The unavailable adverse-driving article is not
retried, cited as evidence, or interpreted as an extra SAE/quality class.

## Sources and integrity

Exact URLs, article date, row indices, original merged-cell spans and limitations
are preserved in the [completed pilot](oil-volvo-xc40-source-pilot.md). Production
locators identify the breadcrumb/heading, selected engine row, corresponding
oil-grade cell and unpublished volume column. Original source wording is not
rewritten to manufacture a conjunction or country scope.

| Projection, SHA-256 over compact JSON | Hash |
| --- | --- |
| First 75 canonical records, unchanged | `8bd8fbf24847db1c51720e4eea7b9eb04f23144b3f16bedc967ed31597f49f45` |
| First 75 public records, unchanged | `85b66fe8a36904efe9d9792be07aab44f8b575395d2a8a8a98667ffa7c39965a` |
| 13 research records, unchanged | `50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342` |
| 59 quarantine records, unchanged | `429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35` |
| S70 reference, unchanged | `b1d672fc3f8c80f9619e6d18a966c09c8c0bc28dd32af8668cb9b51f18fc33c5` |
| Final canonical | `9a255f5d2b773834296861fed47412d889cc2a95ab511950fd720d705040204a` |
| Final public records | `c08c571d5c2d023e5cb3d882d9e83e7293393a9a742c8d9f3ee83e27a59445c2` |

The new fixture independently checks the old public hash against Batch 9 before
freezing new expected values. Existing snapshots retain their historical record
projections; only current-count/freshness and intentionally changed implementation
hashes are refreshed. PCD, Engines, CI and S70 reference data are unchanged.

## UI, tests and limits

Only necessary EN/ES/FR/DE labels/rendering were added: OEM oil-quality
specification, explicitly unestablished geography, source-row scope description
and contextual note sources. Existing selectors, URL identifiers, Reset,
Back/Forward, Copy link, source disclosures and responsive styles are retained.

Targeted `oil:check` passes. New regressions include unknown versus confirmed
geography, wrong year/engine, exclusions/conflicts, disconnected/cyclic evidence,
row spans/column roles, arbitrary prose versus a reviewed pairing, quality versus
approval, non-service volumes, unsafe URLs, composite sources, optional conflicting
quantity, unchanged old paths, all four languages, selector/search/URL separation
and generated freshness. One final `npm test` covers the complete existing scripts
without separately repeating checks it already includes. Diff and staged audit
precede commit. No research PDFs/dumps/profiles/screenshots/scripts are committed.

Visual check: offline headless Chrome with external network blocked, desktop
1440 px (EN) and mobile 500 px (DE), using the actual local page/scripts/styles.
At mobile size, measured clientWidth = scrollWidth = 500; no horizontal overflow
was seen. The runtime rendered a requested 390 px window with a roughly 500 px
CSS viewport, so **390 px visual verification is not claimed**. Live browser host
and native computer-use access were unavailable; the temporary probe measured
viewport only and did not change project files. This is distinct from the source
table's earlier cached-HTML visual cell-span assessment.
