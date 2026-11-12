---
issue: 2859
title: The GIS Day Presenters page can be searched, and lists presenters by last name
testOnDev: |
  | GIS Day Presenters: search, and last-name order ([#2859](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2859), [#2860](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2860)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) | The cards run A to Z by last name. Type part of a first name, a last name or an organization (for example "Esri") in the search box: only matching presenters stay, with "Showing N of M presenters" |
---

### GIS Day Presenters: search by name or organization, and listed by last name

The Presenters page showed every presenter, 77 this year, in order of first name, with no way to find one person or
everyone from one organization except scrolling. A search box above the cards now narrows them to the presenters
whose first name, last name or organization contains what is typed, in any case and ignoring accents, and says how
many it is showing. The cards are in order of last name, as a printed program would list them.
([#2859](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2859),
[#2860](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2860))

| Presenters | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide | ![By first name, no search](../screenshots/2859-presenters-search-sort/before.png) | ![A search box, by last name (local test data, whose photos are not on that machine)](../screenshots/2859-presenters-search-sort/after.png) |
