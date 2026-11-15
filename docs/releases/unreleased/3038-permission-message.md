---
issue: 3038
title: "GIS Day admin: a dashboard refused for a missing permission names the permission, instead of saying to try again"
testOnDev: |
  | GIS Day admin: a refused dashboard names the missing permission ([#3038](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3038)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > Check-ins on txgisday.org](https://txgisday.org/admin/dashboards/check-ins), then RSVPs and User accounts | Each loads as before. An account without the page's permission (`read:checkins`, `read:rsvps` or `read:users`) is told which one it lacks and to sign out and back in once an administrator adds it in Auth0, not "Try again in a moment"; a failure that is not a refusal still says to try again |
---

### GIS Day admin: a dashboard refused for a missing permission names the permission

On 15 November 2026 the new Check-ins dashboard said "The check-ins could not be read. Try again in a moment." on
production. The API had refused it with a 403, because the `read:checkins` permission had never been defined in Auth0,
so trying again could never help, and nothing on the page pointed at the cause. When the API refuses an admin
dashboard (Check-ins, RSVPs or User accounts) for a missing permission, the page now says which permission
the account lacks and that an administrator adds it in Auth0, then to sign out and back in. A run-out sign-in (401) says
to sign in again; any other failure still says to try again in a moment. The API's refusal now names the permission it
checked for.
([#3038](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3038))

Captured on a local copy of the site with made-up people, for the 2025 season, at 1280 px. The local test admin has
every permission, so **the 403 was simulated in the browser**: the request still reached the local API, which answered
200, and the page was handed a 403 in the API's own body shape, as each version's permission check sends it (before: a
bare `Forbidden`; after: the message naming `read:checkins`). The site header is masked.

| Before | After |
| --- | --- |
| ![Check-ins dashboard, 2025, refused with a simulated 403: "The check-ins could not be read. Try again in a moment."](../screenshots/3038-permission-message/before-check-ins-403.png) | ![The same simulated 403 after the change: "Your account doesn't have the permission this needs: read:checkins. An administrator gives it in Auth0 (on the API and the admin role); then sign out and sign back in."](../screenshots/3038-permission-message/after-check-ins-403.png) |
