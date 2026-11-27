# Maintenance and service parking, before and after (#3824)

Each image is the map at the moment it finished drawing, from a local production build of `development` (`before-*`) and of this change (`after-*`), against production's services, on 26 November 2026. The maps look the same: the same 427 service and loading spaces are drawn. The difference is when the picture could be taken.

| Map                       | Before: finished drawing | After  |
| ------------------------- | ------------------------ | ------ |
| Maintenance Parking       | 115.6 s                  | 22.0 s |
| Service and Loading Zones | 125.8 s                  | 17.0 s |

Every load's timing is in `docs/build-times.md`, under "Maintenance and service parking load only their own spaces". A football notice in an "after" image appears because that map finished drawing while the notice was still showing.
