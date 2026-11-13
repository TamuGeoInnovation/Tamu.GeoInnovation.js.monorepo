---
issue: 2921
title: "GIS Day: link to the Presenters page already searched, with a Copy link button"
testOnDev: |
  | GIS Day: a link to Presenters already searched ([#2921](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2921)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) and type a company's name | The address shows `?search=` with it; a Copy link button beside the box copies the whole link and says Copied; opening that link shows only those presenters; Back leaves the page rather than stepping through each letter typed |
---

### GIS Day: link to the Presenters page already searched, with a Copy link button

The **Presenters** page's address now follows its search box, so a search can be shared: a link such as
`gisday.tamu.edu/presenters?search=lower colorado` opens the list showing only that company's people. While a search is
in use, a **Copy link** button beside the box copies the whole link, ready to paste into an email, and says **Copied**.
Typing does not add a history entry per letter, so Back still leaves the page.
([#2921](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2921))

| Before | After |
| --- | --- |
| ![A search, with the address unchanged and nothing to copy](../screenshots/presenters-link/presenters-before.png) | ![A search, with the Copy link button beside the box](../screenshots/presenters-link/presenters-after.png) |

![The button after copying](../screenshots/presenters-link/presenters-copied-after.png)
