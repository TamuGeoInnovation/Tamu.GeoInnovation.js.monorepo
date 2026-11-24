---
issue: 3047
title: "GIS Day: broadcasts are listed by name, with numbers in order, on Admin > Broadcasts and in every Broadcast drop-down"
testOnDev: |
  | GIS Day: broadcasts listed by name, numbers in order ([#3047](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3047)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Broadcasts](https://txgisday.org/admin/broadcasts), then an event's edit page from [Events](https://txgisday.org/admin/events) | Broadcasts are in alphabetical order, case ignored, with numbers in order ("Zoom 2" before "Zoom 10"). An event's Broadcast drop-down lists them in the same order |
---

### GIS Day: broadcasts are listed by name, with numbers in order, on Admin > Broadcasts and in every Broadcast drop-down

The API now sorts every list of broadcasts it gives (all of them, a season's, and the active season's, which an
event's Broadcast drop-down reads) by name, once, so the list page and every drop-down agree: case is ignored and
numbers are compared as numbers, so "Zoom 2" comes before "Zoom 10". The database's own ordering compared numbers
as text and put "Zoom 10" between "Zoom 1" and "Zoom 2".
([#3047](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3047))

The screenshots are from the local site with two made-up broadcasts added for the capture, "TAMU GIS Day(s) 2025 -
Zoom 10" and "TTU 10" (Meeting ID `test-3047`), and removed afterwards. The drop-down is a native list the browser
draws outside the page, so for its screenshot the list was given a height that shows every option in the page.

| Before | After |
| --- | --- |
| ![Admin > Broadcasts for 2026 before, at 1280 px: Zoom 1, Zoom 10, Zoom 2, Zoom 3, then TTU 1, TTU 10, TTU 2, TTU 3](../screenshots/3047-broadcasts-sorted/before-broadcasts-list.png) | ![Admin > Broadcasts for 2026 after: Zoom 1, Zoom 2, Zoom 3, Zoom 10, then TTU 1, TTU 2, TTU 3, TTU 10](../screenshots/3047-broadcasts-sorted/after-broadcasts-list.png) |
| ![An event's Broadcast drop-down before, every option shown: Zoom 10 after Zoom 1, TTU 10 after TTU 1](../screenshots/3047-broadcasts-sorted/before-event-broadcast-dropdown.png) | ![An event's Broadcast drop-down after: the same order as the list page, Zoom 10 and TTU 10 last in their groups](../screenshots/3047-broadcasts-sorted/after-event-broadcast-dropdown.png) |
