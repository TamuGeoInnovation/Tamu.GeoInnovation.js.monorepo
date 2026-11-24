# Adding another organization's GIS Day site

The checklist for adding a GIS Day site for another organization, from its definition in code to its own address,
written from what was done for UCGIS's site, gisday.ucgis.org
([#1837](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1837),
[#1843](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1843)). Every site runs the same two
images, `gisday-angular` and `gisday-nest`; what makes one site differ from another is its entry in
[`libs/gisday/common/src/lib/sites.ts`](../libs/gisday/common/src/lib/sites.ts) and the settings of its own deployments.

A step marked **unconfirmed** is one no record here shows being done that way for UCGIS; confirm it before relying on
it, and fix this page when you do.

## Decided once, for every site (16 October 2026)

From [#1837's deployment decisions](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1837#issuecomment-6228599077):

- **Its own database**, on the existing production SQL Server, beside txgisday.org's, with a login that can reach only
  that database. A shared database with a site column was rejected (one missed filter would expose another
  organization's attendees), and so was a separate server per site (more to license, patch and back up).
- **Its own uploads volume and its own Redis**, so the sites' files and the APIs' job queues never mix.
- **Its own Auth0 application** in the same Auth0 tenant, its own `MAILROOM_TO`, its own `ANGULAR_SITE` and
  `GISDAY_SITE`, and an ingress for its address.
- **Before launch, the organization agrees** who hosts its members' data and whose privacy policy applies.
- Cluster and database commands are run by the maintainer.

A second address for an existing site is different and much smaller: Texas A&M's site is txgisday.org's deployment
answering for `gisday.tamu.edu` and `tamu.txgisday.org` (`hosts` in `sites.ts`, #2012). That needs no new database
or deployment, only the entry's `hosts`, an ingress rule and Auth0's allowed addresses.

## 1. Define the site in code

In [`libs/gisday/common/src/lib/sites.ts`](../libs/gisday/common/src/lib/sites.ts), add an entry to `GISDAY_SITES`
under a short key (UCGIS's is `ucgis`). The `GisdaySite` interface documents each field; the ones every site sets:

| Field | What it is | UCGIS |
| --- | --- | --- |
| `name` | In the header, on the homepage and in the tab | `UCGIS GIS Day` |
| `logo`, `banner`, `favicon` | Images, relative to the front end's root | `assets/images/sites/ucgis/...` |
| `owner` | The footer's copyright line | University Consortium for Geographic Information Science |
| `address` | The site's own address, which link previews name ([#2649](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2649)) | `https://gisday.ucgis.org` |
| `description`, `preview` | A link preview's sentence and its 1200 × 630 image (#2649) | |
| `off` | The features it leaves out (`GisdayFeature`) | `competitions`, `faq`, `sponsors`, `classes`, `checkIns`, `pastYears`, `tamu`, `tamuLinks` |

And where they apply: `contact` (who people write to, [#2077](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2077)),
`signInWith` and `signInNote` (sign in straight through the organization's own Auth0 connection, as UCGIS does with
Tradewing, [#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575),
[#2662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2662)), `hosts`, `brand` and
`sessionsFrom` (which organizations' sessions it lists, [#2142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2142)).

Then:

- **The images** go in `apps/gisday-angular/src/assets/images/sites/<key>/`. UCGIS's came from its own websites.
- **The link-preview page** is made by the build: `apps/gisday-angular/scripts/site-pages.ts` writes
  `index.<key>.html` for every site and the nginx `map` from each site's addresses to its page. Nothing to add by hand.
- **An end-to-end spec** that opens the app as the site and checks it shows what it should and leaves out what it
  should: [`test/e2e/gisday/ucgis-site.spec.ts`](../test/e2e/gisday/ucgis-site.spec.ts), with `asSite(page, '<key>')`
  from `test/e2e/gisday/site.ts`.
- **The smoke check of link previews** names each site's title: add the address to `SITE_NAMES` in
  [`test/smoke/gisday/smoke.spec.ts`](../test/smoke/gisday/smoke.spec.ts).
- **Look at it locally**, with `scripts/gisday-local.sh web --site <key>`
  ([`docs/gisday-local.md`](gisday-local.md#another-organizations-site)).

## 2. The database

In kubernetes-config, `6. GIS Day/ucgis/04-create-database.ps1` and `04-database-schema.sql`:

- The script creates the database and a login that can reach only it, saving the login's generated password for the
  next step, and builds the tables in one transaction, rehearsed first inside a transaction that is rolled back.
- **The tables come from a schema file, not `migration:run`.** `04-database-schema.sql` is every migration in
  `apps/gisday-nest/src/database/migrations`, in order, at a named commit, and the script records each in
  `typeorm_migrations` as `migration:run` would. A new site's file is regenerated from the migrations of the commit it
  deploys; it is never edited by hand.
- **From then on every migration runs on every site's database.** kubernetes-config's production migration and data
  scripts run both namespaces by default (`gisday`, then `gisday-ucgis`), each in its own transaction; a new site's
  namespace has to be added to them. See [`docs/gisday-migrations.md`](gisday-migrations.md). **Unconfirmed:** how a
  third namespace is added to those scripts; read their parameters before the first migration after the site exists.

## 3. Auth0

- **The site's own application** in the same tenant as txgisday.org's, its allowed callback, logout and web-origin
  addresses being the new site's address. The site's `07-site.configmap.yaml` names it. **Unconfirmed:** the exact
  settings used for UCGIS's application; Auth0 holds them.
- **The API's audience** is the same as txgisday.org's API (`06-api.configmap.yaml` says so).
- **Organizers** need accounts in the tenant with the organizer role until the organization's own sign-in is connected
  (decision 4). An organization with its own identity provider, as UCGIS has with Tradewing, is connected as an Auth0
  connection, named in the site's `signInWith` (#2575).

## 4. The cluster

kubernetes-config's `6. GIS Day/ucgis/` is the whole of UCGIS's deployment, one file a step, applied in order. A new
site copies the folder under its own name and changes what each file marks as UCGIS's:

| File | What it does |
| --- | --- |
| `01-namespace.yaml` | The site's own namespace, so its names cannot clash with or reach the other sites' |
| `02-copy-ghcr-secret.ps1` | Copies the registry pull secret into the namespace, so it can pull the images |
| `03-volume.yaml` | Its own uploads volume (ReadWriteMany, so both copies of the site and of the API can use it) |
| `04-create-database.ps1`, `04-database-schema.sql` | Step 2 |
| `05-create-api-secret.ps1` | The API's secret settings (the database login and the rest); the script writes names only, never values |
| `06-api.configmap.yaml` | The API's other settings, txgisday.org's except where marked: `GISDAY_SITE`, `ORIGINS`, `MAILROOM_TO` |
| `07-site.configmap.yaml` | The website's settings, filled into the image when it starts: `ANGULAR_SITE`, the Auth0 application, no `G_TAG` until it has an Analytics property ([#2657](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2657)) |
| `08-api.deployment.yaml` | The API, the same image as txgisday.org's, run as the `node` user |
| `09-site.deployment.yaml` | The website, the same image, with its rollback target written beside the tag |
| `10-certificate.yaml` | The address's certificate from Let's Encrypt, which succeeds only once the address's DNS reaches the cluster |
| `11-ingress.yaml` | The address: `/api/` to the API, everything else to the website |

**`ORIGINS`.** Each site's API lists the addresses whose pages may call it. Once
[#2088](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2088) (PR 3304) is deployed, every
site calls the API on its own address, so a site's own addresses no longer need to be listed; until then, every
address the site is served at must be in its API's `ORIGINS`, or its pages load with no data, as tamu.txgisday.org's
did ([#2087](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2087)).

**Redis: unconfirmed.** The decision gives each site its own Redis, for the API's job queue, but no file in UCGIS's
folder creates one or names one; where UCGIS's API gets its Redis from is not recorded there. Settle it, and write
it here, before the next site.

**Its images move with txgisday.org's.** UCGIS's site deployment carries the same `gisday-angular` tag as
txgisday.org's and is promoted with it ([`docs/releases/README.md`](releases/README.md#releasing-gis-day)).

**The address's DNS** is the organization's to point at the cluster. **Unconfirmed:** who did this for
gisday.ucgis.org, and how; the certificate step records only that it must be done first.

## 5. The first season

A new database has no season, days or tags (decision 4). An admin creates them in Admin, Seasons: the season, its
days, and then its tags and events as for any season. **Unconfirmed:** the order UCGIS's first season was set up in.

## 6. Checks once it is live

- **The end-to-end spec** from step 1 passes against the deployed site.
- **The smoke check of link previews** reads the site's own title and image from its address.
- **By hand, in a private window:** the homepage, Sessions, an event, then sign in (through the organization's
  connection, if it has one) and open one admin page, as the GIS Day release check does.
- **`/api/seasons/active`** on the site's address answers JSON.

## 7. The agreement

Before launch, the organization confirms who hosts its members' data and whose privacy policy applies (decision 2).
**Unconfirmed:** where UCGIS's confirmation is recorded.
