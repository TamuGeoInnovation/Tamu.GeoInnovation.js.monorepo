---
issue: 2919
title: "GIS Day: the presenter search box on each presenter's page"
testOnDev: |
  | GIS Day: search from a presenter's page ([#2919](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2919)) | Not on dev: GIS Day has no dev site. After release, open any presenter from [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) and type in the box above them | The other presenters that match are listed under the box, searched as the Presenters page searches; choosing one opens their page; with more than ten matches, "See all matches on the Presenters page" opens the list already searched |
---

### GIS Day: the presenter search box on each presenter's page

A presenter's own page now has the **Presenters page's search box** above it, so another presenter can be found
without going back to the list. While typing, the other presenters that match are listed under the box, searched as
the list searches (name, organization, university or its abbreviation, ignoring case and accents). Choosing one opens
their page. When more than ten match, **See all matches on the Presenters page** opens the list already searched.
([#2919](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2919))

| Before | After |
| --- | --- |
| ![A presenter's page, with no way to search](../screenshots/presenter-search/presenter-before.png) | ![A presenter's page with the search box](../screenshots/presenter-search/presenter-after.png) |

![Searching "geography" from a presenter's page lists the other matching presenters](../screenshots/presenter-search/presenter-search-after.png)
