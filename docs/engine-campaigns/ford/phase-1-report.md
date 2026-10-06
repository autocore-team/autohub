# FORD MANUFACTURER CAMPAIGN — PHASE 1

## Scope and baseline

Phase 1 is complete as a discovery inventory. Coverage is substantial but not exhaustive. It does not modify, enrich, or migrate production engine data. The baseline remains **916 records** (**827 verified**, **89 legacyPending**) at main commit `75fb4d8253f1133d96ec4eca222770be059cf507`; its semantic hash is `92b39177bda0e206293b60e4a238a9dad1d42097957fda3d3180bda0aafa6fe1`.

## Audited identity arithmetic

| Identifier type | Identities |
| --- | ---: |
| Exact manufacturer codes | 2 |
| Exact engineering codes | 0 |
| Family designations | 78 |
| Marketing designations | 10 |
| Part numbers | 20 |
| Unknown identifiers | 0 |
| **Total inventory identities** | **110** |

Only **2** identities are exact manufacturer/engineering codes. Part numbers are exact catalog identities but are reported separately. The remaining entries are explicitly family or marketing designations and are not described as exact codes.

- Existing production matches: **30** = 20 verified + 10 legacyPending.
- New discovery candidates: **80**.
- Status arithmetic: **30 existingProduction + 80 partialCandidate = 110**.
- Canonical families: **61**.

## UNKNOWN_CODE and hold audit

Open holds total **90**:

- INSUFFICIENT_OFFICIAL_EVIDENCE: **10**.
- SHARED_ENGINE_IDENTITY: **2**.
- UNKNOWN_CODE: **78**.

The total exceeds the 80 new candidates because each new candidate has one identity/evidence hold and the 10 existing legacy records have an additional unresolved strict-evidence or shared-identity hold. No hold is closed or counted twice by market/application.

The 78 current `UNKNOWN_CODE` holds are classified as:

- codeProbablyExistsButNotFound: **7**.
- likelyNoDistinctPublicCode: **39**.
- marketingDesignationOnly: **25**.
- sharedCoDevelopedIdentityUnresolved: **7**.

Every UNKNOWN_CODE hold now records the designation found, why it is not an exact code, official sources checked, the next document needed, current-schema compatibility, and whether a policy/architecture decision is required. BDA and YB were removed from UNKNOWN_CODE because they are exact public Cosworth designations; their remaining problem is authoritative code-to-application evidence.

Historic engines that were publicly identified by family/displacement may conflict with the strict exact-code policy even after exhaustive research. They require an explicit compatibility decision; a made-up code is not acceptable.

## Duplicate and family audit

The normalized audit used family, code/designation, aliases, displacement, category, and relationship. It found no duplicate composite identities, self-references, duplicate chains, or cycles. `duplicateOf` is empty because regional applications, Lincoln/Mercury applications, trims, power ratings, and source URLs were consolidated inside one identity rather than retained as duplicate records. Eight recurring duplicate classes were avoided during construction: Lincoln/Mercury applications, regional Sigma, regional EcoBoost, PSA DW10/DW12, Volvo B5254T, Navistar Power Stroke, Australian/imported Coyote, and production/crate overlap.

All 61 family IDs are unique and every family contains at least one identity. The audit keeps technically distinct names separate across Kent/Valencia/Crossflow, Essex/Cologne, Zetec/Zetec-SE/Sigma, Duratec, Duratorq/DLD/EcoBlue, Windsor/Cleveland/FE/385, Modular/Coyote, Cyclone/Essex/Vulcan, Power Stroke, Barra, and South American families. The B5254T and DW10 family names were corrected after the initial automatic normalization removed meaningful digits.

## Existing production and shared identities

All 30 production references resolve one-to-one to existing production IDs; codes/designations and verification states match the source records. No production ID is assigned to multiple inventory identities. The exact Ford Performance part-number records account for all 20 verified matches; 10 road-engine records remain legacyPending and unchanged.

The shared audit contains **12** identities. It records Ford relationship, partner, base family, Ford designation, partner designation, applications, sources, and double-count control for Mazda, PSA, Volvo, Jaguar/Land Rover, International/Navistar, Yamaha, Cosworth, and Renault relationships. Duratec 30 and Duratec HE were corrected from `fordDesigned` to shared/partner relationships. Partner designations are crosswalk hints only where evidenceStatus is `identityCrosswalkIncomplete`; they do not create a second Ford candidate.

## Categories and coverage

- crateEngine: **20**.
- heavyCommercial: **2**.
- lightCommercial: **4**.
- passengerVehicle: **66**.
- racing: **4**.
- suvPickup: **14**.

Road, crate, racing, light-commercial, and heavy-commercial identities remain distinct. Industrial and marine identities are explicit coverage gaps because stable official identity evidence was not found in this pass. Geographic coverage includes Europe, North America, South America, Australia/New Zealand, India, Asia, Africa, the Middle East, Mexico, China, and Turkey, but it is a routing map rather than an exhaustive worldwide catalog.

## Checkpoint audit

| Checkpoint | Status | Scope | Identities/families reviewed | Sources | Duplicates avoided | Holds | Remaining gaps |
| --- | --- | --- | ---: | ---: | ---: | ---: | --- |
| A | complete | Existing Ford/Lincoln/Mercury/Ford Performance production audit | 30 | 24 | 0 | 10 | Ten legacy records still need strict evidence; exact crate records remain already represented. |
| B | complete | Canonical family grouping and alias review | 61 | 47 | 0 | 0 | Parent/child taxonomy is intentionally shallow; family periods remain incomplete. |
| C | partial | Europe passenger, performance, diesel, and light-commercial families | 29 | 11 | 0 | 29 | Historic exact codes and complete period/application bounds remain incomplete. |
| D | partial | North America historic V8/I6, Modular/Coyote, EcoBoost, and Power Stroke | 31 | 6 | 0 | 31 | MEL and several historic/material variants are coverage gaps; partner diesel crosswalks remain incomplete. |
| E | partial | South America CHT, Rocam, Sigma, and flex-fuel applications | 5 | 4 | 0 | 5 | Official CHT/Rocam identity documents and complete regional code coverage are missing. |
| F | partial | Australia/New Zealand Barra and Boss local identities | 5 | 1 | 0 | 5 | Archived local technical documents and complete Barra/Boss variant coverage are missing. |
| G | partial | India/Asia/Africa/Middle East, Ford Otosan, racing, and other regional engines | 10 | 7 | 0 | 10 | Regional code crosswalks, industrial, and marine coverage remain incomplete. |
| H | complete | Normalized cross-market duplicate audit | 110 | 47 | 8 | 0 | No duplicateOf entries were required; repeat after identity resolution changes designations. |
| I | complete | Hold classification and shared-identity reconciliation | 12 | 4 | 0 | 90 | All holds remain open and are routed to identity resolution or evidence work. |

Checkpoint A and the structural B/H/I checkpoints are complete for the current artifact set. Regional checkpoints C–G are partial because exact codes, some historic families, and industrial/marine coverage remain incomplete. The next work is Phase 2A identity resolution; it has not started.

## Source registry audit

The registry contains **47** unique reusable sources, all from official Ford, Ford Performance, Ford regional media/technical archives, or Ford Otosan publishers. Two duplicate URL registrations found during final audit were consolidated into shared source entries. URLs are direct product, document, catalog, corporate, or official archive URLs rather than search-result URLs. Every entry has location and limitations, source references resolve, and no duplicate source IDs or URLs remain. Automated HEAD checks returned 200 for 28 URLs; 19 official Ford Media endpoints returned 403 to HEAD and are marked `headRequestRestricted` rather than falsely recorded as directly available. Broad archive/index entries retain discovery-only limitations and do not confer strict production verification. No dealer, forum, Wikipedia, aggregator, or unverified mirror is classified Tier A.

## Phase 2 readiness

- **30 alreadyRepresented** production matches.
- **80 partialCandidate** discovery identities.
- **0 new readyForEnrichment** identities.

### Phase 2A — exact-code and identity resolution

| Priority | Group | Estimated identities | Best reusable sources | Documents still needed |
| --- | --- | ---: | --- | --- |
| 1 | Current EcoBoost/EcoBlue/Duratorq and regional applications | 15–20 | Ford regional technical specifications | Parts/service/type-approval code crosswalks |
| 2 | Sigma/Dragon/DLD/Duratec shared engines | 10–15 | Ford Brazil, India, Europe, and partner material | Ford/partner exact-code crosswalks |
| 3 | Modular/Coyote/Cyclone/Power Stroke/Godzilla | 15–20 | Ford Performance and Ford truck specifications | Generation-specific parts/service documents |
| 4 | Historic Europe, Kent through Zetec | 15–20 | Ford Heritage Vault | Period parts, workshop, homologation, and casting references; policy decision where no public code exists |
| 5 | Historic North America, Flathead through 385/Lima | 15–20 | Ford Heritage Vault | Period code/application documentation |
| 6 | Australia Barra/Boss and local families | 5–10 | Ford Australia archive | Stable local technical and homologation documents |
| 7 | Ford Otosan Ecotorq and regional commercial engines | 4–8 | Ford Otosan technical pages | Exact internal codes and rating/application scopes |
| 8 | Racing identities | 3–6 | Ford/Cosworth homologation sources | Exact code-to-application evidence |

### Phase 2B — construction enrichment

After identity resolution, collect valve count, camshaft arrangement, injection, and aspiration from exact-variant service or certification sources.

### Phase 2C — performance and application enrichment

Only after identity and construction binding, collect power/rpm, torque/rpm, years, applications, and markets with explicit source field coverage.

## Manufacturer-first efficiency assessment

Manufacturer-first is more effective for **discovery**: it improves reusable-source handling, family structure, shared-identity detection, duplicate avoidance, resumability, and coverage mapping. It is not more effective for immediate production growth in this pass: no new candidate is ready, most candidates still need exact-code resolution, and the research artifacts are large. The main bottleneck is the gap between public marketing/family terminology and the strict exact-code policy.

For the next manufacturer, start with a smaller identity-resolution pilot before widening regional coverage, classify identifier types at ingestion, record partner ownership immediately, and distinguish “likely no public code” from “code not yet found” from the first checkpoint.

## Validation contract

Campaign validation checks JSON parsing, schema conformance, unique candidate/family/source/hold IDs, source and hold reference resolution, duplicate target/cycle checks, production ID references, identifier/status arithmetic, absence of absolute local paths, production baseline preservation, and Git whitespace checks. Generator, npm, UI, and legacy-comparison tests are intentionally omitted because production and executable code are unchanged.
