---
issue: 3051
title: "GIS Day: every admin search box has the X that clears it"
testOnDev: |
  | GIS Day: the X that clears every admin search box ([#3051](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3051)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Speakers](https://txgisday.org/admin/speakers) and [Speaker badges](https://txgisday.org/admin/dashboards/speaker-badges) | Type in the search box: an X shows at its right. Click it: the box empties, the count goes back to the whole list (e.g. "773 speakers."), and every row is listed again. The same on Classes, Events, Venues, Organizations, Sponsors, Universities and Users. On Speaker badges the X sits inside the box, beside the text, and the box keeps its height |
---

### GIS Day: every admin search box has the X that clears it

The public Sessions and Presenters searches have had an X that empties them since #2963; the admin lists' search box
did not, so a search could only be cleared by deleting it. The search box the admin lists share (Classes, Venues,
Events, Organizations, Affiliations, Speakers, Sponsors, Universities, Users and others) now has it, and so does the
Speaker badges dashboard's own search. Pressing it empties the box and lists everything again.
([#3051](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3051))

| Before | After |
| --- | --- |
| ![Admin > Speakers before, at 1280 px: "texas" typed in the search, Showing 338 of 773 speakers, and no way to clear it](../screenshots/3051-admin-search-clear/before-speakers-search-1280.png) | ![Admin > Speakers after, at 1280 px: the same search, with an X at the right of the box](../screenshots/3051-admin-search-clear/after-speakers-search-1280.png) |
| | ![After pressing the X: the box empty with its placeholder, and "773 speakers." listed again](../screenshots/3051-admin-search-clear/after-speakers-cleared-1280.png) |
| ![Speaker badges before: "texas" typed, Showing 13, and no way to clear it](../screenshots/3051-admin-search-clear/before-badges-search-1280.png) | ![Speaker badges after: the same search with an X inside the box](../screenshots/3051-admin-search-clear/after-badges-search-1280.png) |
| | ![Speaker badges after pressing the X: the box empty and Showing 18 again](../screenshots/3051-admin-search-clear/after-badges-cleared-1280.png) |
