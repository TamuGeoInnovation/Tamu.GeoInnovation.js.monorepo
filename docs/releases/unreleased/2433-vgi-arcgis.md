---
issue: 2433
title: Each VGI submission, its photos and review status are published to the season's ArcGIS Online layer
testOnDev: |
  | GIS Day: VGI submissions published to ArcGIS Online ([#2433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2433)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)), and publishing needs the 2026 layer and its `VGI_ARCGIS_` settings on the production API. On production after release, as a GIS Day admin: [Admin, Competitions, Submissions](https://txgisday.org/admin/competitions/submissions) | Before the settings are in place, **Publish to ArcGIS** says publishing is not set up. Once they are, it says how many submissions it published; each appears in the 2026 layer as a point with its type, name, time, review status, accuracy and photos. Discarding one on this page changes its status in the layer within a few seconds |
---

### GIS Day: VGI submissions are published to ArcGIS Online as they arrive

Last year's VGI submissions were copied into an ArcGIS Online layer by hand, from the admin export. Now the app
publishes each submission to the season's layer itself, as it is saved: a point with its type, the name typed on
it, when it was submitted, its review status, the phone's location accuracy and an anonymous participant id (never
an email or a name), with its photos as attachments. When the app or a person reviews it, its status in the layer
changes too. A discarded submission stays in the layer, marked discarded, so the layer matches the admin page.

Publishing happens after the save, so a participant's upload succeeds whatever ArcGIS Online does. **Publish to
ArcGIS** on the admin Submissions page starts sending the whole season again, after an outage or once publishing
is switched on, and says how many it will send; it runs on the server in the background, and is safe to run any
number of times. The layer is shared with the organization only, never the public, because its points carry
participants' photos and the names they typed.

Publishing is off until the API has the 2026 layer's address and an ArcGIS Online application's client id and
secret (`VGI_ARCGIS_LAYER_URL`, `VGI_ARCGIS_CLIENT_ID`, `VGI_ARCGIS_CLIENT_SECRET`). The issue lists the layer's
fields.
([#2433](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2433))

| Before | After |
| --- | --- |
| ![The Submissions page, with nothing about ArcGIS](../screenshots/2433-vgi-arcgis/before-submissions.jpg) | ![Publish to ArcGIS, here on a local run where publishing is not set up](../screenshots/2433-vgi-arcgis/after-submissions.jpg) |
