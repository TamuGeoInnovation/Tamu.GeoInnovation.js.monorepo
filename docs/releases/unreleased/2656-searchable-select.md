---
issue: 2656
title: University and organization lists can be searched by typing
testOnDev: |
  | GIS Day: searchable University and Organization ([#2656](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2656)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [Add a speaker](https://gisday.tamu.edu/admin/speakers/add) and [your profile](https://gisday.tamu.edu/account/details) | Clicking University or Organization (or, on the profile, Institution or Employer) opens the whole list; typing "texas" narrows it to names containing it; choosing one shows its name, and saving keeps it. An existing speaker's university and organization still show when the speaker is opened for editing |
---

### GIS Day: university and organization lists can be searched by typing

The University and Organization fields on the admin speaker form, and Institution and Employer on the profile page, were plain drop-downs of about 80 universities and 290 organizations. They now take typed text as well: clicking one opens the whole list, and typing narrows it to the names that contain the text. What is saved is the same as before. It is the shared select with a new `searchable` option, which uses the shared autocomplete for the typing and the list, so any other drop-down can turn it on ([#2656](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2656)).

| Before | After |
| --- | --- |
| ![The speaker form's University field, a plain drop-down](../screenshots/2656-searchable-select/before-speaker-university.png) | ![The University field with "texas" typed and the Texas universities listed](../screenshots/2656-searchable-select/after-speaker-university-typed.png) |
| ![The profile page's Employer field, a plain drop-down](../screenshots/2656-searchable-select/before-profile-employer.png) | ![The Employer field with "esri" typed and Esri listed over the fields below](../screenshots/2656-searchable-select/after-profile-employer.png) |
