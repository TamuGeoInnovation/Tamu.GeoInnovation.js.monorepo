---
issue: 2246
title: Popup photos open full screen with GLightbox, without lightGallery's licence error
testOnDev: |
  | Popup photos open full screen ([#2246](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2246)) | [dev.aggiemap.tamu.edu/map](https://dev.aggiemap.tamu.edu/map) | Search for *Aggie Ring Statue* and open its popup; click a photo: it opens full screen over a dark backdrop, the arrow keys (or a swipe on a phone) move between photos, and Escape closes it. The browser console shows no *license key* error. The same in a bonfire popup (e.g. *History Walk*) |
---

### Popup photos open full screen with GLightbox

Clicking a photo in a building or bonfire popup still opens it full screen, now with GLightbox (MIT) instead of
lightGallery, which is licensed GPLv3 or commercially and logged *"license key is not valid for production use"* on
every gallery. The carousel in the popup is unchanged. The full-screen view no longer shows a *1 / 3* counter or a
download button, and arrow keys, swipes and Escape work as before. The two popups now share one photo carousel
instead of two copies of the same code.
([#2246](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2246))

| Before | After |
| --- | --- |
| ![The Aggie Ring Statue photo full screen in lightGallery](../screenshots/glightbox/before-poi-fullscreen.png) | ![The same photo full screen in GLightbox](../screenshots/glightbox/after-poi-fullscreen.png) |
| ![A bonfire popup's photo full screen on a phone, lightGallery](../screenshots/glightbox/before-phone-bonfire-fullscreen.png) | ![The same on a phone, GLightbox](../screenshots/glightbox/after-phone-bonfire-fullscreen.png) |
