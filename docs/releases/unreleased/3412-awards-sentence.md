---
issue: 3412
app: gisday
title: The competition pages no longer lead into a session they cannot name
testOnDev: |
  | A sentence leading into a session shows only with the session ([#3412](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3412)) | GIS Day dev site: Competitions > Posters, *Awards Announcement*; Competitions > Presentation, *Presentation Competition Session* and *First Place Award Announcement* | With an awards session found (chosen in Admin, or named `AWARDS:` with poster or presentation), "Winners will be announced at the awards session:" and the session's name, day, time and room. With none found, no sentence ending in a colon, only "The day, time and room are on the schedule." The same for each presentation session |
---

### The competition pages no longer lead into a session they cannot name

On the Posters and Presentation pages, the awards announcement read "Winners will be announced at the awards
session:" even when the page found no awards session, so the sentence ended in a colon with nothing after it but a
pointer to the schedule. That happens when the season has not chosen an awards session in Admin and its awards
session's name does not mention posters or presentations, for example "AWARDS: Winner Announcements". The sentence
now shows only when there is a session to name, and the presentation sessions' sentences work the same way.
([#3412](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3412))

| Before                                                                                                                                                                                         | After                                                                                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![The Posters page's Awards Announcement: "Winners will be announced at the awards session:", then only the schedule line](../screenshots/3412-awards-sentence/posters-awards-1280-before.png) | ![The same section with no sentence ending in a colon, only the schedule line](../screenshots/3412-awards-sentence/posters-awards-1280-after.png) |
