# Four parking maps' popups (#3808)

Each image opens a popup by its `?feature=<layer>:<object id>` link, on a local production build (`aggiemap-angular:build:production`) served from `dist`, in Playwright, 26 November 2026. The "before" images are of `development`; the "after" images are of this branch. The services are production's.

| Images                 | Layer                                                     | Record                                  |
| ---------------------- | --------------------------------------------------------- | --------------------------------------- |
| `*-motorcycle-spaces`  | Motorcycle Parking spaces                                 | OBJECTID 1316, Ireland Street           |
| `*-maintenance-spaces` | Maintenance Parking spaces                                | OBJECTID 216, Post Office Lot, space 14 |
| `*-maintenance-lots`   | Maintenance Parking lots                                  | lot 94                                  |
| `*-service-spaces`     | Service and Loading Zones spaces                          | OBJECTID 216, the same space            |
| `*-service-lots`       | Service and Loading Zones lots, unchanged, for comparison | lot 94                                  |
| `*-media-lots`         | Media Parking lots                                        | lot 100g                                |
