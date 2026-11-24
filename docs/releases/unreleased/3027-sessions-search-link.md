---
issue: 3027
app: gisday
title: "GIS Day: a Sessions search can be linked to, and copied as a link, as a Presenters search can"
testOnDev: |
  | GIS Day: a Sessions search as a link ([#3027](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3027)) | Not on dev: GIS Day has no dev site. After release, [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) | Type "competition" in the search: the address becomes /sessions?search=competition, and **Copy link** appears in the box. Paste that link into a new tab: the box is filled and only the competition sessions are listed. Tick a Tags filter as well: the address keeps both. Back leaves the page, not each letter typed. [Presenters](https://gisday.tamu.edu/presenters) works as before |
---

### GIS Day: a Sessions search can be linked to, and copied as a link

The Sessions page's search now works as the Presenters page's does: the address follows the box
(`/sessions?search=competition`) without adding a history entry for each letter, and keeps the page's Tags and
Organizations filters beside it; a link that carries a search opens with the box filled and only the matching
sessions listed; and **Copy link**, inside the box, copies the whole link, ready to send. Both pages now use one
search box, so they cannot drift apart.
([#3027](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3027))

| Before | After |
| --- | --- |
| ![Typing "competition" on the Sessions page: no Copy link, and the address stays /sessions](../screenshots/3027-sessions-search-link/before-sessions-searched.png) | ![Typing "competition": Copy link in the box, and the address is /sessions?search=competition](../screenshots/3027-sessions-search-link/after-sessions-searched.png) |
| ![Opening /sessions?search=competition: the box is empty and every session is listed](../screenshots/3027-sessions-search-link/before-sessions-link-opened.png) | ![Opening /sessions?search=competition: the box is filled and only the competition sessions are listed](../screenshots/3027-sessions-search-link/after-sessions-link-opened.png) |
