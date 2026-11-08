# Oil Production Batch 8 — Toyota Canada

Baseline: main `ed174d0` (Volvo reference-only change merged), clean tracked worktree.
Branch: `feature/oil-production-batch-8`. No subagents.

**Considered 2 / accepted 1 / deferred 1.** Final counts: **73 selectable /
13 research-only / 59 legacy quarantine**, including 69 recommendation cards and
4 foundation placeholders. Statuses: 25 verified, 44 preliminary, 4 legacyPending.
The accepted record is preliminary and partial, not automatically verified.

## Decisions and verified document coverage

| Exact application considered | Decision | Documented oil path and quantity |
| --- | --- | --- |
| Prius MY2020 Canada, hybrid, 2ZR-FXE | Accepted: `toyota-prius-2020-ca-2zr-fxe` | API SN/RC AND SAE 0W-16; SAE 0W-20 only if 0W-16 unavailable, mandatory return at next change. With-filter drain/refill reference quantity 4.4 qt. (4.2 L, 3.7 Imp.qt.); publish 4.2 L. |
| Highlander MY2020 Canada, non-hybrid, 2GR-FKS | Deferred, no production/research collection entry added | Read and verified: ILSAC GF-5 AND SAE 0W-20; temporary 5W-20 with mandatory return. With-filter reference quantity 5.8 qt. (5.5 L, 4.8 Imp.qt.). These Highlander values are report-only, not a published card. |

Prius manual OM47D44U has one combustion-engine entry. PDF 657 distinguishes
2WD/AWD fuel tank capacities, traction motors and batteries; the common engine-oil
table on PDF 658 does not split those variants. All-model coverage plus that
single-engine/common-lubrication section supports one engine-scoped application,
without manufacturing duplicate FWD/AWD, trim or transmission records. This does
not assert that every possible equipment combination exists. Prius Prime, other
years/markets/models and engine swaps are excluded.

Highlander OM0E108U also has a single engine table and common lubrication section.
Its positive coverage statement on PDF 7 / printed 5 literally says **“this manual
applies to explains all models and all equipment, including options.”** This typo
is visible in the original rendered page, not merely an extraction error. The
unchanged gate requires `/manual applies to all models/i`. Its meaning is
understandable, but the stored literal quote cannot satisfy that implementation
check. The candidate is deferred; neither quote nor gate is silently changed.
A future separately authorized gate review could address this specific mismatch;
no source rediscovery is needed for these already-read facts. This is an
implementation blocker, not a claim that the official manual is unreliable.

## Official source chains, editions and exact locators

Starting point reused without re-fetch: saved Toyota Canada catalogue page
https://www.toyota.ca/en/owners/manuals/ and its cached series/year selector options.
Two additional catalogue responses were read, each for a concrete publication /
Canada-model-year binding gap:

- https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=prius
- https://www.toyota.ca/bin/api/get-manuals.toyota.en.json?year=2020&series=highlander

Locators: `data.seriesTitle`, `data.year`, and `documents.allResults` entry with
`type: Manual`, `publicationNo`, `documentUrl`. Neither selected owner's manual
has a production-month restriction. Restrictions on separate multimedia or quick
reference documents are not transferred to them. Stored catalogue excerpts are
explicitly identified as combined response fields plus Canadian publisher context,
not fabricated single-sentence quotations.

| Publication | Exact PDF URL | Edition identification | PDF / printed pages actually checked |
| --- | --- | --- | --- |
| Prius 2020 OM47D44U | https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM47D44U/OM47D44U.pdf | Part No.01999-47D44; Printed in Japan, code 01-1908-00 | Cover 1; all-model coverage and hybrid context 10/8; Canada applicability 97/95; engineering identity 656/654; drivetrain/battery distinctions 657/655; complete lubrication table, conditions and quantity procedure 658/656; oil-label explanation 659/657; colophon 732. |
| Highlander 2020 OM0E108U | https://www.toyota.ca/content/dam/toyota/documents/manuals/en/OM0E108U/OM0E108U.pdf | Part No.01999-0E108; Printed in the U.S.A., code 01-2007-00 | Cover 1; literal all-model statement 7/5; Canada applicability 72/70; single engine / quantity 497/495; grade, SAE, substitution and operating warning 498/496; colophon 564. PDF 8 and 496 were also checked during section navigation and do not close the literal coverage blocker. |

These are manufacturer publications hosted in Toyota Canada's own DAM, selected
by its Canadian catalogue, not third-party copies. Source classification remains
`ownersManual` plus `oemServicePortal`; no new host or source classification is
introduced. Printed codes are retained literally, not interpreted as dates.

The accepted chain is catalogue → exact publication/cover/colophon → all-model
coverage → literal 2ZR-FXE engine identity → the same manual's common lubrication
section. Every published technical locator cites that engine and links to the
all-model coverage locator. Multi-page excerpts clearly label the engine-table
and oil-section fragments, rather than pretending they are one continuous quote.

## Conditions and unknown fields

Prius: park on level ground; warm up the engine; **turn off the hybrid system**;
wait **more than 5 minutes**, then check the dipstick. The quantity remains a
reference amount for changing oil, not dry fill. The without-filter 4.1 qt.
(3.9 L, 3.4 Imp.qt.) is not published as a with-filter recommendation.

Preferred SAE AND actual grade, OR temporary SAE AND that grade under its explicit
unavailability/mandatory-return condition, remains the existing allOf/anyOf tree.
The high-speed/extreme-load higher-viscosity warning is localized beside the
preferred path; it does not create another permanent SAE or numerical temperature
threshold. Coverage is `documentedPath`, not an exhaustive manufacturer list.
Branded Toyota oil is not converted into an OEM approval; no modern API/ILSAC
equivalents are inferred.

Displacement assessment, fuel assessment, aspiration, OEM approvals, interval,
numerical climate limits, emissions equipment and generation remain unknown.
Hybrid application context is documented in the application chain; it is not an
invented fuel enum or a newly confirmed optional technical field.

## Budget and reusable cache

New manuals: **2 downloaded / 2 extracted once**, from a maximum of 3.
Additional catalogue/applicability sources: **2**, exhausting the allowed maximum.
No third candidate requiring another catalogue binding was opened. No adjacent-year
cards or package splits were created to increase the count. Read coverage is two
engine-scoped applications, only one currently publishable; no unreviewed extra
applications are claimed as verified coverage.

Cache: `%TEMP%/autohub-oil-batch8/` contains both original PDFs, one extraction JSON
per PDF, the catalogue responses and selected rendered pages. Subsequent page
review reused these files. Initial sandbox transport/web-API support limitations
were resolved by authorized direct access outside the sandbox; no HTTP refusal was
repeated. No PDFs, dumps or one-off scripts are committed.

## SHA-256 integrity

| Content | SHA-256 |
| --- | --- |
| Prius PDF | `0e6902e70de38bad8832df211fac87063725c37b7e0e8e4df53925e1836dd682` |
| Prius catalogue response | `6766974a98218bde8f6fb27c1942a9bc3da19030d2e4e6be280d14718eb189b9` |
| Highlander PDF | `07fbf69febe8a4f198966bb62d6f02ecef96f1a140155b2e38863512a399fa20` |
| Highlander catalogue response | `8affdc824836509ed59cccc4f705f2a3608ad00d0a09ae5d8083a5e768b33df6` |
| Baseline canonical projection | `419cd4368880349d76a5824f9efc36e026adb14a1cc9431d3de1fe63e0982123` |
| First 72 records, unchanged | `77a5371647f84671a60a8dced366c75a77c7f63054a26148485b5c59a1b92c82` |
| First 72 public records, unchanged | `ebc5f3649bae391a1491fe5c2229569d4085d0dac4ed1dcc2fbcabc053c0263c` |
| 13 research records, unchanged | `50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342` |
| 59 quarantine records, unchanged | `429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35` |
| Volvo reference collection, unchanged | `b1d672fc3f8c80f9619e6d18a966c09c8c0bc28dd32af8668cb9b51f18fc33c5` |
| Final canonical | `8a1eeb9a5e98055424562916bbd9f01e8002e8041030dfa9a3ff4a34d89cae10` |
| Final public records | `ec847c049848dcf55d07ff058c2d997e5f1a200f9d43baf55493a7245518df9e` |

JSON projection hashes use compact serialization. The Batch 8 fixture additionally
freezes baseline order, accepted record/source hashes and protected schema, gate,
validator/generator, UI, Volvo reference, PCD, Engines and CI file hashes.

## Changed files and checks

Changed: `data/oil/canonical.json`, generated `oil-data.js`, `package.json`, this
report, Batch 8 fixture/regression, and current-count/freshness expectations in
existing Oil fixtures/tests. Historical baseline hashes are retained; Batch 7 and
Volvo tests now reconstruct their original 72-record projection while Batch 8
freezes the new full dataset. No evidence criterion is weakened.

Targeted `oil:check` and Batch 8 negative regressions cover baseline/order/public
integrity, source locators, identity/market/capacity mismatches, conditional SAE,
partial/unknown safety, duplicates, research exclusion, multilingual card/URL
cases and generated freshness. One final `npm test` includes site contracts,
Oil validation/freshness/all suites, PCD and Engines without duplicating included
checks afterward. Diff and staged-file audit precede commit.

UI, schema, gate, allowlist, Volvo reference content, PCD, Engines and CI are
unchanged. No live-browser visual review is claimed; UI behavior is covered by
the existing controller/DOM regressions and unchanged mobile layout contract.
