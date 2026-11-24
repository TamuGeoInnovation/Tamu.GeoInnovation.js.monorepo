---
issue: 3043
app: gisday
title: "GIS Day admin: the finalists' profile email reaches co-authors, starts from the maintainer's text, and names who it can't reach"
testOnDev: |
  | GIS Day admin: the finalists' profile email ([#3043](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3043), [#3045](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3045), [#3046](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3046)) | Not on dev: GIS Day has no dev site. After release, as an admin: [Research Competitions](https://txgisday.org/admin/research-competition), select a group submission whose co-authors share one email box, **Send profile email**, then **Cancel** | The count includes each co-author who has a presenter record, including one entered by NetID; the text starts "One of the best ways for you to get a full-time or internship position..." and ends "- The Texas A&M GIS Day Team"; anyone on the submissions with no presenter record is listed by name and submission before anything is sent |
---

### GIS Day admin: the finalists' profile email reaches their co-authors, and says who it can't reach

Research Competitions' **Send profile email** matched each participant's whole email box to a presenter, so a co-author
typed into the same box as someone else, or entered by NetID, matched nobody and got no email, though they are on the
program. The box is now read as the finalists' presenter records were made from it: several addresses split on commas,
semicolons and spaces, and a bare NetID read as its tamu.edu address
([#3043](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3043)).
The email starts from the maintainer's text for the competition finalists
([#3045](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3045)), and the window lists, before
anything is sent, the people on the selected submissions who have no presenter record and will not be emailed, with their
submissions, so they can be added first
([#3046](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3046)).

The same made-up group submission in both: its lead, two co-authors typed into one email box (one of them by NetID), and
one person with no presenter record.

| Before (`development`, the local site): one email, the co-authors missed, nobody listed, the old text | After (the local site): three emails, the person with no presenter record named, the new text |
| --- | --- |
| ![The profile email's window from Research Competitions for a group submission of 3 entries: Presenter profile emails (1) and Send 1 email, the two co-authors in one email box missed, and the old short text](../screenshots/profile-email-finalists/before-research-competition-window.png) | ![The same window on the branch: 1 person on these submissions will not be emailed, Drew Nospeaker3071, with the submission; Presenter profile emails (3) and Send 3 emails; the finalists' text in the box and the preview](../screenshots/profile-email-finalists/after-research-competition-window.png) |
