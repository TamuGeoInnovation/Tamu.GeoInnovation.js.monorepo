---
issue: 2630
title: Nature Rx spaces are on the map, with photographs and what each space has
testOnDev: |
  | Nature Rx ([#2630](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2630)) | [The main map on dev](https://dev.aggiemap.tamu.edu/map/d), then Layers, then **Nature Rx** | The layer turns on and draws 36 green-space markers. Click **Aggie Park**: a photograph carousel at the top that scrolls through three images, the campus location, a description, and a list of what the space has (seating, shade, tables and so on - only what it has, not what it lacks). The copy-link field returns to the same space. Search **Aggie Park**, and also a key word such as **Water**, **Study** or **Quick Access**: Nature Rx results appear for both. (Searching an amenity such as *hammocks* finds nothing - the key words and the amenity fields are separate lists in the service, [#2632](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2632).) Four spaces - Vet, ILSB, White Creek and Wehner - have photographs that the image server does not hold ([#2631](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2631)), so their carousels are short or empty; that is the data, not the map |
---

### Nature Rx spaces are on the map

Texas A&M's **Nature Rx** green spaces - the places on campus set aside for being outdoors - are a layer on
the main map. Turn it on under Layers.

Clicking a space opens the same kind of panel as a Point of Interest: **photographs across the top**, then
where on campus it is, a description, and **what the space actually has** - restrooms, seating, shade,
hammocks, ponds, a nature trail, and so on. Only what a space has is listed, so the panel reads as
information rather than a form.

Nature Rx spaces are **searchable**, by name and by what they are for: searching *hammocks* or *disc golf*
finds them, not only *Aggie Park*. A copied link reopens the space it was copied from.

The spaces and their photographs come from Facilities Analytics & Mapping, who publish and maintain them.

| | |
| --- | --- |
| The layer and its legend | ![Nature Rx turned on in Layers, with its marker in the Legend](../screenshots/2630-nature-rx/after-layer.jpg) |
| A space's panel | ![Aggie Park with its photographs above and what it has listed below](../screenshots/2630-nature-rx/after-popup.jpg) |
