---
issue: 3098
app: gisday
title: 'GIS Day admin: a repeated session details email is caught whichever copy of the API it reaches'
testOnDev: |
  | GIS Day admin: the session details email's repeat guard ([#3098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3098)) | Not on dev: GIS Day has no dev site. After release, as an admin open a session with speakers and send its details email, then send it again within ten minutes | The second send emails no one, and each speaker is listed as "already emailed this session's details in the last 10 minutes". Production runs two copies of the API, so try it several times: it must never send twice |
---

### GIS Day admin: a repeated session details email is caught whichever copy of the API it reaches

A session's details email (#3092) is never sent twice to the same speaker within ten minutes, so a repeated request
emails no one again. That guard was kept in each copy of the API's memory, and production runs two copies, so a repeat
that reached the other copy went out again. Each send is now recorded, before it goes, in a table both copies share
(which speaker was sent which session's details, and when), as the profile email's guard already was. A together
email's whole group is guarded at once.

**Before the API is deployed**, the production migration `migrate-prod-3098.ps1` runs
`AddSessionDetailsSends1795448491167`, which adds the one empty table it needs, `session_details_sends`.
([#3098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3098))
