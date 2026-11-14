---
issue: 2923
title: "GIS Day: a presenter's search opens over the page; Copy link and a clear sit inside the search box"
testOnDev: |
  | GIS Day: presenter search panel, and Copy link and clear in the box ([#2923](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2923)) | Not on dev: GIS Day has no dev site. After release, open any presenter from [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters), then open [Presenters searched for geography](https://gisday.tamu.edu/presenters?search=geography) | On a presenter's page: the box sits under the heading with room before the bio; typing opens the matches over the page without moving it; Escape or a click elsewhere closes them; the x clears the box. On Presenters: Copy link and an x sit inside the box at its right end, Copy link says Copied! and copies the whole link, and the x clears a search the page was opened with |
---

### GIS Day: a presenter's search opens over the page; Copy link and a clear sit inside the search box

On a presenter's page, the search box's matches now open in a panel **over** the page, as the site's other searches
do, rather than pushing the presenter's details down. Escape, a click elsewhere or choosing a presenter closes it. The
box moves up into the space under the heading, with room before the bio.

On the **Presenters** page, **Copy link** no longer stretches across the page beside the box: it sits **inside** the box
at its right end, with an **x** that clears the search, as AggieMap's copy field holds its Copy. A visitor who arrives
from a shared link can now clear that search. The Copy styles were pasted into three apps' stylesheets; they are now one
shared file.
([#2923](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2923))

| Before | After |
| --- | --- |
| ![Matches listed in the page, pushing the presenter down](../screenshots/presenter-search-panel/searching-before.png) | ![Matches in a panel over the page](../screenshots/presenter-search-panel/searching-after.png) |
| ![The box close to the top of the bio](../screenshots/presenter-search-panel/page-before.png) | ![The box under the heading, with room before the bio](../screenshots/presenter-search-panel/page-after.png) |
| ![Copy link as a wide button beside the box](../screenshots/presenters-link/presenters-after.png) | ![Copy link and a clear inside the box](../screenshots/presenter-search-panel/presenters-in-box-after.png) |

![On a phone](../screenshots/presenter-search-panel/presenters-in-box-phone-after.png)
