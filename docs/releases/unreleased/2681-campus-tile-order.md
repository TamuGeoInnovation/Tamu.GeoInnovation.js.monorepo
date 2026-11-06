---
issue: 2681
title: The campus map tiles read in alphabetical order
testOnDev: |
  | Campus tiles ([#2681](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2681)) | [Campus Maps on dev](https://dev.aggiemap.tamu.edu/all-maps/campus), and the Campus Maps section of [All Maps](https://dev.aggiemap.tamu.edu/all-maps) | Read the tiles **across** each row: DC / Bush School, Fort Worth Law School, Galveston, then Houston Space Institute, HSC College of Dentistry, HSC Corpus Christi, and so on to McAllen. Before this they ran alphabetically *down* each column, so the first row was DC / Bush School, HSC College of Dentistry, HSC Round Rock. Narrow the window to a phone width: one column, same order |
---

### The campus map tiles read in alphabetical order

The campus maps were sorted alphabetically and did not look it. The sorted list was cut into three
equal pieces and the pieces were put side by side, so the order ran **down** each column while a
reader runs **across** each row - and the first row read DC / Bush School, HSC College of Dentistry,
HSC Round Rock.

They now flow across the rows, and on a phone, where there is only one column, they are simply the
list. One order, read the same way at every width.

| Before, on production | After |
| --- | --- |
| ![The campus tiles with the first row reading DC / Bush School, HSC College of Dentistry, HSC Round Rock](../screenshots/2681-campus-tile-order/before-prod-campus.jpg) | ![The campus tiles with the first row reading DC / Bush School, Fort Worth Law School, Galveston](../screenshots/2681-campus-tile-order/after-built-campus.jpg) |
