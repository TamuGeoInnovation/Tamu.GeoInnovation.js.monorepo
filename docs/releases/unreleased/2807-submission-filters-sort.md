---
issue: 2807
title: The GIS Day admin submissions list can be filtered, counted and sorted
testOnDev: |
  | GIS Day admin: filter, count and sort the competition submissions ([#2807](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2807), [#2808](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2808)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Research Competitions | Choose Graduate and Poster: only graduate posters are listed, and "Showing N of M" counts them. Click a heading: the list sorts by it, with an arrow; click again and it reverses. A click on a row still opens it |
---

### GIS Day admin: filter, count and sort the competition submissions

The admin list of student competition submissions showed every entry of the season at once, in no particular order.
It can now be narrowed by classification (undergraduate or graduate) and by type (poster, presentation and the
rest), says how many entries it is showing out of the season's total, and sorts by any column when its heading is
clicked, newest first to begin with. The filters offer the same choices as the submission form, and the table is
the one the VGI review list already uses, which also gains a visible sort arrow.
([#2807](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2807),
[#2808](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2808))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide (local test data) | ![Every submission, no filters, no sorting](../screenshots/2806-admin-tables-fit/after.png) | ![Filters, a count, and the table sorted by date](../screenshots/2807-submission-filters-sort/after.png) |
