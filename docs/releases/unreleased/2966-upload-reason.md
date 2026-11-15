---
issue: 2966
title: "GIS Day: a refused save or upload says why, not only its status code"
testOnDev: |
  | GIS Day: refused saves say why ([#2966](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2966)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Add Sponsor](https://txgisday.org/admin/sponsors/add) | Give the sponsor a name and choose an SVG file as its logo (in the file picker, show all files), then Create. The message says "The logo must be a JPEG or PNG image." instead of "Error creating sponsor: 400", and no sponsor is created. The organization, place and speaker forms say the same for their images |
---

### GIS Day: a refused save or upload says why, not only its status code

When the API refused a save, the admin forms showed only the status code: an SVG logo, which the API has refused
since #2937, came back as "Error creating sponsor: 400". The API's reply already said why. Every admin form (sponsors,
organizations, places, speakers, sessions, locations, classes, tags, universities, broadcasts, seasons), the sponsor and
season lists, the research competition review, My Details and the student's submission form now show that reason, and
keep their old wording when there is none. The submission form showed the API's words only when a competition had
closed (#2934); it now shows them for any refusal. A server failure still shows the old message, since its text is not
something anyone can act on. ([#2966](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2966))

| Before | After |
| --- | --- |
| ![Create Sponsor with an SVG logo, refused with "Error creating sponsor: 400"](../screenshots/2966-upload-reason/before-sponsor-svg-logo.png) | ![Create Sponsor with an SVG logo, refused with "The logo must be a JPEG or PNG image."](../screenshots/2966-upload-reason/after-sponsor-svg-logo.png) |
