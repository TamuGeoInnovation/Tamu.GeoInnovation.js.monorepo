---
issue: 3827
app: gisday
title: Editing an event no longer erases its attendance
testOnDev: |
  | Editing an event keeps its attendance ([#3827](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3827)) | No GIS Day dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)): checked on the local stack. On a site, signed in as an admin: a session's page, Update Attendance with two counts, then Admin, Events, that session | The Attendance boxes show the two counts. Change only the abstract and Update: the session's page still shows the same counts |
---

### Editing an event no longer erases its attendance

The attendance a session's page records, at the start and the end, was erased the next time anyone saved that session
from Admin, Events, whatever they changed. The edit form never read the two counts, so it opened with both boxes empty
and saved them that way. It now reads them, shows them, and keeps them.
([#3827](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3827))

| Before                                                                                                                                                          | After                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| ![The admin edit form of a session whose attendance is 12 and 15, with both Attendance boxes empty](../screenshots/3827-event-attendance/before-admin-edit.png) | ![The same form showing 12 and 15](../screenshots/3827-event-attendance/after-admin-edit.png) |
