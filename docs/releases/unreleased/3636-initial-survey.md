---
issue: 3636
app: gisday
title: The initial survey page shows one heading
testOnDev: |
  | The initial survey's heading ([#3636](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3636)) | GIS Day dev site, signed in: Account, then the initial survey (`/account/initial-survey`) | **One** heading: "Pre-Event User Impact Survey" once you have taken the survey, "Event User Impact Survey" if you have not, never both; and no "templateRef.createEmbeddedViewImpl" error in the browser console |
---

### The initial survey page shows one heading

The survey page showed both of its headings, "Pre-Event User Impact Survey" and "Event User Impact Survey", one above the other, and
logged an error. The second heading is meant only for a visitor who has not taken the survey yet; it now shows only then.
([#3636](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3636))

| Before                                                                                              | After                                                                                            |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| ![The survey page with both headings](../screenshots/3636-initial-survey/before-initial-survey.png) | ![The survey page with one heading](../screenshots/3636-initial-survey/after-initial-survey.png) |
