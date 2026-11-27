---
issue: 440
app: gisday
title: Admin > Speakers lists the speakers in a session with one tag
testOnDev: |
  | Speakers by session tag ([#440](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/440)) | GIS Day dev site, signed in as an admin: Admin > Speakers | **Session tag** beside Season lists the tags of the season's sessions. Choosing one, such as Panel, leaves only the speakers in a session with that tag, and the count says how many. **Every tag** shows them all again |
---

### Admin > Speakers lists the speakers in a session with one tag

Organizers inviting past panelists back had no way to see every speaker who had spoken in a panel. Admin > Speakers now
has a **Session tag** choice beside the season. It lists the tags of the season's sessions, and choosing one leaves only
the speakers in a session with that tag. It is kept and cleared with the page's other filters, as the Events list's
Organization choice is.
([#440](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/440))

| Before                                                                                                                                                    | After, every tag                                                                                                                | After, Panel chosen                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![Admin > Speakers with a season choice and no way to filter by the kind of session](../screenshots/440-speakers-by-session-tag/before-every-speaker.png) | ![Admin > Speakers with a Session tag choice beside the season](../screenshots/440-speakers-by-session-tag/after-every-tag.png) | ![Admin > Speakers with Panel chosen, listing the two speakers in the panel session](../screenshots/440-speakers-by-session-tag/after-panel.png) |

The images use made-up speakers, sessions and tags, with sign-in and the API stubbed.
