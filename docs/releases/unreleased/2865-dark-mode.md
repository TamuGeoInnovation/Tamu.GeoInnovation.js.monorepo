---
issue: 2865
title: AggieMap has a dark mode that turns on at sunset, on dev only
testOnDev: |
  | Dark mode ([#2865](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2865)) | [dev.aggiemap.tamu.edu/map](https://dev.aggiemap.tamu.edu/map) | Settings tab (desktop) or the menu (phone): Appearance, with Automatic, Dark and Light. Dark repaints the campus map for night (blue-grey ground, light roads and labels) and the panels go slate; Light puts everything back. After sunset, Automatic is dark on its own. With `?as=production` there is no Appearance choice and the page stays light |
---

### AggieMap has a dark mode that turns on at sunset, on dev only

A dark mode for the phone and desktop layouts. **Automatic**, the default, is dark from sunset to sunrise in College
Station, worked out from the date on the device with no outside service, or whenever the phone itself is in dark mode,
and it changes over while the page is open. **Dark** and **Light** override it. The choice is on the Settings tab and in
the phone's menu, and it is remembered.

The campus basemap is repainted for night rather than dimmed: a blue-grey ground, roads lighter than it, quiet greenery,
maroon-tinted buildings and light labels, the way night maps are drawn. The panels, search, popups, the trip planner and
Esri's own widgets follow, and every text colour meets WCAG AA. A basemap the visitor picked is never swapped, and aerial
imagery is left as it is.

Development only until it is approved: production stays light and shows no choice.
([#2865](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2865))

| By day (unchanged) | At night |
| --- | --- |
| ![The phone map by day](../screenshots/2865-dark-mode/before-phone-map.png) | ![The phone map at night](../screenshots/2865-dark-mode/night-phone-map.png) |
| ![The phone menu by day](../screenshots/2865-dark-mode/before-phone-menu.png) | ![The phone menu at night, with the Appearance choice](../screenshots/2865-dark-mode/night-phone-menu.png) |
| ![The desktop map by day](../screenshots/2865-dark-mode/before-desktop-map.png) | ![The desktop map at night](../screenshots/2865-dark-mode/night-desktop-map.png) |
| ![Evans Library's popup by day](../screenshots/2865-dark-mode/before-desktop-popup.png) | ![Evans Library's popup at night](../screenshots/2865-dark-mode/night-desktop-popup.png) |

**What went into this change**

| | |
| --- | --- |
| Issue | [#2865](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2865) AggieMap dark mode that turns on at sunset in College Station |
