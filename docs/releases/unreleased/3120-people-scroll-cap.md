---
issue: 3120
app: gisday
title: A long people list keeps its sideways scrollbar in view
testOnDev: |
  | GIS Day admin: an opened dashboard row's people ([#3120](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3120)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on txgisday.org: Admin, Dashboards, VGI submissions, the 2025 season, open Unknown Art Piece; on gisday.tamu.edu, RSVPs and Check-ins for 2025, open the largest event | The people sit in a box no taller than the window, which scrolls up and down inside itself; with the row's name at the top of the window the whole box is in view, and on VGI its sideways scrollbar is at the bottom of the box, not 38,000 px down the page. A short list is only as tall as its people. At 1280 px an RSVP or check-in list has no sideways scrollbar, as before |
---

### GIS Day admin: a long people list keeps its sideways scrollbar in view

An opened row's people, on every admin dashboard, now sit in a box no taller than the window, which scrolls up and down
inside itself ([#3120](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3120)). On VGI
submissions, opening a feature type with 705 submitters drew a box as tall as all of them, so its own sideways scrollbar,
the only way to reach the count and date columns, was about 38,000 px down the page. It is now at the bottom of the box,
in the same window as the row's name. The page itself is 2,885 px tall with that type open, not 40,293.

A short list is only as tall as its people. The email column is 10 px narrower at its narrowest, so an RSVP or check-in
list still fits beside the admin menu at 1280 px with the box's up-and-down scrollbar, with no sideways one.

Measured in a local copy at 1280 x 900, names and emails hidden:

| Before | After |
| --- | --- |
| ![Unknown Art Piece opened: the people box runs off the bottom of the window, with no sideways scrollbar in sight](../screenshots/3120-people-scroll-cap/before-feature-type-open.png) | ![The same row opened: the box ends above the window's bottom, with its own up-and-down and sideways scrollbars](../screenshots/3120-people-scroll-cap/after-feature-type-open.png) |
| | ![The box scrolled sideways by its own scrollbar to its last columns: New finds, Repeats, First submitted](../screenshots/3120-people-scroll-cap/after-feature-type-open-right.png) |
| ![RSVPs on gisday.tamu.edu, 2025, the largest event opened: 123 people running off the window](../screenshots/3120-people-scroll-cap/before-rsvps-open.png) | ![The same, in a capped box with an up-and-down scrollbar and no sideways one](../screenshots/3120-people-scroll-cap/after-rsvps-open.png) |
| ![Check-ins, 2025, the largest event opened: 78 people running off the window](../screenshots/3120-people-scroll-cap/before-check-ins-open.png) | ![The same, in a capped box](../screenshots/3120-people-scroll-cap/after-check-ins-open.png) |
