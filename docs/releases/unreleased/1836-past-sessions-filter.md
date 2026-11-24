---
issue: 1836
title: "GIS Day: past years' Sessions pages list their organizations again"
testOnDev: |
  | GIS Day: past years' Organizations filter ([#1836](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1836)) | Not on dev: GIS Day has no dev site. After release, once the migration has run, open a past year's Sessions page on txgisday.org, for example [2025](https://txgisday.org/seasons/2025/sessions) and [2023](https://txgisday.org/seasons/2023/sessions), and look at **Organizations** beside the sessions | Each lists the organizations that year's sessions were held at, and no longer says "There are no organizations." Ticking one shows only its sessions. This year's filter is unchanged. The smoke test "a past year's Sessions page offers the organizations its sessions were held at" passes |
---

### GIS Day: past years' Sessions pages list their organizations again

On a past year's Sessions page, the **Organizations** filter said "There are no organizations.", although that
year's sessions name where they were held
([#1836](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1836)). Since
[#1826](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1826) the filter lists only the
organizations with **Sessions Filter** ticked in Admin, and that setting was new, so no past season's had it. Each
season keeps its own copies of its organizations, so ticking this year's never reached them.

A one-time migration, run before the release, ticks **Sessions Filter** on each past season's organizations that
hosted at least one of that year's sessions. An organization with no sessions that year stays unticked, so the filter
only offers choices that return sessions. This year's organizations are left as they are: they are ticked by hand.
Undoing the migration puts back only what it changed, so an organization edited in Admin since keeps its edit.

On production today 2023 has 8 organizations that hosted sessions, 2024 has 10 and 2025 has 11, and none of them is
ticked. A new smoke test fails while a past year's filter is empty.

| A past year's Sessions page | Before | After |
| --- | --- | --- |
| At 1280 pixels | ![The 2025 Sessions page: two sessions, each naming its organization, and an Organizations filter that says "There are no organizations."](../screenshots/1836-past-sessions-filter/before-past-season-1280.png) | ![The same page after the migration: the Organizations filter lists Example State University and Sample County GIS](../screenshots/1836-past-sessions-filter/after-past-season-1280.png) |
| At 390 pixels, Filters open | | ![On a phone, with Filters open: the Organizations filter lists the same two organizations](../screenshots/1836-past-sessions-filter/after-past-season-390.png) |

The images are a local build with made-up data: a 2025 season, now past, whose two sessions were held at Example State
University and Sample County GIS, and a third organization, No Sessions Institute, that held none. After the migration
the filter offers the two that held sessions, and not the third.
