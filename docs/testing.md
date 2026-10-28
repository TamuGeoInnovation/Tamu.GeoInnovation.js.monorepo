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
- **The smoke suite compiles.** The live-site checks described below are typechecked strictly on every
  pull request, so a mistake in a check fails before it can quietly check the wrong thing. Until
  October 2026 nothing compiled them
  ([#1470](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1470)).
- **The tools' own tests.** The scripts under `tools/`, which check the maps from outside the
  applications, carry their own small tests. They run on pull requests that change those scripts, or
  the map definitions they read
  ([#2055](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2055)).
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

The counts are a snapshot: **657 tests, measured on dev on 20 October 2026** in the run that cleared
the [21 October release](releases/2026-10-21.md): 613 passed and 44 skipped, none failed or flaky, in 17.4
minutes, with the release tier. Production lists fewer maps than dev, so it runs fewer (421
on 8 October); the bus routes run as one test each on dev (#1473), and production does not show bus routes.
The per-row counts below were last counted on 12 October and have grown since.

| Type of check | Spec files | Tests | What it catches | Prompted by |
| --- | --- | ---: | --- | --- |
| GIS services | `services.spec.ts` | 88 | Every GIS service any map uses is public and answering, asked directly, so a moved or locked service is named outright, including for maps nobody happened to open; and the campus basemap's own services, which are declared as Esri basemaps rather than as connections and so were the one set nothing asked about | [#1118](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1118), after DC / Bush School services moved and their old address started demanding a login ([#1110](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1110)); extended to the campus basemap by [#1695](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1695) |
| Maps load and serve layers | `maps.spec.ts` | 74 | One test per map: the page loads, every layer loads and returns data, nothing errors, and the map actually draws | [#1034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1034), the suite's original plan |
| Event dates | `event-dates.spec.ts` | 101 | Every event map agrees, at College Station time, on whether its event is over - both that it does not say so early, and that a map whose event is past says so at all | [#1302](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1302), after a map said "This event has passed" the evening before it ([#1298](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1298)); the other direction added by [#1687](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1687) and an event left the upcoming list on its own day ([#1301](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1301)) |
| Phone layout | `mobile.spec.ts` | 20 | Every kind of page works at phone width, where the site shows different components, not just a narrower layout | [#1331](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1331), after three phone-only faults were found by eye |
| Search | `search-sources.spec.ts`, `search.spec.ts`, `all-maps-search.spec.ts` | 24 | Every place the main map searches still answers, under the right heading, with real details; map search finds the expected result; a second search lists its own results, not the first's; a result chosen in All Maps' search, with the mouse or the keyboard, opens its map | [#1138](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1138) and [#1116](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1116), after bike racks ([#1122](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1122)) and night parking ([#1162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1162)) quietly stopped returning results; searching twice, [#1672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1672); an All Maps result that did nothing when clicked, [#1868](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1868) |
| Retired events | `retired.spec.ts` | 17 | Finished events are offered nowhere, and their old links say the event has ended | [#1098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1098) |
| The map actually draws | `paint.spec.ts`, `blank-map.spec.ts`, `campus-basemap.spec.ts`, `basemap-zoom.spec.ts` | 18 | A map that loads everything but draws a blank canvas, including zoomed all the way in; the blank-canvas detector is itself tested so it cannot silently stop working; and six plain loads of the main map, each its own test with no retries, each read once when it draws and again five seconds later, because the fault that prompted this blanked about one load in four and the suite's retries hid it | [#1241](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1241) and [#1259](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1259), blank maps the suite had passed; [#1577](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1577), white at the deepest zoom; [#2487](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2487), after a basemap sprite override blanked the map on a share of plain loads with every check passing and the map probe reporting ready |
| Notices and alerts | `campus-notifications.spec.ts`, `map-notice.spec.ts`, `code-maroon.spec.ts` | 16 | College Station notices stay off other campuses' maps; a map's notice shows and stays dismissed; the Code Maroon page reads its feed | [#1281](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1281), the 150th venue change ([#1193](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1193)), [#1304](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1304) |
| Production gating | `directions.spec.ts`, `development-only.spec.ts` | 13 | Features still in development, such as directions, bus routes and the Aerial Imagery timeline, appear on dev and never on production, checked both ways; the trip planner is checked at its own address too, which still opens on production with the tab hidden, and with `?as=production` on dev | [#1003](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1003), [#1090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1090), [#1229](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1229) |
| Portal renderers | `portal-renderers.spec.ts` | | One test per hosted GIS service: every renderer its portal item publishes keys on fields the layer it describes still has. The application draws a layer with its item's renderer, and an item is not republished with its service, so a replaced schema leaves layers that draw nothing and raise no error. Needs no browser, so it covers builder-gated maps, which `map-layers.spec.ts` skips. Known failures are listed in `environments.json` under `allowedPortalRendererFailures`, each tied to an issue | [#2500](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2500), after three baseball layers drew nothing on production once the GIS team republished their views |
| Service metadata | `service-metadata.spec.ts` | | One test per hosted GIS service, over every layer: `objectIdField` is one of the layer's `fields`, `displayField` (where set) is too, and `where=1=1&returnCountOnly=true` is answered - an error under a 200 status counts as a failure. A republish can leave a service describing itself inconsistently and every query to it failing, as no map-level check notices. Needs no browser, so it covers builder-gated maps, which `map-layers.spec.ts` skips; shares its metadata fetch with the portal renderers check. Known failures are listed in `environments.json` under `allowedServiceMetadataFailures` as `<connection>/<layer>/<check>`, each tied to an issue | [#2511](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2511), after [#2510](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2510): the production baseball layer declared an `objectIdField` it does not have |
| Production services | `gis-hosts.spec.ts` | 15 | No map on a production environment may request a development GIS host. The rule is its own tested module, because a host pattern that quietly matches nothing reports green for the one thing it was added to catch | [#1483](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1483), filed on the way to linking the campus maps on production ([#1482](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1482)) |
| Choosing what to run | `scope.spec.ts` | 22 | The rule that picks the quick tier's tests from what a build changed, so a dev release is not gated by every map. Tested because its failure is silent: it would run *fewer* tests than it should | [#1427](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1427), [#1717](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1717) |
| Build and runtime | `analytics.spec.ts`, `esri-runtime.spec.ts`, `build-banner.spec.ts` | 6 | Each site reports to its own Google Analytics; the maps run the intended ArcGIS version; the page says which build it is | [#1037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1037) (dev was reporting into production's analytics), [#1219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1219), [#1306](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306) |
| Interaction | `bus.spec.ts`, `popup.spec.ts`, `basemap-gallery.spec.ts` | 30 | Every bus route draws its stops, one test per route (25 on dev; [#1473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1473)); clicking a feature opens a popup with its data, and clicking the next one shows that one's; choosing a basemap changes the map and the panel marks it; Aerial Imagery asks Nearmap for its latest imagery as one GET and gets an image, and its spinner stops | [#1174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1174), [#1117](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1117); the view following each change, ahead of OnPush on the map, [#1672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1672) , Aerial Imagery by GET [#1997](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1997) |
| Legend | `legend.spec.ts` | 5 | A legend symbol that does not follow its layer: the portal's symbology is held back so the legend is drawn first, and the symbol must change when it arrives; a symbol squeezed to a sliver by a long label, on the Baseball Event Map; a layer switched off and on from the Layers list and from the legend, which both lists and the map must follow; and a main-map layer, which loads hidden, listed in the legend once it is switched on, and gone from it once switched off again; and on Freshman Selectable Parking, each layer drawn by a two-field unique-value renderer shows its symbols | [#1721](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1721), [#1804](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1804), [#1672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1672), [#1857](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1857), [#1871](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1871); [#1987](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1987), after that map's legend showed names with no symbols, because the legend quoted integer values as strings (#1988) |
| 2D and 3D | `perspective.spec.ts` | 1 | A map that moves when it is switched to 3D or back: the centre of the view is read before, in 3D and after, and must be the same place | [#1724](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1724) |
| The main map in 2D | `map-coordinates.spec.ts` | 3 | A click on the main map shows its latitude and longitude with no error, the keyboard viewfinder lists the buildings under it, and a click in directions draws a stop where it lands, on a basemap in a projected reference where ArcGIS gives no latitude | [#1875](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1875), found while working on [#1671](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1671) |
| Map framing | `framing.spec.ts` | 71 | Every map, and every builder choice, opens at the zoom and center it opens at on production, compared with a baseline recorded from production: 412 routes, plus one report of the routes only one side has. On dev, 7 maps production does not list are reported and skipped | [#1380](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1380), after event maps opened at the default zoom on dev with every layer drawn ([#1379](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1379)) |
| Kiosk maps | `kiosk.spec.ts` | 4 | The dining kiosk, opened by direct link as production serves it, draws its dining locations with no sidebar, on each of three fresh loads, and holds none of the main map's layers | [#1392](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1392), after it opened on the basemap alone |
| Satellite campus layers | `campus-layers.spec.ts` | 4 | Each satellite campus map (Galveston, McAllen, DC / Bush School) holds only the basemap and its own campus's layers, none of College Station's; read from the probe, so a campus added later is checked unchanged | [#1910](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1910), after the DC map loaded 26 College Station layers, logged 40 console errors and took 100 seconds to paint on ArcGIS 5.1 |
| Parking-space layers | `parking-spaces.spec.ts` | 3 | Accessible Parking and Motorcycle Parking each hold exactly the spaces their symbology draws, counted by the service for the values the map's renderer has a symbol for, so a map does not download every parking space on campus to draw one type; and a `?lot=` link on Motorcycle Parking selects a motorcycle space, not one the map leaves out | [#1897](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1897), after both maps loaded all 44,980 spaces and took up to four minutes to finish drawing on ArcGIS 5.1; [#1954](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1954), after `?lot=100j` selected an accessible space |
| Layers listed, drawn and keyed | `map-layers.spec.ts` | 70 | One test per map (70 on production on 20 October 2026; builder-gated maps at their recorded destinations, dev's borrowed on production, #2467 and #1134): every layer its definition lists reaches the map and the Layers list, read from `declared-layers.generated.json`, which a unit test in `ts-events-ngx` keeps equal to the definitions; every layer that is on and holds features draws at least one of them, asked of its own renderer; and every layer on in the Layers list has a legend entry with a symbol in it | [#1986](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1986), after Business Parking held 73 and 6 lots and drew none ([#1981](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1981)) and Freshman Selectable Parking keyed both its layers in the legend with no symbol ([#1987](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1987)), both on production with every other check passing |
| Map isolation | `isolation.spec.ts` | 3 | Going back to the main map from a map that changes some of its layers, without reloading, shows the main map as it was | [#1397](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1397), after the dining kiosk left the main map's dining layer switched on |
| Selection highlight | `selection.spec.ts` | 6 | A link to one tent or area on Football Tailgating opens with the feature highlighted above every other layer, on each of three fresh loads per link: the highlight's layer could end up under layers that finished loading after it | [#1805](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1805), after a tent's link opened with the tent selected but its highlight drawn under the tents |
| Drawing order | `layer-order.spec.ts` | | On Indoor Track Parking, the accessible spaces are drawn above the lots they sit in, read from the map's own layer order on each of three fresh loads | [#2059](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2059), after the area was drawn under the building and switching it on and off changed nothing on the map; rewritten for the accessible spaces when that area was removed ([#2507](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2507)) |
| Lactation Rooms | `lactation-rooms.spec.ts` | 2 | The Lactation Rooms layer's service has every field its popup shows and holds the campus's rooms (35 on 19 October 2026), asked directly, so a layer repointed at a service with other field names fails here instead of opening empty popups | [#1960](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1960), when the layer moved to a hosted service whose every field was renamed, and the old popup's Building Number had been blank for years |
| Lot links | `lot-links.spec.ts` | 3 | A `?lot=` link opens the lot on a parking map whose service names its fields by table (Visitor Parking) and on one that does not (Motorcycle Parking), and a `?feature=` link shared before opens the same lot | [#1952](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1952), after `?lot=` links opened nothing on fourteen parking maps |
| **Total** | | **552** | | |

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
| 6 October | 436 | Production services (`gis-hosts.spec.ts`), and framing scoped from 412 routes to 71 so the suite is fast enough to gate a release ([#1426](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1426)). **Measured: 436** (421 passed, 1 failed, 14 skipped) in 29 min 24 s, the run that cleared the 6 October release |
| 7 October | 460 | The every-route bus test split into one test per route, so it spreads across workers and a failure names its route ([#1473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1473)). The count is dev's; production, where bus routes are not offered yet, keeps 2 bus tests |
| 11 October | 461 | A map that draws ArcGIS's default symbol fails ([#1578](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1578)). **Measured: 461** on dev, twice: 447 passed and 14 skipped in 27 min 2 s on that day's first build, then 446 passed, 1 flaky and 14 skipped in 29 min 9 s on the build that shipped |
| 20 October | 576 | **Measured: 576** on dev with the release tier, on the build cleared for the [19 October release](releases/2026-10-19.md): 546 passed, 1 flaky and 29 skipped in 36.8 minutes |
| 20 October, night | 657 | Every map's layers listed, drawn and keyed (`map-layers.spec.ts`, [#1986](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1986)), the Football Tailgating kiosk, Aerial Imagery by GET and the legend's numeric fields. **Measured: 657** on dev with the release tier, 11:35 to 11:53 PM Central, on the build cleared for the [21 October release](releases/2026-10-21.md): 613 passed and 44 skipped in 17.4 minutes |

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

**The suite is run at three sizes** ([#1717](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1717)):

| Tier | What it runs | When | What it decides |
| --- | --- | --- | --- |
| Quick | A fixed core, plus the tests for what the build changed | After every build reaches the test site, in six to ten minutes | Whether the build is tagged as checked on the test site |
| Release | Every map once | Once, on the build going to production, in about thirty minutes | Whether that build may go to production |
| Full | Every map and every saved view, on both sites | Nightly, on GitHub | Nothing about a release. It notices a map that broke with no release, and opens an issue |

The quick tier samples: it loads the maps a build touched and three it did not. A map nobody touched
is checked by the release tier before production and by the nightly run after it.

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
- **A pull request adds its row and leaves every number alone**, the Total included. The counts are a
  measurement taken at release, not a running tally, and the check above does not read them - it only
  asks that each spec file is named here.

  Hand-incrementing the Total is what three pull requests in one afternoon on 20 October each
  conflicted on, because every one of them edited the same line and nothing else collided. It was not
  buying accuracy either: that day the headline said 576 tests measured on dev, this table's Total said
  552, and the per-row counts added up to 619, all in one file. A number that is wrong three ways and
  costs a conflict per pull request is worse than one refreshed deliberately, with a date on it, from a
  run somebody actually watched (#2002).
