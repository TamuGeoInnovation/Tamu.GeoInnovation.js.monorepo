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

| A made-up speaker's admin edit form, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up 9,000 x 6,000 JPEG of 1.5 MB chosen | Image |
| --- | --- |
| Before: Update fails with "Error updating speaker: 413", and the API answers that the photo is too large in pixels | ![The Update Speaker form with the large photo chosen, and a toast reading Update Speaker, Error updating speaker: 413](../screenshots/3177-photo-pixels/before-413.png) |
| After: Update saves, and the speaker's edit page, opened again, shows the stored photo | ![The Update Speaker form opened again, showing the speaker's saved photo above Select Profile Picture](../screenshots/3177-photo-pixels/after-saved.png) |

Checked on the local site, where the API refuses the photo with 413 as on production. After the fix the whole update
request was 21 KB, and the API fitted the photo it was sent as it fits every speaker photo (840 pixels on the shorter
side), so the file stored is a 1,260 x 840 JPEG. Locally nothing serves uploaded files, so for the second image the
stored file was copied out of the API's storage and served to the page unchanged.
