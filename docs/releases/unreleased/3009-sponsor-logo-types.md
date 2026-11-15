---
issue: 3009
title: "GIS Day: the sponsor form refuses a logo that is not a JPEG or PNG as soon as it is chosen"
testOnDev: |
  | GIS Day: the sponsor form's logo picker takes only JPEG and PNG ([#3009](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3009)) | Not on dev: GIS Day has no dev site. After release, signed in as an admin, open Admin > Sponsors and a sponsor | Click Select Logo Image: the chooser offers JPEG and PNG files. Switch it to all files and pick an SVG or GIF: "The logo must be a JPEG or PNG image." appears under the picker, no file is shown as chosen and the preview keeps the saved logo. Press Escape and leave without saving |
---

### GIS Day: the sponsor form refuses a logo that is not a JPEG or PNG as soon as it is chosen

An admin could choose an SVG (or any other image type) as a sponsor's logo; the form previewed it, and the server
refused it only when the sponsor was saved (#2937, #2966). The logo picker now uses the server's own rule, defined once
and shared by both: it offers JPEG and PNG files, and a file of any other type is refused the moment it is chosen,
with the server's words, "The logo must be a JPEG or PNG image." The server still checks every file it is sent.
([#3009](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3009))

| Before | After |
| --- | --- |
| ![A sponsor's admin page before, at 1280 px, with an SVG chosen as its logo: the SVG is previewed and shown as chosen, with nothing to say it will be refused](../screenshots/3009-sponsor-logo-types/before-2-svg-chosen.png) | ![After: the SVG is refused at once, "The logo must be a JPEG or PNG image." under the picker, and the saved logo kept](../screenshots/3009-sponsor-logo-types/after-2-svg-chosen.png) |
| ![Before: a GIF chosen is taken in the same way](../screenshots/3009-sponsor-logo-types/before-3-gif-chosen.png) | ![After: the GIF is refused in the same words](../screenshots/3009-sponsor-logo-types/after-3-gif-chosen.png) |
