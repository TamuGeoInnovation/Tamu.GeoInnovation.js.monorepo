---
issue: 3433
title: Searching for "garage" finds every garage, not an arbitrary five
testOnDev: |
  | Every garage is findable ([#3433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3433)) | [dev.aggiemap.tamu.edu/map](https://dev.aggiemap.tamu.edu/map) | Type **garage** into the search box. Under **Parking Garage** every garage whose name contains the word is listed, in alphabetical order, rather than five of them. Typing **parking** does the same. Searching for one by name, such as **Southside**, still finds it |
---

### Searching for "garage" finds every garage

Typing a general term into the search box returned **five garages and no more**, and which five was
arbitrary. It was not a display limit that more scrolling would get past: the search asked the service for
five rows, so the rest were never fetched and there was nothing to page through.

That is the search someone uses when they do not know the name - "garage", or "parking" - and it was the
one that did not work. Searching for a garage by name always found it.

|                 | Before                                                                                   | After                                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Typing "garage" | ![Five garages listed](../screenshots/3433-garage-search-count/before-garage-search.png) | ![Every garage listed, in alphabetical order](../screenshots/3433-garage-search-count/after-garage-search.png) |

Counted against Campus Structures on 24 November 2026: the layer holds 11 rows marked as a garage, and
typing "garage" matches 8 of them, "parking" 7. The garage search now asks for all of them and sorts them by
name, so the list reads in a useful order and a garage built later cannot quietly fall off the end.

**The typed building search keeps its limit of five on purpose.** Its layer has 1,987 rows, so asking for
every one of them would be a different fault. Raising a count is right only where a whole category fits in
one page.

| Issue                                                                                    | What                                                                                        |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [#3433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3433) | A general search returns every garage, in alphabetical order, rather than an arbitrary five |
