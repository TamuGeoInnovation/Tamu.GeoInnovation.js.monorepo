---
issue: 3198
app: gisday
title: "GIS Day: a tap anywhere on a phone menu tile follows it, not only on its title"
testOnDev: |
  | GIS Day: the phone menu's tiles are tappable as whole boxes ([#3198](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3198)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on [gisday.tamu.edu](https://gisday.tamu.edu) on a phone, open the menu (the three lines at the top) and tap a tile's icon, or the white space around its words, on Sessions, Presenters, Competitions and Login | Each tap goes where the tile says, as a tap on its words does, and the menu closes; Login signs in. Before, only a tap on the words did anything |
---

### GIS Day: a tap anywhere on a phone menu tile follows it, not only on its title

On a phone, the site's menu shows each choice as a white box with an icon and a title. Only the title's words could be
tapped: a tap on the icon or the space around the words did nothing, so a visitor had to hit a few words in the middle of a
large box ([#3198](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3198)). The whole box is now
the tap target, for the tiles that go to a page (Sessions, Presenters, Competitions, FAQs) and for Login. The tiles that open
a list (About, Account) already worked this way.

The fix is in the shared phone menu, so the other site that uses it (the geoservices documentation's menu) gets it too.

There are no images: the boxes look the same as before, and the change is in where a tap lands, which a still image cannot
show.
