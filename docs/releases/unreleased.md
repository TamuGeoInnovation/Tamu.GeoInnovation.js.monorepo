# Unreleased

> **Not on production.** This file collects what has merged since the last production release. The
> two 150th Events changes below merged tonight, 28 September, and are being built for dev. They will be released to
> production once the full test suite passes on dev. Until then, the *What to test* links point at dev.

**Production is currently running the [28 September release](2026-09-28.md).**

If you followed a link to this page expecting the notes for the 28 September release, including its
*What to test* checklist, they are in [28 September](2026-09-28.md). That file is the permanent
record of what shipped; this one only ever describes what has not shipped yet.

---

## Summary

The **150th Events** list on the main map is corrected. Live at the Station comes out of the group,
because it is a concert rather than part of the anniversary celebration. Each remaining event now
shows its date next to its name. The DC / Bush School campus map works again after its services
moved. Behind the scenes, the automated checks now cover search, map popups, and every GIS service
the maps use.

---

## What to test

**On dev**, once tonight's build is deployed. Each link opens the thing it describes on
[dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu).

| Open this | Look for |
| --- | --- |
| [The main map](https://dev.aggiemap.tamu.edu/map) | the layer list's **150th Events** heading lists **three** events, with no Live at the Station |
| [The main map](https://dev.aggiemap.tamu.edu/map) | each event shows its date after its name: **Opening Ceremony - Oct. 2, 2026**, **Kickoff at Kyle - Oct. 2, 2026**, **Spirit of 150 Week - Oct. 2-8, 2026** |
| [Live at the Station](https://dev.aggiemap.tamu.edu/events/live-at-the-station) | its own map is unchanged, and it is still listed on All Maps |
| [DC / Bush School](https://dev.aggiemap.tamu.edu/campus/dc-bush-school) | the map draws, and searching for "Bush" finds **Bush School - DC (F002)** |

---

## Changed

### Live at the Station is no longer listed under 150th Events

The main map's layer list showed Live at the Station under the **150th Events** heading. It is a
concert and not part of the 150th anniversary celebration. Megan McMullen caught this, and Tricia
Speed confirmed it against the university's event page. The heading now lists Opening Ceremony,
Kickoff at Kyle and Spirit of 150 Week.

Only the main map's list changes. The Live at the Station map itself, and where it is listed on All
Maps, stay as they were. (#1125)

### Each 150th event shows its date

Tricia asked for each event's date in the layer list, next to its name, rather than in the layers
themselves:

| Event | Date |
| --- | --- |
| Opening Ceremony | Oct. 2, 2026 |
| Kickoff at Kyle | Oct. 2, 2026 |
| Spirit of 150 Week | Oct. 2-8, 2026 |

The date follows the name after a dash, in the list's usual grey. Any other layer can show a note
the same way later with only a definition change, no code change. (#1126)

## Fixed

### The DC / Bush School map stopped loading

Its services were republished at a new address, and the old one began asking for a sign-in, so the
map drew nothing. It now reads the new services. Search now finds buildings by name, abbreviation or
number. (#1110)

Campus maps are a development-only section, so this is visible on dev; production does not list
them.

One thing is still for the GIS team: a building label on the new basemap reads
"F002 CONCAT NEWLINE CONCAT TAMUDC" instead of two lines. That comes from the service's label style,
not from Aggie Map, and is noted on #1110.

---

## Behind the scenes

Not user-visible, but worth recording.

- **Search and popups are tested.** The automated checks now type a search, pick the result and
  confirm its details open. They also click a map feature and confirm its popup shows data. (#1116,
  #1117)
- **Maps behind a builder are tested** rather than skipped. (#1106)
- **Local test runs use `localhost`,** so they check the same maps dev shows. (#1114)
- **Every GIS service the maps use is checked directly**, so a service that is moved, stopped or
  made private is named outright rather than surfacing as a map that does not load (#1118). Its first run found four stopped services for past events (#1098), a missing bike racks
  service on production (#1122) and two unused entries (#1123).

---

## Work in flight — 28 September, end of day

Nothing below has merged, so it is not part of a release yet. This section exists because
[`CLAUDE_SETUP.md`](../../CLAUDE_SETUP.md) sends a session on another machine here first, and an empty
file would say the work had stopped.

### Read this first if you are picking up elsewhere

**726 screenshots exist only on the work machine.** They are in `test/visual/baselines/builder/`,
untracked and deliberately uncommitted — 363 builder destinations at two viewports, 322MB. They are
the output of a two-hour crawl against dev and can be regenerated with:

```bash
AGGIEMAP_SMOKE_BASE_URL=https://dev.aggiemap.tamu.edu BUILDER_INVENTORY_SHOTS=/some/dir   npx playwright test --config=tools/builder-inventory/playwright.config.ts
```

The capture resumes rather than restarts, so an interrupted run costs only what it had not reached.

They are uncommitted on purpose: at 322MB they would more than triple a 151MB repository, permanently,
since git keeps every version. Where they should live is #1107.

### Open pull requests

None from today. #1106 (builder-map tests), #1124 (GIS services check), #1127 and #1128 (150th
Events) have all merged.

**Next:** once the dev build is deployed, run the full suite on dev
(`test/smoke/aggiemap/run-local.sh development`). If it passes, release to production, then follow
[the checklist](README.md#the-first-thing-after-a-production-deployment).

### The decision waiting to be made

**#1107 — evaluate Visual Regression Tracker on the cluster** as the home for baseline images. It
holds the comparison of the options, why Percy and Chromatic cannot work here (they re-render from
DOM, and these maps are a WebGL canvas), and the caveat that VRT's Playwright agent is two years
stale while its server is current.

The contained test is in that issue: stand VRT up, point the existing capture at `gameday-parking`'s
14 destinations, and find out whether the agent works before migrating 726 images.

### Filed today, none started

| Issue | |
| --- | --- |
| #1089 | Full visual suite: a screenshot of every page, including builder paths |
| #1090 | Nothing asserts development-only sections stay off production |
| #1091 | Layer toggle round-trip: prove a layer returns the map to its original state |
| #1097 | Two 2025 events still registered and tested nightly on dev |
| #1098 | `visible:false` means both "not announced" and "finished", so hidden maps accumulate |
| #1099 | Ring Day naming: October holds the generic `/events/ring-day` id |
| #1100 | The builder-inventory README claims the smoke suite consumes its output; nothing did |
| #1101 | Inventory every GIS service, with dev and prod URLs and which maps use them |
| #1102 | Dev is hardcoded to the production transportation GIS host by a `TEMP` |
| #1103 | No test that a past event shows the "this event has passed" warning |
| #1104 | Define an emergency test tier for urgent deploys |
| #1105 | Map captures are not byte-reproducible; page captures are |
| #1122 | Bike racks search reads a service that does not exist on the production GIS server |
| #1123 | Two unused football entries point at stopped services |

### Worth knowing before touching the visual work

- **Page captures are byte-identical across runs; map captures are not.** Measured three times each.
  So hash comparison works for pages and cannot work for maps, which need pixel tolerance (#1105).
- **A local dev server must be reached at `http://localhost:4200`, not `127.0.0.1`.** `TestingService`
  keys on the host containing `dev` or `localhost`, so `127.0.0.1` renders the *production* variant —
  6 headings on All Maps instead of 31.
- **The builder inventory is environment-specific** and the smoke suite refuses one captured
  elsewhere. Production has no inventory yet, so its builder maps still skip.
