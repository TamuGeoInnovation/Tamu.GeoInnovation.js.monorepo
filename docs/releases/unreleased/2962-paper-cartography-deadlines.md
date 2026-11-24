---
issue: 2962
app: gisday
title: "GIS Day: paper and cartography submissions close at a deadline too, as posters and presentations do"
testOnDev: |
  | GIS Day: paper and cartography deadlines ([#2962](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2962)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | Submission deadlines lists four competitions, each with its two dates: Poster, Presentation, Paper and Cartography. Set a paper deadline a few minutes ahead and save; signed in, [a new submission](https://txgisday.org/account/submissions/add) of type Paper says when the paper competition closes, and after it says it closed and offers no Submit. Poster and presentation are unchanged. Clear the paper deadline afterwards to reopen |
---

### GIS Day: paper and cartography submissions close at a deadline too, as posters and presentations do

The deadlines admins set on **Research Competitions** (#2934) covered only the poster and presentation competitions.
The paper and cartography competitions now have the same pair: when new submissions and edits close, and a later
moment when their files close. A deadline left empty stays open, so nothing changes for a season until an admin sets
one. The API holds each competition to its own deadlines, and the submission form says when it closes or closed, as
it does for posters and presentations. Reviewers can still review and attach files after either deadline.
([#2962](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2962))

| Before | After |
| --- | --- |
| ![Submission deadlines for the poster and presentation competitions only](../screenshots/paper-cartography-deadlines/before-admin.png) | ![Submission deadlines for the poster, presentation, paper and cartography competitions](../screenshots/paper-cartography-deadlines/after-admin.png) |
