---
issue: 2422
title: GIS Day's Add Speaker form shows the placeholder, not a broken image, before a photo is chosen
testOnDev: |
  | GIS Day: Admin, Speakers, Add, before a photo is chosen ([#2422](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2422)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in as an admin: [Admin, then Speakers, then Add](https://txgisday.org/admin/speakers/add) | Above Select Profile Picture, the grey placeholder picture, not a broken-image icon with "Speaker photo preview". Choosing a photo shows it in its place; Undo brings the placeholder back. Nothing is saved |
---

### GIS Day: the Add Speaker form shows the placeholder until a photo is chosen

Admin, Speakers, Add showed a broken image, with its description "Speaker photo preview", until a photo was
chosen, because the preview had no picture to show yet. It now shows the placeholder that speakers without a
photograph show on the site. Choosing a photo replaces it, as before, and Undo brings the placeholder back
([#2422](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2422)).

| | Before | After |
| --- | --- | --- |
| On arrival | ![A broken image and the words "Speaker photo preview" above Select Profile Picture](../screenshots/2422-speaker-photo-preview/before-add.png) | ![The grey placeholder picture above Select Profile Picture](../screenshots/2422-speaker-photo-preview/after-add.png) |
| A photo chosen | | ![The chosen photo in the preview, with its file name and Undo](../screenshots/2422-speaker-photo-preview/after-chosen.png) |
| After Undo | | ![The placeholder back, and Select Profile Picture](../screenshots/2422-speaker-photo-preview/after-undo.png) |
