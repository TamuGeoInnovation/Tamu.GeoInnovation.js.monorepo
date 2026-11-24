---
issue: 3168
app: gisday
title: "GIS Day: The VGI leaderboard names participants by a masked email, for everyone"
testOnDev: |
  | GIS Day: masked emails on the VGI leaderboard ([#3168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3168)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [the leaderboard](https://txgisday.org/app/leaderboard), then as a student | Each participant reads like `jsm****@tamu.edu`, the same for admins and students; your own row still says **You**; an admin clicking a row still opens that person's finds on the map |
---

### GIS Day: The VGI leaderboard names participants by a masked email, for everyone

The competition's leaderboard showed admins and managers every participant's full email address, so anyone who saw an
organizer's screen, projected or shared, saw students' emails. Students saw the last four characters of an account id,
which told nobody anything. Everyone now sees the first few letters of each email, then `****@` and the domain, such as
`jsm****@tamu.edu`. The server masks it, so a full address is never sent to anyone's browser. Your own row still says
**You**, and an admin can still click a row to see that person's finds on the map.
([#3168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3168))

| Before | After |
| --- | --- |
| ![What the API named participants as: the last characters of an account id for students, the full email for admins](../screenshots/3168-leaderboard-masked-emails/before-api-names.jpg) | ![What the API names participants as now: the masked email, for students and admins alike](../screenshots/3168-leaderboard-masked-emails/after-api-names.jpg) |
