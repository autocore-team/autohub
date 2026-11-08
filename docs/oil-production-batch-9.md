# Oil Production Batch 9 — Toyota Canada

Baseline: main `ebde4d1`, with Highlander scope fix `e52f344` confirmed as an
ancestor. Clean tracked worktree before `feature/oil-production-batch-9`.
No subagents. **Considered 2 / accepted 1 / deferred 1.**

Final: **75 selectable / 13 research-only / 59 quarantine**, including
71 recommendation cards and 4 placeholders. Statuses: 25 verified,
46 preliminary, 4 legacyPending. The new card is **preliminary / partial (6/14)**.
First 74 records, their order/content/public payload, research/quarantine and
Volvo reference are preserved. Schema, gate, allowlist and UI are unchanged.

## Decisions and reusable coverage

| Candidate | Decision | Scope and oil evidence |
| --- | --- | --- |
| Toyota 86 MY2020 Canada, factory FA20 | Accepted: `toyota-86-2020-ca-fa20` | One engine-scoped application, common oil table for manual/automatic transmission; ILSAC GF-5 AND SAE 0W-20, conditional temporary SAE 5W-20 with mandatory return. Drain/refill with filter: 5.7 qt. (5.4 L, 4.8 Imp. qt.); publish 5.4 L. |
| C-HR MY2020 Canada | Deferred before PDF acquisition; engine/oil fields not assessed | Catalogue owner's-manual entry OM10634U explicitly limits applicability to vehicles produced in January 2019 and later. No evidence establishes that this restriction is redundant for every Canadian MY2020 vehicle. |

Reviewed saved coverage first: Camry, Corolla Sedan, RAV4 Hybrid, Tacoma V6,
Prius and Highlander applications already published. Tacoma 2TR-FE still lacks its
Canadian application binding; no unsuccessful investigation was repeated.
No adjacent-year duplicates or separate transmission/trim records were created.

## Sources, editions and locators

Reused the saved Toyota Canada catalogue selector/options without re-fetching:
https://www.toyota.ca/en/owners/manuals/ . Two new responses close the concrete
Canadian MY2020 publication-binding gaps:

- https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=86
- https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=c_hr

Exact JSON locators: `data.seriesTitle`, `data.year`, and
`data.documents.allResults` owner's-manual entry `title`, `publicationNo`,
`documentUrl`, plus `subtext` where present. The 86 entry OM18101U has no
production-month condition. Catalogue excerpts combine literal response fields
with the already-established Toyota Canada publisher context, explicitly noted
as such; they are not fabricated single-sentence quotations.

Official manual read:
https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM18101U/OM18101U.pdf
— **86 2020 Owner's Manual, OM18101U, Part No.01999-18101, Printed in Japan
01-1908-00**. The printed code is retained literally, not decoded as a date.

| Evidence role | PDF / printed page | What was checked |
| --- | --- | --- |
| Publication | 1 and 536 | Cover 86 2020; exact publication/part number and printed code in colophon |
| Canada | 83 / 81 | Explicit “For vehicles sold in Canada” certification subsection |
| All-model coverage | 17 / 15 | Literal “this manual applies to all models and explains all equipment, including options”; no rewriting for the gate |
| Powertrain context | 177 / 175 | Engine ignition/START procedures for automatic and manual variants; clutch procedure for manual |
| Exact engine identity | 463 / 461 | Engine Model **FA20**, gasoline engine type; no 4U-GSE alias or identity inferred from displacement |
| Requirements and quantity | 464 / 462 | Oil grade ILSAC GF-5, preferred/temporary SAE and return condition, reference drain/refill table and dipstick procedure |
| Operating warning | 465 / 463 | Higher-viscosity warning at high speeds/extreme loads; no additional SAE or numeric climate threshold named |
| Variant contrast | 466 / 464 | Coolant quantity explicitly splits manual/automatic; the preceding engine-oil table does not |

Evidence chain: official Canadian model/year catalogue → exact manual publication
→ all-model coverage → literal FA20 engine identity → common lubrication section
in that same publication. All confirmed field/requirement locators carry the
single engine caption and link to the coverage locator. Multi-page excerpts label
their engine-heading and oil-section fragments as composite context.

Non-hybrid factory application classification is a composite assessment of the
manual's gasoline engine/powertrain and ignition/transmission procedures, not a
claim that the literal words “non-hybrid” appear in its engine table. The scope
does not extend to another FA20 model/year/market or engine swaps. No generic
FA20 family recommendation or performance equivalence is asserted.

These are official manufacturer publications/catalogue responses on Toyota
Canada's own domain, classified as `ownersManual` and `oemServicePortal`.
No third-party material or reference-only expansion is used.

## Conditions and unknowns

Quantity is a reference amount for changing the engine oil, not dry fill. Warm up
and turn off the engine, wait **more than 5 minutes**, then check the dipstick.
The table lists **without filter first: 5.5 qt. (5.2 L, 4.6 Imp. qt.)** and
**with filter second: 5.7 qt. (5.4 L, 4.8 Imp. qt.)**; the rendered original was
checked to avoid reversing these rows.

The existing requirement tree retains preferred SAE AND grade, OR temporary SAE
AND grade only when 0W-20 is unavailable, with mandatory return to 0W-20 at the
next oil change. EN/ES/FR/DE conditions and the high-speed/extreme-load warning
remain visible. `documentedPath` does not claim an exhaustive alternatives list.
No API class, modern equivalent or OEM approval is inferred from branded oil.

Displacement assessment, fuel assessment, aspiration, OEM approvals, interval,
numerical climate limits, emissions equipment and generation remain unknown.

### C-HR deferral: applicability gap, not a claimed regex failure

The owner's-manual entry **OM10634U itself**, not just the multimedia entry,
has `subtext`: `** Valid for vehicles produced in January 2019 and later`.
Its selected URL is
https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM10634U/OM10634U.pdf .
That PDF was **not downloaded, extracted or evaluated**, and no engine identity,
oil grade or quantity is claimed for it. Edition identity is catalogue-only.

The current engine-scoped application contract has model-year/engine coverage,
not a structured production-month boundary. A populated description alone does
not prove the boundary is redundant or enforce a narrower application. Therefore
no unconditional MY2020 record was submitted as eligible. This is an unresolved
applicability/model-expression question, **not an observed rejection by
`hasAllModelScope()`**. No alternative wording, source or new gate behavior was
sought to bypass it. A later task should first resolve this exact production-date
gap; it need not rediscover this catalogue response.

## Budget and cache

**1 new PDF downloaded once / extracted once**, maximum 3. **2 additional
catalogue sources**, maximum 2. No failed source request was repeated. The
remaining manual allowance does not authorize another model/year binding source.
No more applications were asserted to inflate the count.

`%TEMP%/autohub-oil-batch9/` retains both catalogue responses, the original 86 PDF,
one extraction JSON and selected page images for reuse. Verified manual coverage
is one engine-scoped 86 application; C-HR technical coverage remains unassessed.
No extra unverified potential applications are counted as accepted coverage.
Temporary PDFs, dumps and one-off scripts are not committed.

## SHA-256 integrity

| Content | SHA-256 |
| --- | --- |
| OM18101U PDF | `cc15699d8fc316411befcc034e2bd40c762a2cb2845abe29b4a95abfd718767a` |
| 86 catalogue | `a9b3cb932fa2192a2f4e36664eb1a8884a3f181d027ce4aedd70ef4c1130f9c3` |
| C-HR catalogue | `bf59737ba1043f97453e224c6cd24624549e557e4b80b719356785b3e93e283b` |
| Baseline canonical projection | `3157e8807b9821405f8937e707ac0d69e03573572fe6e77cdeda3cc9f9505512` |
| First 74 canonical records | `bad970114295dce5302582e6640ffd2e3bff2cfb10256bcd0abfbaa26192d379` |
| First 74 public records | `6a7c7cda2f84a633347843abcb809a4c31e1a7e702bd168869fadc74ecf44998` |
| Research | `50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342` |
| Quarantine | `429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35` |
| Volvo reference | `b1d672fc3f8c80f9619e6d18a966c09c8c0bc28dd32af8668cb9b51f18fc33c5` |
| Final canonical | `0469dd7e1c109f536956715ab199763e899e4ebb72fd534b6162b1cbcb83d3b2` |
| Final public records | `85b66fe8a36904efe9d9792be07aab44f8b575395d2a8a8a98667ffa7c39965a` |

JSON hashes use compact serialization. The fixture additionally freezes baseline
order, new record/source hashes, and unchanged schema/gate/allowlist/UI/reference/
validator/generator/PCD/Engines/CI file hashes.

## Changes and validation

Changed: canonical/generated Oil data, package test scripts, this report,
Batch 9 fixture/regression, current-count/freshness expectations in existing Oil
tests/fixtures. Historical baseline projections/hashes are retained, including
the 74-record Highlander scope-fix snapshot. No evidence requirements are weakened.

Targeted `oil:check`, then one final `npm test` including site contracts, Oil
validation/freshness/all suites, PCD and Engines. Batch 9 covers baseline integrity,
source/field applicability, temporary SAE conditions, with-filter row/quantity,
partial/unknown safety, research separation, duplicate prevention, EN/ES/FR/DE
rendering, numeric-model selector/search/URL cases and freshness. Diff and staged
audit precede commit; included full-run checks are not separately repeated.

UI is unchanged; no live-browser visual review is claimed. PCD, Engines and CI
are unchanged. Merge and PR API are not part of this task.
