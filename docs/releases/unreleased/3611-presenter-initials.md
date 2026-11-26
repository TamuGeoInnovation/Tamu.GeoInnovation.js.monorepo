---
issue: 3611
app: gisday
title: A presenter with no first name shows the initial they have, not "..."
testOnDev: |
  | A presenter's initials from the names they have ([#3611](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3611)) | GIS Day dev site: a session's page (`/sessions/details/<guid>`) whose presenter has no first name or no last name, and the Presenters page | The round avatar shows the initial of the name the presenter has, such as "S" for "Sample", not "..." |
---

### A presenter with no first name shows the initial they have, not "..."

A session's presenters each have a round avatar with their initials when there is no photo. For a presenter whose first
or last name was missing, it showed "..." instead. It now shows the initial of the name they have. Found while making GIS
Day's shared front-end library check for missing values everywhere
([#3611](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3611)).

| Before                                                                                                                                | After                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| ![Two presenters; the one with no first name has "..." in their avatar](../screenshots/3611-presenter-initials/before-presenters.png) | ![The same two presenters; the second shows "S"](../screenshots/3611-presenter-initials/after-presenters.png) |
