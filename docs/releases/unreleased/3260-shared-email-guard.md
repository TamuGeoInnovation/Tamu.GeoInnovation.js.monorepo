---
issue: 3260
app: gisday
title: 'GIS Day admin: a repeated Ask to judge or Ask for slides email is caught whichever copy of the API it reaches'
testOnDev: |
  | GIS Day admin: one repeat guard for every session email ([#3260](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3260)) | Not on dev: GIS Day has no dev site. After release, as an admin open a judged session with judges and send its Ask to judge email twice within ten minutes; then do the same with Ask for slides on a session with speakers | The second send emails no one, and each person is listed as "already asked ... in the last 10 minutes". Production runs two copies of the API, so try it several times: it must never send twice. Sending a speaker the session details just after asking them for slides still goes: each email has its own guard |
---

### GIS Day admin: a repeated Ask to judge or Ask for slides email is caught whichever copy of the API it reaches

The Ask to judge and Ask for slides emails, like the session details email, never go to the same person about the same
session twice within ten minutes. Their guard was kept in each copy of the API's memory, and production runs two, so a
repeat that reached the other copy went out again. All three emails now claim each send, before it goes, in one table
both copies share (which email, which session, which person, and when), so two sends racing in either copy agree on
which goes. The session details email's own table from
[#3098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3098) is folded into it.

**Before the API is deployed**, the production migration runs `AddSpeakerEmailClaims1795459774518`, which adds
`speaker_email_claims` and copies `session_details_sends` into it. It only adds: `session_details_sends` stays, unused by
the new API, so the API before this keeps working once it has run, and can be rolled back to. A later migration drops
it ([#3269](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3269)).
([#3260](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3260))
