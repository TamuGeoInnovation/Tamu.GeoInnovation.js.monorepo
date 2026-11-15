---
issue: 3017
title: "GIS Day admin: a Final file column, and a Send final reminder email to finalists who have not uploaded"
testOnDev: |
  | GIS Day admin: the final file and the final reminder ([#3017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3017)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | A **Final file** column says Uploaded or Missing for each submission, and sorts when its heading is clicked. Select accepted submissions with and without a file, and a rejected one, choose **Send final reminder**: the window says how many are skipped and why (already has a file, or not accepted), and shows the poster and presentation reminders, editable, with the first submission's filled in. Send, and the toast says how many were reminded and skipped. Selecting only submissions that are skipped sends nothing and says why |
---

### GIS Day admin: who has uploaded their final file, and a final reminder to those who have not

Finalists must upload their final presentation slides or poster by the season's file deadline, or they are removed from
the competition. Research Competitions now shows who has:

- a **Final file** column, **Uploaded** or **Missing**, that sorts. A submission's attachments have no kind and its
  abstract is text, so any file it has counts as its final one;
- **Send final reminder** among the actions on the selected submissions: the final warning, shown and editable before
  it goes, exactly as the acceptance emails are, with one text for presenters and one for posters, and the same
  placeholders. It goes only to accepted finalists who have no file yet: selected submissions that already have one, or
  that were not accepted (rejected, or not yet reviewed), are skipped, and the window and the result say how many of
  each.

Only admins who can review the competitions can send it. Nothing about the submissions is recorded.
([#3017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3017))
