---
issue: 3093
app: gisday
title: "GIS Day: speakers upload their sessions' slides from their edit link, and admins see them"
testOnDev: |
  | GIS Day: speakers upload their slides from their edit link ([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093)) | Not on dev: GIS Day has no dev site. After release, open two test speakers' edit links for the same session (from a profile or session details email), then as an admin that session under [Events](https://txgisday.org/admin/events) | Under the profile, **Your sessions** lists each session the speaker presents this season with its day, time and room. **Upload slides** takes a PDF or PowerPoint up to 100 MB and shows its name, size and time at once, beside any already there, up to three files a session, each with its own **Remove**; with three, there is no upload. The second speaker sees none of the first's files and uploads their own. A .docx is refused in words. The session's admin page has a **Slides** section listing every speaker's files, each with who uploaded it, whose file name downloads the original; the Events list has a **Slides** column (the upload date, or None) and **Only sessions with no slides** |
---

### GIS Day: speakers upload their sessions' slides from their edit link, and admins see them

Session speakers can now send their slides from the private link they already get by email to edit their profile, with
no account and no sign-in, as competition finalists send their files.

- **Your sessions**, under the profile on the edit-link page, lists each session the speaker presents this season, with
  its day, time and room. Each has the speaker's own slides: **Upload slides** (PDF or PowerPoint, up to 100 MB), and
  what they have uploaded with its name, size and when, each with its own **Remove**. Each speaker uploads their own,
  **up to three files for each session**; a fourth is refused with the reason. An upload is kept at once, with no
  approval and no deadline, and only the speaker who uploaded it and the GIS Day team can see it (decided 15 November
  2026).
- A speaker sees and removes **only their own files**: another speaker on the same session uploads theirs separately,
  and neither sees the other's. A link reaches only its own speaker's sessions and files. The files are received,
  checked and kept exactly as competition submissions' files are, with the same rules and the same words when a file is
  refused.
- **Admins** see every speaker's files in a new **Slides** section on the session's page, **each labelled with who
  uploaded it**, where the file name downloads the original, and in the **Events** list: a **Slides** column with the
  date they came, or None, and **Only sessions with no slides**, to see which sessions are still to send theirs. A
  session has slides when any of its speakers has uploaded one.

**Before deploying:** the database needs the migration `AddSessionFiles1794786922753`, which adds two nullable columns
to `assets`: `eventGuid`, with a foreign key to `events` that deletes a session's slides with the session, and
`uploadedByGuid`, the speaker who uploaded each file, with a foreign key to `speakers` that keeps the file if the speaker
is deleted. It is run on production by `6. GIS Day/migrations/migrate-prod-3093.ps1` in kubernetes-config, which needs
`AddBroadcastPlace1794772810966` ([#3048](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3048)) first.

([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093))

| On the local site, with made-up test speakers and sessions | Before                                                                                                  | After                                                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The speaker's edit-link page                               | ![The profile form and nothing about sessions](../screenshots/3093-speaker-slides/before-edit-link.png) | ![Your sessions under the profile, each session with Upload slides and up to 3 files](../screenshots/3093-speaker-slides/after-edit-link-sessions.png) |
| After an upload                                            |                                                                                                         | ![The PDF's name, size and time, with Remove, and Upload slides for another](../screenshots/3093-speaker-slides/after-edit-link-uploaded.png)          |
| Three files on a session                                   |                                                                                                         | ![Three files, each with its own Remove, and no upload](../screenshots/3093-speaker-slides/after-edit-link-three-files.png)                            |
| Another speaker on the same session                        |                                                                                                         | ![The second speaker's own file only](../screenshots/3093-speaker-slides/after-edit-link-other-speaker.png)                                            |
| The whole page                                             |                                                                                                         | ![The profile, then Your sessions](../screenshots/3093-speaker-slides/after-edit-link-full.png)                                                        |
| On a phone, 390 px                                         | ![The profile form only](../screenshots/3093-speaker-slides/before-edit-link-390.png)                   | ![Your sessions at phone width](../screenshots/3093-speaker-slides/after-edit-link-390.png)                                                            |
| The session's admin page                                   | ![Speakers, then Tags](../screenshots/3093-speaker-slides/before-admin-session.png)                     | ![A Slides section with both speakers' files, each labelled with who uploaded it](../screenshots/3093-speaker-slides/after-admin-session-slides.png)   |
| The admin Events list                                      |                                                                                                         | ![A Slides column: the upload date for one session, None for the other](../screenshots/3093-speaker-slides/after-admin-sessions-slides.png)            |
| Only sessions with no slides                               |                                                                                                         | ![Only the session without slides](../screenshots/3093-speaker-slides/after-admin-sessions-no-slides.png)                                              |
