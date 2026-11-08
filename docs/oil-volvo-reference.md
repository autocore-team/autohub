# Volvo B5202S reference-only information

The existing Volvo placeholder gains a closed disclosure, not an oil recommendation.
Baseline: main `b81b52322481b2baa4e1c87d8d09dcc67da9d937` (Batch 7 merged).
Counts remain **72 selectable / 13 research-only / 59 legacy quarantine**;
68 records remain production recommendations. Volvo remains `legacyPending`.

## Content and limitations

Only the completed cached-source assessment was used; no new source research,
downloads, PDF extraction or authenticity checks were performed.

| Third-party copy | PDF pages | Information retained |
| --- | --- | --- |
| [S70 Technical Specifications](https://www.volvoclub.org.uk/tech/S70Specifications1997.pdf) | 1–2 | Direct S70–B5202S binding, FWD, M56H/AW42; filename/catalogue year attribution, not proof of MY1999 or market |
| [Section 0 General](https://www.volvoclub.org.uk/tech/data/70Series1997-00-DataSheet-0.pdf) | 2–3 | VIN symbol 41 versus engineering code; X=1999 is separate decoding, not an application binding |
| [Group 16 Lubrication](https://www.volvoclub.org.uk/tech/data/70Series1997-00-DataSheet-1.pdf) | 1–2 | Literal historical SAE/API/CCMC/ACEA list, stable-temperature conditions and extreme-use note; grouped B 5XX2 S quantities, 5.3 L excluding / 5.8 L including filter |

Volvo Owners’ Club is a third-party host. These documents are attributed to Volvo;
factory origin is not independently confirmed. MY1999 and market remain unconfirmed.
The maintenance context supports interpreting the grouped quantities as servicing
information; neither that interpretation nor matching the grouped designation
establishes a confirmed fill quantity for the selected car. No exact numerical
temperature bounds, modern specification equivalents, OEM approvals or invented
API/CCMC/ACEA allOf/anyOf relation are published.

## Implementation and changed files

- `data/oil/reference-information.json`: separate localized descriptions and document locators, bound by stable record ID. No technical evidence fields or recommendation sources.
- `data/oil/schema.json`: additive `$defs.referenceInformation` contract for each entry in that separate collection; existing record schema unchanged.
- `scripts/oil/validate.mjs`: reference collection validation, unique selectable-record binding, HTTPS without credentials, positive unique PDF pages, EN/ES/FR/DE text and rejection of unexpected technical keys. Recommendation validation is unchanged.
- `scripts/oil/generate.mjs`, `oil-data.js`: separate top-level `referenceInformation` channel, restricted to existing public selector records. `records` payload is unchanged. Freshness includes both source files.
- `assets/js/oil-guide.js`, `oil-guide.html`: generic data-driven native details/summary disclosure, closed initially; localized warning visible in summary, outside Oil requirements and Service-fill quantity. Escaped text/URLs, protected external links, wrapping and no fixed width. No Volvo ID or content hardcoded in JS.
- `tests/oil/oil-volvo-reference.test.mjs`, `tests/oil/fixtures/volvo-reference.json`, `package.json`: reference separation/security/localization/mobile contracts and immutable baseline hashes; suite included in `npm test` through `oil:test`.
- Existing protection fixtures (Batch 3/4/5/7, Toyota Canada pilot, result UX): refresh hashes only for intentionally changed schema/generator/validator/UI/generated files. Baseline record, research, quarantine and recommendation hashes are retained.

No PDFs, diagrams, temporary research files, PCD, Engines or CI files are changed.
Canonical Oil records, sources, statuses, order and all recommendation values are unchanged.
The recommendation evidence gate and official host allowlist are unchanged.

## Preservation hashes

SHA-256 over compact JSON (except the gate, normalized LF text):

| Protected content | SHA-256 |
| --- | --- |
| Entire canonical data | `419cd4368880349d76a5824f9efc36e026adb14a1cc9431d3de1fe63e0982123` |
| 72 canonical records | `77a5371647f84671a60a8dced366c75a77c7f63054a26148485b5c59a1b92c82` |
| Public recommendation/selector records | `ebc5f3649bae391a1491fe5c2229569d4085d0dac4ed1dcc2fbcabc053c0263c` |
| 13 research records | `50116bad21bb6e4320832fadf899da7a10b98abde928a5cad9b42f6501a50342` |
| 59 legacy quarantine | `429eadf73577d555741a1fbc3c3a2c25721db60b2c0936521c81a8c36cc1bb35` |
| Evidence gate / allowlist module | `b5c7f483485753117e6549ca8cd1b669780d0ad32108094b502a3373e98e4ced` |

## Validation

Targeted Oil suites and the new reference-only regression pass. The final full
`npm test` covers site contracts, Oil validation/freshness/all suites, PCD and Engines;
those included checks are not separately repeated after the full run.
Final diff and staged-file audit are required before committing.

UI verification is structural/controller testing, including localization, disclosure
defaults, native keyboard semantics and mobile wrapping contracts. No live-browser
visual verification was performed; these checks do not establish visual layout.
No new source authentication or applicability confirmation is claimed.
