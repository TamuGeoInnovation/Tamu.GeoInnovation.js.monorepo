# GIS Day handover from `work` to `home`, 6:05 AM Central, 23 October 2026

Written by the GIS Day chat on the work machine when the maintainer made `home` the director. The AggieMap chat on
this machine owns `work/STATUS.md` and is running batch 22; this file does not touch it. Everything below is also
on the issues and pull requests named.

## Waiting on the maintainer right now

1. **Release `sha-8ee8c6e` (site and API), both sites, UCGIS first.** Images published 22 October; GIS Day E2E passed
   on `8ee8c6e`. Carries #2105 (show or hide sessions from the admin Events list, new `PATCH /events/active`),
   #2102 (the Copy page shows "Applying…" and what it is doing; files fetched 4 at a time) and #2104 (names keep
   their g, j, p and y). No migration. Rollback targets in both namespaces: **gisday-nest `sha-1c5b5a7`,
   gisday-angular `sha-c224856`**. The commands were given in chat, in this order:
   `kubectl -n gisday-ucgis set image deployment/gisday-nest gisday-nest=ghcr.io/tamugeoinnovation/gisday-nest:sha-8ee8c6e`,
   rollout status, the same for `gisday-angular`, then the same two in `-n gisday`.
   **Not known yet whether he ran them.** After it: check all four addresses (txgisday.org, gisday.tamu.edu,
   tamu.txgisday.org, gisday.ucgis.org), try the Active box on txgisday.org/admin/events, and open a
   kubernetes-config PR recording `sha-8ee8c6e` for both images in both namespaces (the deployment files'
   comments follow the earlier records; digests: angular `sha256:f2639a4b81cd`, nest `sha256:6b033a8f151b`).
2. **Merge kubernetes-config #67**, the record of gisday-angular `sha-c224856` (live on both sites since 22 October).

## Done on 22 October (for the record)

- Texas A&M GIS Day live at gisday.tamu.edu and tamu.txgisday.org; txgisday.org unchanged (#2012, #2071).
- tamu.txgisday.org's CORS fixed in the `gisday` ConfigMap's `ORIGINS` (#2087, closed; kubernetes-config #56).
- UCGIS: site and API live, certificate issued, **pre-loaded from txgisday.org's 2026 season with the site copy**
  (#2078). Do **not** create its season by hand. `create:assets` was added to the production Auth0 GIS Day API
  and GIS Day Admin role for the import.
- Data scripts in kubernetes-config `6. GIS Day/data/` (#61): MSC rooms moved (#2095, closed) and Texas A&M
  affiliations collapsed (#2096, closed), on txgisday.org and carried to UCGIS.

## Open GIS Day issues (priority)

#2088 each address calls its own API, so new addresses need no `ORIGINS` change (Medium) · #2079 sub-admins per
organization (Medium) · #2072 txgisday.org as a landing page for each organization's site (Medium) · #2084 Texas
A&M tab icon (Low) · #2097 production's leftover `organization_links` table (Low) · #2067 the pre-push check
skips production budgets (High, workspace) · #2012's next part: Texas A&M's site showing only Texas A&M's events.
Older: #2024 footer links, #1474 GIS Day half, #2057.

## Local state on the work machine

- Worktrees for merged work, safe to remove: `C:\TAMU\wt-2090`, `wt-2092`, `wt-2093`, `wt-2103`.
- `gisday-dev` serves `wt-2092`'s local build on 4201 against `gisday-api` (the local copy of production's data).
  The local database `gisday-empty` (built from the migrations, holding an imported 2026) was used for testing.
- Lesson recorded: a production build of gisday-angular overwrites the local build in `dist`, and a served local
  site then cannot sign in. Take local photos before production-building.
