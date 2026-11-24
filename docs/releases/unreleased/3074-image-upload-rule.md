---
issue: 3074
app: gisday
title: Every GIS Day image picker refuses what the server would, as soon as a file is chosen
testOnDev: |
  | GIS Day admin and the presenter's edit page: image pickers ([#3074](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3074)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, Organizations, Places, Speakers and Sponsors, each one's edit form; and a presenter's edit link | Choosing an SVG, or an image over 5 MB, says "The logo (or photo) must be a JPEG or PNG image." or "... must be 5 MB or smaller." at once, and the form keeps the image it had. A JPEG or PNG is taken and previewed as before |
---

### GIS Day: every image picker refuses what the server would, as soon as a file is chosen

The sponsor form's logo picker already refused a file the server would refuse as soon as it was chosen, in the server's
words ([#3009](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3009)). The organization, place and speaker forms and a presenter's own edit page each had their own copy of
the allowed types, or none, so an SVG was taken, previewed, and only refused on save. Every picker now uses one shared
rule: JPEG or PNG, up to 5 MB, refused at once with the same message
([#3074](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3074)).

| Before | After |
| --- | --- |
| ![An organization's admin page before, at 1280 px, with an SVG chosen as its logo: the SVG is previewed and shown as chosen, with nothing to say it will be refused](../screenshots/3074-image-upload-rule/before-organization.png) | ![After: the SVG is refused at once, "The logo must be a JPEG or PNG image." under the picker, and the saved logo kept](../screenshots/3074-image-upload-rule/after-organization.png) |
| ![A place's admin page before: the SVG is taken and previewed in the same way](../screenshots/3074-image-upload-rule/before-place.png) | ![After: "The logo must be a JPEG or PNG image.", and the saved logo kept](../screenshots/3074-image-upload-rule/after-place.png) |
| ![A made-up speaker's admin page before: the SVG is taken and previewed as the photo](../screenshots/3074-image-upload-rule/before-speaker.png) | ![After: "The photo must be a JPEG or PNG image.", and no photo taken](../screenshots/3074-image-upload-rule/after-speaker.png) |
| ![A made-up presenter's edit link before, at 390 px: the SVG was already refused there, in its own words, "image.svg is not a JPEG or PNG photo."](../screenshots/3074-image-upload-rule/before-edit-link-390.png) | ![After: the same refusal in the shared words, "The photo must be a JPEG or PNG image."](../screenshots/3074-image-upload-rule/after-edit-link-390.png) |
