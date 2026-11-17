---
issue: 3177
title: "GIS Day: a speaker photo is shrunk before it is sent, so a large one is no longer refused"
testOnDev: |
  | GIS Day: speaker photos ([#3177](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3177)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/speakers), edit a speaker and choose a photo larger than 8,000 pixels on a side (a large scan or camera image under 5 MB) | Update saves, and the speaker's photo shows. Before, the same photo failed with "Error updating speaker: 413". A speaker choosing such a photo on their own edit link sends it too |
---

### GIS Day: a speaker photo is shrunk before it is sent, so a large one is no longer refused

Saving a speaker with a new photo failed on production with "Error updating speaker: 413", for a photo of 745 KB
([#3177](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3177)). The API refuses an image over
8,000 pixels a side or 40 megapixels however few bytes it is, and the photo was sent as chosen.

- **The admin's speaker form and a speaker's own edit link** now send the photo shrunk in the browser, as a JPEG at most
  1,600 pixels a side, with the shared `shrinkImage` that competition photos already use. Logos are sent as chosen.
- **A refusal says why**: the admin's toast gives the API's reason, rather than only its status.
