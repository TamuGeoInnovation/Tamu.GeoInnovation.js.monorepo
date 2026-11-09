---
issue: 2799
title: The GIS Day admin submissions list shows who submitted each, and when
testOnDev: |
  | GIS Day admin: the competition submissions list shows each submitter and when they submitted ([#2799](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2799)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Research Competitions | Each submission shows the date and time it was submitted and the submitter's first name, last name, email and department. The list may take a few seconds longer to appear than before, while it looks up each submitter |
---

### GIS Day admin: the submissions list shows who submitted each, and when

The admin list of student competition submissions showed each one's title, type, format, classification and status,
but not who submitted it or when. Checking whether a particular student's poster had arrived meant opening each
submission in turn, and even then it showed only the participants typed into the form, not the account that submitted
it. The list now shows the date and time each was submitted, and the submitter's first and last name, email and
department (the field of study for a student, the department for anyone else), read from their account. A submission
whose account no longer exists still appears, marked "Account not found".
([#2799](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2799))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| The 2026 list (local test data) | ![Title, type, format, classification and status only](../screenshots/2799-submission-submitters/before.png) | ![The same, with when it was submitted and the submitter's name, email and department](../screenshots/2799-submission-submitters/after.png) |
