# Oil result card UX

Date: 2026-11-07. Base: main a6450d4, containing merged Oil Batch 4 PR #76. Main synchronized from a clean worktree before creating feature/oil-result-ux. The pre-existing ignored scripts/pcd/research-batch11.mjs is preserved. No technical-source research, new dependency, data migration or status change.

## Presentation changes

- Compact result starts with vehicle, display year, market, generation and the exact reviewed trim/application codes, transmission and drive system where supplied. Typed engineering code / official variant designation / VIN engine symbol stays distinct.
- Completeness is separate from evidence credibility. Field-assessed partial/complete metadata is displayed as provided; legacy completeness remains explicitly unassessed rather than being promoted by value presence. No global Verified badge is introduced.
- Oil-selection requirements and service-fill quantity are primary. Unknown/conflict messages are rendered once per displayed field, with distinct wording and colors. Unsupported values and quantities with unknown/conflicting units are withheld. A conflicting application/selection path does not leave a viscosity recommendation visible.
- Honda allOf/anyOf grouping, localized conditions and the one-documented-path caveat remain visible beside the oil path before any disclosure opens. Legacy Toyota's temporary 5W-20 substitution condition is also visible beside its recorded SAE values, localized in EN/ES/FR/DE; the source wording remains accessible below.
- Secondary vehicle fields, record notes and field-by-field evidence use native details/summary elements, closed initially. Exact URLs, PDF pages/HTML sections, source/locator IDs and excerpts remain available. Editorial evidence notes are ordinary text, while excerpts retain quote markup. No conditions are truncated or line-clamped.
- Display-only years collapse equal endpoints to a single year and use an en dash for real ranges. The existing yearsLabel/variantKey values, record IDs, option values and URL identifiers are unchanged; selector labels use the new display formatter.
- The general disclaimer now says completeness varies and asks readers to check each field, exact application and the manual before buying/filling oil. New labels and warnings are localized in EN/ES/FR/DE. The old starter-record availability text is also neutralized.

Native summaries retain browser keyboard semantics and visible focus outlines; no custom click handler replaces them. Primary grids use minmax(0, …), collapse to one column, and allow long conditions, application codes, source URLs and quotes to wrap.

## Verification and limits

Targeted Oil regressions and the new oil:result:test passed during development. Presentation fixtures cover partial Honda, actual Toyota values with explicit legacy-unassessed evidence, a foundation placeholder, and synthetic confirmed/Complete, capacity/unit conflict, selection conflict and unknown-application states. Synthetic display states do not change production records or pass through/weaken the evidence gate.

New tests check one unknown/conflict message per displayed field, no disputed value, single-year/range display with stable variant URLs, visible conditions and nested and/or grouping, closed evidence with original source links/locators, legacy Toyota substitution conditions, completeness labels, EN/ES/FR/DE and responsive CSS/native disclosure contracts. Existing real-controller selector, Reset, Copy link, Back/Forward and research-URL regressions remain in the full Oil suite.

Visual desktop/mobile inspection was NOT completed. Browser inventory reported Chrome running, but the browser-access host was unavailable. The fallback Windows Computer Use window capture then stopped with: “could not determine the current browser URL on Windows with enough confidence to enforce policy.” No further UI automation or alternate browser-control workaround was attempted. DOM/markup/controller/CSS checks are structural tests, not visual QA or a measured overflow/keyboard interaction test. Native disclosure behavior and actual desktop/mobile appearance still warrant human browser review.

Package scripts inspected: npm test includes site:contract, oil:check (validation, generated freshness and all Oil suites including result UX), all PCD suites, Engine UI and engines:check. Run the final full npm test once after all implementation/test changes; do not repeat included suites separately.

Final full npm test: PASS (exit 0), run once on the final implementation/tests. Includes site contracts, all Oil validation/generated/UI/evidence/UX suites, all PCD suites (3000 records) and Engine UI/policy/validation/generated/smoke/semantic checks (1702 records). No included suite was separately repeated after this full run. Only this documentation result was updated afterward; git diff --check verifies it. Successful logs stay in the local temporary directory.

## Dataset and gate preservation

Counts remain 57 selectable / 22 research-only / 59 legacy quarantine. The new fixture pins all tracked data/ files, generated Oil/Engine/PCD payloads, Oil evidence/validator/generator implementation and CI (23 normalized-text SHA-256 checks). No canonical/generated data, schema, field evidence, application scope, record status, source or oil requirement was changed.

| File | SHA-256, normalized LF |
| --- | --- |
| data/engines/europe.js | 732b6b4894f165848a02d488d8e2a168797001880ddee5d0dfc2940f66de922e |
| data/engines/japan.js | b83f3d7594bdb1367506d74341e146cc3c49cea2bef0d72c8e4f1f34e36a40ae |
| data/engines/korea.js | 5c31ceb81ad7b6ec309b244bee1d883b92173426ee0147518eec1a71cb5558d6 |
| data/engines/north-america.js | f2ddbc3de547c8b64f0446b1e4fb98798fc1a429bbe1604e53d23cf08a385879 |
| data/engines/source/regions/europe.json | d63a417fa9ba3d83b0a918b9b40b31369c1f413d92053372a4bae4ffff52616a |
| data/engines/source/regions/japan.json | 6d53958d44d2ff886340b6349fb8640df71442c1cd1a44ce57c454b07d14e9fd |
| data/engines/source/regions/korea.json | b09523e266657bcef0c2fffc4f39bd1241924be46c58b25ee14cab22f7154469 |
| data/engines/source/regions/north-america.json | a3b704f9aad1935bc63dccd35973c0bc8937cee576ef5ef3c76e7482c028b9b6 |
| data/engines/source/regions/south-america.json | 51ef5b887b115fbb6b8d087e792c4b090637a9dcd595f1b4da7c13b1b10cef36 |
| data/engines/source/schema.json | f54c4a171c7fa345ddf96ca08738e31af87bbe957c6bdc090dcf4598044823b3 |
| data/engines/south-america.js | 905084234cee1c6ac706b357d589b52178b4c464ad335fbb34cfabafc15e1571 |
| data/oil/canonical.json | fa7072ec40ea3fb025ca8f7a16d54f3e094bff030c5f401c576fc595d5095f92 |
| data/oil/schema.json | 6f381e74fe355471378231d512fa51056d0bc5d42fde91790e7da7350196d547 |
| data/pcd/source/schema.json | d4fa3e7bbf1b4ec7db8dcdc113b78f1bf2c1f1bcf0adc33d56452bcdb45dcf2d |
| data/pcd/source/vehicles.json | 525a6c50ceddba216d8af2a9e7ee52adb34553ac2ba2f5f58006498b411e7532 |
| engine-data.js | 6cc8f5a6d8e3953f7b81cd4fc3509d80c8d0ae4033593eedd66aa5eb69f019e0 |
| oil-data.js | dd3950e36921659234da10c84665f8698555d1f55ae00dfbcbc813231bcd50f5 |
| pcd-data.js | dc5f1e6cd374a1eec562e697ba62dc203199c84ac32df5e36aec763d250e4952 |
| scripts/oil/evidence.mjs | 39c2d9afd4a3c9d671613a3ba3b16906d5a9a48be623f1017579aca3eb88c25c |
| scripts/oil/validate.mjs | 9d1b5722f3bb8675f403a9c31732b25320d311dc68c28ed2e225893f8cd52693 |
| scripts/oil/generate.mjs | 5af4580bf755f102576075fab3754565e088bc9deeceda1cc7aa423b9f6290e6 |
| .github/workflows/ci.yml | dda4aafc273822d867cbeb59e4241983f885cd2b3f3f0b03b27c9928876cf348 |
| .github/workflows/engine-data-ci.yml | 6799fe2e42673d9915b35dd284eaefb423a08657c2b1ea6e59f6cf19c695a722 |

The historical Batch 3/4 fixtures remove only assets/js/oil-guide.js and oil-guide.html from their protected-file lists because this task explicitly authorizes UI edits. Their dataset/schema/gate/CI guards and baseline hashes remain intact, reinforced by the new UX fixture. The VIN presentation assertion now checks separate typed label/value elements instead of the old combined heading string; its semantic requirement is preserved.

## Changed files

- assets/js/oil-guide.js: result renderer, source disclosure presentation, localized labels/conditions, display-only year/variant labels; selector and history logic preserved.
- oil-guide.html: compact responsive result styling, focus/wrapping rules, neutral localized disclaimer/availability text and asset cache version.
- package.json: wire the new result UX suite into oil:test, already included by npm test.
- tests/oil/oil-result-ux.test.mjs and tests/oil/fixtures/result-ux.json: new presentation and dataset-protection regressions.
- tests/oil/oil-field-evidence.test.mjs: equivalent typed VIN label/value assertion for the new markup.
- tests/oil/fixtures/batch-3-production.json and batch-4-production.json: remove only authorized UI files from prior protection lists.
- docs/oil-result-ux.md: this report.

## Delivery

Commit subject: fix(oil): simplify result cards and evidence presentation. Final commit SHA, divergence and clean worktree/staging are reported in the handoff because this report is committed with the change. Push feature/oil-result-ux only; no merge. Compare: https://github.com/autocore-team/autohub/compare/main...feature/oil-result-ux?expand=1 . Temporary scripts and logs are not committed.
