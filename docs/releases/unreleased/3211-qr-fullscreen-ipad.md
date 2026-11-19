---
issue: 3211
title: "GIS Day: The check-in QR code's Full screen works on an iPad"
testOnDev: |
  | GIS Day: QR code full screen on an iPad ([#3211](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3211)) | Not on dev: GIS Day has no dev site. After release, sign in as an organizer on an iPad, open a session's page on [txgisday.org](https://txgisday.org/sessions), show its check-in QR code and press **Full screen** | The code fills the screen, or on an iPad that has no full screen for a page, the whole window, white with its caption under it; **Exit full screen** brings the page back. Also try an iPhone and a laptop |
---

### GIS Day: The check-in QR code's Full screen works on an iPad

Pressing **Full screen** under a session's check-in QR code did nothing on an iPad, so an organizer could not hold up
or project the code from one. Safari on an iPad before iPadOS 16.4 offers full screen for a page only under an older
name, and on an iPhone not at all, and the button asked only for the standard one. It now asks for whichever the
browser has, and where it has neither, or refuses, the code fills the browser window instead, white with its caption
under it. **Exit full screen** leaves either.
([#3211](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3211))

| Before                                                                                                                                                            | After                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![On an iPad-sized window with no full screen, Full screen pressed and the page unchanged](../screenshots/3211-qr-fullscreen-ipad/before-full-screen-pressed.jpg) | ![The same window after the change: the code fills it, with its caption and Exit full screen](../screenshots/3211-qr-fullscreen-ipad/after-full-screen-pressed.jpg) |
