---
issue: 2545
title: The VGI submission form says a chosen photo can be tapped to change it
testOnDev: |
  | GIS Day: changing a photo on the VGI submission form ([#2545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2545)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, on a phone with the competitions app installed: New Submission | After choosing a photo, each box says "Tap to change"; tapping it and choosing another picture, or the same one again, shows that picture |
---

### GIS Day: the VGI submission form says a chosen photo can be tapped to change it

Once a participant chose a photo on the competition's submission form, nothing said it could be changed, so a
wrong picture looked fixed in place. Each chosen photo, the submission's and the optional plaque's, now shows
"Tap to change" over it. Choosing a picture always replaces the one shown, including choosing the same file
again, which before did nothing.
([#2545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2545))

| Before | After |
| --- | --- |
| ![Two chosen test photos on the submission form, with nothing saying they can be changed](../screenshots/2545-photo-change/before-form.jpg) | ![The same photos, each with a "Tap to change" label](../screenshots/2545-photo-change/after-form.jpg) |
