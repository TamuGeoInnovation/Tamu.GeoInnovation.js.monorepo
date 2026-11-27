# Design: GIS Day sub-admins who change only their own organization's records

A proposal for [#2079](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2079), for the
maintainer to review before anything is built. It carries over the rules of
[#442](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/442), closed as its duplicate. Read
against `development` at `86c9013`, 27 November 2026. The decisions are at the end.

## A word about names

In the admin pages, **Organizations** are the `Place` entity (`places` table): "Texas A&M University GIS Day(s)", Texas
State's, and so on. An event belongs to one through its location (`Event.location.place`), and the header's
Organizations menu and gisday.tamu.edu's filter (`sessionsFrom` in `libs/gisday/common/src/lib/sites.ts`) both read it.
The `Organization` entity is shown as **Affiliations**: the employer a speaker comes from. In this document,
"organization" means a place, as it does in #2079 and #442.

## The problem

There is one level of editor. Every write route in the GIS Day API checks only a permission (`@Permissions` in
`libs/gisday/platform/data-api`), and the GIS Day Admin role holds all of them. Anyone who runs one school's events
therefore gets the right to change every school's events, the season's dates, the users and their roles.

Part of the groundwork already exists, unused:

- **The roles.** `GIS Day Manager` and `GIS Day Organizer` exist in Auth0 and in `GISDayRoles`
  (`libs/gisday/platform/ngx/common/src/lib/roles/gisday.roles.ts`). The admin route already admits both
  (`wrapper.routes.ts`, `requiredRoles`). Neither holds a permission (`scripts/gisday-auth0-dev.ps1`: "GIS Day Admin gets
  every permission; the others start empty"), so a Manager or Organizer can open the admin pages but every save is
  refused.
- **An ownership helper.** `isOwnerOrPermitted(user, ownerGuid, permission)` in `@tamu-gisc/common/nest/auth` already
  expresses "you own it, or you hold the permission that lets you change anyone's".
- **Records with an organization.** Events (through their location), event locations, and broadcasts (#3048) carry a
  place. Speakers and sponsors do not.

## The two approaches in the issue

| | Per site | Within one site |
| --- | --- | --- |
| How | Each organization gets its own GIS Day site and database; its organizers are GIS Day Admins there | Records carry their organization; a person is linked to one or more organizations; the API lets them change only those records |
| Code needed | None in the API; a deployment and database per organization | An organizer link, two new owner columns, a check on each write route, filtered admin lists |
| txgisday.org and gisday.tamu.edu | **Does not work.** They share one deployment and one database (#2012), and #2078 decided that the sites we run share one database | Works: Texas A&M's organizers change Texas A&M's events, Texas State's change Texas State's, on the same database |
| UCGIS (own deployment and database) | Already the case | Not needed there today |
| Drift | Each organization's data lives apart; anything statewide is copied (#2078) | None: one record, one place |

**Per site alone cannot answer the issue**, because the case it is about, several schools on txgisday.org, is a single
database by decision. Per site is still how a site we do not run, such as UCGIS's, is administered, and nothing here
changes that.

## Recommendation: within one site, keyed on the place

### Auth0

- **`GIS Day Organizer` becomes the sub-admin role.** It gets the permissions for what an organizer edits: create,
  update and delete for `events`, `event-locations`, `event-broadcasts`, `speakers` and `sponsors`, plus `update:places`
  (narrowed below). The API decides *which* records; the role only says *what kind*.
- **One new permission, `manage:all-organizations`, held only by GIS Day Admin.** It is the `permission` argument to
  `isOwnerOrPermitted`: with it, the organization check passes for every record, so admins keep everything (#442 rule
  4) with no change to their tokens' other permissions.
- **Everything else stays with GIS Day Admin only:** seasons, season days and cloning a season (#442 rules 3, 6, 7),
  tags, universities and affiliations (see decision 9), users and roles, classes, competitions, judging, the site copy
  of #2078, and site-wide settings.
- `GIS Day Manager` is left as it is (decision 3).

### Which organizations a person runs

A new table in the site's database, `place_organizers`: the place's guid, the person's Auth0 `sub`, and their email for
display. Full admins add and remove organizers on the Organizations details page (`admin/places/<guid>`), as #442's
screenshot proposed. The API reads the signed-in user's places from it on each write.

It lives in the database rather than in Auth0's app metadata because places are per database: UCGIS's database has its
own places with their own guids, and a guid in Auth0 would mean nothing there. It also keeps the decision next to the
record it is about, and needs no Auth0 management call to change.

### What owns what

| Record | Its organization | New column? |
| --- | --- | --- |
| Event | `location.place` | No |
| Event location | `place` | No |
| Broadcast | `place` (#3048) | No |
| Speaker | **new** `place`: the organization that manages the speaker's details | Yes, nullable |
| Sponsor | **new** `place`: the organization the sponsor supports | Yes, nullable |
| Organization (place) | itself | No |
| Season, season day, tag, university, affiliation, class, competition, user | none: admin only | No |

Speakers and sponsors get an owner column, as broadcasts did in #3048, rather than deriving their owner from their
events. A derived rule leaves a speaker with no events owned by nobody, so either any organizer could edit them or none
could; and a speaker who has spoken for two schools changes owner whenever an event is added.

**Shared speakers** (decision 5): the owning organization edits the speaker's details; any organizer may *add* the
speaker to their own event, because that is an edit to the event, not to the speaker. A full admin can change a
speaker's owner.

### Enforcement in the API

One helper, beside `isOwnerOrPermitted` in `@tamu-gisc/common/nest/auth`, extended to a set of places:
"the user holds `manage:all-organizations`, or the record's place is one of theirs". Each write route on the
records above calls it before saving and answers **403** otherwise. Hiding buttons is a convenience; the API is the
guard (#2079).

What each route checks:

- **Create.** The place the new record will have must be one of the user's. An organizer cannot create an event with
  no place, or in another organization's place (decision 6).
- **Update.** Both the record's current place and the place it would have after the change. Without the first, an
  organizer could edit another school's event; without the second, they could move their own into another school's
  place, or another's into theirs.
- **Delete.** The record's current place.
- **Bulk routes check every guid and refuse the whole request** if any is not the user's, rather than applying part of
  it: `PATCH events/active`, `DELETE events`, `POST events/clone`, `POST speakers/bulk`, `POST speakers/clone`,
  `DELETE speakers`, and the badge routes.
- **Routes that send email** on behalf of a session (speaker profile links, session details, slide requests) check the
  session's place, because an email from the site is as much an act as an edit.
- **Places.** An organizer may change their own place's website, links and logo, **not its name or visibility
  settings** (decision 7). gisday.tamu.edu chooses its sessions by place *name* (`sessionsFrom`), so a renamed place
  silently drops every Texas A&M session from that site.
- **Reads of personal data** (RSVPs, check-ins, attendance): an organizer sees only their own events'
  (decision 8). Today these are gated by `read:rsvps` and `read:checkins` alone.

`route-permissions.spec.ts` already fails when a route has no permission. A second list beside it names every route
that must also call the organization check, and the spec fails when one does not, so a new write route cannot quietly
skip it.

### The admin pages

`libs/gisday/platform/ngx/core/src/lib/pages/admin`:

- The admin home shows an organizer only what they can use: Events, Event Locations, Broadcasts, Speakers, Sponsors
  and their own Organizations entry. Seasons, Tags, Users, Classes, Competitions and Copy are hidden from them.
- Lists start filtered to the organizer's places, as gisday.tamu.edu's lists start filtered to Texas A&M's. Records of
  other organizations are not shown to them, so there is nothing to click and be refused.
- Pickers (an event's location, a broadcast's organization, a speaker's or sponsor's owner) offer only the
  organizer's places. A speaker picker on an event offers every speaker, since adding one is allowed.
- The Organizations details page gains an **Organizers** list for full admins: add by email of someone who has signed
  in at least once, remove.
- The API needs one read for this: the signed-in user's places, such as `GET /places/mine`.

### Tests

- For each guarded route, an API spec that an organizer of place A changing place B's record is refused with 403, and
  that the same change to place A's record succeeds. Moving a record between places is tested in both directions.
- A bulk request with one foreign guid among several is refused and changes nothing.
- An admin with `manage:all-organizations` and no `place_organizers` rows can still change everything.
- The admin pages' filtering has component specs; the API tests are what proves the rule.

## Migrating today's data

1. **Schema**, by migration, as `docs/gisday-migrations.md` describes: the `place_organizers` table, and nullable
   `place` columns on `speakers` and `sponsors`.
2. **Owners for existing speakers and sponsors**, by a script kept where that document says production data scripts
   are kept, like `set-broadcast-places.ps1` for #3048: a speaker or sponsor whose events all share one place gets that
   place. The rest stay empty, which means admin-only, and the script lists them for the maintainer to assign or leave.
   It runs with a dry run first.
3. **Events with no place** stay admin-only. The same script lists them, so they can be given one.
4. **Auth0, in both tenants**: add `manage:all-organizations` to the GIS Day API and the GIS Day Admin role; give
   GIS Day Organizer its permissions. `scripts/gisday-auth0-dev.ps1` gets the same, so the development tenant matches.
   #2078's import was refused on production for one permission the development script had and production did not; the
   change lists every permission added, for both.
5. **People.** Everyone who holds GIS Day Admin today and is really one school's organizer is moved to GIS Day
   Organizer and linked to their place. Until then, nothing changes for them: they are admins, as now.

Until step 5, the change is invisible: no one holds the Organizer role's new permissions, and admins pass every check.

## Out of scope

- Per-organization landing pages and the statewide page: #2072.
- Copying an organization's records between databases: #2078, done.
- Sub-admins for competitions, judging and classes.
- An audit log of who changed what.
- UCGIS: it has its own database and admins, administered per site.

## Decisions for the maintainer

1. **Approach**
   - **A. Within one site, keyed on the place, as above.** Recommended: the only option that works for txgisday.org and
     gisday.tamu.edu, which share a database.
   - B. Per site only: every organization gets its own deployment and database. Reverses #2078's "one database for the
     sites we run".
   - C. Both: A now, and per site for any organization that later wants its own database.

2. **Where the link between a person and their organizations lives**
   - **A. A `place_organizers` table in the site's database, managed on the Organizations details page.** Recommended:
     places are per database, and it needs no Auth0 call.
   - B. Auth0 app metadata on each user: one place to see a person's access, but place guids from several databases
     would mix there.

3. **Which role is the sub-admin**
   - **A. The existing `GIS Day Organizer`; `GIS Day Manager` is left as it is.** Recommended: both already open the
     admin pages, and the leaderboard already treats Manager like an admin, so giving Manager a narrower meaning would
     change what it does there.
   - B. `GIS Day Manager`, as #442 named it.
   - C. A new role, and retire both unused ones.

4. **Speakers and sponsors**
   - **A. A new owner `place` column on each, backfilled from their events where all share one place.** Recommended:
     the pattern #3048 set for broadcasts; every record has a clear owner.
   - B. No column: an organizer may edit a speaker or sponsor whose events are all theirs. Nothing to migrate, but one
     with no events belongs to nobody.
   - C. Speakers and sponsors stay admin-only; organizers only pick them for their events.

5. **A speaker used by two organizations' events**
   - **A. The owning organization edits the speaker; others may add them to their own events but not edit them.**
     Recommended: one person answers for a speaker's details.
   - B. Any organization with one of the speaker's events may edit them.

6. **Events with no organization**
   - **A. Admin-only; an organizer must give each event one of their places.** Recommended: otherwise an unplaced event
     is editable by every organizer.
   - B. Any organizer may edit an unplaced event.

7. **What an organizer may change on their own organization**
   - **A. Website, links and logo; not the name or where it is shown.** Recommended: gisday.tamu.edu matches places by
     name, so a rename removes Texas A&M's sessions from it.
   - B. Everything on it.
   - C. Nothing; places stay admin-only.

8. **Personal data: RSVPs, check-ins and attendance**
   - **A. Organizers see their own events' only.** Recommended.
   - B. Organizers see none; admins only.
   - C. Organizers see everyone's, as admins do today.

9. **Affiliations and universities** (the lists a speaker's employer and university are picked from)
   - **A. Organizers may pick from them and add new ones, but not edit or delete them.** Recommended: they are shared
     lookups, and a missing entry should not need an admin.
   - B. Admin-only: organizers ask an admin for a missing entry.

10. **Who adds organizers**
    - **A. Full admins only.** Recommended to start.
    - B. Also an organizer, to their own organization.
