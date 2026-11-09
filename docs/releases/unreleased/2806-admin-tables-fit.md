---
issue: 2806
title: GIS Day admin tables use the screen's width and no longer scroll sideways
testOnDev: |
  | GIS Day admin: tables fit the page ([#2806](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2806)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) on a desktop and open Admin > Research Competitions, then Users and Speakers | Each table spans the page beside the menu, every heading and value reads as whole words, and there is no sideways scroll bar |
---

### GIS Day admin: tables use the screen's width and no longer scroll sideways

The admin pages were held to a fixed 1140-pixel layout, and a table wider than its column scrolled sideways inside it.
The competition submissions list, with its new submitter columns, overlapped its own headings and cut names to three
letters. On a desktop the admin pages now use the screen's width, as every GIS Day page already does on a phone; the
menu keeps its width, and each table takes the rest and wraps between words instead of scrolling.
([#2806](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2806))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide (local test data) | ![Eleven narrow columns, headings overlapping](../screenshots/2806-admin-tables-fit/before.png) | ![The table across the page, every value whole](../screenshots/2806-admin-tables-fit/after.png) |
