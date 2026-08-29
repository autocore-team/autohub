# AutoHub

AutoHub is a practical automotive web project with calculators, guides and reference tools for drivers.

The goal is simple:

**Check first. Understand the result. Avoid expensive mistakes.**

## Live website

https://autocore-team.github.io/autohub/

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

The engine section is planned as a searchable reference database.

Future structure:

* search by engine code
* full page for each engine
* technical specifications
* oil recommendations
* common problems
* diagnostics information
* maintenance notes
* related engines

The first full engine page is planned for:

**Volvo B5202**

## Motor Oil Guide

The oil guide is based on an important principle:

**Motor oil should not be selected by viscosity alone.**

Selection logic:

vehicle → engine → year → fuel type → turbo/NA → DPF/GPF → manufacturer approval → viscosity → climate → driving mode

## Project status

AutoHub is under active development.

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

AutoHub is currently a static website.

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

## Engine Data Pipeline

Engine data has four editable regional source files:

* `data/engines/source/regions/europe.json`
* `data/engines/source/regions/japan.json`
* `data/engines/source/regions/korea.json`
* `data/engines/source/regions/usa.json`

The formal source structure is documented in:

`data/engines/source/schema.json`

The JSON Schema is the formal contract for documentation and editor support. `validate-engine-data.mjs` is the executable source-data check used by npm/CI in the current zero-dependency pipeline. It verifies that `schema.json` exists and is valid JSON, then enforces the project-specific business rules: fixed region order, exact record counts, unique IDs, verification policy, and the verified Volvo B5202S source/performance constraints. When the data structure changes, update both `schema.json` and the executable validation policy in the same change.

Verification status policy:

* `verified` records must include `performance` and at least one official source covering `performance.powerKw`, `performance.torqueNm`, and `code` or `aliases`. Official source types are `manufacturer`, `serviceDocumentation`, and `certificationDocument`; additional source types may be present.
* `corroborated` records are for cases where an official source is unavailable. They must include `performance` and at least two independent `technicalReference` sources. Each source must cover `performance.powerKw`, `performance.torqueNm`, and `code` or `aliases`, and must include non-empty `pageNotes` explaining the engine identity and range boundaries.
* `legacyPending` records must not include `performance`; `verification.sources` must be absent or empty.

For `corroborated`, source independence requires at least two normalized publishers and at least two normalized URL hostnames. Publisher normalization trims, lowercases, and collapses repeated spaces; hostname normalization lowercases and removes a leading `www.`. Do not count reprints of the same material, mirrors, sites using the same upstream database, or separate brands of one publisher unless the data origin is genuinely independent.

Generated files:

* `engine-data.js`
* `data/engines/europe.js`
* `data/engines/japan.js`
* `data/engines/korea.js`
* `data/engines/usa.js`

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

Email: [autocore.team@gmail.com](mailto:autocore.team@gmail.com)

Use this email to report broken links, suggest diagnostic software, send corrections or contact AutoHub about cooperation.
