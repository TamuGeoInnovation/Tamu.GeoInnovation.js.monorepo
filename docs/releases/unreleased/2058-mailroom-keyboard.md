---
issue: 2058
app: mailroom
title: Mailroom's delete icons work from the keyboard, and attachments have text alternatives
testOnDev: |
  | Mailroom: keyboard and screen readers ([#2058](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2058)) | Wherever Mailroom's front end is served (or locally, `nx serve mailroom-angular`): the email list and an email with attachments | Tab reaches each delete icon and Enter deletes; each attachment image is read as "Attachment 1", "Attachment 2"... |
---

### Mailroom's delete icons work from the keyboard, and attachments have text alternatives

Mailroom's two delete-email icons could only be clicked; Tab now reaches them and Enter or Space deletes. Its attachment images had no
text alternative and now read as "Attachment 1", "Attachment 2" and so on (an attachment has no file name to use). The template
accessibility rules are switched back on for Mailroom, so a new one fails the lint.
