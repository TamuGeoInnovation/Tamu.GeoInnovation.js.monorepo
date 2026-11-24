---
issue: 2944
title: "GIS Day: a search box above the Sessions list"
testOnDev: |
  | GIS Day: search the Sessions list ([#2944](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2944)) | Not on dev: GIS Day has no dev site. After release, open [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) and type part of a session's name, a building or room (e.g. "gates ballroom"), or a presenter's name; then tick a tag | Only the matching sessions are listed, under their days; a day with none is left out; ticking a tag narrows the matches further; a search that finds nothing says No sessions match |
---

### GIS Day: a search box above the Sessions list

The public Sessions page has a search box above the list. Typing part of a session's name, its building or room, or
the name of one of its presenters lists only the sessions that match, ignoring case and accents, as the Presenters
page and the admin Events list already search. It narrows the list alongside the Tags and Organizations filters, not
instead of them. A day with no matching session is left out, and when none match the page says No sessions match.
Each session now carries its presenters' names from the API for this; only the names, which the Presenters page
shows already. ([#2944](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2944))

| Before | After |
| --- | --- |
| ![The Sessions page with no search box](../screenshots/2944-sessions-search/before.png) | ![The Sessions page with a search box above the first day](../screenshots/2944-sessions-search/after.png) |
| | ![Searching "gates ballroom" lists only the sessions in that ballroom, from Tuesday; Monday is left out](../screenshots/2944-sessions-search/after-search-building.png) |
| | ![Searching "hackathon" leaves out every day and says No sessions match "hackathon"](../screenshots/2944-sessions-search/after-no-match.png) |
