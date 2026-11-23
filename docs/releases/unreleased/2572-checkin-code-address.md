---
issue: 2572
title: "GIS Day: a session's check-in code no longer stays in the page address"
testOnDev: |
  | GIS Day: the check-in code leaves the address ([#2572](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2572)) | Not on dev: GIS Day has no dev site. After release, during a hybrid or virtual session's check-in window, scan its QR code on a phone (or open the link it holds) while signed in; then once more signed out, and sign in when asked | The page says you are checked in, and the address bar shows `/sessions/<id>/checkin` with no `?checkin=`. Going back does not return to an address with the code. Signed out, sign-in comes back to the page and it still checks you in |
---

### GIS Day: a session's check-in code no longer stays in the page address

A hybrid or virtual session's QR code opens its check-in page with the session's code in the address
(`?checkin=<code>`). The address stayed that way, so the code went wherever the address goes: Google Analytics'
page views, the browser's history, and any link someone copied from the address bar after scanning
([#2572](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2572), a follow-up to
[#2560](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2560)).

The page now takes the code out of the address as it loads, before Google's tag is set up and before the app starts,
and keeps it in that browser tab for the check-in page. Checking in works as before, signed out included: sign-in
comes back to the same tab, which still has the code.

The page's Analytics comes from Google's own tag, which records the address it finds when the page loads, so the code
had to be gone before then. Removing it from inside the check-in page, once the app had started, would have been too
late. The code itself is unchanged and still covers the whole session, by design; this only stops it being stored.
