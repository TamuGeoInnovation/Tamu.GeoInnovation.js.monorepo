---
issue: 3614
app: gisday
title: The competitions designer opens a form with a question saved without its options
testOnDev: |
  | The competitions designer with an option-less question ([#3614](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3614)) | GIS Day dev site, signed in as an admin: Admin, Competitions, the designer | Only a form with a question saved without its options shows the difference: the designer now shows its settings, every question and Save, where it stopped after Fetch Schema. Ordinary forms look as before |
---

### The competitions designer opens a form with a question saved without its options

A competition form holding a question saved without its `options` stopped the admin designer as it opened: it showed
nothing after **Fetch Schema**, with an error in the console. It now opens with that question and no options, beside
the others. Saving a season that had no form yet also failed, and now creates one. Seasons used in practice were not
affected. ([#3614](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3614))

| Before                                                                                                       | After                                                                                                    |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| ![The designer stopping after Fetch Schema](../screenshots/3614-designer-no-options/before-designer.png) | ![The designer with its settings, three questions and Save](../screenshots/3614-designer-no-options/after-designer.png) |
