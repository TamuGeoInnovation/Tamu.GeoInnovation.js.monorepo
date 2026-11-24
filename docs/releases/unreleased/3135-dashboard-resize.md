---
issue: 3135
app: gisday
title: "GIS Day: a dashboard's table reaches its last columns at any width, and shows a spinner while it fits a resized window"
testOnDev: |
  | GIS Day: dashboard tables at a resized width ([#3135](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3135)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/check-ins), open Admin, Dashboards, Check-ins (then RSVPs), choose season 2025, and with the window about 1280 px wide narrow it to about 1024 px | While the window changes width, a spinner shows over the By event table for a moment, then goes. At 1024 px a scrollbar is pinned under the table at the bottom of the window, and scrolling it to its end shows the last column, **Not given**, whole. Widened back to 1280 px, RSVPs has no scrollbar under its table |
---

### GIS Day: a dashboard's table reaches its last columns at any width, and shows a spinner while it fits a resized window

On Admin, Dashboards, the By event table on RSVPs and Check-ins was cut off at its box's right edge on a narrower
window, with no scrollbar to reach its last columns: at 1024 pixels, and on Check-ins at 1280 pixels too, whose ten
columns are a few pixels wider than the box there. The scrollbar pinned under the table ([#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029)) never appeared, because the
table's bordered frame was only as wide as the box and hid what did not fit, so the box held nothing wider than itself.
The frame is now as wide as the table, and the box scrolls it as [#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029) meant
([#3135](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3135)).

When the window changes width, the table now waits for its columns to be worked out again before it measures its
scrollbar, and shows the site's spinner over the table meanwhile, so the moment between the old layout and the new one
does not look broken. The same goes for the people under an opened row, and for the VGI dashboard's tables.

| Check-ins, season 2025, on the local site as gisday.tamu.edu, loaded at 1280 pixels and resized to 1024 | Before | After |
| --- | --- | --- |
| At 1024 pixels | ![The table cut off part-way through its columns, with no scrollbar under it](../screenshots/3135-dashboard-resize/before-resized-1024.png) | ![The same table with a scrollbar pinned under it at the bottom of the window](../screenshots/3135-dashboard-resize/after-resized-1024.png) |
| The scrollbar at its end | | ![The table scrolled to its last column, Not given](../screenshots/3135-dashboard-resize/after-resized-1024-rail-end.png) |
| While it fits the new width | | ![The table veiled, with the spinner over it](../screenshots/3135-dashboard-resize/after-spinner.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The images show events
and counts only; no row was opened.
