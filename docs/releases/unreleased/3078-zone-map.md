---
issue: 3078
app: gisday
title: "GIS Day: a venue's check-in zone is drawn and seen on a map"
testOnDev: |
  | A venue's check-in zone is drawn and seen on a map ([#3078](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3078)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Admin > Venues](https://txgisday.org/admin/event-locations) on txgisday.org and open a venue with Check-In Zone Corners, then one without | A map sits beside the corners box (under it on a phone). A venue with corners shows its zone on the map as the page opens; one without opens on campus. **Draw**, then a click on each corner and a double-click on the last, writes the corners into the box; dragging a corner rewrites its line; **Clear** empties the box; corners typed into the box appear on the map. Leave without saving (Escape asks first) unless the zone is meant to change |
---

### GIS Day: a venue's check-in zone is drawn and seen on a map

A venue's check-in zone was set only by typing its corners, one `latitude, longitude` per line, and could not be seen.
Admin > Venues now shows a map beside the Check-In Zone Corners box, stacked under it on a phone. A venue's corners
show on the map as the page opens; with none, the map opens on campus. **Draw** starts a zone (click each corner,
double-click the last), clicking the zone lets a corner or the whole zone be dragged, and **Clear** removes it. The
map and the box are one value: what is drawn is written into the box in its own format, and what is typed is drawn.
The box is still what is saved, so nothing changes in the API or the database, and an event still uses its venue's
zone. ([#3078](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3078))

| Admin > Venues > TAMU OMB Lobby, with test corners around the Eller O&M Building set on the local database (site header greyed out; nothing saved) | Before | After |
| --- | --- | --- |
| 1280 pixels wide | ![The Check-In Zone Corners box with four typed corners, and no map](../screenshots/3078-zone-map/before-1280.png) | ![The box beside a map with the zone drawn around the Eller O&M Building](../screenshots/3078-zone-map/after-1280.png) |
| 390 pixels wide | ![The box with four typed corners](../screenshots/3078-zone-map/before-390.png) | ![The map stacked under the box, with the zone drawn](../screenshots/3078-zone-map/after-390.png) |
| After dragging the zone's north-west corner on the map | | ![The zone being changed on the map, and the box's first line rewritten with the corner's new position](../screenshots/3078-zone-map/after-1280-corner-moved.png) |
