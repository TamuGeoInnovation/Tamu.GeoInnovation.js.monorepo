---
issue: 3049
app: gisday
title: Admin Events says no sessions match the search or filters, rather than that the season has none
testOnDev: |
  | GIS Day Admin › Events: a search or filter that hides every session ([#3049](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3049)) | Not on dev: GIS Day has no dev site. After release, open Admin › Events on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events) | Type something no session has: it says "No sessions match the search or filters." with a button that clears them and brings the list back. A season with no sessions still says "There are no events for the selected season." |
---

### GIS Day Admin › Events: "No sessions match the search or filters", not "no events for the selected season"

When a season had sessions but the search or a filter hid every one, Admin › Events said "There are no events for the
selected season", which reads as if the season had lost its sessions. On gisday.tamu.edu, which starts the list with
Texas A&M's sessions only, choosing 2023 said so of a season with 66. The list now tells the two apart: it says
"No sessions match the search or filters." while the season has sessions, with a button that clears the search and
filters when one is on, and keeps "There are no events for the selected season." for a season with none. The shared
admin list behind every admin page now knows the difference, so any other list that gains a filter can say the same.
([#3049](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3049))

| Admin › Events on gisday.tamu.edu (local test data) | Before | After |
| --- | --- | --- |
| A search that matches nothing, 1280 pixels wide | ![No events match the search, with no way to clear it](../screenshots/3049-no-match-message/before-events-search.png) | ![No sessions match the search or filters, with a button that clears them](../screenshots/3049-no-match-message/after-events-search.png) |
| After pressing the button | | ![The search cleared and the list back](../screenshots/3049-no-match-message/after-events-cleared.png) |
| 2023, every session another organization's | ![There are no events for the selected season](../screenshots/3049-no-match-message/before-events-2023.png) | ![No sessions match the search or filters](../screenshots/3049-no-match-message/after-events-2023.png) |
