---
issue: 2559
title: The VGI competition works in a phone's browser, with no install
testOnDev: |
  | GIS Day: the VGI competition in a phone's browser ([#2559](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2559)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, on an iPhone and an Android phone, in Safari or Chrome, not installed: [txgisday.org/app/submission](https://txgisday.org/app/submission), [map](https://txgisday.org/app/map), [leaderboard](https://txgisday.org/app/leaderboard), and the [Monument Trail page](https://txgisday.org/competitions/monuments) | Each page opens after signing in, with no install page. The phone asks for your location the first time only; opening the form again does not ask. Block location for the site, open the form again: it is not asked, and the warning lists the steps for that phone and browser (Safari Websites on an iPhone in Safari, Chrome's own entry on an iPhone in Chrome, the address-bar Permissions in Chrome on Android). Allow it again in the settings, come back and the location is found without reloading. "Add it to your home screen" on the form opens the install page, which still works. At the foot of the Monument Trail rules, above the Project Information Sheet, two buttons: the pre-competition survey, then the submission form; step 2 no longer says to download an app |
---

### GIS Day: the VGI competition works in a phone's browser, with no install

Students had to install the competition app and open it from their home screen before they could
submit, see the map or see the leaderboard: in a browser, every page sent them to the install page,
and on a laptop it could not be opened at all. The competition now works in Safari or Chrome on the
GIS Day website. Installing it is still possible, as a suggestion at the foot of the form. The Monument
Trail page no longer tells anyone to download an app, and ends its rules with a button to the
pre-competition survey and one to the submission form.

The form asks for the location once. It checks first whether the site may already use it: if so, it
does not ask; if the site is blocked, it does not ask again, and it finds the location by itself as
soon as it is allowed. When location is blocked, the form lists the steps for that phone and browser
— which Settings screen to open on an iPhone or iPad in Safari or Chrome, and on Android in Chrome.
([#2559](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2559))

| Before | After |
| --- | --- |
| ![The submission page in a phone's browser sends the student to the install page](../screenshots/vgi-phone-browser/before-submission-sends-to-install.jpg) | ![The submission form opens in a phone's browser](../screenshots/vgi-phone-browser/after-submission-in-browser.jpg) |
| | ![Location blocked: the steps for Chrome on Android, and the optional home-screen link](../screenshots/vgi-phone-browser/after-location-blocked-android-chrome.jpg) |
| | ![The map opens in a phone's browser](../screenshots/vgi-phone-browser/after-map-in-browser.jpg) |
| | ![The install page, now optional](../screenshots/vgi-phone-browser/after-install-optional.jpg) |
| ![The Monument Trail rules end with no way to the survey or the form](../screenshots/vgi-phone-browser/before-monuments-no-buttons.jpg) | ![Buttons to the survey and the submission form above the Project Information Sheet](../screenshots/vgi-phone-browser/after-monuments-buttons.jpg) |
