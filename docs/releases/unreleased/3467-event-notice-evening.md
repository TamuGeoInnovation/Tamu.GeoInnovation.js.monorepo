---
issue: 3467
title: An event's notice stays up through the evening of the event
testOnDev: |
  | Event notices on the day of the event ([#3467](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3467)) | [dev.aggiemap.tamu.edu/map](https://dev.aggiemap.tamu.edu/map), on a day an event map is running | The notice for an event happening today is still offered after 7 PM Central, and is gone the following day. Notices auto-dismiss about ten seconds after the page loads, so hover over the panel to hold one while you look |
---

### An event's notice stays up through the evening of the event

A map notice for an event - the banner that offers the game-day or parking map for something happening
now - **stopped being shown at 7 PM Central on the day of the event itself**, which is when people are
most likely to be looking for it.

The dates in an event's definition are date-only strings. `new Date('2026-10-02')` reads one as **UTC
midnight**, which is 7 PM Central the evening before, and the service then asked whether now was within a
day of that moment. So the window opened the evening before the event and closed at 7 PM on its own day.

It now uses the same `parseEventDate` and `nextEventDate` the rest of the application reads these dates
with, so a notice is offered while the event's own local day has not ended. No new date arithmetic was
added: a second timezone correction would have been a third copy of the same idea, which is what caused
this.

**No before/after capture.** Showing it needs the clock set to the evening of a real event, and with
Playwright's date fixed no notice appeared at all - not even a control the day before, which should have
shown one. The frozen clock suppresses notices for some other reason, so an image from it would prove
nothing. The evidence is a test with a fixed clock that fails on the old code and passes on the new.

| Issue                                                                                    | What                                                                                               |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [#3467](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3467) | An event's notice is offered through the evening of the event, instead of stopping at 7 PM Central |
