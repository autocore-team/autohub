# FORD MANUFACTURER CAMPAIGN — PHASE 2A FINAL AUDIT

## Audit outcome

The final audit covers **80/80** Phase 1 partial candidates. It changes only Phase 2A research artifacts. Phase 1, production engine data, executable code, schema policy, validators, UI, and generated files remain unchanged.

| Final status | Count |
| --- | ---: |
| identityResolved | 0 |
| identityBridgeReady | 0 |
| publicDesignationOnly | 26 |
| sharedIdentityResolved | 2 |
| unresolved | 52 |
| notProductionEligible | 0 |
| **Total** | **80** |

Identifier findings after reconciliation:

- Manufacturer codes: **0**.
- Engineering codes: **0**.
- Proven partner codes: **0**.
- Official partner designations: **2** (BDA and YBB).
- Public designations in the 26-record review: **26**.
- Ready for Phase 2B under the current exact-code policy: **0**.

## BDA, YB, and YBB reconciliation

The authoritative evidence is published by **Cosworth**, the engine partner. Cosworth says that it entered the mass-production road market with **BDA**, developed for Ford Escort road and rally cars. This proves an official Cosworth engine designation and its Ford application; it does not call BDA a Ford manufacturer code or an engineering code.

Cosworth describes **YB** as its first production engine, so Phase 2A treats YB as the family designation. The timeline separately names **YBB** as the engine used in the first Ford Sierra RS Cosworth road application. YBB is therefore the exact variant designation within the YB family for this candidate scope.

Final classification:

- `ford-cosworth-bda`: `sharedIdentityResolved`, `partnerDesigned`, identifier **BDA**, type `officialPartnerDesignation`.
- `ford-cosworth-yb`: `sharedIdentityResolved`, `partnerDesigned`, family designation **YB**, candidate identifier **YBB**, type `officialPartnerDesignation`.

Phase 1's `manufacturerCode` classification is retained as historical input but superseded by this Phase 2A finding. Neither candidate is ready for verified-record construction under the current exact-code-only policy. Both would be candidates for the proposed official-public-designation path.

## Phase 1 part-number reconciliation

All **20/20** Phase 1 `partNumber` identities were already in the **30 `alreadyRepresented`** set. Exactly **0** appear among the 80 Phase 2A candidates.

Category arithmetic for the 20 records:

| Phase 1 category | Count |
| --- | ---: |
| crateEngine | 20 |
| racing | 0 |
| industrial | 0 |
| marine | 0 |

- `ford-performance-m-6007-23tb`
- `ford-performance-m-6007-33v6na`
- `ford-performance-m-6007-35ta`
- `ford-performance-m-6007-572df`
- `ford-performance-m-6007-572dr`
- `ford-performance-m-6007-73b`
- `ford-performance-m-6007-a52xs`
- `ford-performance-m-6007-d347sr`
- `ford-performance-m-6007-d347sr7`
- `ford-performance-m-6007-m50d`
- `ford-performance-m-6007-m50dauto`
- `ford-performance-m-6007-mz73`
- `ford-performance-m-6007-s347jr2`
- `ford-performance-m-6007-x2302e`
- `ford-performance-m-6007-z2363ft`
- `ford-performance-m-6007-z2363rt`
- `ford-performance-m-6007-z2427fft`
- `ford-performance-m-6007-z2427frt`
- `ford-performance-m-6007-z460fft`
- `ford-performance-m-6007-z460frt`

These are Ford Performance catalog product numbers for existing crate-engine records. Some product titles describe racing applications, but their Phase 1 category is `crateEngine`. Since none is part of the 80-candidate Phase 2A scope, no Phase 2A candidate is rejected solely for being a product/catalog part number. This reconciles the **0 `notProductionEligible`** result.

## Public designation quality audit

Each of the 26 `publicDesignationOnly` records now has `publicIdentityQuality`.

### stableOfficialDesignation — 15

- `ford-dld-1500-tdci`
- `ford-dld-1600-tdci`
- `ford-duratec-direct-flex-2000`
- `ford-duratorq-puma-2200`
- `ford-duratorq-puma-3200`
- `ford-ecoblue-1500`
- `ford-ecoblue-2000`
- `ford-ecotorq-13000`
- `ford-ecotorq-9000`
- `ford-falcon-six-144`
- `ford-falcon-six-170`
- `ford-modular-68-v10`
- `ford-power-stroke-67`
- `ford-sigma-flex-1500`
- `ford-sigma-flex-1600`

These are branded or historically distinct designations literally used in registered Ford material and tied to an engine/application scope. They are suitable candidates for a future strict official-public-designation identity path once all required construction and performance fields are sourced.

### descriptiveLabelOnly — 4

- `ford-dragon-1500-ti-vct`
- `ford-ecoboost-35-gt-racing`
- `ford-godzilla-73`
- `ford-sigma-1200-ti-vct`

These labels primarily describe displacement, technology, fuel, or architecture. The registered evidence does not make them sufficiently distinct for a verified identity.

### ambiguousAcrossVariants — 7

- `ford-cyclone-33`
- `ford-ecoboost-1000`
- `ford-ecoboost-1500-dragon`
- `ford-ecoboost-1600`
- `ford-ecoboost-2000`
- `ford-ecoboost-27-v6`
- `ford-ecoboost-30-v6`

These are searchable Ford terms, but the current scope can span materially different generations or variants. They require application/market/period splitting or exact-code evidence.

## Refined unresolved blockers

The 52 unresolved candidates no longer use the broad `INSUFFICIENT_IDENTITY_EVIDENCE` reason.

| Blocker | Count |
| --- | ---: |
| MISSING_STABLE_IDENTIFIER | 5 |
| DESCRIPTIVE_DESIGNATION_ONLY | 2 |
| AMBIGUOUS_DESIGNATION_ACROSS_VARIANTS | 3 |
| MISSING_CODE_APPLICATION_BINDING | 2 |
| SHARED_RELATIONSHIP_UNRESOLVED | 7 |
| INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | 33 |
| **Total** | **52** |

| Candidate | Refined blocker | Future identity assessment |
| --- | --- | --- |
| `ford-335-400` | MISSING_STABLE_IDENTIFIER | exactCodeOrRelationshipRequired |
| `ford-385-460` | MISSING_STABLE_IDENTIFIER | exactCodeOrRelationshipRequired |
| `ford-australia-boss-335` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-barra-182` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-barra-240t` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-barra-270t` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-barra-ecolpi` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-big-six-300` | MISSING_STABLE_IDENTIFIER | exactCodeOrRelationshipRequired |
| `ford-cht-1600` | SHARED_RELATIONSHIP_UNRESOLVED | exactCodeOrRelationshipRequired |
| `ford-cleveland-351c` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-cologne-v6-2800` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-cologne-v6-2900` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-coyote-predator-52` | MISSING_STABLE_IDENTIFIER | exactCodeOrRelationshipRequired |
| `ford-coyote-voodoo-52` | MISSING_STABLE_IDENTIFIER | exactCodeOrRelationshipRequired |
| `ford-cvh-1600` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-cvh-1600-turbo` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-dld-1400-tdci` | MISSING_CODE_APPLICATION_BINDING | officialPublicDesignationPotentialAfterEnrichment |
| `ford-duratec-he-2000` | SHARED_RELATIONSHIP_UNRESOLVED | exactCodeOrRelationshipRequired |
| `ford-endura-e-1300` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-essex-v4-1700` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-essex-v6-3000` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-fe-390` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-fe-427` | MISSING_CODE_APPLICATION_BINDING | exactCodeOrRelationshipRequired |
| `ford-flathead-v8-221` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-flathead-v8-239` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-hcs-1100` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-kent-crossflow-1300` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-kent-crossflow-1600` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-kent-pre-crossflow-997` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-lima-2300` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-modular-46-4v` | AMBIGUOUS_DESIGNATION_ACROSS_VARIANTS | officialPublicDesignationPotentialAfterEnrichment |
| `ford-modular-54-4v` | AMBIGUOUS_DESIGNATION_ACROSS_VARIANTS | officialPublicDesignationPotentialAfterEnrichment |
| `ford-navistar-power-stroke-60` | SHARED_RELATIONSHIP_UNRESOLVED | exactCodeOrRelationshipRequired |
| `ford-navistar-power-stroke-73` | SHARED_RELATIONSHIP_UNRESOLVED | exactCodeOrRelationshipRequired |
| `ford-pinto-ohc-1600` | DESCRIPTIVE_DESIGNATION_ONLY | exactCodeOrRelationshipRequired |
| `ford-pinto-ohc-2000` | DESCRIPTIVE_DESIGNATION_ONLY | exactCodeOrRelationshipRequired |
| `ford-power-stroke-30` | SHARED_RELATIONSHIP_UNRESOLVED | exactCodeOrRelationshipRequired |
| `ford-psa-dw12-2200` | SHARED_RELATIONSHIP_UNRESOLVED | exactCodeOrRelationshipRequired |
| `ford-sho-yamaha-30` | SHARED_RELATIONSHIP_UNRESOLVED | exactCodeOrRelationshipRequired |
| `ford-valencia-1100` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-vulcan-30` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-windsor-289` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-windsor-302` | AMBIGUOUS_DESIGNATION_ACROSS_VARIANTS | officialPublicDesignationPotentialAfterEnrichment |
| `ford-windsor-351w` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-y-block-292` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-y-block-312` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-zetec-e-1600` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-zetec-e-1800` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-zetec-e-2000` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-zetec-rocam-1600` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-zetec-se-1250` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |
| `ford-zetec-se-1600` | INSUFFICIENT_SOURCE_IDENTITY_EVIDENCE | officialPublicDesignationPotentialAfterEnrichment |

The **37** `officialPublicDesignationPotentialAfterEnrichment` cases consist of 33 candidates blocked by archive-level rather than candidate-specific evidence, three ambiguous identities that could be split into stable scopes, and `ford-dld-1400-tdci`, whose designation needs complete application binding. The other **15** still need exact-code or shared-relationship evidence.

## Feasibility of a second verified identity path

Recommendation: **implement a separate `officialPublicDesignation` path**, while retaining `exactCode` as the preferred path. The audit finds **15 of 26** current public-designation records potentially suitable, and **37 of 52** unresolved records potentially suitable after source enrichment or scope splitting. **15 of 52** unresolved records still require exact-code or relationship evidence.

Proposed identity model:

- `identity.type: exactCode` for manufacturer, engineering, or fully bridged partner codes.
- `identity.type: officialPublicDesignation` for stable manufacturer-published identities when an internal code is not publicly disclosed.

Strict acceptance conditions for `officialPublicDesignation`:

1. The designation is literally published by the manufacturer or authoritative engine partner.
2. The evidence binds it to a specific engine and application scope.
3. It is more than displacement, fuel type, or a generic engine description.
4. Markets and production period are explicitly bounded.
5. Materially different variants are separate records.
6. Valves, total camshafts, aspiration, injection, power, torque, and both RPM values remain mandatory and sourced.
7. UI labels the value **Official engine designation**, never **Engine code**.
8. Search indexes identity value plus identity type; duplicate detection compares type, normalized value, application, market, and period.
9. Partner-published designations retain publisher ownership and relationship metadata.

This is an architecture recommendation only. No production schema, validator, UI, policy, or engine record was changed.

## Validation scope

Research validation covers exact 80/80 candidate coverage, Phase 2A schema conformance, source references, status arithmetic, BDA/YB/YBB consistency, all 20 part-number identities, allowed `publicIdentityQuality` values, blocker arithmetic, absence of absolute paths, and `git diff --check`.

No npm, generator, UI, legacy, or production semantic suite is part of this audit.
