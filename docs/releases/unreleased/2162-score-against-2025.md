---
issue: 2162
title: The 2026 VGI competition scores a memorial already documented in 2025 as 1 point, and tells neighbouring plaques apart by name
testOnDev: |
  | GIS Day: Monument Trail scoring ([#2162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2162)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org/competitions/monuments](https://txgisday.org/competitions/monuments), then, as a GIS Day admin, [Admin, Competitions, Designer](https://txgisday.org/admin/competitions/designer) and [Leaderboard](https://txgisday.org/admin/competitions/leaderboard) | "How Competition Points Work" gives the plaque, monument and memorial marker rules. In the Designer, load `https://txgisday.org/assets/competitions/2026-monument-trail.json` again, tick "What did you find?" as the type question, retype any title or instructions an admin had changed, and save: that stores the scoring rules with the form. Once students submit, a plaque at a spot documented in 2025 scores 1, and two plaques a few metres apart with different names score 2 each |
---

### GIS Day: the 2026 VGI competition scores a memorial already documented in 2025 as 1 point

The 2026 Monument Trail Challenge gives 2 points for a new find and 1 for one already found, and "already
found" now includes the 2025 competition: every 2025 submission that was not discarded, verified or not
reviewed. 2025's statues and monuments count for monuments, its tree and bench plaques for plaques, and its
art not at all.

Plaques sit close together (half of 2025's are within 4.5 meters of another), so 15 meters, the distance
used until now, would have scored most new plaques as already found. A plaque now counts as already found
only within 10 meters of an earlier one **with the same name**, or within 3 meters of a 2025 plaque, which
has no name. Names are compared ignoring case, punctuation, a small typing mistake and a plaque's own
wording, such as "In loving memory of". Monuments and memorial markers keep 15 meters.

The rules live in the 2026 form file, beside each answer, rather than in the code, so another year can set
its own. **After release, an admin loads the 2026 form in the Designer again and saves it**, as for
[#2160](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2160); until then,
scoring works as before. Loading a form resets every question's title and instructions to the file's, so any
wording an admin typed into the Designer since has to be typed again before saving. Releasing #2160 and this
together needs the load only once.

Whatever names they type, a participant's own second submission of the same type close to their first scores 1,
so nobody scores twice at one plaque by retyping its name. A name made only of a plaque's wording ("In loving
memory", "Dr."), or in a script other than Latin letters, counts as no name, and that plaque is judged by distance.
([#2162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2162))

| Before | After |
| --- | --- |
| ![One rule, 15 meters, for every type](../screenshots/2162-score-against-2025/before-points-rules.jpg) | ![A rule for plaques, monuments and markers, and 2025's finds counted](../screenshots/2162-score-against-2025/after-points-rules.jpg) |
| | ![Six test submissions around real 2025 finds, scored locally](../screenshots/2162-score-against-2025/after-leaderboard-local.jpg) |
