# Unreleased

> **Not on production.** This file collects what has merged since the last production release. Each
> entry says where it can be seen.

Four faults in the map's own controls, all of them things a visitor would hit within a minute of
using a map: alerts that followed you to the map you had just opened, a hamburger that ignored the
first click, a side panel that swallowed the thing you clicked, and two unexplained icons that threw
away the map when pressed. A fifth change is not visible at all and matters more than any of them:
the suite can now tell a map that drew nothing from one that drew correctly.

---

## Summary

- **Clicking an alert takes you to its map and clears the rest.** They no longer follow you to the
  destination, and nothing is drawn underneath a venue-change notice.
- **The hamburger works on the first click.** It used to take two, on every map.
- **Clicking a feature opens the side panel** instead of appearing to do nothing when the panel is
  closed.
- **Two unexplained icons are gone from the desktop maps.** Pressing either used to return you to the
  root map.
- **The suite now fails a map that loads everything and draws nothing**, which it previously passed.

---

## Changed

### Alerts no longer follow you to the map you opened

Clicking one alert on the main map took you to the map it named and brought the others along, so you
arrived to be told about the map you were already looking at, plus everything you had not clicked.

The event maps are routes of AggieMap itself, so the alerts survived the navigation. Acting on one now
clears the batch. Alerts you have never seen still appear if you open an event map directly, which
they did not before. Acknowledging one — "Don't show again" — now means everywhere, including the
Ring Day and event map deployments, which each kept their own record before. And while a venue-change
notice or an event-passed warning is open, the alerts hold back and stop their countdown, so they are
not drawn underneath it and have not silently expired behind it.

| Before | After |
| --- | --- |
| ![Before: three alerts still showing on the destination event map](../screenshots/1246-toast-batch/before-destination-three-toasts.jpg) | ![After: the destination map with the venue notice and no alerts under it](../screenshots/1246-toast-batch/after-destination-no-toasts.jpg) |

The four alerts as they appear on the main map, for reference:

![The main map with four alerts](../screenshots/1246-toast-batch/before-home-four-toasts.jpg)

([#1246](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1246))

### The hamburger works on the first click

The side panel's tabs ignored the first click and responded to the second, on every map — AggieMap,
the event maps and Ring Day alike. The panel recorded which view was showing by reading the whole
browser path, `map/d`, and compared it against tab names like `settings` and the default view, which
it could never match. The first click only recorded the view; the second finally compared equal.

| Before | After |
| --- | --- |
| ![Before: the panel still open after one click](../screenshots/1249-sidebar-first-click/before-panel-open-after-one-click.jpg) | ![After: the panel closed after one click](../screenshots/1249-sidebar-first-click/after-panel-closed-after-one-click.jpg) |

([#1249](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1249))

### Clicking a feature opens the side panel

With the panel closed, clicking a building or a parking lot did nothing you could see. The feature
popup is rendered inside the panel, so closing the panel closed the popup with it: the click worked,
the popup drew, and it was behind the panel you had shut.

The panel now opens when a popup opens. It only ever opens — it will not close itself on you while
you are reading one.

![After: the panel opens on its own when a parking lot is clicked](../screenshots/1244-popup-reveals-sidebar/after-panel-opens-on-feature-click.jpg)

Only the after is shown. The before is a closed panel and an unchanged map — a picture of nothing
happening, which is the fault but not something an image conveys. What was measured on production
instead: with the panel off screen, clicking the same lot left the popup element present with a
height of `0` and no text. On development it now reports the lot's name and its share link.

([#1244](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1244))

### Two unexplained icons are gone from the desktop maps

A list icon and a layers icon sat at the bottom right of the event and Ring Day maps, partly behind
the side panel. Pressing either returned you to the root map, losing the map you were looking at.

They were shortcuts to the mobile map's Legend and Layers panels, shown on desktop by mistake: the
routes they point at exist only on the mobile map, so on a desktop map the link could not resolve and
fell back to the root. They remain on the mobile map, where they work. On desktop the side panel
already offers Layers and Legend.

| Before | After |
| --- | --- |
| ![Before: two unexplained icons at the bottom right](../screenshots/1251-mobile-only-controls/before-two-stray-icons.jpg) | ![After: the corner is empty](../screenshots/1251-mobile-only-controls/after-no-stray-icons.jpg) |

([#1251](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1251))

### Event maps take their projection from the basemap

Every event and parking map drew an empty canvas on development. The maps pinned themselves to Web
Mercator while the campus basemap on development is a vector tile cache in Texas State Plane, and
Esri cannot reproject a tiled layer: the basemap loaded, reported no error, and painted nothing.

([#1240](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1240), [#1242](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1242))

### Campus notifications stay on their own campus

AggieMap's alerts — Ring Day, Football, Kickoff at Kyle, the 150th events — are College Station's, and
they were appearing on the Galveston, McAllen and DC / Bush School maps. They also sat over the map
and took the click: pressing a building on a campus map could open the Football Transportation map
instead.

Those campuses are separate places and will have notifications of their own. A map now shows its own
campus's alerts and nobody else's, and the kiosk maps — which are embedded inside other applications,
with no one there to dismiss anything — show none at all.

![Before: College Station alerts over the Galveston campus map](../screenshots/1265-campus-notifications/before-toasts-on-galveston.png)

The first fix covered someone arriving at a campus map from another page. Opening one **directly**, from
a link or a bookmark, still showed College Station's alerts for its first ten seconds: the app read the
address before it had finished loading, while it still looked like the main map. That is fixed too, and
every campus map is now checked for it on every run.

| Opened directly, before | Opened directly, after |
| --- | --- |
| ![Before: the DC campus map covered by four College Station alerts](../screenshots/1281-campus-notices/before-dev-dc-notices-on-load.png) | ![After: the DC campus map with no alerts](../screenshots/1281-campus-notices/after-local-dc-no-notices.png) |

([#1265](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1265),
[#1281](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1281))

### Campus maps draw for a visitor who has chosen a basemap before

The Galveston, McAllen and DC / Bush School maps showed building outlines on a white page for anyone
who had ever picked a basemap on AggieMap — the campus basemap simply did not draw.

Each campus map carries its own basemap, and it was also honouring the basemap choice saved from the
main map. Those are in different projections, and a tiled basemap cannot be redrawn into a map that
uses another one, so it disappeared while the buildings, which can be redrawn, stayed. The campus maps
now keep their own basemap. A link that names a basemap still works.

This only ever affected development: the projection the two disagree about is the vector tile basemap,
which is not published for production.

([#1259](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1259))

---

### The campus maps show a picture of themselves

The Campus Maps page listed DC / Bush School, Galveston and McAllen as names over an empty area. Each
now shows a picture of the campus it opens, so you can see what you are choosing between.

![Before — names over empty space](../screenshots/1275-campus-thumbnails/before-no-pictures.jpg)

![After — the three campus pictures](../screenshots/1275-campus-thumbnails/after-pictures-on-campus-page.jpg)

The pictures were added in the previous change, to the All Maps page. The Campus Maps page is a
different component, so the page they were added for never showed them — and a second fault meant the
picture a map declares never reached either listing. Both are fixed, and the styles now live in one
place the two listings share, so a campus added later appears with its picture in both.

([#1275](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1275))

---

## Not visible, and the reason the rest were found

### The suite now fails a map whose layers cannot be drawn

The smoke suite passed all 69 maps while every event map was blank. It asked whether each layer
loaded and answered yes, because they had — a tiled basemap in the wrong projection loads perfectly
and simply cannot be painted.

Each map now also asserts that every visible tiled layer can actually be drawn in that map's
projection, decided by Esri's own comparison rather than by matching numbers, because the same
projection has more than one identifier.

**A limit worth recording:** a map can still satisfy every layer assertion and paint nothing. The DC
campus map does exactly that — it reports itself ready with a blank canvas
([#1259](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1259)). This check is correct and not yet sufficient.

([#1241](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1241))

### The suite now checks the picture, not only the layers

The check added this release asks whether every layer *could* be drawn. The campus maps showed that a
map can satisfy that and still be empty: 34 layers, all loaded, all visible, all drawable, nothing on
screen.

Each map is now also measured by its picture. A map whose canvas is a single flat colour fails. The
threshold was set from measurements at both ends — a drawn map covers 26% to 47% of its canvas with
its most common colour, an empty one 82% to 96% — and it requires the map to stay drawn rather than
accepting the moment before it empties, which is how the first version of this check passed a map that
was broken.

([#1259](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1259))

### Pull requests must now carry before/after images

A check fails a pull request that changes a template, stylesheet, component or directive and shows no
image in its body. The rule was already written in the pull request template and was skipped anyway,
four times in one session, because `gh pr create --body-file` replaces the template rather than
filling it in. The escape hatch is the `no-visible-change` label.

([#1258](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1258))

---

### A map is given long enough to draw before it is called broken

Not visible, but it decides whether a release can go out. The picture check added in this release gave
each map thirty seconds. CLAUDE.md has always said that a canvas blank for twenty to forty seconds is
Esri still drawing, so the budget was shorter than the normal case, and on development it failed four
maps that had drawn — including the main map, reported blank while the measurement beside it said
otherwise. It is ninety seconds now, and a timeout says which of its two causes happened: a canvas
that stayed blank, or one that drew but never settled.

([#1285](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1285))

---

## What went into this release

Every pull request this release carried, and the issue behind each one.

| Change | Pull request | Issue |
| --- | --- | --- |
| Event maps take their projection from the basemap | [#1242](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1242) | [#1240](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1240) |
| The suite fails a map that loads everything and draws nothing | [#1252](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1252) | [#1241](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1241) |
| The hamburger moves the panel on the first click | [#1253](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1253) | [#1249](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1249) |
| Acting on one alert clears the batch | [#1254](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1254) | [#1246](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1246) |
| The side panel opens when a feature is clicked | [#1255](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1255) | [#1244](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1244) |
| Mobile-only map controls hidden on desktop | [#1256](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1256) | [#1251](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1251) |
| Pull requests must carry before/after images | [#1263](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1263) | [#1258](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1258) |
| College Station notifications stay off the campus and kiosk maps | [#1266](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1266) | [#1265](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1265) |
| Campus maps opened directly stay free of College Station notifications | [#1286](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1286) | [#1281](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1281) |
| Campus maps keep their own basemap, and the suite checks the picture | [#1269](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1269) | [#1259](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1259) |
| Each campus map is shown as a picture you can click | [#1270](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1270) | [#1245](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1245) |
| The campus pictures reach the page they were added for | [#1287](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1287) | [#1275](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1275) |
| A map is given long enough to draw before it is called broken | [#1288](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1288) | [#1285](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1285) |
| Contributors reuse components, code and CSS, and build anything new to be reused | [#1284](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1284) | [#1282](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1282) |

**Also carried: the [1 October release](2026-10-01.md), which never reached production on its own.** Its
notes merged and its build passed on dev, but it was held back and then overtaken by this one, so
production receives it now. What it brings is described in that file.

| Change | Pull request | Issue |
| --- | --- | --- |
| The campus basemap on vector tiles (dev), the basemap loading indicator, and the compass keeps its needle | [#1227](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1227) | [#1222](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1222), [#1223](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1223), [#1224](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1224) |
| The vector tile basemap stays off production | [#1233](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1233) | [#1229](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1229) |
| Each Ring Day period opens on its own view | [#1234](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1234) | [#1230](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1230) |
| The dead TWO, COVID, Kissing Bug, Football and Move-In projects are removed | [#1237](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1237) | [#1232](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1232) |

---

## Work in flight — 1 October

Nothing below has merged, so it is not part of a release yet. This section exists because
[`CLAUDE_SETUP.md`](../../CLAUDE_SETUP.md) sends a session on another machine here first, and an empty
file would say the work had stopped.

### Waiting on someone else

**Bus route stops are a data fix, not a code fix
([#1174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1174)).** Five
routes draw no stops — NW0104, NW0305, NW4041, 15R and 47/48 — and two draw the wrong number: 40 has
one extra, 47 two missing. The map matches each stop's `Route` field in the Bus Stops layer
(`TS/Bus_Routes/MapServer/0`) against the route code, and no stop carries those codes. The side panel
still lists their stops, because that comes from separate text fields.

**Megan maintains the bus data.** `bus.spec.ts` records the seven as known failures for dev, so the
nightly run shows each one going green as its data is corrected. Production deliberately has no
entries, so the test holds any bus release until the data is right.

### Read this first if you are picking up elsewhere

**726 screenshots exist only on the work machine.** They are in `test/visual/baselines/builder/`,
untracked and deliberately uncommitted — 363 builder destinations at two viewports, 325MB. They are
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
new tests running against builds that predated them — neither environment had been redeployed since
the 29 September release. Checking the deployed bundle settled it in minutes; debugging the
application would have wasted the morning.

Until a build can say which commit it came from
([#1148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1148)), the smoke
suite tests a URL and cannot know what it verified, so this can happen after any merge that is not
promptly deployed.

### The decision waiting to be made

**[#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107) — evaluate
Visual Regression Tracker on the cluster** as the home for baseline images, with
[#1119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1119) to stand it
up. Phase 0 is five decisions that need no VPN: hostname, TLS issuer, image storage, PVC size, and who
can log in.

The contained test is in #1107: stand VRT up, point the existing capture at `gameday-parking`'s 14
destinations, and find out whether its Playwright agent — about two years stale, while the server is
current — still works before migrating 726 images.

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
  That is deliberate and useful — it is the `local-production` test environment, and the way to capture
  production behaviour before deploying — but it is not what you want for everyday work.
- **The builder inventory is environment-specific** and the smoke suite refuses one captured
  elsewhere. Production has no inventory yet, so its builder maps still skip
  ([#1134](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1134)).
