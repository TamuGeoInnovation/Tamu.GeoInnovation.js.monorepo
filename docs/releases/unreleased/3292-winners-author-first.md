---
issue: 3292
app: gisday
title: The Winners page offers each entry by its main author first
testOnDev: |
  | GIS Day: the Winners page's entries, author first ([#3292](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3292)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production, as an admin: Admin, Research Competition, Winners | Each place's box lists an entry as "Main author - Title (with Others)"; an entry with a long title still shows whose it is, and one with a single person has no "with" |
---

### GIS Day: The Winners page offers each entry by its main author first

On the admin Winners page, each place's box listed an entry as its title and then its people in brackets, so a long
title pushed the names off the end of the box and an admin could not see whose entry it was. Each entry now reads
**Main author - Title (with Others)**, so the name an admin is looking for comes first.
([#3292](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3292))

| Desktop, 1280 pixels | Before | After |
| --- | --- | --- |
| A competition's 1st place, its entries shown | ![The long entry's title fills the box and its third name is cut off](../screenshots/3292-winners-author-first/before-winners-dropdown.png) | ![Each entry starts with its main author](../screenshots/3292-winners-author-first/after-winners-dropdown.png) |
| Phone, 390 pixels | | ![The same on a phone: each entry starts with its main author](../screenshots/3292-winners-author-first/after-winners-dropdown-phone.png) |

The boxes are drop-downs; the images show their options drawn as a list in the page, as a browser does when a drop-down
is given a height, because an open drop-down is drawn by the system and cannot be captured. The entries and people are
made up.
