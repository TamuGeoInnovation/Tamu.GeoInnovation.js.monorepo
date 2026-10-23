---
issue: 2119
title: The four front ends are served by nginx 1.30 on a supported Alpine
testOnDev: |
  | The front ends on the new nginx base ([#2119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2119)) | [dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu), then a deep link such as [dev.aggiemap.tamu.edu/map/d/settings](https://dev.aggiemap.tamu.edu/map/d/settings), loaded directly rather than clicked to | Both load, and the map draws as before. In the browser's developer tools, Network, the page's own request has the response header `Server: nginx/1.30.6` (it was `nginx/1.23.2`). geoservices and mailroom take the same base; GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)), so check it on production after the release |
---

### The four front ends are served by nginx 1.30 on a supported Alpine

AggieMap, GIS Day, geoservices and mailroom are served from one shared web server image, `nginx-base`. It
was built in November 2024 on nginx 1.23.2 and Alpine 3.16.3, which is no longer supported and carried 4
critical and 27 high known vulnerabilities, among them curl, OpenSSL 1.1.1, libwebp and HTTP/2 Rapid Reset.
It is now nginx 1.30.6, the current stable line, on Alpine 3.24.3, with none
([#2119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2119),
[nginx-base#1](https://github.com/TamuGeoInnovation/nginx-base/pull/1)). The sites themselves are
unchanged: the same files are served, byte for byte.

The front ends now name the exact base image they are built on
([#2136](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2136)), rather than
whatever was newest, so a change to it is always a deliberate step like this one.
