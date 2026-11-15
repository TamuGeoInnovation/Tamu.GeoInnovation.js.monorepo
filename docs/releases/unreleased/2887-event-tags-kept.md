---
issue: 2887
title: "GIS Day admin: an event opened to edit shows its tags ticked, so ticking them again no longer removes them"
testOnDev: |
  | GIS Day admin: an event's tags when it is edited ([#2887](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2887)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin, open [Admin > Events on gisday.tamu.edu](https://gisday.tamu.edu/admin/events), click an event that has a tag, change nothing and press Update, then open it again | The event's tags are ticked each time it is opened from the list, and still on the event after Update. Ticking another tag adds it beside them; unticking one removes only that one |
---

### GIS Day admin: an event opened to edit shows its tags ticked, so ticking them again no longer removes them

An event opened from the admin Events list showed every tag box unticked, although the event had its tags. An organizer
who ticked a tag again to put it back was taking it off, so saving lost it. The tags were never lost by the server: the
form held them, but the shared checkbox group ticked its boxes once, before it knew which tag each box was, and never
again. It now ticks and unticks them whenever either changes.

The same checkbox group draws the census years and address formats in GeoServices' advanced options, a place's
visibility settings, and the first-visit survey's multiple-choice questions, which now show their saved choices the
same way.
([#2887](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2887))

| Before | After |
| --- | --- |
| ![An event that has the Lunch tag, opened to edit, with every tag unticked](../screenshots/2887-event-tags-kept/before-edit-lunch-unticked.jpg) | ![The same event opened the same way, with Lunch ticked](../screenshots/2887-event-tags-kept/after-edit-lunch-ticked.jpg) |
