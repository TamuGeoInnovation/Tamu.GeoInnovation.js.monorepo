---
issue: 3147
title: "GIS Day admin: a session can be marked No slides, so its speakers are not asked for any"
testOnDev: |
  | GIS Day: No slides for this session ([#3147](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3147)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release (and its migration, AddEventNoSlides), as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with speakers that has no slides (a panel, a social) | Below the session's checkboxes, "No slides for this session", unticked on every session until someone ticks it. Tick it and save: Email these speakers offers Profile email and Session details, and no Ask for slides, and the Slides section says no slides are expected. On that session's speaker's presenter page (from their profile email's link), the session says "No slides are needed for this session." with no upload. Every other session still offers Ask for slides and the upload |
---

### GIS Day admin: a session can be marked No slides, so its speakers are not asked for any

A panel, a social or lunch has no slides, but nothing said so, and Ask for slides could be sent to its speakers. A
session's admin form now has a **No slides for this session** box, unticked on every session until someone ticks it
([#3147](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3147)). It is stored in a new column
of the sessions table, added by migration AddEventNoSlides. With it ticked:

- **Email these speakers** offers no Ask for slides, and the session's Slides section says no slides are expected;
- the site refuses to preview or send an Ask for slides email for the session, whichever page asks;
- each of its speakers' presenter pages lists the session with "No slides are needed for this session." and no upload,
  and the site refuses an upload to it.

| A made-up session's admin form, and one of its made-up speakers' presenter page, 1280 pixels, on the local site as gisday.tamu.edu | Image |
| --- | --- |
| Before: the session's checkboxes, with nothing about slides | ![Five checkboxes: Event active, Requires RSVP, Is accepting RSVPs, Is bring your own device, Check-in open at any time](../screenshots/3147-no-slides/before-form.png) |
| Before: Email these speakers offers Ask for slides on every session | ![The Email these speakers menu open with Profile email, Session details and Ask for slides](../screenshots/3147-no-slides/before-menu.png) |
| After: No slides for this session, ticked on this session | ![The five checkboxes, then No slides for this session ticked, with Its speakers are not asked for slides and cannot upload any](../screenshots/3147-no-slides/after-form.png) |
| After: with it ticked, Email these speakers has no Ask for slides | ![The Email these speakers menu open with Profile email and Session details only](../screenshots/3147-no-slides/after-menu.png) |
| After: the speaker's presenter page, reached through their own edit link, lists the session with no upload | ![Your sessions on a presenter page: the made-up session, its day, time and room, and No slides are needed for this session, with no upload](../screenshots/3147-no-slides/after-presenter-page.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, with the box ticked in the
local database by hand and the speaker's edit link made there by hand, and nothing was sent or saved from the page.
