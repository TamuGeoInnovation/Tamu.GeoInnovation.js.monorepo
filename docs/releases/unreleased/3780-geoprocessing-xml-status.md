---
issue: 3780
app: geoservices
title: Geoservices' XML answers with status 200 succeed instead of being reported as errors
testOnDev: |
  | Geoservices: XML answers ([#3780](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3780)) | Not checkable on dev by a page: it is in `geoprocessing-core`'s response parsing, which `geoservices-nest` uses. Call any geoprocessing endpoint that answers in XML, against the build this ships in | A status-200 XML answer is returned as a result, not thrown as an error with a NaN status code. Covered by `geoprocessing-core`'s tests |
---

### Geoservices' XML answers with status 200 succeed instead of being reported as errors

`geoprocessing-core` read an XML answer's status code with a pattern that took the whole match rather than the code. So every XML
answer, a 200 included, came out as "NaN" and was thrown as an error. CodeQL flagged the same pattern because a crafted input
could make it run for seconds (3.3 s on the test input). The code is now read by position, in linear time, and **XML answers that
should succeed now do.** Anything that called these endpoints and expected the old error will get a result instead.
([#3780](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3780), part of [#3776](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3776))
