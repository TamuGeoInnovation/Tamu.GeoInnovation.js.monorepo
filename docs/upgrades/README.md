# Modernization: where the workspace is, and what is next

**The living plan.** [#1218](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1218) opened
this work in 2026 with the workspace "several major versions behind on everything". That is no longer true, and this
page is where the current position lives so nobody has to reconstruct it from a two-year-old issue body.

Measured **26 November 2026**. Refresh it with the command under [Keeping this current](#keeping-this-current).

## Where we are

| | #1218, when it opened | Today | Latest | Gap |
| --- | --- | --- | --- | --- |
| Angular | 15.2.9 | **22.2.6** | 22.3.0 | one minor, **blocked** — see step 1 |
| NestJS | 9.4.3 | **12.6.3** | 12.6.3 | none |
| Nx | 16.0.0 | **24.0.6** | 24.0.7 | one patch, and it is the gate |
| TypeScript | 4.9.5 | **6.0.3** | 7.0.2 | **blocked** - see step 6 |
| ArcGIS | 4.23, CDN + `esri-loader` | **`@arcgis/core` 5.1.27** | 5.2.9 | **blocked** - see step 4 |
| Node | — | **24.22.3** | — | matched everywhere (#3591) |

**66 direct dependencies are behind, 9 of them by a major.** That is the whole remaining gap, and none of it is the
kind of debt #1218 described.

## How we got here

**The record, so it never has to be recomputed from issues and pull requests again.** Add a row when a step lands, in
the same pull request as the step. Every individual upgrade pull request, by family, is in [`history.md`](history.md).

| Landed | Step | Where it got to | Issue |
| --- | --- | --- | --- |
| 2 Oct 2026 | ArcGIS runtime off 4.23 | the version the maps draw with, decoupled from the Angular work | [#1219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1219) |
| 3 Oct 2026 | **Angular 15 to 16** | Angular 16.2, Nx 16.10, TypeScript 5.1 | [#1343](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1343) |
| 4 Oct 2026 | Angular 16 to 17 | Angular 17.1, Nx 17.3, TypeScript 5.3 | [#1365](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1365) |
| 4 Oct 2026 | Angular 17 to 18 | Angular 18.2, Nx 19.8, TypeScript 5.5 | [#1371](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1371) |
| 5 Oct 2026 | Angular 18 to 19 | Angular 19.2, Nx 20.8, TypeScript 5.7 | [#1378](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1378) |
| 6 Oct 2026 | Angular 19 to 20 | Angular 20.3, Nx 21.6, TypeScript 5.9 | [#1447](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1447) |
| 6 Oct 2026 | Angular 20 to 21 | Angular 21.2, Nx 22.7, Jest 30 | [#1456](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1456) |
| 6 Oct 2026 | **Angular 21 to 22** | Angular 22.1, Nx 23.2, **TypeScript 6.0**, ESLint 9 | [#1469](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1469) |
| 28 Oct 2026 | Three event apps removed, superseded by AggieMap | | [#1202](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1202) |
| 23 Oct 2026 | Nx 23 to 24 | Nx 24.0.2, after lint, tests and the API builds moved to Nx's inferred targets | [#2168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2168) |
| 23 Nov 2026 | Nx 24.0.2 to 24.0.6 | by Dependabot's nx group | [#3248](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3248) |
| 25 Nov 2026 | **Jest to Vitest**, across every front end and API | geoservices, mailroom, GIS Day, ts-events and their libraries | [#1977](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1977) |
| 25 Nov 2026 | **Node 24.22.3 everywhere**, matching the API images | | [#3545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3545) |
| 25 Nov 2026 | Dead applications removed | **61 applications became 10** | [#1201](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1201), [#1203](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1203) |
| 26 Nov 2026 | Vitest 5.1.1 | | [#3701](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3701) |
| 26 Nov 2026 | NestJS 12.5.1 to 12.6.3 | `@nestjs/common`, `core`, `platform-express` and `testing`; under the seven-day exception of [#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763) | [#3754](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3754) |
| 26 Nov 2026 | `jimp` 1.6.1 to 2.2.0 | four `@jimp` packages, and the `zod` overrides under them go; under the seven-day exception of [#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763) | [#3755](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3755) |
| 26 Nov 2026 | **Nx 24.0.6 to 24.0.7**, a seven-day exception | unblocks Angular 22.3 (step 1 below) | [#3738](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3738) |
| 26 Nov 2026 | The build and test toolchain to its latest as of 26 November, a one-time exception to the seven-day rule | Vite 8.4.0, Vitest 5.1.2, webpack 5.113.0, typescript-eslint 8.74.0 | [#3764](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3764), under [#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763) |
| 26 Nov 2026 | The runtime libraries to their latest as of 26 November, a one-time exception to the seven-day rule | mssql 12.8.1, marked 18.3.0, auth0 7.9.0, nodemailer 10.6.1, interactjs 1.10.29 | [#3765](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3765), under [#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763) |
| 26 Nov 2026 | `@analogjs` 2.9.7 to 3.0.0 | the Angular/Vitest bridge; the same test counts in every project before and after | [#3767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3767), under [#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763) |

**Seven Angular majors landed in four days**, 3 to 6 October, each as its own pull request into `development` and each
gated by the smoke suite. Step by step timings for every rung are in [`angular.md`](angular.md) - that page is the
evidence behind any forecast, and the reason a forecast can be made at all.

**What the record shows that a list of versions does not:** the hard part was never the framework. It was the 61
applications that each had to compile through seven majors, and Jest, which had to leave before the test tooling could
move at all.

### What #1218's four steps came to

All four are done, including the one it called the genuinely hard migration.

| Step | State |
| --- | --- |
| 1. ArcGIS runtime off 4.23 | **done** (#1219 closed) |
| 2. Delete dead projects | **done** (#1201–#1203 closed). **61 applications became 10.** Only #1204, removing `ts-events-angular`, is open |
| 3. Angular, one major per pull request | **done** — 15 to 22, each with its own pull request, timed in [`angular.md`](angular.md) |
| 4. `@arcgis/core` ESM, last | **done** — `esri-loader` and `@types/arcgis-js-api` are gone from `package.json` entirely |

## The plan, in order

The order is forced where it says so. Everything else can be taken in any order.

### 1. Nx 24.0.6 → 24.0.7 — **done** 26 November 2026 ([PR 3753](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3753))

**Every Angular minor is blocked until this lands.** Angular 22.3.0 tightens `@angular-devkit/architect`'s `exports`
map, and Nx 24.0.6 imports a subpath that is no longer in it:

| | |
| --- | --- |
| `nx` **24.0.6** | imports `@angular-devkit/architect/node/index.js` |
| `nx` **24.0.7** | imports `@angular-devkit/architect/node` |
| architect **0.2202.7** | no `exports` map at all, so either form resolves |
| architect **0.2203.0** | exports `./node` but **not** `./node/index` |

So all six Angular applications' production builds fail on 22.3.0 today. A **patch** to Nx fixes it. Tracked in
[#3735](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3735).

**Taken as a seven-day exception** ([#3738](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3738)),
the maintainer's decision of 26 November. `nx` 24.0.7 was published 25 November and would not be proposable until
2 December; waiting would hold every Angular minor for a week. The cost is a one-day-old release where the rule asks
for eight days, accepted deliberately. Eight packages: `nx`, `@nx/angular`, `@nx/eslint`, `@nx/eslint-plugin`,
`@nx/js`, `@nx/vitest`, `@nx/webpack`, `@nx/workspace`.

### 2. The Angular group to 22.3.0 — after step 1

Retry Dependabot's `angular` group once Nx is in. Do not reopen the old pull request; Dependabot rebuilds the branch
itself. 18 packages, no major among them.

### 3. NestJS 12.5.1 → 12.6.3 — **done** ([#3754](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3754))

Independent of everything above. Four packages, a minor: `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
and `@nestjs/testing`. **Taken under the seven-day exception** ([#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763)), the maintainer's decision of 26 November:
12.6.3 was published that day, and no 12.6.x was seven days old. None of the four has an install script, and the
lock moved those four packages and nothing else.

### 4. `@types/node` — **do not take the latest**

`@types/node` is 24.19.2 and the registry's latest is 26.6.11, two majors ahead. **That gap is correct and should
stay.** The types describe the runtime, and the runtime is Node **24.22.3** everywhere (#3591). Upgrading the types to
26 would describe an API we do not run, and the compiler would accept code that fails in production. `@types/node`
moves when Node does, not when npm does.

This is the one place in this document where "behind" is the right state.

### 5. TypeScript 6.0.3 → 7.0.2 — a major

**Blocked, twice over.** Angular 22.3 peers `typescript >=6.0 <6.1`, and Nx 24.0.7 peers `^5.8.0 || ^6.0.0`. TypeScript 7.1,
where the compiler API Angular needs is meant to land, is still a beta. Neither framework accepts 7 yet, so there is nothing
to do until both say they do ([#1918](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1918)).

Check first what Angular 22 and Nx 24 support. A TypeScript major with the framework not ready for it is the kind of
upgrade that cannot be shipped in one pull request, which is the lesson of
[PR 450](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/450): opened October 2025, went 349
commits behind, retired rather than merged.

### 6. The remaining majors, each on its own

| | From | To | Note |
| --- | --- | --- | --- |
| `@jimp/*` (4 packages) | 1.6.1 | 2.2.0 | **Done** ([#3755](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3755)), under the seven-day exception of [#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763). Output compared in [`docs/screenshots/jimp-2/`](../screenshots/jimp-2/README.md): JPEGs nearly the same, kept at full-resolution colour; transparent PNGs larger |
| `@analogjs/vite-plugin-angular`, `@analogjs/vitest-angular` | 2.9.7 | 3.0.0 | **Done** ([#3767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3767)), under the seven-day exception of [#3763](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3763). No configuration change; every project runs the same tests as before (2,513 in the 64 Angular projects, none skipped) |

### 7. Everything else — 30 minors and patches

Dependabot's weekly grouped pull requests handle these (`.github/dependabot.yml`, Mondays, 6 AM Central). They need no
plan; they need merging.

## How this gets done, which has not changed

**Not on a long-lived branch.** PR 450 is the evidence: 349 commits behind, conflicted, retired. Every step lands as
its own pull request into `development`, independently shippable.

**Why we can be confident:** the smoke suite checks every map and every service it draws from, against deployed
environments. Most upgrades this size are done blind; each step here can be shown not to have broken the maps.

## Keeping this current

Run this and update the tables above with what it prints. The repository has no host Node (CLAUDE.md), so it runs in
the same image the checks use:

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/Tamu.GeoInnovation.js.monorepo:/t" \
  -v tamu-js-dev-nm:/t/node_modules -w /t node:24.22.3 npm outdated
```

**Update this page when a step lands, in the same pull request as the step.** A plan that is refreshed afterwards is a
plan nobody trusts, which is how #1218's table came to say Angular 15 when the workspace was on 22.
