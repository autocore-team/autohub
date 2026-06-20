# AutoHub Roadmap

## Project goal

AutoHub is a practical automotive portal for drivers who want to check tire sizes, wheel fitment, fuel costs, diagnostics, engines, oils and vehicle data before buying parts or tools.

The main idea is simple:

Check first. Understand the result. Avoid expensive mistakes.

## Current state

The project already has:

* Tire calculator.
* Fuel cost calculator.
* Diagnostics page.
* Engines page.
* PCD / wheel fitment section.
* Guides section.
* GitHub Pages deployment.
* AGENTS.md with project rules.
* TASKS.md with current priorities.

## Phase 1 — Stability and trust

Goal: make the site look like a real project, not a test page.

Tasks:

* Keep the existing tire calculator working.
* Do not break current URL parameters.
* Improve site navigation.
* Add Contact page.
* Add About page.
* Add Privacy Policy.
* Add Affiliate Disclosure page.
* Add footer links to important pages.

## Phase 2 — Diagnostics section

Goal: turn diagnostics.html from a simple list into a useful diagnostic software guide.

Tasks:

* Keep all existing diagnostic software links.
* Add software cards.
* Add categories by brand, protocol and cable type.
* Add warnings about cable compatibility.
* Explain which cable is needed for which software.
* Avoid selling free diagnostic software directly.
* Monetize later through guides, affiliate links and recommended tools.

## Phase 3 — Tire calculator graphics

Goal: make the tire calculator more visual and easier to understand.

Tasks:

* Add old vs new tire visual comparison.
* Add wheel diameter difference.
* Add tire width difference.
* Add inner clearance diagram.
* Add outer poke diagram.
* Add AutoHub verdict:

  * Safe
  * Caution
  * Check manually

## Phase 4 — Engine database

Goal: do not continue a huge engine list on one page.

The engines.html page should become a search page where the user enters an engine code.

Example:

User enters:

B5202

AutoHub opens:

/engines/volvo-b5202.html

Each engine should have a full SEO page with:

* Engine overview.
* Technical specifications.
* Cars where it was used.
* Oil capacity and oil recommendations.
* Manufacturer approvals.
* Timing belt or chain information.
* Fuel system.
* ECU / engine management system.
* Diagnostics information.
* Common problems.
* Maintenance intervals.
* Tuning potential.
* Related engines.

The first full engine page should be:

Volvo B5202

The structure can be inspired by sites like Otoba, but AutoHub must not copy their text, design or images.

## Phase 5 — Motor oil guide

Goal: create a useful oil selection section.

Oil should not be selected by viscosity alone.

Selection logic:

vehicle → engine → year → fuel type → turbo or naturally aspirated → DPF/GPF → manufacturer approval → viscosity → climate → driving mode.

The oil guide should explain:

* What 0W-20, 5W-30, 5W-40 and 10W-40 mean.
* Why manufacturer approval is important.
* Why DPF/GPF engines need correct oil.
* How climate affects oil choice.
* How driving mode affects oil interval.
* What changes for old engines with high mileage.

## Phase 6 — VIN decoder

Goal: add a basic VIN decoder later.

Tasks:

* Add free basic VIN decoding.
* Do not store VIN numbers.
* Show basic vehicle data.
* Add a clear privacy note.
* Later add affiliate link for full vehicle history report.

## Phase 7 — PWA and apps

Goal: make AutoHub installable and useful on phones.

Tasks:

* Add PWA support.
* Add manifest.json.
* Add service-worker.js.
* Add icons.
* Add offline support for calculators.
* Later consider Android app.
* iPhone app should be considered later, when the site has more real functionality.

## Phase 8 — Monetization

Goal: prepare monetization without hurting trust.

Possible monetization:

* Affiliate links for diagnostic cables and tools.
* Affiliate links for OBD2, ELM327, KKL, VIDA/DICE and other adapters.
* Ads later, when the site has enough useful content.
* Paid PDF guides later.
* Partner links for full vehicle history reports.
* Recommended tools sections.

Important:

* Add affiliate disclosure.
* Do not mislead users.
* Do not sell free diagnostic software directly.
* Focus on trust and practical value first.

## Working method

Use this workflow:

1. Discuss ideas with ChatGPT.
2. Prepare a clear task for Codex.
3. Codex or GitHub creates a separate branch.
4. Changes go through Pull Request.
5. Check before merging.
6. Do not push directly to main for important changes.
7. Do not break working calculators.
