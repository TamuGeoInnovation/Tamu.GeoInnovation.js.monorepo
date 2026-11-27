---
issue: 3861
app: gisday
title: Changing a season's year in admin saves it
testOnDev: |
  | A season's year saves ([#3861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3861)) | No GIS Day dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)): checked on the local stack. On a site, signed in as an admin: Admin, Seasons, a season that is not the active one | Change its Year and Update, then open it again: the new year is shown. A year another season has is refused with "There is already a … season." |
---

### Changing a season's year in admin saves it

The Year box on a season's edit page was ignored. Update said the season was saved, and it kept its old year. A changed
year is now saved, and one that another season already has is refused, saying so.
([#3861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3861))

| Before                                                                                                                                           | After                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| ![The season reopened after its year was changed to 2033 and saved: it still shows 2032](../screenshots/3861-season-year/before-season-year.png) | ![The same, now showing 2033](../screenshots/3861-season-year/after-season-year.png) |
