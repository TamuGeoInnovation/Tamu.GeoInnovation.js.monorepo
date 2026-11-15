---
issue: 2884
title: "GIS Day: signed-in visitors get the Account card in the phone menu again"
testOnDev: |
  | GIS Day: the Account card in the phone menu ([#2884](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2884)) | Not on dev: GIS Day has no dev site. After release, on a phone (or a browser narrower than the menu), sign in on [gisday.tamu.edu](https://gisday.tamu.edu), then open the menu | An **Account** card after About, opening Profile, Classes, Checkins and Logout; Profile opens My Details. Signed out, the card is **Login** instead |
---

### GIS Day: signed-in visitors get the Account card in the phone menu again

On a phone, a signed-in visitor who opened the menu found no **Account** card, and so had no way to their profile,
classes, check-ins or Logout. The card is back on every GIS Day site. It had been missing since the Angular 20 upgrade
of 5 October 2026, whose conversion of the templates left the card nested where the menu does not look for it.
([#2884](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2884))

| Before | After |
| --- | --- |
| ![The phone menu signed in, with no Account card](../screenshots/mobile-account-tile/phone-menu-before.png) | ![The phone menu signed in, with an Account card after About](../screenshots/mobile-account-tile/phone-menu-after.png) |

![The Account card opened: Profile, Classes, Checkins and Logout](../screenshots/mobile-account-tile/phone-account-submenu-after.png)
