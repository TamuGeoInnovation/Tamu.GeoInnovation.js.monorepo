---
issue: 3029
app: gisday
title: "GIS Day admin: the RSVPs and Check-ins tables' sideways scrollbar stays in view on a narrow screen"
testOnDev: |
  | GIS Day admin: the dashboards' sideways scrollbar in view ([#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then Check-ins, in a window about 1024 px wide | As soon as the top of the **By event** table is on screen, a sideways scrollbar is at the bottom of the window; dragging it shows the last columns (Industry, Not given). At the end of the table it sits directly under the total row, and there is only one. The page itself never scrolls sideways. At 1280 px the RSVPs table fits with no scrollbar, as before |
---

### GIS Day admin: the dashboards' sideways scrollbar stays in view on a narrow screen

At 1024 px the RSVPs and Check-ins tables are wider than the space beside the admin menu and scroll sideways in their
own box, but that box's scrollbar was at the bottom of a table about 19,000 px tall, so an admin could not see that
there were more columns, or reach them, without scrolling to the very end. The tables now keep a sideways scrollbar at
the bottom of the window while any of the table is on screen, and only while the table is wider than its box. It
scrolls the table, and at the end of the table it sits under the total row in place of the box's own. Both dashboards
share the table, so both have it. At 1280 px the RSVPs table fits, with no scrollbar, as before; the Check-ins table is
6 px wider than its box where the browser draws the page's own scrollbar, as on Windows, so it scrolled there before and
now shows this scrollbar too.
([#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029))

Captured on a local copy of the site with made-up people, served as gisday.tamu.edu, for the 2025 season, in a window
1024 by 768 px with the **By event** heading at the top. Scrollbars are drawn as a Windows browser draws them: the
browser that took the images was started without its default of hiding them.

| Before | After |
| --- | --- |
| ![RSVPs at 1024 px: the table is cut off after Faculty & academia, with no sideways scrollbar anywhere in the window](../screenshots/3029-dashboard-scroll/before-rsvps-1024.png) | ![The same: a sideways scrollbar along the bottom of the window, under the table](../screenshots/3029-dashboard-scroll/after-rsvps-1024.png) |
| ![Check-ins at 1024 px: cut off after the Student column, with no sideways scrollbar in the window](../screenshots/3029-dashboard-scroll/before-check-ins-1024.png) | ![The same: the sideways scrollbar along the bottom of the window](../screenshots/3029-dashboard-scroll/after-check-ins-1024.png) |
| ![Check-ins at 1024 px, the end of the table: the box's own scrollbar under the total row](../screenshots/3029-dashboard-scroll/before-check-ins-1024-end.png) | ![The same: one scrollbar under the total row, where the box's own was](../screenshots/3029-dashboard-scroll/after-check-ins-1024-end.png) |
| | ![RSVPs at 1024 px with that scrollbar moved to its end, from the top of the table: Industry and Not given in view](../screenshots/3029-dashboard-scroll/after-rsvps-1024-right.png) |
| ![RSVPs at 1280 px: every column fits, no sideways scrollbar](../screenshots/3029-dashboard-scroll/before-rsvps-1280.png) | ![The same, unchanged](../screenshots/3029-dashboard-scroll/after-rsvps-1280.png) |
