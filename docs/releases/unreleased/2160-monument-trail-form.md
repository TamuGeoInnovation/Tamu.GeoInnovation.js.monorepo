---
issue: 2160
title: The 2026 Monument Trail Challenge asks for monuments, memorial markers and memorial plaques, and the name on each
testOnDev: |
  | GIS Day: the Monument Trail Challenge page and form ([#2160](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2160)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org/competitions/monuments](https://txgisday.org/competitions/monuments), then, as a GIS Day admin, [Admin, Competitions, Designer](https://txgisday.org/admin/competitions/designer) | The page lists monuments, memorial markers and memorial plaques on trees and benches, with an entry for each under Examples. In the Designer, loading `https://txgisday.org/assets/competitions/2026-monument-trail.json` gives two questions, "What did you find?" with the three types and "Name on the plaque or marker, or the monument's name"; set the first as the type question and save. The [competitions app](https://txgisday.org/app) then asks both |
---

### GIS Day: the 2026 Monument Trail Challenge asks for monuments, memorial markers and memorial plaques

This year's VGI competition covers monuments, memorial markers and memorial plaques on trees and
benches, and no art. Its page listed only tree and bench plaques under "in search of", and the
competition was still using 2025's art form, which asked "Select the type of art installation".

- **The page** lists all three, with an entry for each under *Examples of Submissions*, and asks for a
  photo in which the name on the plaque or marker can be read.
- **A 2026 form** is now part of the GIS Day site, at `/assets/competitions/2026-monument-trail.json`,
  rather than in a personal Gist. It asks what was found (monument, memorial marker, or tree or bench
  memorial plaque) and the name on it. The name is what lets the Office of the University Architect
  match each find to its memorial inventory, and it is what later scoring uses to tell neighbouring
  plaques apart.

**One step after release:** an admin loads that form in **Admin, Competitions, Designer**, sets "What did
you find?" as the type question, and saves. Until then the competition keeps the 2025 form.
([#2160](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2160))

| Before | After |
| --- | --- |
| ![The page lists only plaques for trees and benches](../screenshots/2160-monument-trail-form/before-details-page.jpg) | ![The page lists monuments, memorial markers and memorial plaques, and asks for the name](../screenshots/2160-monument-trail-form/after-details-page.jpg) |
| | ![Examples for monuments, memorial markers and memorial plaques](../screenshots/2160-monument-trail-form/after-examples.jpg) |
