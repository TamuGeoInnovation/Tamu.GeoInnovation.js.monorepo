---
issue: 3627
app: gisday
title: Admin pages handle a missing season, guid or name instead of failing
testOnDev: |
  | Attendance export with no professor ([#3627](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3627)) | GIS Day dev site: Admin > Classes, a class with no professor's name | **Export as CSV** downloads `<code>-<number>-_gisday_attendance.csv` instead of doing nothing |
  | Admin lists with a missing season or guid ([#3627](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3627)) | GIS Day dev site: any Admin list (Copy, Delete, select all) | Closing the Copy window with no season chosen copies nothing; Delete and select all still work on every row |
  | Sponsors, badges and research competition ([#3627](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3627)) | GIS Day dev site: Admin > Sponsors; Admin > Dashboards > speaker badges; Admin > Research competition | Switching a sponsor says so; a speaker with no guid is left out of the badge list; downloading files with no season says they could not be downloaded; a submission with no acceptance shows as not accepted |
  | Session check-ins, the initial survey and the homepage ([#3627](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3627)) | GIS Day dev site: a session's details (check-ins), the account's initial survey, and the homepage | A check-in with no account is listed with an empty name; an option question saved with no options still lets the survey load; the homepage loads with no active season |
---

### Admin pages handle a missing season, guid or name instead of failing

Several GIS Day pages, mostly in Admin, failed when a record was missing a value the page assumed was there. A class with no
professor's name could not export its attendance, and a submission saved without its acceptance could not be opened. A session
check-in with no account, an initial-survey question saved with no options, and a homepage with no active season also failed. Each
now does the sensible thing: the export is named without a professor, the submission shows as not accepted, and the rest load.
Nothing renders differently where the data is complete. Where it is not, the survey shows the question it used to drop:

| Before                                                                                                   | After                                                                                                                  |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ![The survey without its option question](../screenshots/3627-admin-missing-values/before-survey-option-question.png) | ![The survey with the option question and no options](../screenshots/3627-admin-missing-values/after-survey-option-question.png) |

([#3627](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3627))
