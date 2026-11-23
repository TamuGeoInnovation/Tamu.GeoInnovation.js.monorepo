---
issue: 3113
title: "GIS Day admin: ask a session's speakers for their slides"
testOnDev: |
  | GIS Day admin: Ask for slides, a session's third speaker email ([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113)) | Not on dev: GIS Day has no dev site. After release, as an admin, open a session with two or more speakers under [Events](https://txgisday.org/admin/events), then Email these speakers, Ask for slides | The menu has three items: Profile email, Session details, Ask for slides. The window lists the speakers with tick boxes, offers no "together", and says each speaker gets their own copy because it carries their own link to upload their slides. The text names the session, its day and time in Central and its room, says what may be uploaded (PowerPoint or PDF, up to 100 MB each, up to 3 files for each session), and the preview shows "(their own edit link, added when it is sent)" where the link goes. Cancel sends nothing |
---

### GIS Day admin: ask a session's speakers for their slides

A session's **Email these speakers** menu has a third email, **Ask for slides**, beside Profile email and Session
details. It opens the same window, with a template of its own that the admin reads and can edit first, subject included:

- **The session**: its name, its day and time in Central, and its room, as the session details email gives them.
- **Where to upload**: each speaker's own link to their presenter page, where **Your sessions** takes their slides
  ([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093)). It is the same link the
  profile email sends, made when the email goes; the preview shows a stand-in, never a real link.
- **What may be uploaded**, in words made from the upload rule itself (PowerPoint or PDF files, .pdf, .ppt or .pptx, up
  to 100 MB each, up to 3 files for each session), so the email cannot promise what the upload refuses.

**It always goes as a copy each.** Every copy carries its speaker's own link, so one email to several would hand each
of them the others'. The speakers are chosen with the tick boxes of
[#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104); the window offers no
"together" and says why, and the API refuses one asked to go together. It goes from the sender chosen in **Send as**
([#3100](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3100)), and, as the other speaker
emails, a speaker asked for a session's slides in the last 10 minutes is skipped and named, so a repeated click emails
no one twice.

([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113))

| On the local site, as an admin, with a made-up hybrid session and two made-up speakers | Before | After |
| --- | --- | --- |
| Email these speakers | ![Two items: Profile email and Session details](../screenshots/3113-ask-for-slides/before-menu.png) | ![Three items: Profile email, Session details and Ask for slides](../screenshots/3113-ask-for-slides/after-menu.png) |
| Ask for slides: the window's top | | ![Both speakers ticked, no together choice, and why: each copy carries their own link to upload their slides](../screenshots/3113-ask-for-slides/after-composer.png) |
| Ask for slides: the preview | | ![As the first speaker gets it: the session's day, time and room, the stand-in for their own link, and what may be uploaded](../screenshots/3113-ask-for-slides/after-preview.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site.
