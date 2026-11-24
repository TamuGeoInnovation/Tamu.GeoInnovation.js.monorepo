---
issue: 2956
app: gisday
title: "GIS Day: a speaker's own page shows their photo full size, with the school banner and class year"
testOnDev: |
  | GIS Day: the photo on a speaker's own page ([#2956](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2956)) | Not on dev: GIS Day has no dev site. After release, on [Texas A&M's Speakers page](https://gisday.tamu.edu/admin/speakers) select yourself, choose **Send profile email**, and open the link | Your photo is a full-size square, as on the admin speaker form, with your school and class year across its corner (for example TAMU '18); changing University or Graduation year changes the banner at once, and choosing a new photo shows it in the same box |
---

### GIS Day: a speaker's own page shows their photo full size, with the school banner and class year

On the page a speaker reaches from their profile email, the photo was a small circle beside **Choose a photo**. It is
now shown as the admin speaker form shows it, with the same shared components: full size, at the size of a presenter's
card, with the school banner and class year across its corner. The banner follows the University and Graduation year
chosen on the page as they change, so a speaker sees the result before sending it. A speaker with no photo sees the
person icon, with no banner over it.
([#2956](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2956))

| Before | After | After choosing another university and year |
| --- | --- | --- |
| ![The photo as a small circle beside Choose a photo](../screenshots/2956-speaker-edit-photo/before.png) | ![The photo full size with a TXST '02 banner](../screenshots/2956-speaker-edit-photo/after.png) | ![The banner now reads TAMU '18](../screenshots/2956-speaker-edit-photo/after-other-choice.png) |
