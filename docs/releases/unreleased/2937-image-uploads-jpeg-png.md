---
issue: 2937
title: "GIS Day: image uploads take JPEG and PNG only, so an SVG is refused"
testOnDev: |
  | GIS Day: image uploads take JPEG and PNG only ([#2937](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2937)) | Not on dev: GIS Day has no dev site. After release, as an admin, edit a sponsor on [Sponsors](https://txgisday.org/admin/sponsors) and choose its logo; then do the same for an organization, a place and a speaker | The file picker offers JPEG and PNG files only; a PNG or JPEG logo saves and shows as before; an SVG chosen with **All files** is refused with an error and nothing is saved |
---

### GIS Day: image uploads take JPEG and PNG only, so an SVG is refused

Sponsor, organization and place logos accepted any image, SVG included. Uploads are served from the site's own address, and
an SVG can carry script, so one opened directly would run as the site. Every image upload now takes a JPEG or PNG only:
logos, speaker photos added by an admin, and photos speakers propose themselves. The server judges the file by its content,
not its name, so an SVG renamed to `.png` is refused, and a picture is stored under the extension its content has. The
5 MB limit on each upload is unchanged.

Speaker photos already refused SVG ([#2352](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2352));
they used to take GIF and WebP as well, and now take JPEG and PNG like everything else. The admin forms' file pickers offer
JPEG and PNG files only. Nothing on a page looks different.
([#2937](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2937))
