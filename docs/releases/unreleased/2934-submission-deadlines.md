---
issue: 2934
app: gisday
title: "GIS Day: poster and presentation submissions close at a deadline an admin sets"
testOnDev: |
  | GIS Day: submission deadlines ([#2934](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2934)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition), set a poster deadline a few minutes ahead and save; then, signed in, open [a new submission](https://txgisday.org/account/submissions/add) and choose Poster | Before the deadline the form says when the poster competition closes; after it, it says it closed and when (in Central time) and offers no Submit, an existing poster submission can no longer be changed, and its files can still be attached until the files deadline. Clear the deadlines afterwards to reopen |
---

### GIS Day: poster and presentation submissions close at a deadline an admin sets

Submissions to the student competitions were closed by hand. Admins now set, on **Research Competitions**, when
each competition closes for the season: for the poster and for the presentation competition, when new submissions
and edits close, and a later moment when the files attached to them (#2933) close. A deadline left empty stays open.

From that moment the API refuses a student's new submission, edit or file change for that competition, whatever the
page shows, and the submission form says that the competition closed and when; before it, the form says when it will
close. Times are entered and shown in US Central. Reviewers can still review and attach files after either deadline.
([#2934](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2934))

| Before | After |
| --- | --- |
| ![Research Competitions with no deadlines](../screenshots/submission-deadlines/before-admin.png) | ![Research Competitions with each competition's submission and file deadlines](../screenshots/submission-deadlines/after-admin.png) |
| ![A poster submission offered Submit with nothing about a deadline](../screenshots/submission-deadlines/before-form-poster.png) | ![The poster competition closed, and when; no Submit](../screenshots/submission-deadlines/after-form-poster-closed.png) |
| ![The poster submission taken after its deadline](../screenshots/submission-deadlines/before-submitted.png) | ![A submission to the closed poster competition, locked, with its files open until their own deadline](../screenshots/submission-deadlines/after-edit-poster-closed.png) |
| | ![The presentation competition, still open, saying when it closes](../screenshots/submission-deadlines/after-form-presentation-open.png) |
