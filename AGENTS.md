# AutoHub rules for Codex

## Project type

* AutoHub is a static website for GitHub Pages.
* Use HTML, CSS and vanilla JavaScript.
* Do not add backend or heavy frameworks unless explicitly requested.
* Keep the site fast, simple and mobile-friendly.

## Safety rules

* Do not break the existing tire calculator.
* Do not remove or rename existing URL query parameters in index.html.
* Do not remove existing diagnostic software links.
* Do not push directly to main.
* Always create a separate branch and Pull Request.

## Design rules

* Preserve the current visual style.
* Keep pages responsive for mobile devices.
* Use clear automotive language.
* Prefer simple UI over complex effects.

## SEO rules

* Use clear page titles and meta descriptions.
* Create separate SEO pages where useful.
* Do not copy text from other websites.
* Avoid thin duplicate pages.

## Engine data pipeline

* Edit engine records only in `data/engines/source/regions/*.json`.
* Keep `data/engines/source/schema.json` aligned with the source JSON structure.
* Treat `engine-data.js` and `data/engines/*.js` as generated files.
* Run `npm run engines:generate` after source data changes.
* Run `npm run engines:check` before handing off engine data changes.
* Keep compatibility first: preserve existing engine IDs, text and record order unless a task explicitly approves a migration.
* Add new technical specifications only when a real source is recorded in the source entry. Leave unverified legacy records as `legacyPending`.
* Use `verified` only when every required identity, application, specification and performance field is backed by an official `manufacturer`, `serviceDocumentation`, or `certificationDocument` source. Existing records may use the compatible single-source rule. New multi-source records must use unique source IDs, explicit `sourceRefs`, declared `fields`, evidence notes and a normalized record scope. Every referenced source must fully contain the record applications, year interval and markets; source scopes may be broader and need not match each other.
* Strict verified identity has two paths. Existing records without `identity` retain exact-code behavior. New exact-code records may use `identity.type: exactCode` with `identity.value` equal to `code`. New official-designation records use `identity.type: officialPublicDesignation`, omit `code`, and treat the literal designation as the display/search identity. An official public designation is not an internal manufacturer or engineering code.
* For either strict path, require a direct `exactVariant` identity source that binds the identity to applications and years. Exact-code evidence uses `scope.codes` plus `fields: code`; official-designation evidence uses `scope.designations` plus `fields: identity.officialPublicDesignation`. Supplemental evidence may use `identityBindingRef` while matching the exact application. Reject mixed identity paths, chains/cycles, aliases as primary evidence, unbound family documents, aggregate ranges, secondary identity sources and incompatible application/market/year scopes.
* Use `officialPublicDesignation` only for new records or a separately reviewed migration. Its designation and application/year binding always require Tier A official evidence. Use `evidenceBasis: official` when all mandatory fields have Tier A coverage and `corroborated` when technical fields rely on valid independent Tier B pairs. Require an explicit manual `identity.review` confirming literal official publication, stability/distinctness, rejection of generic descriptions, and separation of materially different variants. Review notes must explain the evidence. Displacement/fuel/layout/aspiration/power descriptions alone do not qualify.
* New tiered strict records declare `verification.evidenceBasis`: `official` when every required field is covered by Tier A evidence, or `corroborated` when any required field relies on two independent Tier B publishers. Tier A covers authoritative manufacturer, service, certification/regulatory and provenance-documented professional sources; Tier B is field-specific professional corroboration; Tier C is supporting only and cannot close a required field. Tier B pairs must differ by publisher, domain and upstream `dataOrigin`, match the exact variant scope and store structured performance claims when covering power or torque.
* Use `corroborated` only when official data is unavailable and performance is backed by at least two independent `technicalReference` sources. Each source must cover `performance.powerKw`, `performance.torqueNm`, and `code` or `aliases`, with page notes explaining identity and range boundaries.
* For corroboration, do not treat reprints, mirrors, shared upstream databases, or separate brands of one publisher as independent unless the data origin is genuinely independent.

## Current priorities

1. Improve diagnostics.html.
2. Add Contact, About, Privacy Policy and Affiliate Disclosure pages.
3. Add visual tire comparison to the tire calculator.
4. Rework engines.html into engine code search.
5. Create full engine pages, starting with Volvo B5202.
6. Add motor oil guide later.
7. Add VIN decoder later.
8. Add PWA/app support later.
9. 
