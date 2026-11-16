---
issue: 3093
title: "GIS Day: speakers upload their sessions' slides from their edit link, and admins see them"
testOnDev: |
  | GIS Day: speakers upload their slides from their edit link ([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093)) | Not on dev: GIS Day has no dev site. After release, open a test speaker's edit link (from a profile or session details email), then as an admin that session under [Events](https://txgisday.org/admin/events) | Under the profile, **Your sessions** lists each session the speaker presents this season with its day, time and room. **Upload slides** takes a PDF or PowerPoint up to 100 MB and shows its name, size and time at once; **Replace** swaps it and **Remove** takes it away. A .docx is refused in words. The session's admin page has a **Slides** section whose file name downloads the original; the Events list has a **Slides** column (the upload date, or None) and **Only sessions with no slides** |
---

### GIS Day: speakers upload their sessions' slides from their edit link, and admins see them

Session speakers can now send their slides from the private link they already get by email to edit their profile, with
no account and no sign-in, as competition finalists send their files.

- **Your sessions**, under the profile on the edit-link page, lists each session the speaker presents this season, with
  its day, time and room. Each has its slides: **Upload slides** (PDF or PowerPoint, up to 100 MB), what is uploaded
  now with its name, size and when, **Replace** and **Remove**. An upload is kept at once, with no approval, and only
  the GIS Day team can see it (decided 15 November 2026).
- A link reaches only its own speaker's sessions. The files are received, checked and kept exactly as competition
  submissions' files are, with the same rules and the same words when a file is refused.
- **Admins** see the slides in a new **Slides** section on the session's page, where the file name downloads the
  original, and in the **Events** list: a **Slides** column with the date they came, or None, and **Only sessions with
  no slides**, to see which sessions are still to send theirs.

**Before deploying:** the database needs the migration `AddSessionFiles1794786922753` (a nullable `assets.eventGuid`
with a foreign key to `events`), run on production by `6. GIS Day/migrations/migrate-prod-3093.ps1` in
kubernetes-config, which needs `AddBroadcastPlace1794772810966` ([#3048](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3048)) first.

([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093))

| On the local site, with a made-up test speaker and sessions | Before                                                                                                  | After                                                                                                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| The speaker's edit-link page                                | ![The profile form and nothing about sessions](../screenshots/3093-speaker-slides/before-edit-link.png) | ![Your sessions under the profile, each session with Upload slides](../screenshots/3093-speaker-slides/after-edit-link-sessions.png)        |
| After an upload                                             |                                                                                                         | ![The PDF's name, size and time, with Remove and Replace](../screenshots/3093-speaker-slides/after-edit-link-uploaded.png)                  |
| The whole page                                              |                                                                                                         | ![The profile, then Your sessions](../screenshots/3093-speaker-slides/after-edit-link-full.png)                                             |
| On a phone, 390 px                                          | ![The profile form only](../screenshots/3093-speaker-slides/before-edit-link-390.png)                   | ![Your sessions at phone width](../screenshots/3093-speaker-slides/after-edit-link-390.png)                                                 |
| The session's admin page                                    | ![Speakers, then Tags](../screenshots/3093-speaker-slides/before-admin-session.png)                     | ![A Slides section with the file, which downloads](../screenshots/3093-speaker-slides/after-admin-session-slides.png)                       |
| The admin Events list                                       |                                                                                                         | ![A Slides column: the upload date for one session, None for the other](../screenshots/3093-speaker-slides/after-admin-sessions-slides.png) |
| Only sessions with no slides                                |                                                                                                         | ![Only the session without slides](../screenshots/3093-speaker-slides/after-admin-sessions-no-slides.png)                                   |
