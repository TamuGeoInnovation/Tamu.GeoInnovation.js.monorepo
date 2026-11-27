---
issue: 3747
app: gisday
title: The accounts dashboard says when the sign-in service is busy, and for how long
testOnDev: |
  | Accounts dashboard when Auth0 is busy ([#3747](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3747)) | GIS Day dev site: Admin > Dashboards > User accounts | Opens and shows the counts as before. Auth0's rate limit cannot be forced on purpose; if it is hit (several admin pages opened quickly, Users included), the page says the counts are temporarily unavailable and how many seconds to wait, not that they could not be read |
---

### The accounts dashboard says when the sign-in service is busy, and for how long

When Auth0 limited how often accounts could be read, **Admin > Dashboards > User accounts** got a server error and said
only that the accounts could not be read. It now says the account counts are temporarily unavailable and how many seconds
to wait, which Auth0 itself gives.
([#3747](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3747))

| Before                                                                                                                           | After                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![The dashboard saying the accounts could not be read](../screenshots/3747-accounts-dashboard-rate-limit/before-unavailable.png) | ![The dashboard saying the counts are temporarily unavailable, try again in 12 seconds](../screenshots/3747-accounts-dashboard-rate-limit/after-unavailable.png) |
