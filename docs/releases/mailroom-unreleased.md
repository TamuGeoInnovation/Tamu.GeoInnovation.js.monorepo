# Mailroom, unreleased

**Mailroom's changes collect here until Mailroom is next released.** This is `mailroom-angular`, the Mailroom web front end. It is released on its own path, not
with AggieMap or GIS Day, so its changes do not belong in their notes. The file was started on 24 November 2026 for the first change
that needed it ([#2058](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2058)); each change adds its own
entry file to [`unreleased/`](unreleased/README.md) with `app: mailroom` in its front matter, and
`node scripts/collate-release-notes.mjs --write` gathers them here.

**What is deployed is not recorded here.** Where Mailroom runs is part of the infrastructure inventory
([#1517](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1517)).

---

## Summary

### Mailroom's delete icons work from the keyboard, and attachments have text alternatives

Mailroom's two delete-email icons could only be clicked; Tab now reaches them and Enter or Space deletes. Its attachment images had no
text alternative and now read as "Attachment 1", "Attachment 2" and so on (an attachment has no file name to use). The template
accessibility rules are switched back on for Mailroom, so a new one fails the lint.

## What to check, and where


| Change | Open this on dev | Look for |
| --- | --- | --- |
| Mailroom: keyboard and screen readers ([#2058](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2058)) | Wherever Mailroom's front end is served (or locally, `nx serve mailroom-angular`): the email list and an email with attachments | Tab reaches each delete icon and Enter deletes; each attachment image is read as "Attachment 1", "Attachment 2"... |

---
