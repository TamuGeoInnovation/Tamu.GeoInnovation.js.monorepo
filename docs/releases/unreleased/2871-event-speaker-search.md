---
issue: 2871
title: "GIS Day admin: the event form's speaker search closes once a speaker is added"
testOnDev: |
  | GIS Day admin: the speaker search closes once a speaker is added ([#2871](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2871)) | Not on dev: GIS Day has no dev site. After release, open any event at [gisday.tamu.edu/admin/events](https://gisday.tamu.edu/admin/events), type part of a name under Speakers and click a speaker | The speaker is added under the search box, the search is cleared and the results close; clicking the box opens them again |
---

### GIS Day admin: the event form's speaker search closes once a speaker is added

On the admin's event pages, clicking a speaker in the Speakers search added them but left the results open over the
rest of the form. The list stays open while anything in it has focus, and the speaker just clicked kept it. Choosing a
speaker now adds them, clears the search and closes the list. Enter and Space still choose a speaker from the
keyboard. ([#2871](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2871))

| Before | After |
| --- | --- |
| ![The results still open after clicking Andrew Shensky](../screenshots/event-speaker-search/before.png) | ![Andrew Shensky added under a closed, empty search](../screenshots/event-speaker-search/after.png) |
