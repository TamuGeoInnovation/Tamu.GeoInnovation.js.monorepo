---
issue: 2320
title: GIS Day's Admin → Users lists every account, not only the first 50
testOnDev: |
  | GIS Day: Admin, then Users ([#2320](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2320)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)), and the development tenant has only 3 accounts. On production after release, as a GIS Day admin: [txgisday.org/admin/users](https://txgisday.org/admin/users) | The list says how many users it displays. If production has more than 50 accounts, the count is over 50 and the list runs past the 50th name, still sorted by name. No error in the page |
---

### GIS Day: Admin → Users lists every account

The admin **Users** list asked the sign-in service for one page of accounts and stopped there, so once GIS Day
had more than 50 accounts, the list ended at the 50th name, sorted by name, with nothing to say it was cut
short. It now reads every page, still sorted by name. The sign-in service itself lists at most the first 1,000
accounts this way, far above GIS Day's numbers. ([#2320](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2320))
