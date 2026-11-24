---
issue: 3011
app: gisday
title: "GIS Day: The presentation and poster competition pages give each session's day, time and room from the sessions themselves"
testOnDev: |
  | GIS Day: competition session times ([#3011](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3011)) | Not on dev: GIS Day has no dev site. After release, open [Presentation](https://gisday.tamu.edu/competitions/presentation) and [Posters](https://gisday.tamu.edu/competitions/posters) | Under Presentation Competition Session, each session's name links to its page, with the same date, time and room the [schedule](https://gisday.tamu.edu/sessions) shows (undergraduate 2:00 to 2:40 PM, graduate 2:40 to 4:00 PM, Bethancourt Ballroom 2300 C). The talk is 5 minutes in all, questions included. The poster session and the awards session read the same way. Change a session's time in the admin and the page follows without a release |
---

### GIS Day: The presentation and poster competition pages give each session's day, time and room from the sessions themselves

The competition pages had their sessions' dates, times and rooms typed in, so when the sessions moved the pages kept
the old ones: the presentation page gave 2:00 - 3:00 PM in Gates Ballroom 2400 for a session at 2:00 to 2:40 PM in
Bethancourt Ballroom 2300 C. Each page now reads its sessions, and the awards session, from the season's sessions, the
same way the acceptance emails find them, and links each to its own page. The presentation page also says what
finalists were told: 5 minutes in all, questions included.
([#3011](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3011))

| Before (production, 15 November): typed into the page, and out of date | After (the local site, whose copy of the sessions is older than production's, and has no awards session): read from the sessions, each linked |
| --- | --- |
| ![The presentation page before, giving 2:00 - 3:00 PM in Gates Ballroom 2400 and a 10 minute talk](../screenshots/3011-competition-session-times/before-presentation.png) | ![The presentation page after, each session's name linked, with its date, time and room as that database has them, and the awards session sending readers to the schedule because that copy has none](../screenshots/3011-competition-session-times/after-presentation.png) |
| ![The poster page before, giving Gates Ballroom 2400](../screenshots/3011-competition-session-times/before-posters.png) | ![The poster page after, the poster and awards sessions from the sessions](../screenshots/3011-competition-session-times/after-posters.png) |
