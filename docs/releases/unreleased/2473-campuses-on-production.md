---
issue: 2473
title: Every satellite campus map is listed on production
testOnDev: |
  | Campus maps on production ([#2473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2473)) | On dev: [all campus maps](https://dev.aggiemap.tamu.edu/all-maps/campus), then the same page with [`?as=production`](https://dev.aggiemap.tamu.edu/all-maps/campus?as=production) | **Nine campuses in both lists.** Before this, the first listed nine and the second three. The nine are Galveston, McAllen, DC / Bush School, Fort Worth Law School, Houston Space Institute, Mays City Center, HSC Round Rock, HSC Kingsville and HSC Corpus Christi. Open one of the six that were hidden and check it draws and that its building search finds something |
---

### Every satellite campus map is listed on production

Six campus maps were listed on development only, each waiting for someone to say it was ready: Fort Worth
Law School, Houston Space Institute, Mays City Center, HSC Round Rock, HSC Kingsville and HSC Corpus
Christi. All of them are live now, so **nine campus maps are listed on both environments** where three
were.

Nothing about the maps themselves changed. Their services were already on the production GIS server and
already public; the flag only decided whether the All Maps page listed them. The general map search still
leaves every satellite campus out on both environments, which is deliberate.
