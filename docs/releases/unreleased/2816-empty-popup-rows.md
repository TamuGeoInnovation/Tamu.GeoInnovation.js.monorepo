---
issue: 2816
title: A popup no longer shows a field the map has no value for, and a shared link opens the same popup a click does
testOnDev: |
  | Empty popup rows left out, and shared links matching a click ([#2816](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2816), [#3536](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3536)) | AggieMap dev: `/transportation/sustainable-transportation/map/d?feature=sustainable-transportation-bike-racks:7057`, then `/operations/construction-map/map/d?feature=construction-map-popup:35375`, then an EV charger such as `?feature=sustainable-transportation-ev-chargers:35` | The bike rack shows its type and Total Capacity and no Notes row (not "Notes: {attributes.BR_Notes}"). The construction project shows its start and end as dates, not long numbers. The EV charger shows all four of its rows, as before. Clicking the same features on the map shows the same |
---

### A popup no longer shows a field the map has no value for, and a shared link opens the same popup a click does

Some map layers leave a field empty for some features: ten of the bike racks have no notes. Their popups printed the
label anyway, and a popup opened from a shared link printed the raw field name, "Notes: {attributes.BR_Notes}". A row
whose value is empty is now left out, label and all
([#2816](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2816)).

A popup opened from a shared link (`?feature=…`) also went through its own copy of the code that fills a popup in,
which a click did not use, so two earlier fixes had reached clicks only: this one, and the construction map's dates,
which a shared link showed as long numbers such as 1735689600000. Both now go through one piece of code, so a shared
link opens exactly the popup a click does
([#3536](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3536)). A popup whose fields are all
filled is unchanged.

| Before                                                                                                                                                                       | After                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| ![A bike rack's popup from a shared link: "Total Capacity: 10" and "Notes: {attributes.BR_Notes}"](../screenshots/2816-empty-popup-rows/before-bike-rack-7057-popup.png)     | ![The same popup with only "Total Capacity: 10"](../screenshots/2816-empty-popup-rows/after-bike-rack-7057-popup.png) |
| ![A construction project's popup from a shared link, its dates as 1735689600000 and 1798675200000](../screenshots/2816-empty-popup-rows/before-construction-35375-popup.png) | ![The same popup with its dates written out](../screenshots/2816-empty-popup-rows/after-construction-35375-popup.png) |
| ![An EV charger's popup, all four rows filled](../screenshots/2816-empty-popup-rows/before-ev-popup.png)                                                                     | ![The same popup, unchanged](../screenshots/2816-empty-popup-rows/after-ev-popup.png)                                 |
