---
issue: 2164
title: The app reviews each VGI submission as it arrives, and admins look only at what it leaves them and at the top finishers
testOnDev: |
  | GIS Day: automatic review of VGI submissions ([#2164](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2164)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, as a GIS Day admin: [Admin, Competitions, Submissions](https://txgisday.org/admin/competitions/submissions) | Three buttons: All, Needs a look and Top finishers. A new submission with a photo, a name, and a precise location on campus shows "Verified by app"; one without a photo, or far from campus, shows under Needs a look with the reason. Top finishers lists the submissions of everyone in the top three places |
---

### GIS Day: the app reviews each VGI submission as it arrives

In 2025, 167 of 195 competition submissions were never reviewed, and the rules award prizes on verified points.
Now the app reviews each submission as it is saved. It marks one **verified** when it has a photo, a name, a
location on Texas A&M property in Brazos County that the phone placed to within 15 meters, is not something the
same participant already submitted, and is not one of ten or more in two minutes. Anything else stays unverified,
with the reason. An admin can still verify or discard any submission, and their decision wins.

The admin **Submissions** page now has three views: **All**; **Needs a look**, what the app left for a person,
each with its reason; and **Top finishers**, everyone in the top three places, so their photographs and names can
be checked before prizes are awarded. The list also shows the name typed on each submission, and "Verified by app"
where the app verified it. Submissions made before this release keep their status.
([#2164](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2164))

| Before | After |
| --- | --- |
| ![The list, with no reasons and no views](../screenshots/2164-automatic-review/before-submissions.jpg) | ![Needs a look: four test submissions, each with its reason](../screenshots/2164-automatic-review/after-needs-a-look.jpg) |
| | ![Top finishers, including one verified by the app](../screenshots/2164-automatic-review/after-top-finishers.jpg) |
