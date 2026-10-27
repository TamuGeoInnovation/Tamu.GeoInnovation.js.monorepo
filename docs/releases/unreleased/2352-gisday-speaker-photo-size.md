---
issue: 2352
title: Speaker photos are stored at the size the site shows them
testOnDev: |
  | GIS Day: speaker photos are stored at the size they are shown ([#2352](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2352)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, as a GIS Day admin: upload a large photo (a phone photo, several MB) for a speaker in [Admin, then Speakers](https://txgisday.org/admin/speakers), then open [txgisday.org/presenters](https://txgisday.org/presenters) | The photo shows as before, the right way up. In the browser's developer tools, Network, its file is a few hundred KB and its shorter side is 840 px. After the maintainer runs `fit-speaker-photos` on the uploads (a dry run first), Presenters' photos total much less than today's 9.0 MB and look the same |
---

### GIS Day: speaker photos are stored at the size the site shows them

Speaker photos were stored and served exactly as uploaded, so Presenters downloaded 60 photos, 9.0 MB, to draw cards
255 px wide, and five photos were over 500 KB. An uploaded photo is now scaled down until its shorter side is 840 px:
twice the 420 px a presenter's own page draws it at, for sharp screens. It keeps its name and aspect ratio, is
re-encoded (JPEG at quality 80; a PNG with transparency stays a PNG, and an opaque PNG is stored as whichever of JPEG and
PNG is smaller, so a photo is never stored larger than it was uploaded, [#2426](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2426)),
and loses its EXIF metadata, which can hold where a photo was taken, after its EXIF
orientation is applied. Small photos with no metadata are left exactly as they were. WebP, SVG and GIF photos are kept as
they are.

The photos already stored are resized the same way by `nx run gisday-nest:fit-speaker-photos`, in place under the same
names, so no database row changes. It is a dry run unless given `--apply`, which copies the originals aside first. The
maintainer runs it on production's uploads after the release.

On the local stack, eight real photos went from 6.16 MB to 4.29 MB with the page unchanged. Those photos were already
close to the target size; the large ones on production, over 1 MB at camera resolution, shrink much further
([#2352](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2352)).

| Before (6.16 MB of photos) | After (4.29 MB) |
| --- | --- |
| ![Presenters on the local stack, photos as uploaded](../screenshots/2352-gisday-speaker-photo-size/before.png) | ![Presenters on the local stack after fit-speaker-photos: the same page](../screenshots/2352-gisday-speaker-photo-size/after.png) |
