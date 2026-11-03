---
issue: 2635
title: A GIS Day session's check-in can be opened at any time, and admins see check-ins made outside its time
testOnDev: |
  | GIS Day: a session's check-in at any time ([#2635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2635)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release and the `AddCheckInAnyTime` migration, as an admin: Admin, Events, a session that is not on now, tick "Check-in open at any time?" and save, then open the session at [txgisday.org/sessions](https://txgisday.org/sessions) | The session offers CHECKIN outside its time. For an in-person session with a zone it still asks for your location and refuses you outside the zone; a hybrid or virtual one still needs its QR code. Once checked in, the session's Check-ins list (organizer section) shows you, the time, and "Outside Session Time Check-In". A session without the box still says check-in is available at the start |
---

### GIS Day: open a session's check-in at any time, and see check-ins made outside its time

A session's check-in used to be open only from its start until 15 minutes after its end
([#1795](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1795)), which made
check-in, and the location check above all, hard to test, and left no way to accept a late check-in. An
admin can now tick **Check-in open at any time?** on a session's event form. Its page then offers
**CHECKIN** before, during and after the session, and the API accepts it. Every other rule still applies:
an in-person session still needs the attendee inside its check-in zone
([#1766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1766)), and a hybrid
or virtual one its QR code
([#2560](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2560))
([#2635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2635)).

A check-in made outside the session's time is marked **Outside Session Time Check-In**. The mark is
decided when the check-in is made, so moving the session later does not change it, and check-ins an
organizer adds by hand are never marked. Admins see each session's check-ins in the organizer section of
its page: who, when in Central time, and the mark. Every other session keeps its window. Production needs
the `AddCheckInAnyTime` migration before this release.

| Before | After |
| --- | --- |
| ![A session outside its time: "Checkin will be available at the start of the session."](../screenshots/2635-gisday-checkin-any-time/before-outside-time.jpg) | ![The same session, open at any time: a CHECKIN button outside its time](../screenshots/2635-gisday-checkin-any-time/after-outside-time.jpg) |
| ![The admin event form's check boxes, with no check-in setting](../screenshots/2635-gisday-checkin-any-time/before-admin-form.jpg) | ![The admin event form with "Check-in open at any time?" ticked](../screenshots/2635-gisday-checkin-any-time/after-admin-form.jpg) |
| ![The session's organizer section: Attendance and the QR code, with no list of check-ins](../screenshots/2635-gisday-checkin-any-time/before-organizer-section.jpg) | ![The organizer section's Check-ins list, with a check-in marked "Outside Session Time Check-In"](../screenshots/2635-gisday-checkin-any-time/after-checkins-list.jpg) |
