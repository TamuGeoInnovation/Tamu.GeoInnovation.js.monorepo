---
issue: 2940
title: "GIS Day: an event's speakers on its edit page are in order by last name"
testOnDev: |
  | GIS Day: an event's speakers by last name ([#2940](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2940)) | Not on dev: GIS Day has no dev site. After release, open an event with several speakers from [Events](https://txgisday.org/admin/events) | Its speakers are listed by last name, then first name, and stay in that order when one is added or removed |
---

### GIS Day: an event's speakers on its edit page are in order by last name

On an event's edit page in the admin, the speakers already on the event were listed in the order they had been added,
so on a session with nineteen student presenters a name was hard to find. They are now listed by last name, then first
name, and stay in that order as speakers are added and removed.
([#2940](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2940))

| Before | After |
| --- | --- |
| ![An event's speakers in the order they were added](../screenshots/event-speakers-sorted/before.png) | ![The same speakers by last name](../screenshots/event-speakers-sorted/after.png) |
