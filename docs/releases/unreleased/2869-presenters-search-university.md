---
issue: 2869
title: "GIS Day: the Presenters search finds a university, by name or abbreviation"
testOnDev: |
  | GIS Day: the Presenters search finds a university ([#2869](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2869)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) and search for `TAMU`, then `Texas A&M University` | Both find the presenters from Texas A&M, including those whose organization is somewhere else |
---

### GIS Day: the Presenters search finds a university, by name or abbreviation

The search on the Presenters page found a presenter by name or organization. It now also finds them by their
university, by its full name or its abbreviation, so `TAMU` lists everyone from Texas A&M, including those who now
work elsewhere. On the local site, `TAMU` found none of its 13 presenters before and 5 after.
([#2869](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2869))

| Before | After |
| --- | --- |
| ![Searching TAMU finds no presenters](../screenshots/presenters-university-count/search-before.png) | ![Searching TAMU finds 5 of 13 presenters](../screenshots/presenters-university-count/search-after.png) |
