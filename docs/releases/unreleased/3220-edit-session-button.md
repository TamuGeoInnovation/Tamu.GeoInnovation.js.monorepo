---
issue: 3220
title: "GIS Day: An Edit session button on a session's page, for organizers"
testOnDev: |
  | GIS Day: Edit session button on a session's page ([#3220](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3220)) | Not on dev: GIS Day has no dev site. On production, signed in as a GIS Day admin, manager or organizer, open any session from Sessions | An **Edit Session** button at the right of the session's title opens that session's edit form under Admin → Sessions; signed out, or signed in without one of those roles, there is no button |
---

### GIS Day: An Edit session button on a session's page, for organizers

Getting from a session's public page to its edit form meant going to Admin → Sessions and finding the session in the
list. A signed-in GIS Day admin, manager or organizer, the roles the admin area lets in, now sees an **Edit Session**
button beside the session's title, which opens its edit form. Nobody else sees it.
([#3220](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3220))

| Before | After |
| --- | --- |
| ![A made-up session's page signed in as a GIS Day admin: its title at the left, then the check-in QR code section and the time and place, with no Edit session button](../screenshots/3220-edit-session-button/before-organizer.png) | ![The same page signed in as a GIS Day admin: the title at the left as before, and an Edit Session button at the right of its row](../screenshots/3220-edit-session-button/after-organizer.png) |
| | ![A made-up session with a title of 73 characters, signed in as a GIS Day admin: the title on two lines at the left, and the Edit Session button beside it at the right](../screenshots/3220-edit-session-button/after-organizer-long.png) |
| | ![The page the button opens: the made-up session's edit form under Admin → Events, Update Event, its day, times, check-in minutes, name and abstract](../screenshots/3220-edit-session-button/after-edit-form.png) |
| | ![The same session's page signed out: no Edit Session button and no check-in QR code, the title at the left as before](../screenshots/3220-edit-session-button/after-signed-out.png) |
| | ![The same page on a phone, 390 pixels wide, signed in as a GIS Day admin: the Edit Session button under the title, nothing past the right edge](../screenshots/3220-edit-session-button/after-organizer-phone.png) |
