---
issue: 2496
title: The GIS Day poster gallery lists the season's posters
testOnDev: |
  | GIS Day poster gallery ([#2496](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2496)) | GIS Day's dev site, signed out: open `/competitions/posters/gallery`, then choose another season in the list | The accepted posters of the season appear, each with its title, its authors and a **View Full Poster** link; a season with none says "No posters yet." |
---

### The GIS Day poster gallery lists the season's posters

The public poster gallery showed nothing. It asked for `GET /user-submissions/posters`, and the server read `posters`
as the `:guid` of a route that needs a login, so every visitor got a 401
([#2496](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2496)). That route now exists and is
public. It returns only a poster's title, its authors' names, its link and the year: never an email, a student id, the
owner's account or the reviewer's message. The gallery has a season list, opens on the active season, and says so when a
season has no posters or the posters cannot be loaded. It shows the authors where it showed the abstract.

New tests start a real server to check that the route needs no login, rejects a season that is not a GUID, and sends
nothing private; the gallery has a component test.

| Before: signed out | After: 2025, with the season list |
| --- | --- |
| ![The gallery's heading and vote button, and nothing else](../screenshots/2496-poster-gallery/before-gallery.png) | ![The 2025 posters listed, each with a View Full Poster button](../screenshots/2496-poster-gallery/after-gallery-2025.png) |
