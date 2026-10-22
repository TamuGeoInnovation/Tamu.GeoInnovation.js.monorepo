---
issue: 2092
title: GIS Day admins can show or hide sessions on the public schedule from the Events list
testOnDev: |
  | GIS Day: Admin, then Events ([#2092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2092)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, as a GIS Day admin: [txgisday.org/admin/events](https://txgisday.org/admin/events) | Each event has an Active box. Untick one: it stays on the list, and leaves [Sessions](https://txgisday.org/sessions); tick it again and it is back. Selecting several offers "Show on schedule" and "Hide from schedule". The event keeps its speakers and tags |
---

### GIS Day: show or hide sessions on the public schedule from the Events list

Placeholder sessions, such as the "TBD" ones, can now be taken off the public schedule from the admin
**Events** list, without opening each event. Every event has an **Active** box there, the same setting as
"Event active?" on the event's own page, which the public schedule already respected. Selecting several
events offers **Show on schedule** and **Hide from schedule** for all of them at once. Only that setting
changes; an event keeps its speakers, tags and everything else
([#2092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2092)).

| Before | After |
| --- | --- |
| ![The Events list with no Active column](../screenshots/2092-event-active-list/before-admin-events.png) | ![The Events list with an Active box on every event, one just unticked, and "1 event taken off the public schedule"](../screenshots/2092-event-active-list/after-admin-events.png) |
