---
issue: 2867
title: Edit Speaker's university and organization lists stay closed until used
testOnDev: |
  | Edit Speaker's university and organization lists stay closed until used ([#2867](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2867)) | GIS Day has no dev site; check on production after the rollout: [gisday.tamu.edu/admin/speakers](https://gisday.tamu.edu/admin/speakers), open any speaker with a university and an organization | Both fields show the saved name with no list open; clicking into University opens its list over the fields below, and typing narrows it |
---

### Edit Speaker's university and organization lists stay closed until used

On the GIS Day admin's Edit Speaker page, the University and Organization lists opened as soon as the page
loaded, with nothing touched, and lay over each other and over Affiliation, Is organizer and Delete Speaker.

Both are the shared searchable select (#2656), which fills its text field with the saved item's name. That
field reports every value written to it as a change, and the autocomplete inside opened its list on any change.
It now opens the list for a change only while someone is typing in it, so a saved value leaves it closed.
Focusing the field still opens the whole list, as before.

This is the shared autocomplete, so it covers every searchable select, and AggieMap's All Maps search, which
only opens on typing already. ([#2867](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2867))

| Before | After | After, University clicked |
| --- | --- | --- |
| ![Both lists open on load, over the fields below](../screenshots/edit-speaker-lists/before.png) | ![Both fields show the saved names, lists closed](../screenshots/edit-speaker-lists/after.png) | ![The University list open over the fields below](../screenshots/edit-speaker-lists/after-focused.png) |
