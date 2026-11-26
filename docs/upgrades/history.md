# Every upgrade, by family

The full record behind [the modernization plan](README.md). The plan's "How we got here" table is the headline version;
this page lists every pull request that moved a dependency, a runtime, an image or the toolchain, so nobody has to
remember them or search for them again (the maintainer's request, 26 November 2026, #3749).

**143 pull requests, from the first in September 2019 to 26 November 2026**, out of 1,768 merged in that time.
Dates are when each merged, US Central.

| Family | Pull requests |
| --- | --- |
| [Angular](#angular) | 13 |
| [Angular code moved to newer APIs](#angular-code-moved-to-newer-apis) | 5 |
| [Nx](#nx) | 15 |
| [TypeScript](#typescript) | 2 |
| [Esri / ArcGIS](#esri--arcgis) | 16 |
| [NestJS and API libraries](#nestjs-and-api-libraries) | 7 |
| [Database](#database) | 3 |
| [Test tooling](#test-tooling) | 16 |
| [Lint and format](#lint-and-format) | 5 |
| [Node, images and Docker](#node-images-and-docker) | 11 |
| [GitHub Actions and CI](#github-actions-and-ci) | 8 |
| [Security fixes in dependencies](#security-fixes-in-dependencies) | 15 |
| [Other dependencies](#other-dependencies) | 23 |
| [Packages removed](#packages-removed) | 4 |

## How this list was made, and how to extend it

**Add a row when an upgrade merges**, in the same pull request, as the plan page asks for its own table.

It was built once, on 26 November 2026, from every merged pull request (`gh pr list --state merged`, fetched in date
windows so GitHub's 1,000-result cap does not cut the early years off). A title filter picked candidates, and each
was then **kept or dropped by hand**:

- **Kept:** pull requests that moved a package's version, a runtime or base image, the toolchain, or moved code onto a
  newer framework API as part of an upgrade (Angular's signal inputs, outputs and queries; Esri's map components).
  Security fixes in dependencies have their own family. Packages removed because nothing used them are kept too,
  because a removal changes what we install.
- **Dropped:** features and fixes that only mention a package (`fix(maps-esri): ...`), documentation, and the GIS Day
  release-notes pull requests whose titles match only on `sha-...`.

**What a title filter can miss:** an upgrade whose title names neither the package nor a word like *upgrade*,
*bump* or *move*. A second pass looked for version-shaped titles (`x.y to z`, *advisory*, *override*, *pin*), and
that is how the security overrides of October 2026 got in. Anything still missing gets a row when it is found.

## Angular

| Merged | Pull request | What |
| --- | --- | --- |
| 2 Oct 2026 | [1309](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1309) | chore(common-ngx-local-store): Upgrade ngx-webstorage-service to 5.0.0, its Ivy release |
| 2 Oct 2026 | [1310](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1310) | chore(cpa-ngx-admin): Upgrade ng2-dragula to 4.0.0, its Ivy release for Angular 15 |
| 3 Oct 2026 | [1345](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1345) | chore(workspace): Upgrade Angular 15 to 16, with Nx 16.10 |
| 4 Oct 2026 | [1370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1370) | chore(workspace): Upgrade Angular 16 to 17, with Nx 17.3 |
| 4 Oct 2026 | [1377](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1377) | chore(workspace): Upgrade Angular 17 to 18, with Nx 19.8 |
| 4 Oct 2026 | [1406](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1406) | chore(workspace): Upgrade Angular 18 to 19, with Nx 20.8 |
| 5 Oct 2026 | [1451](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1451) | chore(workspace): Upgrade Angular 19 to 20, with Nx 21 |
| 5 Oct 2026 | [1465](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1465) | chore(workspace): Upgrade Angular 20 to 21, with Nx 22 |
| 6 Oct 2026 | [1471](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1471) | chore(workspace): Upgrade Angular 21 to 22, with Nx 23 and TypeScript 6 |
| 18 Oct 2026 | [1925](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1925) | chore(workspace): Update Angular 22.1.8 to 22.2.3 |
| 23 Oct 2026 | [2178](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2178) | chore(workspace): Move angular-eslint to 22.6.0, the first step towards Nx 24 |
| 6 Nov 2026 | [2665](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2665) | chore(deps): Bump the angular group across 1 directory with 14 updates |
| 23 Nov 2026 | [3259](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3259) | chore(workspace): Angular 22.2.6, with @angular/animations and the CLI's own packages in the same change |

## Angular code moved to newer APIs

| Merged | Pull request | What |
| --- | --- | --- |
| 11 Oct 2026 | [1660](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1660) | refactor(workspace): Migrate @Input() to signal inputs |
| 12 Oct 2026 | [1667](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1667) | refactor(workspace): Migrate @Output() to output() |
| 12 Oct 2026 | [1668](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1668) | refactor(workspace): Migrate view and content queries to signal queries |
| 19 Oct 2026 | [1950](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1950) | feat(maps-esri): Host the maps in Esri's <arcgis-map> and <arcgis-scene>, in place of view.ui |
| 25 Nov 2026 | [3616](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3616) | chore(gisday-angular): GIS Day's components run OnPush, Angular 22's default |

## Nx

| Merged | Pull request | What |
| --- | --- | --- |
| 21 Dec 2020 | [90](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/90) | dep(nx-workspace): Nx workspace upgrade |
| 28 Jan 2022 | [178](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/178) | chore: Nx Workspace 13.6.1 Upgrade |
| 28 Jan 2022 | [181](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/181) | chore: Nx 13 Package Lock Update |
| 31 Jan 2022 | [182](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/182) | chore: Nx workspace upgrade 13.7.1 |
| 9 Sep 2025 | [432](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/432) | chore(workspace): Upgrade Nx workspace to 14.0.0 |
| 8 Oct 2025 | [448](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/448) | chore: upgrade Nx workspace to 16.0.0 and migrate to @nx packages |
| 20 Oct 2026 | [1984](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1984) | chore(workspace): Upgrade Nx 23.2 to 23.3 |
| 23 Oct 2026 | [2182](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2182) | chore(workspace): Move lint to Nx's inferred targets, ahead of Nx 24 |
| 23 Oct 2026 | [2184](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2184) | chore(workspace): Move Jest to Nx's inferred targets, ahead of Nx 24 |
| 23 Oct 2026 | [2223](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2223) | chore(workspace): Move the API builds to Nx's inferred webpack targets, ahead of Nx 24 |
| 23 Oct 2026 | [2231](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2231) | chore(workspace): Upgrade Nx from 23 to 24 |
| 24 Oct 2026 | [2284](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2284) | ci(workspace): Let Dependabot propose Nx majors again, now that Nx 24 is in |
| 6 Nov 2026 | [2664](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2664) | chore(deps): Bump the nx group across 1 directory with 9 updates |
| 23 Nov 2026 | [2779](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2779) | chore(deps): bump the nx group across 1 directory with 9 updates |
| 26 Nov 2026 | [3753](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3753) | chore(workspace): Nx 24.0.7, a seven-day exception, so Angular 22.3 can build |

## TypeScript

| Merged | Pull request | What |
| --- | --- | --- |
| 18 Sep 2019 | [17](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/17) | Updated language service to 9.0.0@next |
| 7 Oct 2026 | [1555](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1555) | chore(workspace): Move the tsconfigs off the options TypeScript 6 deprecates |

## Esri / ArcGIS

| Merged | Pull request | What |
| --- | --- | --- |
| 11 Oct 2019 | [27](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/27) | Upgraded monorepo arcgis js api and types to 4.12 |
| 2 Nov 2020 | [88](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/88) | dep(esri-loader): Updated esri-loader npm module |
| 22 May 2021 | [124](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/124) | dep(esri-loader): Update esri loader package |
| 18 Oct 2021 | [161](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/161) | chore(deps): Installed arcgis js types explicit version 4.19 |
| 26 Oct 2021 | [162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/162) | chore(deps): Fixed esri-loader package.json version |
| 24 Jun 2022 | [243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/243) | chore(deps): ArcGIS JS upgrade to 4.23 |
| 2 Oct 2026 | [1329](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1329) | feat(aggiemap-angular): Pin the ArcGIS runtime to 4.27, off the 2022 default |
| 3 Oct 2026 | [1364](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1364) | chore(maps-esri): Move the ArcGIS type definitions to 4.27, matching the runtime |
| 17 Oct 2026 | [1846](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1846) | chore(maps-esri): Load the ArcGIS SDK from @arcgis/core 4.27 instead of esri-loader |
| 17 Oct 2026 | [1847](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1847) | chore(maps-esri): Step @arcgis/core from 4.27 to 4.34, one release per commit |
| 17 Oct 2026 | [1854](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1854) | chore(maps-esri): Replace the ArcGIS APIs 4.34 flags as deprecated |
| 18 Oct 2026 | [1861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1861) | chore(maps-esri): Step ArcGIS from 4.34 to 5.0.19 |
| 18 Oct 2026 | [1894](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1894) | chore(maps-esri): Step ArcGIS to 5.1, with RNS Spaces at its service's own scale |
| 8 Nov 2026 | [2622](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2622) | chore(deps): Bump @esri/calcite-components from 5.1.2 to 5.2.0 in the arcgis group across 1 directory |
| 23 Nov 2026 | [3132](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3132) | chore(deps): bump @esri/calcite-components from 5.2.0 to 5.2.1 in the arcgis group across 1 directory |
| 23 Nov 2026 | [3291](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3291) | ci(dependabot): Keep amCharts at the version @arcgis/core depends on |

## NestJS and API libraries

| Merged | Pull request | What |
| --- | --- | --- |
| 3 Oct 2026 | [1363](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1363) | chore(workspace): Upgrade NestJS 9 to 10 |
| 20 Oct 2026 | [1985](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1985) | chore(workspace): Upgrade NestJS 10 to 11, and fix UES sign-out |
| 21 Oct 2026 | [2044](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2044) | chore(workspace): Upgrade NestJS 11 to 12 |
| 23 Oct 2026 | [2128](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2128) | fix(workspace): Upgrade class-validator to 0.15, and drop undeclared fields in GIS Day's APIs |
| 23 Oct 2026 | [2153](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2153) | fix(mailroom-nest): Upgrade nodemailer to 10 for its injection and denial-of-service advisories |
| 23 Nov 2026 | [3128](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3128) | chore(deps): bump the nestjs group across 1 directory with 7 updates |
| 23 Nov 2026 | [3275](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3275) | chore(deps): bump the nestjs group with 4 updates |

## Database

| Merged | Pull request | What |
| --- | --- | --- |
| 7 Oct 2025 | [433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/433) | Upgrade Nx workspace to version 15.0.0 with full dependency compatibility and TypeORM 0.3.x upgrade |
| 23 Oct 2026 | [2195](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2195) | chore(workspace): Upgrade typeorm to 1 and mssql to 12 |
| 26 Nov 2026 | [3739](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3739) | chore(deps): Bump mssql from 12.7.14 to 12.7.16 in the everything-else group |

## Test tooling

| Merged | Pull request | What |
| --- | --- | --- |
| 19 Oct 2026 | [1948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1948) | chore(workspace): Vitest, zoneless AggieMap and UES, Node 24 and the TypeScript 6.0 deprecations, together |
| 21 Oct 2026 | [2043](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2043) | chore(workspace): Upgrade Vitest 4 to 5 |
| 23 Oct 2026 | [2187](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2187) | chore(deps): Bump the testing group across 1 directory with 2 updates |
| 23 Nov 2026 | [3276](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3276) | chore(deps): bump the testing group across 1 directory with 3 updates |
| 23 Nov 2026 | [3296](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3296) | chore(deps): bump jsdom from 30.1.3 to 31.0.1 |
| 24 Nov 2026 | [3499](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3499) | chore(gisday-platform-ngx-common): Four GIS Day libraries move from Jest to Vitest |
| 24 Nov 2026 | [3519](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3519) | chore(gisday-platform-ngx-core): The GIS Day ngx/core libraries move from Jest to Vitest |
| 24 Nov 2026 | [3520](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3520) | chore(gisday-angular): The GIS Day site's tests move from Jest to Vitest |
| 24 Nov 2026 | [3523](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3523) | chore(gisday-nest): The GIS Day API's libraries and gisday-nest move from Jest to Vitest |
| 25 Nov 2026 | [3543](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3543) | chore(geoservices-nest): geoservices-nest and geoservices-data-api move from Jest to Vitest |
| 25 Nov 2026 | [3544](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3544) | chore(mailroom-nest): The mailroom projects move from Jest to Vitest |
| 25 Nov 2026 | [3567](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3567) | chore(geoservices-angular): The Geoservices front end and its libraries move from Jest to Vitest |
| 25 Nov 2026 | [3568](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3568) | chore(mailroom-angular): The Mailroom front end and its libraries move from Jest to Vitest |
| 25 Nov 2026 | [3570](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3570) | chore(ts-events-angular): The event maps app, dev-tools and geoprocessing libraries move from Jest to Vitest |
| 25 Nov 2026 | [3599](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3599) | chore(workspace): Jest leaves the workspace |
| 26 Nov 2026 | [3670](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3670) | chore(deps): Bump the testing group with 2 updates |

## Lint and format

| Merged | Pull request | What |
| --- | --- | --- |
| 1 Feb 2022 | [183](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/183) | chore: Converted all TSLint projects to ESLint |
| 5 Oct 2026 | [1450](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1450) | chore(workspace): Upgrade Prettier 2.8.8 to 3.9.9, needed by Angular 20 |
| 23 Oct 2026 | [2180](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2180) | chore(workspace): Upgrade ESLint to 10, and let lint fail the projects that forced it to pass |
| 23 Oct 2026 | [2188](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2188) | chore(deps): Bump the lint group across 1 directory with 5 updates |
| 23 Nov 2026 | [3233](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3233) | chore(deps): bump the lint group across 1 directory with 5 updates |

## Node, images and Docker

| Merged | Pull request | What |
| --- | --- | --- |
| 23 Jun 2022 | [242](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/242) | ci: Pinned Node version to 16.15.0 which fixes npm ci failure in dep cache task |
| 11 Mar 2025 | [388](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/388) | chore(workspace): Upgrade to Node 20 |
| 4 Oct 2026 | [1401](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1401) | chore(workspace): Move Node 20.18.1 to 22.23.3, required before Angular 20 |
| 23 Oct 2026 | [2108](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2108) | fix(workspace): Move Node to 24.22.1 for the Brotli remote-code-execution flaw (CVE-2026-111497) |
| 23 Oct 2026 | [2141](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2141) | fix(workspace): Pin the front ends to an exact nginx-base tag, not latest |
| 23 Oct 2026 | [2146](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2146) | fix(workspace): Build the front ends on nginx 1.30.6 and Alpine 3.24 |
| 24 Oct 2026 | [2312](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2312) | fix(workspace): Build the front ends on nginx-base sha-b5ba4a5, with brotli-libs 1.2.1-r0 |
| 19 Nov 2026 | [3217](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3217) | chore(workspace): Build the Angular images on nginx 1.30.7, for the 18 November nginx security release |
| 23 Nov 2026 | [3236](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3236) | chore(deps): bump the api-images group across 4 directories with 1 update |
| 24 Nov 2026 | [3404](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3404) | fix(workspace): The front ends build from the nginx base with libxml2 2.13.9-r3 |
| 25 Nov 2026 | [3591](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3591) | chore(workspace): Node 24.22.3 everywhere, matching the API images |

## GitHub Actions and CI

| Merged | Pull request | What |
| --- | --- | --- |
| 4 Sep 2024 | [358](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/358) | ci: Bump actions to move away from node16 base |
| 7 Oct 2026 | [1553](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1553) | ci: Pin every GitHub workflow to ubuntu-24.04 |
| 7 Oct 2026 | [1556](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1556) | ci: Pin the Azure pipeline to ubuntu-24.04 and replace NodeTool@0 with UseNode@1 |
| 23 Oct 2026 | [2186](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2186) | chore(deps): Bump the actions group with 8 updates |
| 25 Oct 2026 | [2387](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2387) | ci(workspace): Give every workflow a read-only token, and pin actions to commits |
| 26 Oct 2026 | [2403](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2403) | chore(deps): Bump docker/login-action from 3.7.0 to 4.6.0 in the actions group |
| 6 Nov 2026 | [2624](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2624) | chore(deps): Bump docker/login-action from 4.6.0 to 4.7.0 in the actions group |
| 23 Nov 2026 | [3134](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3134) | chore(deps): bump docker/login-action from 4.7.0 to 4.8.0 in the actions group across 1 directory |

## Security fixes in dependencies

| Merged | Pull request | What |
| --- | --- | --- |
| 23 Oct 2026 | [2125](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2125) | fix(workspace): Apply every in-range security update the audit found |
| 23 Oct 2026 | [2129](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2129) | fix(aggiemap-ngx): Upgrade swiper to 14 for its prototype-pollution advisory |
| 23 Oct 2026 | [2149](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2149) | fix(workspace): Apply the in-range security updates the 2125 merge undid |
| 23 Oct 2026 | [2208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2208) | fix(workspace): Move body-parser to 2.4.0 for its denial-of-service advisory (GHSA-27r3-jxmh-p828) |
| 24 Oct 2026 | [2295](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2295) | fix(workspace): Accept @azure/msal-node's authorization-code advisory as unreachable here |
| 24 Oct 2026 | [2296](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2296) | fix(workspace): Override multer to 2.5.0 for its denial-of-service advisory |
| 25 Oct 2026 | [2349](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2349) | fix(workspace): Override the vite that @angular/build pins, for its High advisories |
| 25 Oct 2026 | [2375](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2375) | fix(workspace): Override bull's uuid to 11.1.1 for its buffer advisory |
| 25 Oct 2026 | [2378](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2378) | fix(workspace): Override the undici that nx pins, for its advisories |
| 26 Oct 2026 | [2411](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2411) | chore(workspace): Take the fast-uri 3.1.9 and serialize-javascript 7.1.3 security fixes now |
| 26 Oct 2026 | [2409](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2409) | chore(gisday-platform-data-api): Accept jimp's zod 3 advisory as unreachable, tracked until 9 November |
| 26 Oct 2026 | [2419](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2419) | chore(workspace): Force msal-node 7.1.0 under @azure/identity, ending the last High |
| 8 Nov 2026 | [2714](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2714) | chore(workspace): Move glob to 14.0.3 and minimatch to 11.0.3 for their two advisories, keeping Nx's own copy |
| 8 Nov 2026 | [2715](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2715) | chore(workspace): Replace deepmerge in our code with a guarded helper, and pin a patched copy for the tools |
| 26 Nov 2026 | [3744](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3744) | fix(workspace): es-toolkit 1.53.2, which fixes a High and two Medium advisories |

## Other dependencies

| Merged | Pull request | What |
| --- | --- | --- |
| 11 Dec 2020 | [76](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/76) | Bump bcrypt from 4.0.1 to 5.0.0 |
| 11 Dec 2020 | [75](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/75) | Bump bcrypt from 4.0.1 to 5.0.0 in /apps/oidc-provider-express |
| 18 May 2021 | [113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/113) | Bump nodemailer from 5.1.1 to 6.4.16 |
| 19 May 2021 | [92](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/92) | Bump date-and-time from 0.13.1 to 0.14.2 |
| 26 Mar 2022 | [190](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/190) | chore(deps): bump node-forge from 1.2.1 to 1.3.0 |
| 29 Mar 2022 | [187](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/187) | chore(deps): bump follow-redirects from 1.14.7 to 1.14.8 |
| 29 Mar 2022 | [191](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/191) | chore(deps): bump minimist from 1.2.5 to 1.2.6 |
| 29 Mar 2022 | [193](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/193) | chore(deps): Bump ansi-regex from 3.0.0 to 3.0.1 |
| 29 Mar 2022 | [195](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/195) | chore(deps): Bumped and pinned nodemailer for deployment apps |
| 24 Jun 2022 | [241](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/241) | chore(deps): bump got from 11.8.3 to 11.8.5 |
| 24 Jun 2022 | [227](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/227) | chore(deps): bump ejs from 3.1.6 to 3.1.8 |
| 24 Jun 2022 | [245](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/245) | chore(deps): bump moment from 2.29.1 to 2.29.3 |
| 6 Jul 2022 | [258](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/258) | chore(deps): bump moment from 2.29.3 to 2.29.4 |
| 4 Jun 2025 | [411](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/411) | chore(deps): Upgrade @swc/core package |
| 23 Oct 2026 | [2191](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2191) | chore(deps): Bump the everything-else group across 1 directory with 14 updates |
| 23 Oct 2026 | [2238](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2238) | chore(workspace): Move dotenv, fs-extra, turf, jsdom and pngjs to their latest majors |
| 24 Oct 2026 | [2314](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2314) | chore(workspace): Move marked to 18.1.0 |
| 25 Oct 2026 | [2322](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2322) | chore(deps): Bump the everything-else group across 1 directory with 2 updates |
| 25 Oct 2026 | [2300](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2300) | chore(deps): Bump angulartics2 from 13.1.0 to 14.1.0 |
| 26 Oct 2026 | [2401](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2401) | chore(deps): Bump the everything-else group with 2 updates |
| 8 Nov 2026 | [2666](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2666) | chore(deps): Bump the everything-else group across 1 directory with 17 updates |
| 23 Nov 2026 | [3295](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3295) | chore(deps): bump the everything-else group across 1 directory with 18 updates |
| 24 Nov 2026 | [3401](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3401) | chore(deps): bump the everything-else group with 2 updates |

## Packages removed

| Merged | Pull request | What |
| --- | --- | --- |
| 23 Oct 2026 | [2202](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2202) | chore(workspace): Remove eslint-plugin-node, registered but never used |
| 26 Nov 2026 | [3736](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3736) | chore(workspace): Remove ng-packagr, which nothing invokes |
| 26 Nov 2026 | [3737](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3737) | chore(workspace): Remove @angular/platform-server, which nothing imports or invokes |
| 26 Nov 2026 | [3745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3745) | chore(workspace): Remove @typescript-eslint/utils, which nothing uses, and tell knip what it misreads |
