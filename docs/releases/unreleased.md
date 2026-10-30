# Unreleased

Since `21e69426e`, which production was promoted from on 30 October.

**The latest release notes are [30 October 2026](2026-10-30.md)**, cleared on dev from `21e69426e` and
tagged `dev-2026-10-30`; `prod-2026-10-30` records what reached production. It carried **215 pull
requests**. The release before it is [21 October 2026](2026-10-21.md), from `61161ce1b`.

This file collects what merges from here until the next release. **A pull request with a user-visible
result adds its own file to [`unreleased/`](unreleased/README.md), in that pull request**, with its
before/after screenshots linked from `docs/screenshots/<slug>/` and its row for *What to test on dev*;
the files are collated here at release ([#2037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2037)). Nobody writes these later. See
[README.md](README.md#cutting-a-release).

---

## Summary

Nothing has merged since the 30 October release.

---

## What to test on dev

**The team tests these on dev before a release goes to production.** Dev is
[dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu). Each row is a change on dev and not yet on
production. A pull request with a visible result adds its own row; at release, the rows move into the
dated notes as what was tested, and this table empties.

**Nothing waiting:** the 30 October rows moved into the [30 October notes](2026-10-30.md).

| Change | Open this on dev | Look for |
| --- | --- | --- |

---

## Work in flight - 13 October

Nothing below has merged, so it is not part of a release yet. This section exists because
[`CLAUDE_SETUP.md`](../../CLAUDE_SETUP.md) sends a session on another machine here first, and an empty
file would say the work had stopped.

### AggieMap on 28 October: what another machine most needs to know

**The two baseball faults are fixed.** The GIS team republished production's `BaseballParking_view` on the
morning of 28 October, and it was verified on the live service at 11:40 AM Central:

| Fault | What was wrong | State |
| --- | --- | --- |
| [#2510](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2510) | `/2` declared `objectIdField: objectid_1`, a field it did not have, so **every query returned HTTP 500** | **Fixed.** The layer is `Closures`, its object ID field is `objectid`, and it answers `{"count":3}` |
| [#2522](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2522) | `/0` and `/3` carried `simple` renderers where development's are `uniqueValue`, so every lot drew the same pale blue; the portal item still had three stale overrides | **Fixed.** Both renderers are `uniqueValue` again and the portal item has **no overrides at all**, which is how development has always been configured |

Production was then photographed in both baseball modes: **lots in two colours, symbols drawing, all three
closures present, no console errors.** The five known-failure entries added while they were live were each
confirmed stale by running the specs, and removed in [PR 2547](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2547).

**Those were the only two of their kind.** Every layer of all eleven athletics services was checked for
both faults while they were live: three broken layers for #2500 and one for #2510, all baseball.

**Both checks that would have caught them are now in place** and are the durable result:
[#2511](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2511) asks every layer whether its `objectIdField` and `displayField` exist in its own fields and
whether it answers `where=1=1`; [PR 2504](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2504) makes the front end discard a portal renderer whose
fields its layer lacks, so the *next* republish that leaves a stale override behind degrades to the service
renderer instead of drawing nothing. Neither fault was visible to anything we ran, because the layer checks
skipped builder-gated maps ([#2467](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2467)) - which [PR 2542](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2542) has since fixed on production too.

**Three faults do still need the GIS team**, and none is fixable here:

- [#2520](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2520) - the NSC and Break parking services return their lots **with no geometry**, so neither
  map's popups can ever open;
- [#2529](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2529) - three restroom records carry building numbers that are not buildings;
- [#659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/659) - production's `Routing` folder publishes no services, and on dev routing fails with
  `The table was not found. [Stops]` as soon as directions are requested.

#### The athletics and campus maps moved on 27 October

- **All ten sports read one schema, the development one** ([#2468](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2468), [#2478](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2478),
  [#2489](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2489)), after the GIS team republished the production services to match. Layers the
  development views do not carry were removed from the definitions: accessible lots on baseball, and the
  visitor kiosk, safety-first and team bus layers across the others. **A smoke test outlived one of them**
  and was always red until [PR 2509](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2509).
- **Ten campus maps are listed, all on production** ([#2470](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2470), [#2475](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2475), [#2480](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2480)),
  the newest being HSC College of Dentistry. Only the north-western Dallas site is mapped; the Cooper
  Dental Clinic gets its own map from the same service when the GIS team is ready.

#### The construction symbology: fixed by drawing it ourselves, and sprites are gone

The published sprite is **an opaque tile, not a hatch** - 0 transparent pixels of 810, about half pure
white - so it paints out the ground beneath. That, rather than line spacing, is why it read as a solid
block ([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)).

Three attempts replaced the sprite and each shipped a map that sometimes drew nothing. **`setSpriteSource`
blanks the map when it lands while the view is still building**, measured even with the published sheet
handed back unmodified ([#2487](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2487)). So [PR 2508](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2508) hides the basemap's construction layers
and draws the buildings itself with a CIM hatch, and **deletes the sprite-override mechanism rather than
leaving it behind a flag**. Measured 0 blank loads in 60 across two sessions against a control that blanked
14 of 75.

Its outline is ours too: a vector tile basemap is one layer, so anything added draws entirely above it, and
the hatch broke the building edge until the symbol drew its own.

**Two campus maps still show the pink tile on production** - Fort Worth Law School and Houston Space
Institute ([#2506](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2506)). Their basemaps are not gated by `isTesting`, each names its construction layer
differently, and PR 2508 does not reach them. **"The construction symbology is fixed" is not true until
#2506 is done.**

#### No build tags for either of 27 October's production releases

`scripts/tag-build.sh` was not run, so the newest tags are `dev-2026-10-25` and `prod-2026-10-22`. **The
repository's record says production is on a 22 October commit and it is not.** The build banner cannot
settle it either: it still ships unsubstituted placeholders on both environments, because IIS serves these
and `tokenSubstitute.sh` never runs ([#1306](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306)). So the commit has to come from the maintainer
before the tags can be pushed.

#### Seven pull requests open and green, checked together

[2501](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2501) campus list sorted, [2502](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2502) a check that fails when the map does not draw,
[2503](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2503) the release note for the reverted hatch removed, [2504](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2504) portal renderers,
[2505](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2505) campus names on a phone, [2508](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2508) the construction hatch, [2509](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2509) the
Indoor Track test. 2504 and 2508 both edit `map.service.ts` and were only ever tested apart, so **all seven
were merged into one branch and checked together**: one release-note conflict, full affected check exit 0.

### Security and vulnerability work has one owner, 23 October

One Claude Code session, on one of the maintainer's machines, does all of the security and vulnerability
work here: dependency audits and security updates ([#2112](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2112)),
the daily package and image scan ([#2118](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2118)),
the security parts of the standing sweep ([#1146](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1146)),
Dependabot, CodeQL and secret-scanning alerts, and anything else whose main purpose is security. Any
other session, on any machine, that finds a security problem files the issue as usual and leaves the
fix to that session. One that needs to change `package.json` or `package-lock.json` for its own work
says so first, so two sessions are never editing the lock file at once. Ask the maintainer which
session it is.

### Visual baselines on the cluster, 25 October

Screenshot sets of every AggieMap map ([`tools/visual-baselines`](../../tools/visual-baselines/README.md)) are now taken on the
cluster, not on one workstation, and every machine sees them at `https://visual-baselines.geoservices.tamu.edu/`, from
Texas A&M networks ([#1533](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1533), closed). The cluster side is in the private cluster configuration
repository, folder `12. Visual Baselines`.

| What | State |
| --- | --- |
| Captures start by themselves ([#2355](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2355), [#2364](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2364)) | Done. A CronJob checks the newest `dev-*` and `prod-*` tags every 15 minutes; about an hour after a tag it captures that release and compares it with the previous set of its kind. Not between 2:30 and 8:30 AM Central (the nightly smoke run), one capture at a time. Any comparison missing, or made before its set finished, is made |
| What changed, as a third column ([#2357](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2357)) | Done: the after shot dimmed, changed pixels in pink |
| A front end for the sets ([#2345](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2345)) | Done: a home page of sets and comparisons, and a gallery per set |
| Maps photographed before they finished; a shot depending on the one before it ([#2346](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2346), [#2347](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2347)) | Fixed in [#2384](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2384), open. Proven red then green on production; the lab checks it on a whole set on 25 October at night (its batch 151) |
| A good capture shown as failed when only the page rebuild after it fails ([#2377](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2377)) | Fixed in the cluster configuration repository's pull request 82, open |
| The first sets | `dev-2026-10-25` (`eab737da7`): 846 of 846 shots, compared with `dev-2026-10-06-4` (838 pages, 822 changed: three weeks of releases, so a first look rather than a verdict). `prod-2026-10-22` was captured on the evening of 25 October, and compared with `prod-2026-10-20` automatically |

Which comparison answers which question: **dev against the previous dev**, before promoting a build; **production against
the previous production**, after a release. Dev against production is rarely useful: the same commit differed on 241 of
848 shots, because the two are built with different settings and use different GIS services.

### The smoke suite, 13 October

| What | State |
| --- | --- |
| Three tiers: quick, release, full ([#1717](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1717)) | Done, in the 13 October release. `run-local.sh development quick` clears a dev build; `release` clears production; `full` is the nightly run |
| Maps reported as "drew but never settled" ([#1716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1716), High) | Fixed in the 19 October release ([#1901](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1901)): the three map tests that contend for the machine run last, two at a time |
| Whether loading got heavier on 6 October ([#1719](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1719), Medium) | Not started |

### Found on 12 and 13 October, not started

| What | State |
| --- | --- |
| Outdoor Track and Cross Country zoom ([#1727](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1727), High) | Outdoor Track is confirmed fixed by [#1726](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1726). Cross Country has not been looked at |
| Blank pause coming back from 3D to 2D on dev's vector basemap ([#1732](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1732), High) | Measured: under a second on the raster basemap, about four on the vector one |

### Signals and OnPush ([#1455](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1455)), 12 October

The three migrations are in the 12 October release: 216 of 287 inputs, 40 of 44 outputs, 31 of 40 queries.

| Step | State |
| --- | --- |
| What the migrations left ([#1657](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1657)) | done: every decorator input, output and query left is a signal ([#1865](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1865)), in the 19 October release |
| OnPush, the safe libraries ([#1670](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1670)) | UI kits (12) and geoservices (58) are in the 12 October release. AggieMap's ten non-map pages ([#1864](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1864)) are in the 19 October release. GIS Day's wait for the work in flight there to merge |
| OnPush, fields set in subscriptions ([#1671](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1671)) | done: 114 components ([#1874](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1874)), in the 19 October release |
| Interaction tests in the smoke suite ([#1672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1672)) | done ([#1866](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1866)), in the 19 October release |
| OnPush, the map ([#1673](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1673)) | done: every component AggieMap and UES Operations render, but the modal host ([#1908](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1908)), in the 19 October release. Zoneless followed for AggieMap and UES Operations ([#1948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1948)), in the same release |

The approach and the risks are written on [#1455](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1455#issuecomment-6118481532). A view that stops
updating fails no compile and no unit test, so every step is checked in a browser.

### A smaller first load ([#1454](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1454))

Done, and in the 12 October release: popups, the All Maps pages, lodash and colornames, the event
definitions loaded after startup, and the trip planner's components. The map page's JavaScript goes from
459 KB to about 330 KB gzipped. Still owed: paint timings for the lodash and trip planner changes, and one
measurement of all of it together, on a quiet machine. Parked until after signals: downloading an event
map's definition only when its map opens ([#1646](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1646)).

### GIS Day

- **Its production site is on an Angular 15 build**, so its next deploy carries every upgrade and refactor
  of 2026 at once. [#1611](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1611) (high) is the test pass on its dev site first.
- **The whole GIS Day stack runs locally** from `scripts/gisday-local.sh`, with sign-in, on a starting
  database kept in the repository that holds nobody's real data. [`docs/gisday-local.md`](../gisday-local.md)
  explains it and `CLAUDE_SETUP.md` Phase 6 is the step-by-step ([#1621](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1621), [#1522](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1522)).
- **A new developer is given nothing**: the API's local settings are a copy of
  `apps/gisday-nest/local.env.sample`, with no secrets, and the API runs without Auth0 management
  credentials, so locally the admin Users page and a user's own profile answer 503 (and with them
  event registration and check-in), while class rosters and competition results show placeholders
  for names and emails
  ([#1759](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1759)). A development tenant with test users, which would make those work too, waits on
  the maintainer creating it ([#1623](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1623), medium).
- **The first schema change since `InitialSchema` is waiting for production**: `AddCheckInZones`, for
  location-based check-in ([#1766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1766)). It adds one nullable column, so it can run before the
  release that needs it; the step-by-step plan, for the maintainer, is a comment on the issue.
- **No development database exists outside a developer's machine.** [#1511](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1511) (medium) is open for
  that: one on the cluster, then a migration run and reverted there, following
  [`docs/gisday-migrations.md`](../gisday-migrations.md). It is the first step of the dev site
  ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525), high).

**What Angular's standalone migration gets wrong here, so check for it next time:**

- `--mode=standalone-bootstrap` drops `provideZoneChangeDetection()` (the app then runs zoneless), gives
  the `env` token only the `environment` export where the module used `import * as environment` (AggieMap
  then rendered nothing, and only the smoke suite noticed), and loses anything at the top of the deleted
  `app.module.ts`, such as `WebFont.load`. A module with a constructor is left in place with a TODO.
- `--mode=prune-ng-modules` must run over the whole workspace in one pass, and even then leaves imports of
  the modules it deleted in routing modules, unconverted code and specs.
- Every pass leaves relative imports across libraries and components not exported from their library's
  index; both show as lint or `TS2305` errors in the check.
- The production daily smoke run fails its campus and All Maps notification tests until the Ring Day fix
  ships: the hard-coded notice it removes shows on every page from 8 to 10 October.

### The Angular upgrade ([#1218](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1218)), in order

| Order | Step | State |
| --- | --- | --- |
| 1 | Remove `ngcc` ([#1220](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1220)) | done |
| 2 | ArcGIS runtime off 4.23 ([#1219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1219)) | done: 4.27, in the 5 October release |
| 3 | Angular 15 to 16 ([#1343](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1343)) | done, in the 5 October release |
| 4 | NestJS 9 to 10 ([#1350](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1350)) | done: [#1363](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1363) |
| 5 | ArcGIS type definitions 4.23 to 4.27 ([#1322](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1322)) | done: [#1364](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1364) |
| 6 | Angular 16 to 17 ([#1365](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1365)) | done: [#1370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1370) |
| 7 | Angular 17 to 18 ([#1371](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1371)) | done: [#1377](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1377) |
| 8 | Node 20.18 to 22.23.3 ([#1376](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1376)) | done: [#1401](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1401) |
| 9 | Angular 18 to 19 ([#1378](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1378)) | done: [#1406](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1406). Steps 2 to 9b are all in the 5 October release |
| 9b | esbuild-based `application` builder ([#1403](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1403)) | done: [#1408](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1408), in the 5 October release |
| 10 | Angular 19 to 22, one major per pull request | done and merged: 20 ([#1451](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1451)), 21 ([#1465](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1465), dev-tagged `dev-2026-10-06`), 22 ([#1471](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1471)), about 1 to 1.5 hours each ([`docs/upgrades/angular.md`](../upgrades/angular.md)). Angular 22 is on production, at 22.2.3 since the 19 October release ([#1925](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1925)) |
| 10b | Faster smoke suite ([#1426](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1426)) | merged ([#1477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1477)): a release check runs one framing route per map, 6 workers, the ArcGIS library cached; 22 min 44 s on a workstation against about 1 h 50 min. Further cuts: [#1473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1473) (bus test), [#1427](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1427) (maps) |
| 11 | `esri-loader` to `@arcgis/core` | done: `@arcgis/core` at 4.27 ([#1844](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1844)), stepped to 4.34 one release per commit ([#1845](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1845)), 5.0.19 ([#1859](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1859)) and 5.1.27 ([#1867](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1867)), with RNS Spaces at its service's own scale to get round 5.1's many-points updating; then the maps hosted in Esri's `<arcgis-map>` and `<arcgis-scene>` components in place of `view.ui` ([#1949](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1949), [#1950](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1950)). All on production since `prod-2026-10-20`, at `@arcgis/core` and `@arcgis/map-components` 5.1.27 |
| 12 | Nx 23.2.1 to 23.3.0 ([#1972](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1972)) | done: [#1984](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1984), in the 21 October release. No migrations; nx, every `@nx/*` plugin and the lock only |
| 13 | Vitest 4 to 5 ([#1973](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1973)) | to do |
| 14 | NestJS 10 to 11 ([#1974](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1974)) | done: [#1985](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1985), in the 21 October release, with Express 5, Passport 0.7 and the UES Operations sign-out fix ([#1978](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1978)). Includes GIS Day's servers, by the maintainer's decision; each API gets it with its own deploy |
| 14b | NestJS 11 to 12 ([#1974](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1974)) | to do |
| 15 | TypeScript 7, the native compiler ([#1918](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1918)) | waits on Angular supporting it |
| - | Dead projects ([#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226)) | VeoRide retired ([#1404](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1404)); the old Ring Day app is removed ([#1236](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1236)); CPA is retired ([#1458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1458); restore it from the tag `cpa-last` if it is ever needed); the unused projects are listed in the cloud's Batch B report on `cloud-mailbox`, and the Cypress `*-e2e` projects are deleted, with Cypress itself ([#1545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1545), part of [#1457](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1457)) |
| - | After Angular 22 | standalone ([#1452](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1452)) and no NgModules ([#1569](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1569)): done, in the 12 October release. `inject()` ([#1453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1453)): done, same release. `@defer` and a smaller first load ([#1454](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1454)): done, in the 12 October release. Signals and OnPush ([#1455](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1455)): mostly done, every decorator input, output and query left is a signal ([#1865](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1865)), in the 19 October release; OnPush as in the table above. Zoneless ([#1478](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1478)) and Vitest ([#1479](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1479)): done for AggieMap and UES Operations ([#1948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1948)), in the 19 October release; the other apps remain. Next: accessibility rules back on ([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474)) |

**A local `nx affected` on a `package.json` change fails on projects that already fail on
`development`.** Every project counts as affected. Measured on 2 October: `cpa-angular` (since
retired, [#1458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1458)), `ues-recycling-angular`, `signage-angular`, `ues-valves-angular` and `oidc-admin-angular` fail to build
on unchanged `development` (TypeORM and NestJS typings, signage typings, a missing `secrets` file);
NestJS builds fail on missing `ormconfig` files; three NestJS projects fail stale generator specs. CI
excludes all of them. Compare against this list, not the exit code. After any dependency change, prove
the lock file with a clean `npm ci` before pushing (CLAUDE.md, [#1347](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1347)).

### Also open

- **The standalone GIS Day competitions app and API are to be removed** ([#1609](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1609), low): the main GIS Day
  site and API serve everything they did, and nothing builds or deploys them.
- **`gisday-competitions-angular`'s page never answers when served locally** ([#1410](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1410), low);
  CI and Azure exclude the app.
- **Clicking a Ring Day popup throws in `TripPlannerConnectionService.connection`**, on production too
  ([#1411](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1411), medium). The popup still works.
- **The map probe should report popups**, so a test can see one carried between maps ([#1400](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1400),
  medium).
- **The shared flex mixins emit dead vendor prefixes** ([#1340](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1340), low priority), which makes
  reused CSS larger than hand-written.
- **Angular 16's parallel Sass compilation failed once on Azure** with "This file is already being
  loaded", on stylesheets that built cleanly before and since. If it recurs, it becomes its own issue.

### Also open from 1 and 2 October

- **Code Maroon needs an IIS proxy for its feed.** Dev reads a saved copy of the feed until then
  ([#1304](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1304), in the 2 October release). The fix is an IIS URL Rewrite and ARR rule
  with server-side caching, for dev only, to be arranged with the team that manages the server; the
  saved copy is removed once it is in place.
- **The browser console's build banner prints `___BUILD_DATE___` and the other placeholders** instead
  of the build's details ([#1306](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306), low priority).
- **The old standalone Ring Day app's deployed copy at `/ringday/`** still needs deleting, or redirecting
  to `/events/ring-day`, on dev and production; its code is removed
  ([#1236](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1236)). The old Move-In app's deployed copy at `/movein/` still needs deleting
  ([#1235](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1235)).
- **Every map's starting center and zoom** to be checked against its data ([#1231](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1231)).
- **Signage does not build from its current source** ([#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226)).

### Waiting on someone else

**Everything waiting on the GIS teams is in one list: [#1745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1745).** The basemap republished in Web
Mercator and with its tree cutoffs corrected, bus route data on a production server, routing, the
symbology review and the rest, each with its issue and the AggieMap work that follows it.

**Bus route stops are a data fix, not a code fix
([#1174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1174)).** Five
routes draw no stops - NW0104, NW0305, NW4041, 15R and 47/48 - and two draw the wrong number: 40 has
one extra, 47 two missing. The map matches each stop's `Route` field in the Bus Stops layer
(`TS/Bus_Routes/MapServer/0`) against the route code, and no stop carries those codes. The side panel
still lists their stops, because that comes from separate text fields.

**Megan maintains the bus data.** `bus.spec.ts` records the seven as known failures for dev, so the
nightly run shows each one going green as its data is corrected. Production deliberately has no
entries, so the test holds any bus release until the data is right.

### Read this first if you are picking up elsewhere

**726 screenshots exist only on the work machine.** They are in `test/visual/baselines/builder/`,
untracked and deliberately uncommitted - 363 builder destinations at two viewports, 325MB. They are
the output of a two-hour crawl against dev and can be regenerated with:

```bash
AGGIEMAP_SMOKE_BASE_URL=https://dev.aggiemap.tamu.edu BUILDER_INVENTORY_SHOTS=/some/dir \
  npx playwright test --config=tools/builder-inventory/playwright.config.ts
```

The capture resumes rather than restarts, so an interrupted run costs only what it had not reached.

They are uncommitted on purpose: at 325MB they would more than triple a 153MB repository,
permanently, since git keeps every version. Where they should live is
[#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107).

### A lesson from this release worth keeping

**A red smoke run is not automatically a code fault.** On the morning of 30 September the scheduled
run was red on both environments: 57 failures on production, one on dev. Every one of them was the
new tests running against builds that predated them - neither environment had been redeployed since
the 29 September release. Checking the deployed bundle settled it in minutes; debugging the
application would have wasted the morning.

Until a build can say which commit it came from
([#1148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1148)), the smoke
suite tests a URL and cannot know what it verified, so this can happen after any merge that is not
promptly deployed.

### The decision waiting to be made

**[#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107) - evaluate
Visual Regression Tracker on the cluster** as the home for baseline images, with
[#1119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1119) to stand it
up. Phase 0 is five decisions that need no VPN: hostname, TLS issuer, image storage, PVC size, and who
can log in.

The contained test is in [#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107): stand VRT up, point the existing capture at `gameday-parking`'s 14
destinations, and find out whether its Playwright agent - about two years stale, while the server is
current - still works before migrating 726 images.

### Open, none started

| Issue | |
| --- | --- |
| [#1079](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1079) | Visual baselines are stale against dev, and there is one set for all environments |
| [#1082](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1082) | All Maps scrolls sideways on a phone: a copy field with an unbreakable URL widens its card |
| [#1089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1089) | Full visual suite: a screenshot of every page, including builder paths |
| [#1090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1090) | Nothing asserts development-only sections stay off production |
| [#1091](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1091) | Layer toggle round-trip: prove a layer returns the map to its original state |
| [#1097](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1097) | Two 2025 events still registered on dev |
| [#1099](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1099) | Ring Day naming: October holds the generic `/events/ring-day` id |
| [#1101](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1101) | Inventory every GIS service, with dev and prod URLs and which maps use them |
| [#1102](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1102) | Dev is hardcoded to the production transportation GIS host by a `TEMP` |
| [#1103](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1103) | No test that a past event shows the "this event has passed" warning |
| [#1104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1104) | Define an emergency test tier for urgent deploys |
| [#1105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1105) | Map captures are not byte-reproducible; page captures are |
| [#1123](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1123) | Two unused football entries point at stopped services |
| [#1134](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1134) | Test production's builder-gated maps using the builder inventory |
| [#1137](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1137) | Run a frequent scheduled subset of map function checks and alert on failure |
| [#1140](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1140) | Field names differ between three maps in the latest service data |
| [#1144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1144) | Release process: which of the remaining options to adopt |
| [#1146](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1146) | Professionalization sweep |
| [#1148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1148) | A deployed build cannot say which commit it came from |
| [#1156](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1156) | Decide whether to turn Claude's auto memory off, as the C# repository did |
| [#1159](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1159) | Test that every map's side panel tabs open and close |
| [#1160](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1160) | Test that the items inside every map's side panel open and close |
| [#1161](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1161) | Test that an upcoming event's toast appears, opens its map, and stays dismissed |
| [#1169](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1169) | Drive directions' visitor parking query uses a column that no longer exists |
| [#1173](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1173) | Every popup offers a copy link that reopens that map and feature, through shared code |
| [#1174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1174) | Five bus routes draw no stops (waiting on the data) |

### Worth knowing before touching the visual work

- **Page captures are byte-identical across runs; map captures are not.** Measured three times each.
  So hash comparison works for pages and cannot work for maps, which need pixel tolerance
  ([#1105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1105)).
- **A local dev server must be reached at `http://localhost:4200`, not `127.0.0.1`.** `TestingService`
  keys on the host containing `dev` or `localhost`, so `127.0.0.1` renders the *production* variant.
  That is deliberate and useful - it is the `local-production` test environment, and the way to capture
  production behaviour before deploying - but it is not what you want for everyday work.
- **The builder inventory is environment-specific** and the smoke suite refuses one captured
  elsewhere. Production has no inventory yet, so its builder maps still skip
  ([#1134](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1134)).
