---
issue: 2706
title: A new GIS Day event starts out accepting RSVPs
testOnDev: |
  | GIS Day admin: a new event starts out accepting RSVPs ([#2706](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2706)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Events > Add | "Is accepting RSVPs?" is ticked on the empty form. Open an existing event that does not accept RSVPs: it is still unticked |
---

### GIS Day admin: a new event starts out accepting RSVPs

The form for adding an event started with "Is accepting RSVPs?" unticked, although the database treats an event as
accepting RSVPs unless told otherwise. So every event added in the admin pages was saved as not accepting them: on
6 November 2026 all 45 active events on each site were, and a script had to set them. A new event now starts with the
box ticked; an organizer can still untick it, and an event being edited keeps what it has.
([#2706](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2706))

| Admin > Events > Add | Before | After |
| --- | --- | --- |
| A new event | ![Is accepting RSVPs? unticked](../screenshots/2706-new-event-accepts-rsvps/before.png) | ![Is accepting RSVPs? ticked](../screenshots/2706-new-event-accepts-rsvps/after.png) |
