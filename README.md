# D3 Orient

D3 Orient is a practical automotive web project with calculators, guides and reference tools for drivers.

The goal is simple:

**Check first. Understand the result. Avoid expensive mistakes.**

## Live website

https://d3orient.com/

## Current sections

* Tire Size Calculator
* Fuel Cost Calculator
* Diagnostic Software Guide
* Engine and Transmission Reference
* Motor Oil Guide
* Automotive Guides
* Contact page

## Tire Size Calculator

The tire calculator helps compare old and new tire and wheel sizes.

It can show:

* tire diameter difference
* sidewall height difference
* speedometer error
* ground clearance change
* inner clearance change
* outer wheel poke
* shareable calculation links

## Diagnostics

The diagnostics section provides information about automotive diagnostic software and tools.

It includes information about:

* OBD2
* ELM327
* KKL / VAG-COM
* Volvo diagnostic tools
* BMW diagnostic tools
* Opel diagnostic tools
* Toyota diagnostic tools
* universal diagnostic software

The diagnostics page also reminds users to check vehicle year, diagnostic protocol, cable type, Windows version and driver compatibility before using any software.

## Engine Database

The engine section is a searchable reference database with regional source data.

Current structure:

* search by engine code
* full SEO page for Volvo B5202S
* technical specifications
* oil recommendations
* common problems
* diagnostics information
* maintenance notes
* related engines

The first full engine page is available for:

**[Volvo B5202S](engines/volvo-b5202.html)**

## Motor Oil Guide

The oil guide is based on an important principle:

**Motor oil should not be selected by viscosity alone.**

Selection logic:

vehicle → engine → year → fuel type → turbo/NA → DPF/GPF → manufacturer approval → viscosity → climate → driving mode

## Project status

D3 Orient is under active development.

Current priorities:

1. Keep existing calculators stable.
2. Improve diagnostics carefully without breaking multilingual support.
3. Add trust pages: About, Privacy Policy and Affiliate Disclosure.
4. Add tire comparison graphics.
5. Improve engine code search.
6. Expand the oil guide.
7. Add a basic VIN decoder later.
8. Add PWA support later.

## Development

D3 Orient is currently a static website.

Technologies:

* HTML
* CSS
* Vanilla JavaScript
* GitHub Pages

Important rules:

* Do not break the tire calculator.
* Do not remove existing URL parameters.
* Do not remove multilingual support.
* Do not remove existing diagnostic links.
* Use Pull Requests for changes.
* Keep pages mobile-friendly.

## PCD Data Pipeline

PCD and wheel-fitment records have one editable source file:

* `data/pcd/source/vehicles.json`

Its formal structure is documented in `data/pcd/source/schema.json`. The browser-facing `pcd-data.js` file is generated and must not be edited manually. Existing migrated records remain `legacyPending` until real sources and a verification date are added; missing torque, wheel-size or tire-size data must not be guessed.

Commands:

* `npm run pcd:generate` validates the source and rebuilds `pcd-data.js`.
* `npm run pcd:check` validates source records and checks that generated data is current.
* `npm run pcd:test` checks migration compatibility, search, translations and the existing static PCD tables.

## Engine Data Pipeline

Engine data has five editable regional source files. Empty regional files are valid and remain hidden in the public data-driven navigation until their first record is added:

* `data/engines/source/regions/europe.json`
* `data/engines/source/regions/japan.json`
* `data/engines/source/regions/korea.json`
* `data/engines/source/regions/north-america.json`
* `data/engines/source/regions/south-america.json`

The formal source structure is documented in:

`data/engines/source/schema.json`

The JSON Schema is the formal contract for documentation and editor support. `validate-engine-data.mjs` is the executable source-data check used by npm/CI in the current zero-dependency pipeline. It verifies that `schema.json` exists and is valid JSON, then enforces the project-specific business rules: fixed region order, exact record counts, unique IDs, verification policy, and the verified Volvo B5202S source/performance constraints. When the data structure changes, update both `schema.json` and the executable validation policy in the same change.

Verification status policy:

* Existing `verified` records remain compatible with the original single-source rule: they must include `performance` and at least one official source covering `performance.powerKw`, `performance.torqueNm`, and `code` or `aliases`.
* New strict multi-source verification is enabled by `verification.sourceRefs`. In that mode every source is a record-local registry entry with a unique `id`; every ref must resolve to an official `manufacturer`, `serviceDocumentation`, or `certificationDocument` source. Only declared `fields` from accepted refs count toward coverage. `verification.scope` normalizes the record applications, year interval and markets. Every referenced source must fully contain that record scope, but sources may be broader and do not need identical scopes. `Global` sources may cover regional records; regional sources cannot cover a `Global` record.
* Strict `verified` records use one of two identity paths. Existing records without `identity` retain exact-code behavior. New exact-code records may declare `identity: { "type": "exactCode", "value": "..." }`, with `value` equal to `code`. New official-designation records declare `identity.type: officialPublicDesignation`, omit `code`, and use the literal public designation as their primary display and search identity. An official public designation is not an internal manufacturer or engineering code.
* Both paths require `maker`, their identity field, `applications`, `years`, `displacement`, `layout`, `fuelKey`, `aspirationKey`, `injectionKey`, power and power rpm, and torque and torque rpm. `layout` is the current combined cylinder/configuration/valve-count field. At least one accepted direct `exactVariant` source must jointly declare the chosen identity, applications and years.
* A strict source uses exactly one evidence path. Exact-code evidence uses `scope.codes` plus `fields: code`. Official-designation evidence uses `scope.designations` plus `fields: identity.officialPublicDesignation`. A supplemental source omits both identity scopes and uses `identityBindingRef` to a referenced, accepted direct `exactVariant` identity source for the same application. Chains, cycles, mixed code/designation evidence, aggregate scopes and unbound family evidence are rejected.
* `officialPublicDesignation` is allowed only for new records or records migrated in a separately reviewed change. The designation and its application/year binding always require Tier A official evidence. The record uses `evidenceBasis: official` when Tier A covers every mandatory field, or `corroborated` when any technical field relies on a valid independent Tier B pair. It also requires an explicit `identity.review` confirming literal official publication, a stable and distinct designation, rejection of generic descriptions, and separation of materially different variants. Review notes must explain the decision. Generic displacement, fuel, layout, aspiration or power descriptions do not qualify.
* The identity-binding source must use `exactVariant`. Direct supplemental sources may use `exactVariant` or `family`, but a family source must explicitly include the selected target identity in the corresponding scope list; bridged supplemental sources must use `exactVariant`. `aggregate` sources are rejected. `pageNotes` locate evidence but never create coverage without an accepted type, declared field and compatible scope.
* Official source types for `verified` are `manufacturer`, `serviceDocumentation`, and `certificationDocument`. `technicalReference` and unknown inferred/aggregator types cannot satisfy strict verified coverage.
* `corroborated` records are for cases where an official source is unavailable. They must include `performance` and at least two independent `technicalReference` sources. Each source must cover `performance.powerKw`, `performance.torqueNm`, and `code` or `aliases`, and must include non-empty `pageNotes` explaining the engine identity and range boundaries.
* `legacyPending` records must not include `performance`; `verification.sources` must be absent or empty.

For `corroborated`, source independence requires at least two normalized publishers and at least two normalized URL hostnames. Publisher normalization trims, lowercases, and collapses repeated spaces; hostname normalization lowercases and removes a leading `www.`. Do not count reprints of the same material, mirrors, sites using the same upstream database, or separate brands of one publisher unless the data origin is genuinely independent.

Generated files:

* `engine-data.js`
* `data/engines/europe.js`
* `data/engines/japan.js`
* `data/engines/korea.js`
* `data/engines/north-america.js`
* `data/engines/south-america.js`

Regional classification follows the origin of the manufacturer or the specific engine family/development, not merely the vehicle assembly location. North America includes the USA, Canada and Mexico. South America includes Argentina, Brazil and the other countries of that region. A North American manufacturer's engine assembled in Argentina does not thereby become South American. An independently developed South American engine belongs to South America. Joint developments require a separately documented classification decision; do not reclassify disputed families without sources.

Commands:

* `npm run engines:verification-policy:test` runs fixture tests for verified, corroborated and legacyPending rules.
* `npm run engines:validate` checks source JSON, schema presence, counts, source status and B5202S source data.
* `npm run engines:generate` validates source data and rebuilds generated JS from regional source files.
* `npm run engines:generate:check` verifies generated JS is up to date.
* `npm run engines:smoke` loads generated regional browser globals and compares them with source regions.
* `npm run engines:compare` compares source data with generated outputs.
* `npm run engines:legacy-compare` compares the migration against `main` for compatibility.
* `npm run engines:check` runs the standard engine data checks.

## Contact

Email: [contact@d3orient.com](mailto:contact@d3orient.com)

Use this email to report broken links, suggest diagnostic software, send corrections or contact D3 Orient about cooperation.
