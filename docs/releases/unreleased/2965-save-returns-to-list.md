---
issue: 2965
title: "GIS Day: Save, Create and Delete on an admin page go back to the list as it was left"
testOnDev: |
  | GIS Day: Save, Create and Delete keep the list's season and search ([#2965](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2965)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Universities](https://txgisday.org/admin/universities) | Pick a past season and type in the search, open a university and press **Update** without changing anything: the list comes back on that season with the search still typed, not on the current season with an empty search. The same after **Delete** on a record made to be deleted, and after **Create** from **Add university**. Save never asks "Leave without saving?" |
---

### GIS Day: Save, Create and Delete on an admin page go back to the list as it was left

Escape on an admin page already went back to the list the page was opened from, keeping its season and its search
([#2942](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2942)). **Update**, **Create**,
**Delete** and **Submit Review** went to the bare list instead, on the current season with nothing searched, so an
admin working through a past season was put back at the start after every save. They now go back the way Escape
does, on every admin page: Broadcasts, Classes, Events, Venues, Affiliations, Organizations, Seasons, Speakers,
Sponsors, Tags, Universities and the Research Competitions review. A page opened from somewhere other than its list still goes to the list.
Create Class, when some sections could not be added, still stays on its page with them in the form.
([#2965](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2965))

No before and after images: the local site's sign-in stopped at the development Auth0 tenant's "Authorize App"
screen, which this capture does not accept.
