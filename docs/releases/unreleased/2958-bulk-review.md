---
issue: 2958
title: "GIS Day: approve, reject and send profile emails to the selected submissions at once"
testOnDev: |
  | GIS Day: Approve, Reject and Send profile email for the selected submissions ([#2958](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2958)) | Not on dev: GIS Day has no dev site. After release, on [Texas A&M's Research Competitions](https://gisday.tamu.edu/admin/research-competition), select a test submission of your own | Approve, Reject and Send profile email appear beside Delete; each asks first, saying how many will be emailed; Cancel sends nothing. Approving marks it Accepted and the toast says so, and your inbox gets the acceptance email. Send profile email lists anyone on the submission with no speaker record |
---

### GIS Day: approve, reject and send profile emails to the selected submissions at once

Research Competitions offered only **Delete** for the selected submissions, so every decision meant opening a submission,
choosing, and submitting the review, one at a time. The selected-rows bar now also has:

- **Approve** and **Reject**: each selected submission is reviewed exactly as Submit Review reviews one, and its submitter
  gets the acceptance or rejection email from the reviewer's own site (#2957's wording).
- **Send profile email**: each person on the selected submissions gets their own link to their presenter profile, as the
  Speakers list sends it. People are matched to the season's speaker records by email, ignoring capitals and spaces;
  anyone with no speaker record is listed by name in the result, with their submission, so they can be added.

Every one of these sends email, so each asks first, in the page, with how many will be emailed (*Approve 12 submissions
and email their submitters?*), and says if any were already reviewed and will hear again. One request does the whole
selection; the result says how many were done and lists any that failed, by title, with why.
([#2958](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2958))

| Before | After |
| --- | --- |
| ![Three submissions selected; the bar offers only Delete](../screenshots/2958-bulk-review/before-selected-actions.png) | ![Three submissions selected; the bar offers Approve, Reject, Send profile email and Delete](../screenshots/2958-bulk-review/after-selected-actions.png) |

| Asked first | The result |
| --- | --- |
| ![Approve 3 submissions and email their submitters?](../screenshots/2958-bulk-review/after-approve-confirm.png) | ![The three are Accepted; the toast lists each whose email could not be sent, as on a local copy with no mail server](../screenshots/2958-bulk-review/after-approve-result.png) |
| ![Send profile emails to the 4 people of 3 submissions?](../screenshots/2958-bulk-review/after-profile-confirm.png) | ![The toast names the person with no speaker record, with their submission](../screenshots/2958-bulk-review/after-profile-result.png) |

The results were taken on a local copy, where no email can be sent, so each says its email could not be sent; on the live
site they say who was emailed. A row belonging to a real account is blanked out.
