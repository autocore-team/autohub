# Ford Manufacturer Campaign Phase 2B

Phase 2B reconciles the fixed pool of 54 Phase 1/2A identities. The final audit retains five production records and places the 2021 Power Stroke candidate on hold because its exact-scope brochure does not establish total camshaft count.

## Reconciliation

- implemented: 5
- readyButDuplicate: 0
- holdMissingConstruction: 6
- holdMissingPerformance: 4
- holdMissingApplicationScope: 37
- holdIdentityAmbiguous: 2
- holdSourceConflict: 0
- notProductionEligible: 0

Five exact application/year calibrations satisfy the strict officialPublicDesignation path. All use Tier A evidence, omit code, preserve the 916-record baseline and are classified under north-america by Ford manufacturer ownership rather than sales market.

## Implemented records

| ID | Literal official designation | Exact application / year / market | Construction | Stored performance | Evidence |
|---|---|---|---|---|---|
| ford-phase2b-dld-1500-tdci-ecosport-2015 | 1.5-litre TDCi (95PS) ECOnetic Technology | Ford EcoSport (Europe, 2015 technical specification) / 2015 / Europe | Inline-4 · DOHC · 8 valves · 2 camshafts total; turbocharged; commonRail | 70 kW @ 3750 rpm; 215 N·m @ 1750 rpm | p2b-ford-ecosport-2015-technical-specification |
| ford-phase2b-dld-1600-tdci-transit-connect-2013 | 1.6-litre Duratorq TDCi (95PS) | Ford Transit Connect (Europe, 2013 95PS specification) / 2013 / Europe | Inline-4 · SOHC · 8 valves · 1 camshaft total; turbocharged; commonRail | 70 kW @ 3600 rpm; 230 N·m @ 1500–2000 rpm | p2b-ford-transit-connect-2013-technical-specification |
| ford-phase2b-duratec-direct-flex-2000-focus-2015 | 2.0L Duratec Direct Flex | Ford Focus (Brazil, 2015 owner-manual specification) / 2015 / Brazil | Inline-4 · DOHC · 16 valves · 2 camshafts total; naturallyAspirated; directInjection | 130.9 kW @ 6500 rpm; 221 N·m @ 4500 rpm | p2b-ford-focus-2015-owner-manual |
| ford-phase2b-sigma-flex-1500-new-fiesta-2014 | Sigma 1.5 Flex | Ford New Fiesta (Brazil, 2014 specification) / 2014 / Brazil | Inline-4 · DOHC · 16 valves · 2 camshafts total; naturallyAspirated; multiPointInjection | 82.2 kW @ 5500 rpm; 146.8 N·m @ 4250 rpm | p2b-ford-new-fiesta-2014-launch + p2b-ford-new-fiesta-2014-owner-manual |
| ford-phase2b-sigma-tivct-flex-1600-focus-2015 | 1.6L Sigma Flex | Ford Focus (Brazil, 2015 owner-manual specification) / 2015 / Brazil | Inline-4 · DOHC · 16 valves · 2 camshafts total; naturallyAspirated; multiPointInjection | 99.3 kW @ 6500 rpm; 163.7 N·m @ 5250 rpm | p2b-ford-focus-2015-owner-manual |

Evidence breakdown: official 5, corroborated 0; direct records 4, direct-plus-identity-bridge records 1.

## Flex-fuel performance decision

The original ranges were artificial unions of gasoline and ethanol calibrations. The canonical records now store the manufacturer’s maximum ethanol headline calibration as a point value. Gasoline values and the data-model limitation remain in evidence notes without adding field coverage.

| Record | Fuel | Power | Power rpm | Torque | Torque rpm | Exact evidence |
|---|---|---:|---:|---:|---:|---|
| ford-phase2b-duratec-direct-flex-2000-focus-2015 | gasoline | 175 cv (128.7 kW) | 6,500 | 211 N·m | 4,500 | Focus 2015 owner manual, p. 288, engine specification table |
| ford-phase2b-duratec-direct-flex-2000-focus-2015 | ethanol (stored) | 178 cv (130.9 kW) | 6,500 | 221 N·m | 4,500 | Focus 2015 owner manual, p. 288, engine specification table |
| ford-phase2b-sigma-tivct-flex-1600-focus-2015 | gasoline | 131 cv (96.3 kW) | 6,500 | 158.9 N·m | 3,000 | Focus 2015 owner manual, p. 287, engine specification table |
| ford-phase2b-sigma-tivct-flex-1600-focus-2015 | ethanol (stored) | 135 cv (99.3 kW) | 6,500 | 163.7 N·m | 5,250 | Focus 2015 owner manual, p. 287, engine specification table |
| ford-phase2b-sigma-flex-1500-new-fiesta-2014 | gasoline | 107.1 cv (78.8 kW) | 6,500 | 145.9 N·m | 4,250 | New Fiesta 2014 owner manual, p. 189, engine specification table |
| ford-phase2b-sigma-flex-1500-new-fiesta-2014 | ethanol (stored) | 111.8 cv (82.2 kW) | 5,500 | 146.8 N·m | 4,250 | New Fiesta 2014 owner manual, p. 189, engine specification table |

CV is metric horsepower and is converted with `1 cv = 0.73549875 kW`, rounded to the project’s one-decimal convention. The diesel technical specifications publish kW and N·m directly, so no conversion is stored for those records. The held Power Stroke source publishes 475 mechanical hp and 1,050 lb-ft; its research notes preserve `hp × 0.7456998716 = 354.2 kW` and `lb-ft × 1.3558179483 = 1,423.6 N·m`, also rounded to one decimal.

## Construction evidence

| Candidate | Evidence conclusion |
|---|---|
| ford-duratec-direct-flex-2000 | Focus manual p. 288: inline four, four valves per cylinder, and two independently variable camshafts → 16 valves and two camshafts. |
| ford-sigma-flex-1600 | Focus manual p. 287: inline four, four valves per cylinder, and two independently variable camshafts → 16 valves and two camshafts. |
| ford-sigma-flex-1500 | Ford launch: DOHC 16V for the exact 2014 New Fiesta application → 16 valves and two camshafts. |
| ford-dld-1500-tdci | EcoSport technical specification: four inline cylinders, DOHC, two valves per cylinder, belt to intake cam and chain to exhaust cam → eight valves and two camshafts. |
| ford-dld-1600-tdci | Transit Connect technical specification p. 4: four inline cylinders, SOHC and two valves per cylinder → eight valves and one camshaft. |
| ford-power-stroke-67 | 2021 brochure proves V8, OHV and 32 valves, but not total camshafts. A Ford 2023 service document explicitly describes one camshaft, yet it is outside the exact 2021 scope and is not used to close the field. Candidate held. |

## Identity, region and ownership

The stored designations reproduce the wording in the cited Tier A documents: `2.0L Duratec Direct Flex`, `1.6L Sigma Flex`, `Sigma 1.5 Flex`, `1.5-litre TDCi (95PS) ECOnetic Technology`, and `1.6-litre Duratorq TDCi (95PS)`. The two TDCi records are restricted to their cited 95PS application/year scopes. The records remain under `north-america` because the dataset classifies by manufacturer ownership; European sales scope alone does not change region. The research evidence treats both DLD/Duratorq applications as Ford public identities and contains no source-backed partner ownership that would justify another maker or region.

BDA and YBB remain partnerDesigned Cosworth official designations. Neither is represented as a Ford manufacturer or engineering code.

## Holds

| Candidate | Outcome | Exact blocker |
|---|---|---|
| ford-australia-boss-335 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-barra-182 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-barra-240t | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-barra-270t | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-barra-ecolpi | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-cleveland-351c | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-cologne-v6-2800 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-cologne-v6-2900 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-cosworth-bda | holdMissingPerformance | The authoritative identity/application evidence does not provide both power and torque with engine-speed locations for one road calibration. |
| ford-cosworth-yb | holdMissingPerformance | The authoritative identity/application evidence does not provide both power and torque with engine-speed locations for one road calibration. |
| ford-cvh-1600 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-cvh-1600-turbo | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-dld-1400-tdci | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-duratorq-puma-2200 | holdMissingConstruction | The authoritative scope lacks at least one mandatory construction field, especially explicit total camshafts and/or injection coverage. |
| ford-duratorq-puma-3200 | holdMissingConstruction | The authoritative scope lacks at least one mandatory construction field, especially explicit total camshafts and/or injection coverage. |
| ford-ecoblue-1500 | holdIdentityAmbiguous | The designation spans materially different calibrations/applications and existing evidence does not provide a collision-safe exact scope split with complete construction and performance. |
| ford-ecoblue-2000 | holdIdentityAmbiguous | The designation spans materially different calibrations/applications and existing evidence does not provide a collision-safe exact scope split with complete construction and performance. |
| ford-ecotorq-13000 | holdMissingConstruction | The authoritative scope lacks at least one mandatory construction field, especially explicit total camshafts and/or injection coverage. |
| ford-ecotorq-9000 | holdMissingConstruction | The authoritative scope lacks at least one mandatory construction field, especially explicit total camshafts and/or injection coverage. |
| ford-endura-e-1300 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-essex-v4-1700 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-essex-v6-3000 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-falcon-six-144 | holdMissingPerformance | The authoritative identity/application evidence does not provide both power and torque with engine-speed locations for one road calibration. |
| ford-falcon-six-170 | holdMissingPerformance | The authoritative identity/application evidence does not provide both power and torque with engine-speed locations for one road calibration. |
| ford-fe-390 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-flathead-v8-221 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-flathead-v8-239 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-hcs-1100 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-kent-crossflow-1300 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-kent-crossflow-1600 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-kent-pre-crossflow-997 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-lima-2300 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-modular-46-4v | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-modular-54-4v | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-modular-68-v10 | holdMissingConstruction | The authoritative scope lacks at least one mandatory construction field, especially explicit total camshafts and/or injection coverage. |
| ford-power-stroke-67 | holdMissingConstruction | The 2021 Ford brochure establishes OHV and 32 valves but does not state total camshaft count; OHV alone is not accepted as proof of one camshaft, and the available 2023 Ford service document is outside the exact 2021 scope. |
| ford-valencia-1100 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-vulcan-30 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-windsor-289 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-windsor-302 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-windsor-351w | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-y-block-292 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-y-block-312 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-zetec-e-1600 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-zetec-e-1800 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-zetec-e-2000 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-zetec-rocam-1600 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-zetec-se-1250 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |
| ford-zetec-se-1600 | holdMissingApplicationScope | Existing research does not bind a safe exact application and complete year interval; technical fields also remain incomplete, so no production scope can be formed. |

## Dataset contract

The first 916 records remain semantic and order stable with baseline semantic SHA-256 `92b39177bda0e206293b60e4a238a9dad1d42097957fda3d3180bda0aafa6fe1`. Phase 2B appends five verified records to north-america. The resulting 921-record semantic SHA-256 is `470d47d40d34f08bbe9b35749541f747f9ec7e9880bc25609ceb1c4c3a8e096c`.
