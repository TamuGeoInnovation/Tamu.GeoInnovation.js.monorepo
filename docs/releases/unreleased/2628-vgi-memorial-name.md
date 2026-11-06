---
issue: 2628
title: VGI monuments and memorial markers reach the ArcGIS Online layer with their names
testOnDev: |
  | GIS Day: names on the VGI ArcGIS Online layer ([#2628](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2628)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: submit a Monument with a name, or press **Publish to ArcGIS** in Admin > Competitions > Submissions, then open its point on the layer | `memorial_name` shows the name that was typed, for a monument and a memorial marker as well as a plaque |
---

### GIS Day: VGI monuments and memorial markers reach the ArcGIS Online layer with their names

The submission form asks every find for its name, but only plaques reached the competition's ArcGIS Online layer
with one: a monument or memorial marker arrived with `memorial_name` blank. The publisher found the name through a
scoring setting only the plaque type has. It now publishes the name for every type. How finds are scored and
reviewed is unchanged. Points already on the layer get their names when next published, by a review or by
**Publish to ArcGIS** in Admin.
([#2628](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2628))

Before: a monument's point on the layer, with `memorial_name` blank although a name was typed. The after image
is taken on production after release, as the *What to test* row says, because the local test layer does not
accept edits at the moment.

![A monument's point on the layer, with memorial_name blank](../screenshots/2628-vgi-memorial-name/before-popup.png)
