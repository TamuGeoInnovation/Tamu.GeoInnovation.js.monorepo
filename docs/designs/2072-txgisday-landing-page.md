# Design: txgisday.org as the statewide landing page for each organization's GIS Day

A proposal for [#2072](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2072), for the
maintainer to review before anything is built. It also answers
[#567](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/567), closed as its duplicate. Read
against `development` at `86c9013`, 27 November 2026. The decisions are at the end.

**Until this plan is decided and built, txgisday.org keeps all its current content, Texas A&M's included** (#2072,
#2071).

"Organization" here means a place (`Place`), shown as **Organizations** in the admin pages: "Texas A&M University GIS
Day(s)", Texas State's, and so on. An event belongs to one through its location.

## Where things stand

- **One deployment and one database serve txgisday.org and gisday.tamu.edu.** The address picks the site definition
  (`gisdaySite()` in `libs/gisday/common/src/lib/sites.ts`, #2012). gisday.tamu.edu lists only Texas A&M's sessions
  (`sessionsFrom`), wears Texas A&M's brand, and has Texas A&M's own content (the `tamu` feature).
- **txgisday.org still has the `tamu` feature on** (its `off` list is only `winners`). So it still shows the Organizing
  Committee, the résumé bank, the High School Portal, the 2023 mentoring and TX GIS Hero links, and Texas A&M wording.
  #2012 decided txgisday.org becomes statewide and neutral; that half waits on this plan.
- **The homepage already has a Participating Organizations section**: each place marked for the `org-page` spot, with
  its logo and a link to its `website` (`landing.component.html`, `placesShownOn(..., OrgPage)`).
- **The Sessions page already filters by organization** (the `sessions-filter` spot), and every session page,
  presenter page and past year (`/seasons/<year>`, `/wayback`) is reachable on txgisday.org.
- **UCGIS's site is separate**: its own deployment, database and sign-in (Tradewing, #2575).

So most of what a landing page needs exists. What is missing is making the organizations the point of the page, a
place for each to send visitors, and turning Texas A&M's content off on txgisday.org.

## The issue's questions, each with a recommendation

### 1. What the landing page shows

**Recommended: one card per participating organization, as the page's main content.** In order:

1. **The header**: TxGIS Day's name and logo, and the statewide dates, from the active season, as today.
2. **A card per organization**, from the places marked for the `org-page` spot: its logo, its name, the dates of its own
   sessions this season (the first and last of their season days), how many sessions it has, and one link (below).
   Organizations with sessions first, then the rest, alphabetically.
3. **Explore all events**: the existing link to Sessions, which lists every organization's.
4. **Statewide sponsors**, as today.

**Where each card links**, in this order, which is #567's rule 2 with a step for organizations that have their own site:

1. The organization's own GIS Day site, if it has one: for Texas A&M, gisday.tamu.edu.
2. Otherwise, if it has sessions this season, txgisday.org's Sessions page filtered to it.
3. Otherwise, its `website`.

The own-site address comes from `sites.ts`: a place named in a site's `sessionsFrom` links to that site's `address`. No
new column is needed while gisday.tamu.edu is the only such site (decision 4).

**A map** of Texas with a pin per organization is left out of the first version. Places do carry an address, so it can be
added later without new data.

### 2. The same application in a landing mode, or a static page

**Recommended: the same application. The landing page is txgisday.org's homepage, with no new mode.** It needs the
season's dates, each organization's sessions and logos, which live in the API; a static page would have to be edited by
hand each year and would drift from the data. It would also need its own deployment, branding and footer (the required
Texas A&M and State of Texas links, `tamuLinks`), all of which the site definition already provides.

In practice it is a change to the txgisday site's definition and its homepage component:

- **Turn `tamu` and `homeLinks` off on txgisday.org.** Texas A&M's content then appears only on gisday.tamu.edu,
  which keeps it. The footer's required links (`tamuLinks`) stay on both (#2012).
- **The Participating Organizations section becomes the cards above** and moves up the page, under the header.
- `landing.component.spec.ts` asserts that txgisday.org shows the mentoring, TX GIS Hero and video links ("shows all
  three on txgisday.org"). It is updated in the same change to assert the opposite, so the change is deliberate and
  the test proves it.

### 3. Links people already have to txgisday.org pages

**Recommended: keep them all working, with no redirects.** txgisday.org stays the statewide site and goes on listing
every organization's sessions and presenters, so a link to a Texas A&M session on txgisday.org still shows that session.
Past years stay on txgisday.org: they are the statewide record, and include other schools' events. A redirect to
gisday.tamu.edu would send a Texas State visitor who followed an old link into Texas A&M's brand.

What only Texas A&M has is the exception. The Organizing Committee, Student Opportunities and the résumé bank are
sections of the About page, so with `tamu` off they simply leave txgisday.org's About page. The High School Portal is
its own page, `/highschool`, and `siteFeatureGuard('tamu')` sends a site without `tamu` to its homepage. So an old
txgisday.org link to it would land on the statewide homepage with no explanation; instead it goes to
gisday.tamu.edu's `/highschool` (decision 3).

### 4. Where accounts and sign-in live

**Recommended: where they are now.** txgisday.org and gisday.tamu.edu share one database and one Auth0 setup, so one
account, its RSVPs and its check-ins work on both. Splitting events by organization is a question of which site lists
them, not of who owns the account. A visitor signed in on one address is not automatically signed in on the other,
because they are different origins; Auth0's own session makes the second sign-in a single click. UCGIS keeps its own
accounts.

## How it is built

1. **One pull request** for txgisday.org's homepage and definition: `tamu` and `homeLinks` off, the organization cards,
   the High School Portal's redirect, and the spec change. Before-and-after screenshots of txgisday.org's homepage
   and of gisday.tamu.edu's (which must not change), a release-notes entry, and a row in What to test on dev.
2. **Tests**: which link each card gets in each of the three cases; that gisday.tamu.edu's homepage is unchanged;
   that txgisday.org no longer shows the `tamu` content; that txgisday.org's `/highschool` lands on gisday.tamu.edu's.
3. **Before deploying**, the maintainer checks each organization's `org-page` and website settings in the admin pages,
   since the cards now depend on them.

It needs nothing from #2079 (sub-admins) and nothing in the database.

## Out of scope

- Per-organization pages written in Markdown and styled in an organization's colours (#567, rules 3 and 4). An
  organization that wants its own branded page gets its own site definition, as Texas A&M did.
- Competitions and sponsors shown per organization (#567, rules 5 and 6).
- A map of the organizations.
- New addresses for other universities: each is a site definition, a DNS name and a routing rule, as #2012 found.

## Decisions for the maintainer

1. **What the page shows**
   - **A. One card per organization (logo, name, its dates, its session count, one link), above the statewide
     sponsors.** Recommended.
   - B. A plain list of organizations with links, like today's section, moved to the top.
   - C. A as well as a map of Texas with a pin per organization.

2. **When Texas A&M's content leaves txgisday.org**
   - **A. In the same pull request as the cards, so the page changes once.** Recommended.
   - B. First, on its own, then the cards.
   - C. Not yet: the cards now, Texas A&M's content stays on txgisday.org until a later decision.

3. **Old links to txgisday.org's High School Portal** (`/highschool`, the one Texas A&M-only page with its own address)
   - **A. Send them to gisday.tamu.edu's `/highschool`.** Recommended: old links keep working, in the right brand.
   - B. Leave them as `siteFeatureGuard` handles any feature a site lacks: the statewide homepage.

4. **Where an organization's own-site address is recorded**
   - **A. Derived from `sites.ts` (a site's `sessionsFrom` and `address`), with no new column.** Recommended while
     gisday.tamu.edu is the only one.
   - B. A new `siteAddress` field on the organization, set in the admin pages, for organizations whose site we do not
     define in code.

5. **Statewide pages that stay on txgisday.org** (sessions, presenters, past years)
   - **A. Keep all of them, listing every organization's, with no redirects.** Recommended.
   - B. Redirect Texas A&M's sessions and presenters on txgisday.org to gisday.tamu.edu.

6. **Accounts**
   - **A. Unchanged: one account for txgisday.org and gisday.tamu.edu.** Recommended.
   - B. Separate accounts per organization's site.
