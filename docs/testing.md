# How AggieMap is tested

This page is for anyone asking what testing this project does: colleagues, managers, funders. It
says what is checked, when, and why, in plain terms. The engineering detail lives in the
[smoke suite's README](../test/smoke/aggiemap/README.md) and the
[builder inventory's README](../tools/builder-inventory/README.md).

## In short

Testing happens in layers, each answering a different question.

| Layer | When it runs | The question it answers |
| --- | --- | --- |
| [Pull request checks](#every-pull-request) | On every proposed change, before it merges | Is this change sound: does it compile, pass its tests, stay within size limits, and come with an issue and screenshots? |
| [The smoke suite](#the-smoke-suite-checking-the-live-sites) | Every morning against dev and production, and before every release | Does every map on a deployed site actually load, draw and work? |
| [The builder inventory](#the-builder-inventory) | By hand, when a map's choices change | Where does every combination of choices on the maps without a direct address lead? |
| [People](#people-the-team-tests-on-dev) | Before every production release | Does each change do what it was meant to? |

The middle row matters most for a mapping site. AggieMap's maps draw from GIS services hosted
elsewhere, so a map can break with no change to this code at all: a service is republished, moved or
stopped, and nothing here would notice. The smoke suite exists to notice.

## Every pull request

A change reaches the main code only through a pull request, and every pull request runs these checks
on GitHub before it is merged. Changes merged to `development` run them again.

- **Lint.** Checks the code follows the project's style and avoids common mistakes.
- **Unit tests.** Small, fast tests that live next to the code they check. There are about 175 unit
  test files across the applications and shared libraries, holding roughly 900 individual tests
  (counted from the source on 4 October 2026). Results are published on the pull request itself, so a
  failure can be read there, line by line.
- **The build, with size budgets.** Every application the change could affect is built exactly as it
  would be for production. Eleven applications have *bundle budgets*: a maximum download size, and
  the build fails if a change pushes an application past it. That has caught real problems, such as a
  shared stylesheet growing by under a kilobyte and pushing a different application over its limit.
- **A linked issue.** Every pull request must say which issue it closes. The project's work is
  reported to its funders from those issues, so a change without one would disappear from the record.
- **Before and after screenshots.** A change someone could see must show what it looked like before
  and after. Images catch what reading the code does not: a duplicated tile on the 150th Anniversary
  page ([#1055](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1055)) was
  found this way, because each copy read as correct on its own. A change with nothing visible says so
  with a label, which stays on the record.

Only the checks that a change could affect run. "Affected" is worked out from how the code depends on
itself, so a change to a shared library runs the checks for every application that uses it.

GIS Day has its own browser tests, which start the GIS Day site from the change being proposed and
check its pages load. They run on pull requests that touch GIS Day.

**Azure DevOps** builds what is actually deployed. On each pull request it lints and builds the
affected projects again, in both the development and production configurations. A deployable build of
`development` builds every application, and refuses to produce an artifact that has no applications in
it, so a release can never deploy an empty site. It does not run tests; those run on GitHub.
[The deploy pipeline](releases/README.md#the-deploy-pipeline) explains how the two systems divide the
work.

## The smoke suite: checking the live sites

The smoke suite opens the deployed site in a real browser, the way a visitor would, and checks every
map. It only reads; it changes nothing, so it is safe to run against production.

It is generated from what the site offers, not from a hand-written list: when a new event map appears,
it is tested the next morning without anyone adding a test. That is also why the counts below grow
with the number of maps and services.

### What it checks

The counts are a snapshot: **757 tests, measured on dev on 5 October 2026** in the full run that cleared
the [5 October release](releases/2026-10-05.md#what-cleared-it): 743 passed and 14 skipped, in 1.3 hours,
against the release candidate built with esbuild. Production lists fewer maps than dev, so it runs fewer.

| Type of check | Spec files | Tests | What it catches | Prompted by |
| --- | --- | ---: | --- | --- |
| GIS services | `services.spec.ts` | 83 | Every GIS service any map uses is public and answering, asked directly, so a moved or locked service is named outright, including for maps nobody happened to open | [#1118](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1118), after DC / Bush School services moved and their old address started demanding a login ([#1110](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1110)) |
| Maps load and serve layers | `maps.spec.ts` | 70 | One test per map: the page loads, every layer loads and returns data, nothing errors, and the map actually draws | [#1034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1034), the suite's original plan |
| Event dates | `event-dates.spec.ts` | 66 | Every event map agrees, at College Station time, on whether its event is over | [#1302](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1302), after a map said "This event has passed" the evening before it ([#1298](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1298)) and an event left the upcoming list on its own day ([#1301](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1301)) |
| Phone layout | `mobile.spec.ts` | 20 | Every kind of page works at phone width, where the site shows different components, not just a narrower layout | [#1331](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1331), after three phone-only faults were found by eye |
| Search | `search-sources.spec.ts`, `search.spec.ts` | 21 | Every place the main map searches still answers, under the right heading, with real details; map search finds the expected result | [#1138](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1138) and [#1116](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1116), after bike racks ([#1122](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1122)) and night parking ([#1162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1162)) quietly stopped returning results |
| Retired events | `retired.spec.ts` | 17 | Finished events are offered nowhere, and their old links say the event has ended | [#1098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1098) |
| The map actually draws | `paint.spec.ts`, `campus-basemap.spec.ts` | 17 | A map that loads everything but draws a blank canvas; the blank-canvas detector is itself tested so it cannot silently stop working | [#1241](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1241) and [#1259](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1259), blank maps the suite had passed |
| Notices and alerts | `campus-notifications.spec.ts`, `map-notice.spec.ts`, `code-maroon.spec.ts` | 16 | College Station notices stay off other campuses' maps; a map's notice shows and stays dismissed; the Code Maroon page reads its feed | [#1281](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1281), the 150th venue change ([#1193](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1193)), [#1304](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1304) |
| Production gating | `directions.spec.ts`, `development-only.spec.ts` | 11 | Features still in development, such as directions and bus routes, appear on dev and never on production, checked both ways | [#1003](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1003), [#1090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1090), [#1229](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1229) |
| Choosing what to run | `scope.spec.ts` | 9 | The rule that decides which part of the suite a change needs, so a one-map fix is not gated by all 757 tests. Tested because its failure is silent: it would run *fewer* tests than it should | [#1427](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1427) |
| Build and runtime | `analytics.spec.ts`, `esri-runtime.spec.ts`, `build-banner.spec.ts` | 6 | Each site reports to its own Google Analytics; the maps run the intended ArcGIS version; the page says which build it is | [#1037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1037) (dev was reporting into production's analytics), [#1219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1219), [#1306](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306) |
| Interaction | `bus.spec.ts`, `popup.spec.ts` | 3 | Every bus route draws its stops; clicking a feature opens a popup with its data | [#1174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1174), [#1117](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1117) |
| Map framing | `framing.spec.ts` | 420 | Every map, and every builder choice, opens at the zoom and center it opens at on production, compared with a baseline recorded from production: 412 routes, plus one report of the routes only one side has. On dev, 7 maps production does not list are reported and skipped | [#1380](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1380), after event maps opened at the default zoom on dev with every layer drawn ([#1379](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1379)) |
| Kiosk maps | `kiosk.spec.ts` | 4 | The dining kiosk, opened by direct link as production serves it, draws its dining locations with no sidebar, on each of three fresh loads, and holds none of the main map's layers | [#1392](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1392), after it opened on the basemap alone |
| Map isolation | `isolation.spec.ts` | 3 | Going back to the main map from a map that changes some of its layers, without reloading, shows the main map as it was | [#1397](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1397), after the dining kiosk left the main map's dining layer switched on |
| **Total** | | **757** | | |

A known problem that cannot be fixed yet, such as a service the dev GIS server does not publish, is
listed against its issue and reported on every run rather than failing it, so it stays visible until
it is fixed.

Map framing loads every map and builder choice again, so it is the largest check: it adds **about 40
minutes** to each daily run. A release check run from a workstation opens one route per map instead,
about 70 rather than about 420, since the rest are the same maps with different builder choices; the
daily run still opens all of them ([#1426](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1426)).

### How it grew

The suite started on 27 September 2026 and grew with nearly every bug found since.

| Date | Tests | Added |
| --- | ---: | --- |
| 27 September | ~73 | Maps and analytics ([#1039](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1039)) |
| 28 September | ~162 | GIS services, search, popups |
| 29 September | ~196 | Retired events, search sources |
| 30 September | ~212 | Map notices, bus routes, directions, development-only features |
| 1 October | ~241 | Campus notices, blank-canvas detection, campus basemaps. **Measured: 242** on 2 October at 02:03, in 33 minutes |
| 2 October | ~331 | Event dates, phone layout, ArcGIS version, Code Maroon, build banner. **Measured: 331** in every full run from 3 October, in 36 to 45 minutes |
| 4 October | 758 | Map framing against a production baseline of every map and builder choice; kiosk maps; map isolation |
| 5 October | 757 | One fewer GIS service once VeoRide was retired. **Measured: 757** (743 passed, 14 skipped) in 1.3 hours, the run that cleared the 5 October release |

Numbers marked ~ are estimates: today's count for each spec, added up by the date the spec first
appeared. Bold numbers are real runs. The early estimates are approximate, because the per-map checks
grow with the number of maps the site lists.

### When it runs

**Every morning**, on GitHub, against dev and production as separate jobs. The schedule is 11:17 UTC,
which is 6:17 AM in College Station during daylight saving time and 5:17 AM in winter. Running the two
separately makes a failure diagnostic: production only means a service broke on production; dev only
means the coming release or a dev-only service has a problem; both means a shared service or a map's
definition is broken.

**A failure opens a health issue**, one per environment, labelled
[`dev-health`](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/labels/dev-health) or
[`prod-health`](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/labels/prod-health).
Further failures add a comment to the same issue rather than opening another, and the first passing run
closes it. So the open health issues always describe the present. If the deployed site is too old to
be checked, the run says so and skips, and does not close an open issue.

**On demand**, the same workflow can be started from GitHub's Actions tab against either environment
or both, for example straight after a deploy.

**From a workstation**, [`run-local.sh`](../test/smoke/aggiemap/run-local.sh) runs the identical suite
with the identical settings, against dev, production, or a developer's own copy of the site. **It is
how every release is checked before it goes to production** (see [People](#people-the-team-tests-on-dev)).

GIS Day has a smaller smoke check of its own, which loads txgisday.org every six hours.

## The builder inventory

Eleven maps have no direct address: a visitor first chooses options in a *builder*, such as which
game day lot or which day of an event, and only then sees a map. The
[builder inventory](../tools/builder-inventory/README.md) walks every combination of choices on every
builder and records where each lands, which layers it shows, and the shareable link that reaches it
directly. Those links give the smoke suite something to load, and because the inventory records every
choice offered at each step, a renamed or removed choice shows up as a change rather than vanishing
silently. It is run by hand when a builder's choices change, not on a schedule.

## People: the team tests on dev

Automated checks prove the maps load and draw. They do not prove a change does what it was meant to.
So before every production release, the team tests each change on
[dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu), working from the
[What to test on dev](releases/unreleased.md#what-to-test-on-dev) table: one row per visible change,
with a link and what to look for. Each change adds its own row when it merges, so the list is complete
when a release is cut.

That sits inside one release sequence, written down in
[docs/releases/README.md](releases/README.md#cutting-a-release):

1. Build and deploy to dev.
2. Run the full smoke suite against dev. This is the gate; nothing below happens if it fails.
3. Tag the commit `dev-<date>`.
4. The team tests on dev.
5. Merge the release notes, which record the suite's result and what the team tested.
6. Deploy the same build to production.
7. Tag the commit `prod-<date>`.
8. Check production.

**The tags are the proof that what shipped is what was tested.** The production tag cannot be applied
to a commit that has no dev tag, and a dev tag is only applied after the suite passes. So anyone can
see, from the repository alone, which commit production runs and that it passed on dev first.

## Every bug gets a test

This is a standing rule for every change: when a bug is fixed, the fix comes with an automated check
that would have caught it, and that check is first run against the unfixed code to prove it fails for
the right reason. A bug that cannot be fixed yet still gets its check, listed as a known failure tied
to its issue, so the fix is noticed when it lands.

Nearly every type of smoke check above exists because of a specific bug. Three examples:

- **Game day bike layers.** On the suite's first runs it found that two bike layers on the Gameday
  Parking map were drawing the wrong data on production, with no error and plausible-looking shapes
  ([#1036](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1036)).
- **Blank maps.** On 1 October every event and parking map on dev drew an empty canvas
  ([#1240](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1240)), and the
  suite passed them, because every layer had loaded. The suite now checks the map actually painted
  ([#1241](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1241)).
- **Map framing.** After an ArcGIS upgrade, event maps that zoom to the visitor's choice, such as each
  day of Ring Day, opened zoomed out instead. It was found by eye during testing on dev, before it
  reached production
  ([#1379](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1379)). Every
  map and builder choice is now compared with where it opens on production
  ([#1380](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1380)).

## Planned: not running yet

Nothing in this section runs today.

**Screenshot testing of every page**, planned to start the week of 5 October 2026
([#1089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1089)). Today a
small visual check, run by hand, compares screenshots of four pages at desktop and phone widths with
saved images; it found the duplicated anniversary tile and uneven phone spacing. The plan is a
screenshot of every page at both widths, including all of the builder destinations, generated from
what the site offers the way the smoke suite is. That is hundreds of images (the builder crawl alone
produced 726, about 322 MB), too many to keep in the repository, and a changed screenshot needs a
person to decide whether the change was intended. So the images and those decisions are to live in
Visual Regression Tracker, a self-hosted tool run on the team's own cluster, with nothing leaving TAMU
infrastructure
([#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107),
[#1119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1119)). It is to be
proved on one map before anything is migrated.

## Keeping this page current

- **A check fails** if a smoke spec file exists that this page does not mention by name
  ([`testing-page.yml`](../.github/workflows/testing-page.yml)), so a new type of check cannot be
  added without being described here.
- **The counts and their date are refreshed at each release**, from that release's suite run against
  dev, as a step in the [release checklist](releases/README.md#cutting-a-release).
