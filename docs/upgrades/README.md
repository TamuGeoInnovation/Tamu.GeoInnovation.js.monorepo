# Modernization: where the workspace is, and what is next

**The living plan.** [#1218](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1218) opened
this work in 2026 with the workspace "several major versions behind on everything". That is no longer true, and this
page is where the current position lives so nobody has to reconstruct it from a two-year-old issue body.

Measured **26 November 2026**. Refresh it with the command under [Keeping this current](#keeping-this-current).

## Where we are

| | #1218, when it opened | Today | Latest | Gap |
| --- | --- | --- | --- | --- |
| Angular | 15.2.9 | **22.2.6** | 22.3.0 | one minor, **blocked** — see step 1 |
| NestJS | 9.4.3 | **12.5.1** | 12.6.3 | one minor |
| Nx | 16.0.0 | **24.0.6** | 24.0.7 | one patch, and it is the gate |
| TypeScript | 4.9.5 | **6.0.3** | 7.0.2 | one major |
| ArcGIS | 4.23, CDN + `esri-loader` | **`@arcgis/core` 5.1.27** | 5.2.9 | minors |
| Node | — | **24.22.3** | — | matched everywhere (#3591) |

**66 direct dependencies are behind, 9 of them by a major.** That is the whole remaining gap, and none of it is the
kind of debt #1218 described.

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

### 1. Nx 24.0.6 → 24.0.7 — **the gate, do this first**

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

### 2. The Angular group to 22.3.0 — after step 1

Retry Dependabot's `angular` group once Nx is in. Do not reopen the old pull request; Dependabot rebuilds the branch
itself. 18 packages, no major among them.

### 3. NestJS 12.5.1 → 12.6.3

Independent of everything above. Four packages, a minor.

### 4. `@types/node` — **do not take the latest**

`@types/node` is 24.19.2 and the registry's latest is 26.6.11, two majors ahead. **That gap is correct and should
stay.** The types describe the runtime, and the runtime is Node **24.22.3** everywhere (#3591). Upgrading the types to
26 would describe an API we do not run, and the compiler would accept code that fails in production. `@types/node`
moves when Node does, not when npm does.

This is the one place in this document where "behind" is the right state.

### 5. TypeScript 6.0.3 → 7.0.2 — a major

Check first what Angular 22 and Nx 24 support. A TypeScript major with the framework not ready for it is the kind of
upgrade that cannot be shipped in one pull request, which is the lesson of
[PR 450](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/450): opened October 2025, went 349
commits behind, retired rather than merged.

### 6. The remaining majors, each on its own

| | From | To | Note |
| --- | --- | --- | --- |
| `@jimp/*` (4 packages) | 1.6.1 | 2.2.0 | Used by `libs/common/node/images` and GIS Day speaker photos. Image output is worth comparing before and after, not just compiling |
| `@analogjs/vite-plugin-angular`, `@analogjs/vitest-angular` | 2.9.2 | 3.0.0 | The Angular/vitest bridge: coupled to both, so take it after step 2 |
| `jsdom` | 30.1.3 | 31.0.1 | Test environment only |

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
