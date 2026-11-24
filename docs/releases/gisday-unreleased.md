# GIS Day, unreleased

**GIS Day is released on its own path, not with AggieMap.** It is `gisday-angular` and `gisday-nest` at
[txgisday.org](https://txgisday.org), [gisday.tamu.edu](https://gisday.tamu.edu) and
[gisday.ucgis.org](https://gisday.ucgis.org); its images are built by GitHub Actions rather than Azure DevOps,
production pins a `sha-` tag, and [the release README](README.md#releasing-gis-day) gives the steps. So its
changes do not belong in AggieMap's dated notes, and this file is where they collect until a GIS Day release
takes them.

This replaces the arrangement the README called **"not settled yet"**: GIS Day entries used to go into
`unreleased.md` with AggieMap's, so an AggieMap release collated them into its own notes as though it shipped
them. The 10 November release was the first where somebody noticed the mix in the finished document rather than
in the process.

**37 changes**, merged into `development` between 4 and 13 November 2026 and present in `68d7b974c`. Being in
that commit does not mean being live: a GIS Day build is a separate image, promoted separately.

**What is deployed is not recorded here.** The GIS Day release path records it as a pinned `sha-` tag in the
private cluster configuration repository, because this repository is public. To find out what production is
running, read the pin there rather than inferring it from this file. Several of these changes went out ahead of
the November event and are already live; this file does not say which, and should not be read as if it did.

**Nothing automated covers GIS Day.** It has no development site
([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)), so production is
the first place a built image runs, and the AggieMap smoke suite does not touch it. Check a change on the local
stack first ([`docs/gisday-local.md`](../gisday-local.md)). That makes the checks below the only ones there are.

---

## Summary

### GIS Day admin: show one organization's sessions on the Events list

Several GIS Days share the site, and the admin Events list showed every organization's sessions together. It now has an
**Organization** choice above the list, offering each organization whose venues hold the season's sessions, by name, after
**Every organization**. Choosing one lists only its sessions
([#434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/434)).

| | Before | After |
| --- | --- | --- |
| The Events list, at 1280 | ![Before: the list with no Organization choice](../screenshots/434-events-organization-filter/before-events.png) | ![After: the Organization choice, on Every organization](../screenshots/434-events-organization-filter/after-events.png) |
| One organization chosen | | ![After: only the made-up North GIS Day's two sessions](../screenshots/434-events-organization-filter/after-events-north.png) |
| At 390 | | ![After on a phone: the choice under the search](../screenshots/434-events-organization-filter/after-events-390.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with made-up
sessions at two made-up organizations, the list searched for "Made-up" so only they show.

### A GIS Day venue cannot be saved without its hosting organization

Venues were being created with no hosting organization, and every session held at one was then missing from the
public Sessions page, with nothing to say why. The organization is now the first field on the venue form, and saving
without one is refused with a message saying why it matters. Venues already saved without one ask for it the next
time they are edited.
([#443](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/443))

| Before | After |
| --- | --- |
| ![The Create Venue form, with the hosting organization optional and halfway down](../screenshots/443-gisday-venue-needs-organization/before.jpg) | ![The Create Venue form, with the hosting organization first and required](../screenshots/443-gisday-venue-needs-organization/after.jpg) |

### GIS Day's competition submissions start from a button

Students wrote in that they could not find how to submit their competition work: the way in was a small text link,
"New submission +", in the corner of Account > Submissions, unlike every other action on the site. It is now a
**New submission** button, under the sentence that invites them to submit.
([#451](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/451))

| Before | After |
| --- | --- |
| ![Account > Submissions, with a small New submission text link in the top right](../screenshots/451-gisday-new-submission-button/before.png) | ![Account > Submissions, with a New submission button under the introduction](../screenshots/451-gisday-new-submission-button/after.png) |

### GIS Day admin: download the VGI competition's submissions and photos as one zip

The VGI competition's data goes back to the project's partners, and there was no way to get it out: an export had
been built in the API (#650), but it ran in a background queue that needs a Redis server the site does not have, so it
would never have finished, and no page offered it. The admin Submissions page now has **Download all as a zip**: one
zip of `submissions.csv`, a row per submission with who sent it, when, where, its review status, its photos' paths and
each of its answers, and a `medias` folder with every submission's photos. It is built while the page waits, as the
research competition's files are
([#545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/545)).

| | Before | After |
| --- | --- | --- |
| Admin, VGI Competition, Submissions | ![The Submissions page with Publish to ArcGIS and no export](../screenshots/545-vgi-export-zip/before-submissions.png) | ![The same page with Download all as a zip beside Publish to ArcGIS](../screenshots/545-vgi-export-zip/after-submissions.png) |
| The zip it downloads | | ![The zip's listing: submissions.csv and nine photos in medias folders, and the CSV's first rows](../screenshots/545-vgi-export-zip/after-zip-listing.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with 17
made-up submissions and nine made-up photos. The zip in the image was downloaded through the button.

### GIS Day admin: the date and time picker opens on screen on a phone

On a phone, the date and time picker used across GIS Day's admin forms (an event's start and end times, a season's days,
the research competition's scoring dates) opened its field off the left edge of the screen, where only a sliver of it
showed and it could not be used. It now opens just below the time, or above it if there is no room below, moved sideways
as far as it takes to stay on screen. Wherever it already fitted, as on a desktop, it opens where it always has
([#1756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1756)).

The same picker sets the time in AggieMap's trip planner, which gets the same fix.

| | Before | After |
| --- | --- | --- |
| An event's start time, at 390 | ![The start time's field off the left edge of the screen, only a sliver showing](../screenshots/1756-picker-on-screen/before-event-start-time-390.png) | ![The start time's field just below it, wholly on screen, with its list of times above](../screenshots/1756-picker-on-screen/after-event-start-time-390.png) |
| The same, at 1280 | ![The start time's field and its list of times, opened over its heading](../screenshots/1756-picker-on-screen/before-event-start-time-1280.png) | ![The same, in the same place as before](../screenshots/1756-picker-on-screen/after-event-start-time-1280.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin. No form was
saved.

### An address the site does not know says the page was not found

Opening an address the GIS Day sites do not know, a mistyped link or an old one, drew a blank white page at the home
address, with no header and no message. It now shows the site as usual, with "Sorry: We couldn't find that page." and
links to the home page and the sessions, and leaves the address as it was typed.
([#1765](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1765))

| Desktop, 1280 pixels | Before | After |
| --- | --- | --- |
| `/no-such-page` | ![A blank white page at the home address](../screenshots/1765-page-not-found/before.png) | ![We couldn't find that page, with links](../screenshots/1765-page-not-found/after.png) |

### GIS Day: past years' Sessions pages list their organizations again

On a past year's Sessions page, the **Organizations** filter said "There are no organizations.", although that
year's sessions name where they were held
([#1836](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1836)). Since
[#1826](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1826) the filter lists only the
organizations with **Sessions Filter** ticked in Admin, and that setting was new, so no past season's had it. Each
season keeps its own copies of its organizations, so ticking this year's never reached them.

A one-time migration, run before the release, ticks **Sessions Filter** on each past season's organizations that
hosted at least one of that year's sessions. An organization with no sessions that year stays unticked, so the filter
only offers choices that return sessions. This year's organizations are left as they are: they are ticked by hand.
Undoing the migration puts back only what it changed, so an organization edited in Admin since keeps its edit.

On production today 2023 has 8 organizations that hosted sessions, 2024 has 10 and 2025 has 11, and none of them is
ticked. A new smoke test fails while a past year's filter is empty.

| A past year's Sessions page | Before | After |
| --- | --- | --- |
| At 1280 pixels | ![The 2025 Sessions page: two sessions, each naming its organization, and an Organizations filter that says "There are no organizations."](../screenshots/1836-past-sessions-filter/before-past-season-1280.png) | ![The same page after the migration: the Organizations filter lists Example State University and Sample County GIS](../screenshots/1836-past-sessions-filter/after-past-season-1280.png) |
| At 390 pixels, Filters open | | ![On a phone, with Filters open: the Organizations filter lists the same two organizations](../screenshots/1836-past-sessions-filter/after-past-season-390.png) |

The images are a local build with made-up data: a 2025 season, now past, whose two sessions were held at Example State
University and Sample County GIS, and a third organization, No Sessions Institute, that held none. After the migration
the filter offers the two that held sessions, and not the third.

### GIS Day: the footer's My Account links go to the account's own pages

The footer's **My Account** links led nowhere useful: Profile Details went to `/me` and My Classes to `/me/classes`,
which were never addresses on the site, so both said "We couldn't find that page", and Registered Sessions went to the
public list of every session. Profile Details and My Classes now open the account's own pages, `/account/details` and
`/account/classes`, and Registered Sessions is replaced by **My Check-ins**, `/account/checkins`, the sessions the
visitor has checked in to, on the sites with check-ins
([#2024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2024)).

| Signed in, at 1280 pixels on the local site as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| The footer | ![The footer's My Account column: Registered Sessions, My Classes, Profile Details](../screenshots/2024-footer-links/before-footer.png) | ![The footer's My Account column: My Check-ins, My Classes, Profile Details](../screenshots/2024-footer-links/after-footer.png) |
| Profile Details followed | ![We couldn't find that page, at /me](../screenshots/2024-footer-links/before-profile-details.png) | ![The account's details, at /account/details](../screenshots/2024-footer-links/after-profile-details.png) |
| My Classes followed | | ![The account's classes, at /account/classes](../screenshots/2024-footer-links/after-classes.png) |
| My Check-ins followed | | ![The account's check-ins, at /account/checkins](../screenshots/2024-footer-links/after-checkins.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The account's name and
email are blanked in the images.

### GIS Day: Texas A&M GIS Day's tab icon matches AggieMap's

gisday.tamu.edu's browser-tab icon was the Texas A&M box logo with a wide margin, so it looked smaller than AggieMap's.
It is now AggieMap's own icon, from the one copy both sites serve, and the page names it from the start rather than
only once the app runs ([#2084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2084)).

Headed Chromium's real tab strip, on local builds: the Texas A&M site beside AggieMap, then txgisday.org and UCGIS, unchanged.

| Before | After |
| --- | --- |
| ![A browser's tabs: Texas A&M GIS Day with a smaller box logo, beside Aggie Map with a larger one](../screenshots/2084-tamu-tab-icon/before-tamu-and-aggiemap.png) | ![The same tabs: Texas A&M GIS Day and Aggie Map now show the same icon at the same size](../screenshots/2084-tamu-tab-icon/after-tamu-and-aggiemap.png) |
| | ![The TxGIS Day tab with its Texas flag icon, unchanged](../screenshots/2084-tamu-tab-icon/after-txgisday.png) |
| | ![The UCGIS GIS Day tab with its own icon, unchanged](../screenshots/2084-tamu-tab-icon/after-ucgis.png) |

### GIS Day: a session's check-in code no longer stays in the page address

A hybrid or virtual session's QR code opens its check-in page with the session's code in the address
(`?checkin=<code>`). The address stayed that way, so the code went wherever the address goes: Google Analytics'
page views, the browser's history, and any link someone copied from the address bar after scanning
([#2572](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2572), a follow-up to
[#2560](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2560)).

The page now takes the code out of the address as it loads, before Google's tag is set up and before the app starts,
and keeps it in that browser tab for the check-in page. Checking in works as before, signed out included: sign-in
comes back to the same tab, which still has the code.

The page's Analytics comes from Google's own tag, which records the address it finds when the page loads, so the code
had to be gone before then. Removing it from inside the check-in page, once the app had started, would have been too
late. The code itself is unchanged and still covers the whole session, by design; this only stops it being stored.

### GIS Day: Admin, Users opens again, with a search

Admin, Users spun for ever, because the list behind it failed: it asked Auth0 for every user, and Auth0 lists no
more than the first 1,000, which the site has passed. The list now stops at 1,000 and says so, and a search box
above it asks Auth0 for anyone by name or email, however far down the list they are
([#2574](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2574)).

| Admin, Users, 1280 pixels | After |
| --- | --- |
| The list (the local test tenant has 3 users, so the 1,000 note does not show; check it on production) | ![3 users, with the search box](../screenshots/2574-admin-users/after-list.png) |
| A search for "tamu" | ![Showing 2 of 2 users](../screenshots/2574-admin-users/after-search.png) |

### GIS Day admin: the VGI Form Designer says what Fetch Schema and Save did

Fetch Schema said nothing while it worked, and nothing when it failed: a form file on another GIS Day site, which the
browser does not let the page read, simply did nothing. It now says it is fetching (and can't be pressed twice), then
what it found, or why it couldn't: another site's file, an address that refused, a private ArcGIS layer, or an address
with no fields. Save says whether the form was saved, and why not. The instructions now say what can be read: a form
file on this site or a public ArcGIS layer
([#2582](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2582)).

| Before | After |
| --- | --- |
| ![Fetch Schema with this site's form file: no message, under the old ESRI-only instructions](../screenshots/2582-designer-feedback/before-fetch-ok.png) | ![This site's form file: "Found 2 fields: What did you find?, Name on the plaque or marker, or the monument's name."](../screenshots/2582-designer-feedback/after-fetch-ok.png) |
| Nothing said while it waited | ![While it waits: "Fetching…" on the disabled button and "Fetching the schema…"](../screenshots/2582-designer-feedback/after-fetching.png) |
| ![Fetch Schema with another site's file: nothing happens](../screenshots/2582-designer-feedback/before-fetch-other.png) | ![Another site's file: "Couldn't load that address. Use a form file on this site (/assets/competitions/...) or a public ArcGIS layer."](../screenshots/2582-designer-feedback/after-fetch-other.png) |

### GIS Day admin: an event opened to edit shows its tags ticked, so ticking them again no longer removes them

An event opened from the admin Events list showed every tag box unticked, although the event had its tags. An organizer
who ticked a tag again to put it back was taking it off, so saving lost it. The tags were never lost by the server: the
form held them, but the shared checkbox group ticked its boxes once, before it knew which tag each box was, and never
again. It now ticks and unticks them whenever either changes.

The same checkbox group draws the census years and address formats in GeoServices' advanced options, a place's
visibility settings, and the first-visit survey's multiple-choice questions, which now show their saved choices the
same way.
([#2887](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2887))

| Before | After |
| --- | --- |
| ![An event that has the Lunch tag, opened to edit, with every tag unticked](../screenshots/2887-event-tags-kept/before-edit-lunch-unticked.jpg) | ![The same event opened the same way, with Lunch ticked](../screenshots/2887-event-tags-kept/after-edit-lunch-ticked.jpg) |

### GIS Day admin: the Check-ins dashboard shows walk-ins, the show-up rate, and check-ins outside a session's time

The Check-ins dashboard (#3006) put each event's check-ins beside its RSVPs. It now also counts, for each event, its
**walk-ins**, people who checked in without having RSVP'd to that event, and how many of the people who RSVP'd
**showed up**, as a share of its RSVPs. The total row gives the whole season's rate, not a sum of percents
([#2893](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2893)).

An event's list of who checked in now marks anyone who checked in **outside the session's time**, which an admin
check-in or a session that allows check-in at any time can record
([#2635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2635)). Its CSV has a column for
the same.

With the two new columns, the table no longer fits beside the admin menu at 1280 pixels: it scrolls sideways in its
own box, with its scrollbar in view, as it already does on a narrower screen.

| | Before | After |
| --- | --- | --- |
| By event, at 1280 | ![By event with Checked in, RSVPs and the classification columns](../screenshots/2893-check-ins-dashboard-rest/before-check-ins.png) | ![By event with Walk-ins and Showed up beside RSVPs: 1 walk-in and 75% for the first event, 1 and 33% for the second, 0% for the third and a dash where nobody RSVP'd](../screenshots/2893-check-ins-dashboard-rest/after-check-ins.png) |
| An event opened | ![The first event's list of who checked in, with no outside-time mark](../screenshots/2893-check-ins-dashboard-rest/before-check-ins-row.png) | ![The first event's list of who checked in; one check-in is marked outside the session's time, in the column scrolled past the edge](../screenshots/2893-check-ins-dashboard-rest/after-check-ins-row.png) |
| An event opened, at 390 | | ![The same list on a phone: the table scrolls sideways in its own box and the page stays the screen's width](../screenshots/2893-check-ins-dashboard-rest/after-check-ins-phone.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with made-up
RSVPs and check-ins. The made-up accounts are not in Auth0, so their names read "Account not found".

### GIS Day admin: a VGI submissions dashboard

Admin, Dashboards has a **VGI submissions** dashboard, beside RSVPs and Check-ins and on the same page
([#2894](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2894)):

- **A row per feature type** on the season's form: its submissions; how many are new finds and how many repeats, scored
  exactly as the leaderboard scores them; the people who submitted it; and how many are unverified, verified and
  discarded. A total row counts each person once, whatever types they submitted.
- **A type opens to its submitters**, each with their submissions, new finds and repeats and when they first submitted
  it, with an export as CSV.
- **A chart of submissions over time**, as the RSVP chart has, with a second line for the type opened.

It needs the permission organizers already have to read every submission, so no account needs anything new.

| Before | After |
| --- | --- |
| ![The admin Dashboards menu on txgisday.org: RSVPs, Check-ins, User accounts, Speaker badges](../screenshots/2894-vgi-dashboard/before-dashboards-menu.png) | ![The same menu with VGI submissions after Check-ins](../screenshots/2894-vgi-dashboard/after-dashboards-menu-txgisday.png) |
| | ![On gisday.ucgis.org, which has no competition, the menu has no VGI submissions](../screenshots/2894-vgi-dashboard/after-dashboards-menu-ucgis.png) |
| | ![The VGI submissions dashboard for 2025 in a local copy: 1223 submissions of 3 feature types, the chart of submissions by day, and a row per type with a total row](../screenshots/2894-vgi-dashboard/after-dashboard.png) |
| | ![Unknown Art Piece opened to its 705 submitters, names and emails hidden](../screenshots/2894-vgi-dashboard/after-feature-type-open.png) |
| | ![The 2026 season, which has no VGI competition in the local copy: 0 submissions, nothing to chart](../screenshots/2894-vgi-dashboard/after-dashboard-2026.png) |

### GIS Day admin: a printed badge says Printed, with Undo, and its row no longer scrolls

On the **Speaker badges** page, a printed badge showed its date with **Not printed** under it. That was the link that
undoes the mark, but it read as the badge's status, so after marking every badge printed they all looked unmarked. It
now reads **Printed** with the date, followed by an **Undo** link. Each printed row also had a scroll bar of its own,
which is gone. ([#2912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2912))

| Before | After |
| --- | --- |
| ![Printed rows reading "Not printed", each with a scroll bar](../screenshots/badge-undo/printed-rows-before.png) | ![Printed rows reading "Printed" with their date and Undo](../screenshots/badge-undo/printed-rows-after.png) |

### GIS Day admin: a search box and a count on each admin list page

**Classes, Events, Venues, Affiliations, Organizations, Speakers, Sponsors, Users and Universities** now open with a
search box and how many the page lists. Typing narrows the table to the rows whose shown columns match, ignoring case
and accents, as the Presenters page's search does, and the count becomes **Showing N of M**.

Each page searches what it shows:

| Page | Searches |
| --- | --- |
| Classes | Code and number, section, name and professor |
| Events | Name, building and room |
| Venues | Building, room and affiliation |
| Affiliations | Name, city, state and ZIP |
| Organizations, Sponsors | Name; a sponsor's level too |
| Speakers | Name, email and organization |
| Users | Name, email and connection id |
| Universities | Name and abbreviation |

Changing the search clears any selected rows, so an action on the selected rows never touches one the search hides.
The Affiliations and Organizations pages' "there are none" messages had been swapped, and are corrected.
([#2914](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2914))

| Before | After |
| --- | --- |
| ![Speakers with no search](../screenshots/admin-search/speakers-before.png) | ![Speakers searched for "texas": 358 of 773](../screenshots/admin-search/speakers-after.png) |
| ![Events with no search](../screenshots/admin-search/events-before.png) | ![Events searched for "workshop": 7 of 46](../screenshots/admin-search/events-after.png) |
| ![Users with no search](../screenshots/admin-search/users-before.png) | ![Users searched: 1 of 3](../screenshots/admin-search/users-after.png) |

### GIS Day: the presenter search box on each presenter's page

A presenter's own page now has the **Presenters page's search box** above it, so another presenter can be found
without going back to the list. While typing, the other presenters that match are listed under the box, searched as
the list searches (name, organization, university or its abbreviation, ignoring case and accents). Choosing one opens
their page. When more than ten match, **See all matches on the Presenters page** opens the list already searched.
([#2919](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2919))

| Before | After |
| --- | --- |
| ![A presenter's page, with no way to search](../screenshots/presenter-search/presenter-before.png) | ![A presenter's page with the search box](../screenshots/presenter-search/presenter-after.png) |

![Searching "geography" from a presenter's page lists the other matching presenters](../screenshots/presenter-search/presenter-search-after.png)

### GIS Day: link to the Presenters page already searched, with a Copy link button

The **Presenters** page's address now follows its search box, so a search can be shared: a link such as
`gisday.tamu.edu/presenters?search=lower colorado` opens the list showing only that company's people. While a search is
in use, a **Copy link** button beside the box copies the whole link, ready to paste into an email, and says **Copied**.
Typing does not add a history entry per letter, so Back still leaves the page.
([#2921](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2921))

| Before | After |
| --- | --- |
| ![A search, with the address unchanged and nothing to copy](../screenshots/presenters-link/presenters-before.png) | ![A search, with the Copy link button beside the box](../screenshots/presenters-link/presenters-after.png) |

![The button after copying](../screenshots/presenters-link/presenters-copied-after.png)

### GIS Day: a presenter's search opens over the page; Copy link and a clear sit inside the search box

On a presenter's page, the search box's matches now open in a panel **over** the page, as the site's other searches
do, rather than pushing the presenter's details down. Escape, a click elsewhere or choosing a presenter closes it. The
box moves up into the space under the heading, with room before the bio.

On the **Presenters** page, **Copy link** no longer stretches across the page beside the box: it sits **inside** the box
at its right end, with an **x** that clears the search, as AggieMap's copy field holds its Copy. A visitor who arrives
from a shared link can now clear that search. The Copy styles were pasted into three apps' stylesheets; they are now one
shared file.
([#2923](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2923))

| Before | After |
| --- | --- |
| ![Matches listed in the page, pushing the presenter down](../screenshots/presenter-search-panel/searching-before.png) | ![Matches in a panel over the page](../screenshots/presenter-search-panel/searching-after.png) |
| ![The box close to the top of the bio](../screenshots/presenter-search-panel/page-before.png) | ![The box under the heading, with room before the bio](../screenshots/presenter-search-panel/page-after.png) |
| ![Copy link as a wide button beside the box](../screenshots/presenters-link/presenters-after.png) | ![Copy link and a clear inside the box](../screenshots/presenter-search-panel/presenters-in-box-after.png) |

![On a phone](../screenshots/presenter-search-panel/presenters-in-box-phone-after.png)

### GIS Day: Research Competitions shows a loader while it loads, rather than a blank page

The admin **Research Competitions** list, and a submission opened from it, showed an empty white area until their data
arrived, which looked as if the page had broken. They now show the site's loader, the one the Presenters page already
uses, until it does.
([#2924](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2924))

| Before | After |
| --- | --- |
| ![The list empty while it loads](../screenshots/competitions-loading/loading-before.png) | ![The loader while it loads](../screenshots/competitions-loading/loading-after.png) |

### GIS Day: the Research Competitions admin page loads faster

The **Research Competitions** admin page looked up each submitter's account in Auth0 one at a time, in turn: about fifty
requests for this season's 55 submissions, which was most of its load time. It now reads them all in one search, as the
admin dashboards do, and keeps them for a few minutes.
([#2925](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2925))

### GIS Day: recorded times are right, rather than five or six hours early

Every time the GIS Day site recorded (when a competition entry was submitted, an RSVP made, a check-in scanned, and the
rest) was stored as the database server's clock time labelled as UTC. The server runs on Central time, so a submission
made at the 5:00 PM deadline on 13 November showed as **11:00 AM**: six hours early in winter, five in summer. New
times are now stored with their real offset, and every time already stored was corrected by a migration, with daylight
saving applied to each.
([#2926](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2926))

### GIS Day: search box text centred, in the site's font

Text typed into a search box was in the browser's own font, not the site's, and in the Presenters search it sat
higher than the **Copy link** and **x** beside it. It is now in the site's font and centred in the box. The fix is in
the shared text box, so every box built on it takes the page's font.
([#2930](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2930))

| Before | After |
| --- | --- |
| ![Typed text high in the box, in Arial](../screenshots/search-box-text/box-before.png) | ![Typed text centred, in Open Sans](../screenshots/search-box-text/box-after.png) |

![The empty box, its placeholder on the text's line](../screenshots/search-box-text/empty-after.png)

### GIS Day: students attach their presentation files to their submission, and admins download them

A student with a poster or presentation submission can now attach the files they will present from - their slides,
or their poster as a PDF - to the submission itself, under **Presentation files** on its page in their account:
PowerPoint or PDF, up to 100 MB each, three per submission. This works after the submission has been reviewed too,
since finalists send their files once they are accepted. Until now the files came as a link to a cloud drive, or by
hand.

Admins see how many files each submission has in a new **Files** column on Research Competitions, download any one of
them from the submission's review page, and download every file of the season at once with **Download all files**: a
zip with a folder per submission, named for its type and title.
([#2933](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2933))

| Before | After |
| --- | --- |
| ![A student's submission, with only a link field for materials](../screenshots/submission-files/student-before.png) | ![The same submission with Presentation files: a slide deck and a poster attached](../screenshots/submission-files/student-after.png) |
| ![The review page with no files](../screenshots/submission-files/review-before.png) | ![The review page listing the two files, each a download](../screenshots/submission-files/review-after.png) |
| ![Research Competitions without a Files column](../screenshots/submission-files/list-before.png) | ![Research Competitions with Download all files and a Files column](../screenshots/submission-files/list-after.png) |

### GIS Day: poster and presentation submissions close at a deadline an admin sets

Submissions to the student competitions were closed by hand. Admins now set, on **Research Competitions**, when
each competition closes for the season: for the poster and for the presentation competition, when new submissions
and edits close, and a later moment when the files attached to them (#2933) close. A deadline left empty stays open.

From that moment the API refuses a student's new submission, edit or file change for that competition, whatever the
page shows, and the submission form says that the competition closed and when; before it, the form says when it will
close. Times are entered and shown in US Central. Reviewers can still review and attach files after either deadline.
([#2934](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2934))

| Before | After |
| --- | --- |
| ![Research Competitions with no deadlines](../screenshots/submission-deadlines/before-admin.png) | ![Research Competitions with each competition's submission and file deadlines](../screenshots/submission-deadlines/after-admin.png) |
| ![A poster submission offered Submit with nothing about a deadline](../screenshots/submission-deadlines/before-form-poster.png) | ![The poster competition closed, and when; no Submit](../screenshots/submission-deadlines/after-form-poster-closed.png) |
| ![The poster submission taken after its deadline](../screenshots/submission-deadlines/before-submitted.png) | ![A submission to the closed poster competition, locked, with its files open until their own deadline](../screenshots/submission-deadlines/after-edit-poster-closed.png) |
| | ![The presentation competition, still open, saying when it closes](../screenshots/submission-deadlines/after-form-presentation-open.png) |

### GIS Day: speakers update their own presenter profile through an emailed link, approved by an admin

Speakers can now update their own bio, photo, affiliation and link, without an account and without an organizer typing
it in. An admin emails them a personal link, from **Speakers** (select speakers, then **Email edit links**) or from an
event's page (**Email edit links to these speakers**, everyone on the session at once); a speaker can also ask for one at
`/presenters/edit` with the address on their record. The link opens their profile only, works for seven days, and can be
used as often as they like.

Nothing they send is public until an admin approves it under **Speakers, Edits to review**, which shows each change as
it is now beside what was proposed. A link reaches one speaker and nothing else: the server finds the speaker from the
link itself, keeps only a fingerprint of it, and accepts only the bio, photo, affiliation and link. Scripts in a bio are
stripped as they already were, a link must be a web address, and photos are JPEG or PNG, checked and resized as an
admin's uploads are.
([#2936](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2936))

| The speaker's page | The admin's review |
| --- | --- |
| ![A speaker's own edit page, opened from their link](../screenshots/speaker-self-edit/speaker-page.png) | ![Edits to review: the profile now beside the proposed changes, with Approve and Reject](../screenshots/speaker-self-edit/review.png) |

### GIS Day: image uploads take JPEG and PNG only, so an SVG is refused

Sponsor, organization and place logos accepted any image, SVG included. Uploads are served from the site's own address, and
an SVG can carry script, so one opened directly would run as the site. Every image upload now takes a JPEG or PNG only:
logos, speaker photos added by an admin, and photos speakers propose themselves. The server judges the file by its content,
not its name, so an SVG renamed to `.png` is refused, and a picture is stored under the extension its content has. The
5 MB limit on each upload is unchanged.

Speaker photos already refused SVG ([#2352](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2352));
they used to take GIF and WebP as well, and now take JPEG and PNG like everything else. The admin forms' file pickers offer
JPEG and PNG files only. Nothing on a page looks different.
([#2937](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2937))

### GIS Day: Presentation files stand out on a student's submission, with a button to attach

**Presentation files**, added the same morning, sat below the submission's own buttons and read as an afterthought, and
its file picker was a paperclip and a line of text that was easy to miss. It is now a box above the buttons, which
close the page; its limits (PowerPoint or PDF, up to 100 MB each, up to 3 files) are a line of their own; and
**Attach a file** is a button in the site's usual style.
([#2938](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2938))

| Before | After |
| --- | --- |
| ![The files below the buttons, the picker a line of text](../screenshots/submission-files-panel/student-before.png) | ![The files in a box above the buttons, with an Attach a file button](../screenshots/submission-files-panel/student-after.png) |

### GIS Day: an event's speakers on its edit page are in order by last name

On an event's edit page in the admin, the speakers already on the event were listed in the order they had been added,
so on a session with nineteen student presenters a name was hard to find. They are now listed by last name, then first
name, and stay in that order as speakers are added and removed.
([#2940](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2940))

| Before | After |
| --- | --- |
| ![An event's speakers in the order they were added](../screenshots/event-speakers-sorted/before.png) | ![The same speakers by last name](../screenshots/event-speakers-sorted/after.png) |

### GIS Day admin: Escape on a details page goes back to its list

On the admin pages, Escape on an event's, a speaker's, a sponsor's or any other details page, a submission's review
and the add pages now goes back to the list the page was opened from, as closing a dialog does. The list is as it was
left: the same season, the same search, and on the Research Competitions list the same filters.

A page with changes not yet saved asks first, in the page: **Leave without saving?** Keep editing (or Escape again)
stays with the changes. An Escape that something else on the page uses is left to it: it closes an open drop-down, the
speaker search, a date or time picker, or a dialog, and the page stays. Choosing a day, a time or a speaker on an
event, a day on a season or a link on an organization now counts as a change, as typing does.
([#2942](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2942))

| Before | After |
| --- | --- |
| ![The Events list for 2025, searched for WORKSHOP](../screenshots/2942-admin-escape-back/before-1-list.png) | ![Back on the Events list after Escape, still 2025 and still searched for WORKSHOP](../screenshots/2942-admin-escape-back/after-2-escape-unchanged.png) |
| ![Escape on the event's edit page did nothing](../screenshots/2942-admin-escape-back/before-2-escape.png) | ![With the name changed, Escape asks "Leave without saving?" in the page](../screenshots/2942-admin-escape-back/after-3-asks.png) |

### GIS Day: the admin Events list heads each day with its day of the week

The admin **Events** list headed each day "November 16" while the public **Sessions** page heads the same day "Monday,
November 16". The admin list now uses the same format, in Central time, so an organizer can tell the days apart at a
glance and the two pages read alike.
([#2943](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2943))

| Before | After |
| --- | --- |
| ![A day headed November 16](../screenshots/admin-event-weekday/before.png) | ![The same day headed Monday, November 16](../screenshots/admin-event-weekday/after.png) |

### GIS Day: a search box above the Sessions list

The public Sessions page has a search box above the list. Typing part of a session's name, its building or room, or
the name of one of its presenters lists only the sessions that match, ignoring case and accents, as the Presenters
page and the admin Events list already search. It narrows the list alongside the Tags and Organizations filters, not
instead of them. A day with no matching session is left out, and when none match the page says No sessions match.
Each session now carries its presenters' names from the API for this; only the names, which the Presenters page
shows already. ([#2944](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2944))

| Before | After |
| --- | --- |
| ![The Sessions page with no search box](../screenshots/2944-sessions-search/before.png) | ![The Sessions page with a search box above the first day](../screenshots/2944-sessions-search/after.png) |
| | ![Searching "gates ballroom" lists only the sessions in that ballroom, from Tuesday; Monday is left out](../screenshots/2944-sessions-search/after-search-building.png) |
| | ![Searching "hackathon" leaves out every day and says No sessions match "hackathon"](../screenshots/2944-sessions-search/after-no-match.png) |

### GIS Day: a tab left open across a deploy moves to the new version

A tab opened before a deploy kept running the build it had loaded. Its next click could go nowhere, or go blank,
because the old build asked for a piece of code the new one no longer has; or, worse, it went on quietly showing
old pages, as an open **Speaker edits to review** tab did after the 14 November deploy. Now:

- **A missing piece of code reloads the page once**, at the page the visitor clicked. If the new build really lacks
  it, the page does not reload again, so it cannot loop.
- **A newer version is noticed** when the visitor clicks to another page or comes back to the tab: the site's
  service worker, which it already had, compares its version with the server's.
- **The page then reloads into the newer version**, unless a form on it has unsaved changes. Then it says a newer
  version is ready and reloads only if the visitor chooses **Reload now**; with **Keep working**, the next page
  they open comes from the newer version.

The piece doing this is shared (`provideNewVersionReload()` in `@tamu-gisc/common/ngx/router`), so another app
with a service worker can use it.
([#2945](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2945))

| Before: the click to Sessions goes nowhere after a deploy | After: it reloads into the new version, at Sessions |
| --- | --- |
| ![The About page still showing after clicking Sessions](../screenshots/2945-new-version-reload/before-missing-chunk.png) | ![The Sessions page, loaded from the new version](../screenshots/2945-new-version-reload/after-missing-chunk-reloaded.png) |

![A newer version of this site is ready, with Keep working and Reload now, over the contact form](../screenshots/2945-new-version-reload/after-unsaved-changes-prompt.png)

### GIS Day: every button on a site is the site's colour, maroon on Texas A&M's

On Texas A&M's GIS Day site the buttons did not share a colour. The buttons on its forms stayed txgisday.org's blue
while the site's other buttons were maroon, so on a student's submission **Attach a file** was the only maroon button
among blue ones. The shared form button now takes the site's button colour, as the others already did: maroon
everywhere on Texas A&M's site, and blue, as before, on txgisday.org. The two outlined buttons on a competition's
*Submission Successful* page, which were a dark red of their own on every site, are now the site's outlined button.

Every other application that uses the shared button (AggieMap, GeoServices, the event maps) sets no site colour and keeps
the blue it had.
([#2946](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2946))

| | Before | After |
| --- | --- | --- |
| Texas A&M's site | ![The presenter profile page on Texas A&M's site, its Email me a link button blue](../screenshots/2946-one-button-style/tamu-presenter-edit-before.png) | ![The same page, the button maroon](../screenshots/2946-one-button-style/tamu-presenter-edit-after.png) |
| txgisday.org | ![The presenter profile page on txgisday.org, its button blue](../screenshots/2946-one-button-style/txgisday-presenter-edit-before.png) | ![The same page, unchanged](../screenshots/2946-one-button-style/txgisday-presenter-edit-after.png) |
| GeoServices | ![GeoServices' geocoding demo, its Solve button blue](../screenshots/2946-one-button-style/geoservices-geocoding-before.png) | ![The same page, unchanged](../screenshots/2946-one-button-style/geoservices-geocoding-after.png) |

### GIS Day: admins choose which research competitions a season runs

The student submission form offered every research competition, Paper and Cartography included, every year, whatever
the season ran. Admins now choose the competitions a season runs on **Research Competitions**, above the deadlines,
and everything follows:

- the submission form offers only those;
- the deadlines list only those;
- the Competitions page shows the Poster and Presentation blocks only in a season that runs them;
- the site refuses a new submission to any other.

A season nobody has set runs every competition, so nothing changes until an admin chooses. A submission already made to
a competition later turned off stays as it is, can still be edited, and is still listed for admins. The VGI competition
is not among these: it is switched for each site as before.
([#2948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2948))

| Research competitions, 1280 pixels wide | Before | After |
| --- | --- | --- |
| Research Competitions | ![No way to choose the competitions; the deadlines list all four](../screenshots/2948-season-competition-types/before-research-competitions.png) | ![A Competitions section above the deadlines, all four ticked](../screenshots/2948-season-competition-types/after-competitions-section.png) |
| Paper turned off and saved | | ![Paper unticked, Competitions saved, and the deadlines no longer list Paper](../screenshots/2948-season-competition-types/after-paper-off-saved.png) |
| The new-submission form | ![Presentation, Paper, Poster and Cartography offered](../screenshots/2948-season-competition-types/before-submission-form.png) | ![Presentation, Poster and Cartography offered; Paper is not](../screenshots/2948-season-competition-types/after-submission-form-no-paper.png) |

**Before the API is deployed**, the production migration `migrate-prod-2948.ps1` adds the one empty table it needs, `season_competitions`.

### GIS Day: the speaker edit page, after its first live use - the site's own name, full width, university and class year

The first profile email, sent from Texas A&M's site, arrived as from **TxGIS Day** with a txgisday.org link: every site
calls the API at txgisday.org's address, so the API now reads which site the page is on from the browser, and sends as
that site's own name (Texas A&M GIS Day) in the sender, subject, text and link.
([#2951](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2951))

The speaker's page was a narrow column, borrowed from the Contact page; it now uses the presenter page's full width.
([#2952](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2952))

It also takes the speaker's **University** (from the season's list) and **Graduation year**, both reviewed like the rest;
a speaker whose record has an organization sees it named, to be changed by the team, instead of an Affiliation box that
would change nothing the public page shows; and the admin action is now **Send profile email**.
([#2953](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2953))

| Before | After |
| --- | --- |
| ![The narrow page without university or class year](../screenshots/speaker-self-edit-2/before.png) | ![The full-width page with University, Graduation year and the organization](../screenshots/speaker-self-edit-2/after.png) |

### GIS Day: a speaker's own page shows their photo full size, with the school banner and class year

On the page a speaker reaches from their profile email, the photo was a small circle beside **Choose a photo**. It is
now shown as the admin speaker form shows it, with the same shared components: full size, at the size of a presenter's
card, with the school banner and class year across its corner. The banner follows the University and Graduation year
chosen on the page as they change, so a speaker sees the result before sending it. A speaker with no photo sees the
person icon, with no banner over it.
([#2956](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2956))

| Before | After | After choosing another university and year |
| --- | --- | --- |
| ![The photo as a small circle beside Choose a photo](../screenshots/2956-speaker-edit-photo/before.png) | ![The photo full size with a TXST '02 banner](../screenshots/2956-speaker-edit-photo/after.png) | ![The banner now reads TAMU '18](../screenshots/2956-speaker-edit-photo/after-other-choice.png) |

### GIS Day: the finalist acceptance email names the site it came from and gives the next steps

Accepting a submission on Research Competitions emails the finalist. That email said **TxGIS Day** and linked to
txgisday.org whichever site it came from, and asked finalists to "provide a link" to their materials, which they now
attach to the submission instead. It now comes under the reviewer's own site's name, with the subject *Your … submission
has been accepted*, and lists what to do next: attach the slides or poster under **Presentation files**, complete the
presenter profile from the separate profile email, and check the sessions page for when to present. The reviewer's
message still follows. A rejection keeps its wording, under the site's own name.
([#2957](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2957))

### GIS Day: approve, reject and send profile emails to the selected submissions at once

Research Competitions offered only **Delete** for the selected submissions, so every decision meant opening a submission,
choosing, and submitting the review, one at a time. The selected-rows bar now also has:

- **Approve** and **Reject**: each selected submission is reviewed exactly as Submit Review reviews one, and its submitter
  gets the acceptance or rejection email from the reviewer's own site (#2957's wording).
- **Send profile email**: each person on the selected submissions gets their own link to their presenter profile, as the
  Speakers list sends it. People are matched to the season's speaker records by email, ignoring capitals and spaces;
  anyone with no speaker record is listed by name in the result, with their submission, so they can be added.

Every one of these sends email, so each asks first, in the page, with how many will be emailed (*Approve 12 submissions
and email their submitters?*), and says if any were already reviewed and will hear again. One request does the whole
selection; the result says how many were done and lists any that failed, by title, with why.
([#2958](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2958))

| Before | After |
| --- | --- |
| ![Three submissions selected; the bar offers only Delete](../screenshots/2958-bulk-review/before-selected-actions.png) | ![Three submissions selected; the bar offers Approve, Reject, Send profile email and Delete](../screenshots/2958-bulk-review/after-selected-actions.png) |

| Asked first | The result |
| --- | --- |
| ![Approve 3 submissions and email their submitters?](../screenshots/2958-bulk-review/after-approve-confirm.png) | ![The three are Accepted; the toast lists each whose email could not be sent, as on a local copy with no mail server](../screenshots/2958-bulk-review/after-approve-result.png) |
| ![Send profile emails to the 4 people of 3 submissions?](../screenshots/2958-bulk-review/after-profile-confirm.png) | ![The toast names the person with no speaker record, with their submission](../screenshots/2958-bulk-review/after-profile-result.png) |

The results were taken on a local copy, where no email can be sent, so each says its email could not be sent; on the live
site they say who was emailed. A row belonging to a real account is blanked out.

### GIS Day: paper and cartography submissions close at a deadline too, as posters and presentations do

The deadlines admins set on **Research Competitions** (#2934) covered only the poster and presentation competitions.
The paper and cartography competitions now have the same pair: when new submissions and edits close, and a later
moment when their files close. A deadline left empty stays open, so nothing changes for a season until an admin sets
one. The API holds each competition to its own deadlines, and the submission form says when it closes or closed, as
it does for posters and presentations. Reviewers can still review and attach files after either deadline.
([#2962](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2962))

| Before | After |
| --- | --- |
| ![Submission deadlines for the poster and presentation competitions only](../screenshots/paper-cartography-deadlines/before-admin.png) | ![Submission deadlines for the poster, presentation, paper and cartography competitions](../screenshots/paper-cartography-deadlines/after-admin.png) |

### GIS Day: one clear button for every search box, and one on the Sessions search

The search box on the Sessions page has an x that empties it, as the Presenters page and a presenter's own page
already had. All three now use one x, part of the shared text box rather than a copy kept by each page: a real button,
reached with Tab, read out as "Clear the search", and it puts the cursor back in the box. Text boxes that do not ask
for it, on GIS Day's forms and in AggieMap and GeoServices, are unchanged.
([#2963](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2963))

| Before | After |
| --- | --- |
| ![The Sessions search holding "ballroom", with no way to empty it but deleting the text](../screenshots/2963-textbox-clear/sessions-before.png) | ![The Sessions search holding "ballroom", with an x at its right](../screenshots/2963-textbox-clear/sessions-after.png) |
| | ![The x reached with Tab, showing the browser's focus ring](../screenshots/2963-textbox-clear/sessions-after-keyboard-focus.png) |
| | ![After Enter on the x: the box is empty and every session is listed again](../screenshots/2963-textbox-clear/sessions-after-cleared.png) |
| ![The Presenters search holding "texas", with Copy link and the page's own x](../screenshots/2963-textbox-clear/presenters-before.png) | ![The same, with the shared x, pixel for pixel as before](../screenshots/2963-textbox-clear/presenters-after.png) |
| ![A presenter's page searching "texas", with the page's own x](../screenshots/2963-textbox-clear/presenter-details-before.png) | ![The same, with the shared x](../screenshots/2963-textbox-clear/presenter-details-after.png) |
| ![AggieMap's directory filter holding "evans"](../screenshots/2963-textbox-clear/aggiemap-directory-before.png) | ![The same filter, unchanged pixel for pixel: no x](../screenshots/2963-textbox-clear/aggiemap-directory-after.png) |

### GIS Day: Save, Create and Delete on an admin page go back to the list as it was left

Escape on an admin page already went back to the list the page was opened from, keeping its season and its search
([#2942](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2942)). **Update**, **Create**,
**Delete** and **Submit Review** went to the bare list instead, on the current season with nothing searched, so an
admin working through a past season was put back at the start after every save. They now go back the way Escape
does, on every admin page: Broadcasts, Classes, Events, Venues, Affiliations, Organizations, Seasons, Speakers,
Sponsors, Tags, Universities and the Research Competitions review. A page opened from somewhere other than its list still goes to the list.
Create Class, when some sections could not be added, still stays on its page with them in the form.
([#2965](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2965))

Universities on the 2025 season, searched for "Austin"; Austin Community College opened and **Update** pressed
without changing anything:

| | Before | After |
| --- | --- | --- |
| The list, before opening a university | ![Universities on 2025, searched for Austin, before](../screenshots/2965-save-returns-to-list/before-1-list.png) | ![Universities on 2025, searched for Austin, after](../screenshots/2965-save-returns-to-list/after-1-list.png) |
| Where Update lands | ![Before: the bare list, on 2026 with nothing searched](../screenshots/2965-save-returns-to-list/before-2-after-update.png) | ![After: back on 2025 with Austin still searched](../screenshots/2965-save-returns-to-list/after-2-after-update.png) |

### GIS Day: a refused save or upload says why, not only its status code

When the API refused a save, the admin forms showed only the status code: an SVG logo, which the API has refused
since #2937, came back as "Error creating sponsor: 400". The API's reply already said why. Every admin form (sponsors,
organizations, places, speakers, sessions, locations, classes, tags, universities, broadcasts, seasons), the sponsor and
season lists, the research competition review, My Details and the student's submission form now show that reason, and
keep their old wording when there is none. The submission form showed the API's words only when a competition had
closed (#2934); it now shows them for any refusal. A server failure still shows the old message, since its text is not
something anyone can act on. ([#2966](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2966))

| Before | After |
| --- | --- |
| ![Create Sponsor with an SVG logo, refused with "Error creating sponsor: 400"](../screenshots/2966-upload-reason/before-sponsor-svg-logo.png) | ![Create Sponsor with an SVG logo, refused with "The logo must be a JPEG or PNG image."](../screenshots/2966-upload-reason/after-sponsor-svg-logo.png) |

### GIS Day: Submission deadlines on Research Competitions is a compact panel, collapsed to one line once deadlines are set

The **Submission deadlines** section (#2934) took half the screen above the submissions list. It is now a panel. Once a
season has deadlines it opens collapsed to one line, for example "Poster closes Fri, Nov 13, 5:00 PM; files Mon, Nov
16, 12:00 PM · Presentation open (Central time)", and the submissions are what the page shows first. Clicking that line
opens it to edit: a table with one row per competition, each date picker with its Central time under it and a smaller
Clear, and **Save deadlines** at the end of the panel instead of across the page. A season with no deadlines opens with
the panel open, ready to set them.
([#2969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2969))

| Before: the section as it was, every date open above the submissions | After: collapsed to one line, the submissions right below |
| --- | --- |
| ![Submission deadlines before, a field per competition and date, with Save deadlines across the page](../screenshots/2969-deadlines-panel/before-page.png) | ![Submission deadlines after, collapsed to one line summarizing each competition's dates in Central time, at 1280 px](../screenshots/2969-deadlines-panel/after-collapsed-1280.png) |
| ![The whole Submission deadlines section before](../screenshots/2969-deadlines-panel/before-section.png) | ![Submission deadlines after, opened at 1280 px to a table with one row per competition, each Central time under its date, and Save deadlines on the right](../screenshots/2969-deadlines-panel/after-expanded-1280.png) |
| | ![Submission deadlines after, opened at 1024 px, both date columns and every Clear inside the page](../screenshots/2969-deadlines-panel/after-expanded-1024.png) |

### GIS Day admin: a Check-ins dashboard

Admins had no page showing who checked in at an event. **Dashboards > Check-ins** now shows, for the selected season:

- **Check-ins over time**: the running total at the end of each day, in Central time, with each day's check-ins
  beneath. Opening an event adds its own line.
- **By event**: each event, in the order they happen, with its number of check-ins split by person type, and **how
  many RSVP'd beside them**, so turnout can be compared. A total row sums both.
- **An event, opened**: who checked in, under their type's heading, with the time each checked in, and an **Export as
  CSV** of the same.

It is the RSVPs dashboard's page over check-ins: the same table, people list, chart and export. Names and emails are
read only when an event is opened, and only by an admin with the `read:checkins` permission. On gisday.tamu.edu it
lists only Texas A&M's sessions, as the other admin lists do.

The two dashboards' shared table now fits beside the admin menu on a 1280 px screen: before, its last columns were cut
off with no way to scroll to them, which on RSVPs hid most of **Not given**. On a narrower screen the table scrolls
sideways in its own box.
([#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006))

Captured on a local copy of the site with made-up people, served as gisday.tamu.edu, for the 2025 season. Names and
emails are masked.

| Before | After |
| --- | --- |
| ![The Dashboards menu: RSVPs, User accounts and Speaker badges](../screenshots/3006-check-in-dashboard/before-dashboards-menu.png) | ![The Dashboards menu with Check-ins under RSVPs](../screenshots/3006-check-in-dashboard/after-dashboards-menu.png) |

| After |
| --- |
| ![The Check-ins dashboard: 1591 check-ins at 60 events, and check-ins over GIS Day week as a running total by day](../screenshots/3006-check-in-dashboard/after-check-ins.png) |
| ![By event: each event's check-ins, with its RSVPs beside them, counted by person type](../screenshots/3006-check-in-dashboard/after-check-ins-table.png) |
| ![One event opened: who checked in, under their type's heading, with an Export as CSV link](../screenshots/3006-check-in-dashboard/after-check-ins-event-opened.png) |

### GIS Day: editing only an organization's link counts as a change, so Escape asks before leaving

On an organization's admin page, changing only one of its links (the label or the URL) did not count as a change, so
pressing Escape (#2942) went straight back to the list without asking, and the edit was lost. The link's fields now
report the edit to the page's form, so Escape asks "Leave without saving?" as it does for any other field. Opening an
organization without editing it still leaves without asking.
([#3007](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3007))

| Before | After |
| --- | --- |
| ![An organization's admin page before, at 1280 px, with only its link's URL edited](../screenshots/3007-place-link-dirty/before-1-link-edited.png) | ![The same edit after the fix](../screenshots/3007-place-link-dirty/after-1-link-edited.png) |
| ![Before: Escape left for the Organizations list without asking; the edit is lost](../screenshots/3007-place-link-dirty/before-2-after-escape.png) | ![After: Escape asks "Leave without saving?", with Keep editing and Leave without saving](../screenshots/3007-place-link-dirty/after-2-after-escape.png) |

### GIS Day: the sponsor form refuses a logo that is not a JPEG or PNG as soon as it is chosen

An admin could choose an SVG (or any other image type) as a sponsor's logo; the form previewed it, and the server
refused it only when the sponsor was saved (#2937, #2966). The logo picker now uses the server's own rule, defined once
and shared by both: it offers JPEG and PNG files, and a file of any other type is refused the moment it is chosen,
with the server's words, "The logo must be a JPEG or PNG image." The server still checks every file it is sent.
([#3009](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3009))

| Before | After |
| --- | --- |
| ![A sponsor's admin page before, at 1280 px, with an SVG chosen as its logo: the SVG is previewed and shown as chosen, with nothing to say it will be refused](../screenshots/3009-sponsor-logo-types/before-2-svg-chosen.png) | ![After: the SVG is refused at once, "The logo must be a JPEG or PNG image." under the picker, and the saved logo kept](../screenshots/3009-sponsor-logo-types/after-2-svg-chosen.png) |
| ![Before: a GIF chosen is taken in the same way](../screenshots/3009-sponsor-logo-types/before-3-gif-chosen.png) | ![After: the GIF is refused in the same words](../screenshots/3009-sponsor-logo-types/after-3-gif-chosen.png) |

### GIS Day admin: the RSVPs dashboard on gisday.tamu.edu counts only Texas A&M's sessions

gisday.tamu.edu shares txgisday.org's database. Since [#2986](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2986) its admin lists start with Texas A&M's sessions, but the
RSVPs dashboard listed and counted every organization's. It now lists, totals and charts only the site's own, as the
new Check-ins dashboard does. txgisday.org is unchanged.
([#3010](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3010))

Captured on a local copy of the site served as gisday.tamu.edu, for the 2025 season.

| Before | After |
| --- | --- |
| ![RSVPs for 114 events: every organization's](../screenshots/3006-check-in-dashboard/before-rsvps-tamu-site.png) | ![RSVPs for 60 events: Texas A&M's, and those with no place yet](../screenshots/3006-check-in-dashboard/after-rsvps-tamu-site.png) |
| ![ATX GIS Day's Map Gallery listed among Texas A&M's sessions](../screenshots/3006-check-in-dashboard/before-rsvps-tamu-site-table.png) | ![Only Texas A&M's sessions listed](../screenshots/3006-check-in-dashboard/after-rsvps-tamu-site-table.png) |

### GIS Day: The presentation and poster competition pages give each session's day, time and room from the sessions themselves

The competition pages had their sessions' dates, times and rooms typed in, so when the sessions moved the pages kept
the old ones: the presentation page gave 2:00 - 3:00 PM in Gates Ballroom 2400 for a session at 2:00 to 2:40 PM in
Bethancourt Ballroom 2300 C. Each page now reads its sessions, and the awards session, from the season's sessions, the
same way the acceptance emails find them, and links each to its own page. The presentation page also says what
finalists were told: 5 minutes in all, questions included.
([#3011](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3011))

| Before (production, 15 November): typed into the page, and out of date | After (the local site, whose copy of the sessions is older than production's, and has no awards session): read from the sessions, each linked |
| --- | --- |
| ![The presentation page before, giving 2:00 - 3:00 PM in Gates Ballroom 2400 and a 10 minute talk](../screenshots/3011-competition-session-times/before-presentation.png) | ![The presentation page after, each session's name linked, with its date, time and room as that database has them, and the awards session sending readers to the schedule because that copy has none](../screenshots/3011-competition-session-times/after-presentation.png) |
| ![The poster page before, giving Gates Ballroom 2400](../screenshots/3011-competition-session-times/before-posters.png) | ![The poster page after, the poster and awards sessions from the sessions](../screenshots/3011-competition-session-times/after-posters.png) |

### GIS Day: the closed Submission deadlines panel on Research Competitions reads as a box to open

Closed, the **Submission deadlines** panel (#2969) read as one line of plain text: a small chevron, the title and a run
of grey dates, with nothing to say it opens. It is now the same tinted, bordered box the admin lists use for their
selection bars, with the chevron and title in the link colour and a **Set dates** hint beside them, so it stands apart
from the submissions list below. Opened, it looks as it did.
([#3012](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3012))

| Before: closed, one line of plain text | After: closed, a box to open, with "Set dates" |
| --- | --- |
| ![Submission deadlines before, closed: a small chevron, the title and grey dates on one line, at 1280 px](../screenshots/3012-deadlines-panel-visible/before-collapsed-1280.png) | ![Submission deadlines after, closed: a tinted bordered box with the chevron, title and Set dates in the link colour, at 1280 px](../screenshots/3012-deadlines-panel-visible/after-collapsed-1280.png) |
| | ![Submission deadlines after, opened at 1280 px: unchanged, a table with one row per competition and Save deadlines on the right](../screenshots/3012-deadlines-panel-visible/after-expanded-1280.png) |

### GIS Day: The presentation competition rules say final slides are due by the file deadline, or the finalist is removed

The presentation competition's rules didn't say that finalists must upload their final slides, so a finalist reading
the page couldn't tell that missing the upload costs them their place. The rules now say so, in bold, with the date
taken from the season's own presentation file deadline, the one the site enforces.
([#3015](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3015))

| Before (production, 15 November) | After (the local site, whose season has no file deadline set, so the rule names the deadline without a date) |
| --- | --- |
| ![Competition Rules before, with nothing about uploading final slides](../screenshots/3015-slides-upload-rule/before-rules.png) | ![Competition Rules after, with the bold rule that final slides must be uploaded by the final presentation submission deadline or the finalist is removed](../screenshots/3015-slides-upload-rule/after-rules.png) |

### GIS Day admin: who has uploaded their final file, and a final reminder to those who have not

Finalists must upload their final presentation slides or poster by the season's file deadline, or they are removed from
the competition. Research Competitions now shows who has:

- a **Final file** column, **Uploaded** or **Missing**, that sorts. A submission's attachments have no kind and its
  abstract is text, so any file it has counts as its final one;
- **Send final reminder** among the actions on the selected submissions: the final warning, shown and editable before
  it goes, exactly as the acceptance emails are, with one text for presenters and one for posters, and the same
  placeholders. It goes only to accepted finalists who have no file yet: selected submissions that already have one, or
  that were not accepted (rejected, or not yet reviewed), are skipped, and the window and the result say how many of
  each.

Only admins who can review the competitions can send it. Nothing about the submissions is recorded.
([#3017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3017))

Captured on a local copy of the site at 1280 pixels wide, with made-up local test submissions; everyone else's rows are
greyed out.

| Research Competitions | Before | After |
| --- | --- | --- |
| The submissions table | ![No Final file column](../screenshots/3017-final-reminder/before-table.png) | ![A Final file column, Missing or Uploaded, sorted by it](../screenshots/3017-final-reminder/after-table-final-file-sorted.png) |
| Three presentations selected | ![Approve, Reject, Send profile email, Delete](../screenshots/3017-final-reminder/before-selected-actions.png) | ![Send final reminder among the actions](../screenshots/3017-final-reminder/after-selected-actions.png) |

| Send final reminder | |
| --- | --- |
| Three presentations: accepted with no file, accepted with a file, and rejected | ![The presentations' reminder: two skipped, one for having a file and one for not being accepted; the text to edit and its preview](../screenshots/3017-final-reminder/after-final-reminder-presentation.png) |
| Three posters: accepted with no file, accepted with a file, and not yet reviewed | ![The posters' reminder: two skipped, one for having a file and one for not being accepted; the text to edit and its preview](../screenshots/3017-final-reminder/after-final-reminder-poster.png) |

### GIS Day: the Presentation and Poster competition pages take their day and deadline from the season

The Presentation and Poster competition pages typed 2026's dates into their text: the day under the heading, the
submission deadline and its time, and the day of the poster session in the finalists' instructions. Next year they
would have been wrong unless someone remembered to change them
([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)).

Each page now gives the competition sessions' own day, found as the pages already find their sessions, and the
season's submission deadline as set in Admin, Seasons
([#2934](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2934)), the one the site enforces.
Without one set, it says the deadline is to be announced. The day finalists are told still reads 2026's: there is no
setting for it yet.

On a local build with a made-up 2027 season, the pages before and after:

| | Before | After |
| --- | --- | --- |
| Presentation, 1280 pixels | ![Before: "Tuesday, November 17th, 2026" and "Friday November 13th, 2026" above 2027's sessions](../screenshots/3019-competition-dates/before-presentation-1280.png) | ![After: "Tuesday, November 16, 2027" and "Due: Fri, Nov 12, 2027, 5:00 PM Central"](../screenshots/3019-competition-dates/after-presentation-1280.png) |
| Presentation, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-dates/before-presentation-390.png) | ![After, on a phone](../screenshots/3019-competition-dates/after-presentation-390.png) |
| Posters, 1280 pixels | ![Before: 2026's day and deadline, and "(Tuesday November 17th)" for the poster session](../screenshots/3019-competition-dates/before-posters-1280.png) | ![After: 2027's day and deadline, and the poster session's own day](../screenshots/3019-competition-dates/after-posters-1280.png) |
| Posters, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-dates/before-posters-390.png) | ![After, on a phone](../screenshots/3019-competition-dates/after-posters-390.png) |

### GIS Day: admins choose each competition's sessions and when its finalists hear

The presentation and poster pages, and the finalists' acceptance emails, found their sessions by a naming convention an
admin could not see: a `COMPETITION:` session naming the poster competition or a presentation level, and an `AWARDS:`
session ([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)). An admin now
chooses them for the season, in Research Competitions' **Competition settings**, under **Sessions and finalists**: the
poster session, the undergraduate and graduate presentation sessions, and each competition's awards session. A
competition with none chosen finds its sessions by their names, as before, so nothing changes until an admin chooses.

The same panel sets when each competition's finalists hear. The poster and presentation pages show it in Central time,
and leave the line out when it is not set. **Until an admin sets it, those pages no longer say when finalists hear**:
the date was typed in for 2026, and would have been wrong the next year.

On a local build with a made-up 2027 season, whose poster competition chose a session not named `COMPETITION:` (Poster
Gallery Walk, on the Wednesday) and set when both competitions' finalists hear:

| | Before | After |
| --- | --- | --- |
| Posters, 1280 pixels | ![Before: the COMPETITION: session on Tuesday, and finalists notified on Saturday November 14th, 2026](../screenshots/3019-competition-sessions-chosen/before-posters-1280.png) | ![After: Poster Gallery Walk on Wednesday, November 17, 2027, in the heading and the session, and finalists notified on Sat, Nov 13, 2027](../screenshots/3019-competition-sessions-chosen/after-posters-1280.png) |
| Posters, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-sessions-chosen/before-posters-390.png) | ![After, on a phone](../screenshots/3019-competition-sessions-chosen/after-posters-390.png) |
| Presentation, 1280 pixels | ![Before: finalists notified on Saturday November 14th, 2026](../screenshots/3019-competition-sessions-chosen/before-presentation-1280.png) | ![After: finalists notified on Sat, Nov 13, 2027, with its sessions found by their names, none being chosen](../screenshots/3019-competition-sessions-chosen/after-presentation-1280.png) |
| Presentation, 390 pixels | ![Before, on a phone](../screenshots/3019-competition-sessions-chosen/before-presentation-390.png) | ![After, on a phone](../screenshots/3019-competition-sessions-chosen/after-presentation-390.png) |

The admin panel's images are taken separately: it needs a signed-in admin.

### GIS Day admin: the presenter profile email is read and edited before it is sent

The email that brings a speaker their own link to update their presenter profile went out unseen from the Speakers
list and an event's page, and after a yes/no question from Research Competitions. All three now open the same window
the acceptance emails use: the subject and the text, both editable, today's as the default, with a preview of what the
first person gets. Its placeholders are {first name}, {site}, {site address}, {edit link} and {link expires}.

Each person's own link is made and filled in only when their email is sent, so the preview never shows a real link
and an edit cannot break one. A text without {edit link} is refused, and nothing is sent.
([#3023](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3023))

| Before (`development`, the local site): sent with no window from Speakers, and after a yes/no question from Research Competitions | After (the local site): the same window from all three, its subject and text editable, the preview's link a stand-in |
| --- | --- |
| ![Speakers before, a test speaker selected and Send profile email among the actions, which sent at once with nothing shown](../screenshots/3023-profile-email-preview/before-speakers-selected.png) | ![The profile email's window from Speakers: the subject and the text editable, and a preview for the first speaker in which the link reads (their own edit link, added when it is sent)](../screenshots/3023-profile-email-preview/after-speakers-window.png) |
| ![Research Competitions before, Send profile email asking only Send profile emails to the 1 person of 1 submission?, with Cancel and Send](../screenshots/3023-profile-email-preview/before-research-competition-confirmation.png) | ![The same window from Research Competitions, saying first how many people of how many submissions it is for](../screenshots/3023-profile-email-preview/after-research-competition-window.png) |
| | ![The same window from an event's Send profile emails to these speakers](../screenshots/3023-profile-email-preview/after-event-window.png) |

### GIS Day admin: the dashboards count unreadable accounts only for the site's own sessions

On gisday.tamu.edu the RSVPs and Check-ins dashboards listed only Texas A&M's sessions, but the note under each table
counted the accounts that could not be read across every organization's sessions, so it came out larger than the
records shown ("3197 RSVPs for 60 events. 3924 accounts could not be read"). The site's sessions are now chosen by the
API, so the events, the chart and that count all cover the same records, and another organization's counts no longer
leave the server.
([#3024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3024))

| Before | After |
| --- | --- |
| ![RSVPs, 2025, on gisday.tamu.edu: "3196 RSVPs for 60 events. 3924 accounts could not be read"](../screenshots/3024-unread-by-site/before-rsvps.png) | ![The same: "3196 RSVPs for 60 events. 3196 accounts could not be read"](../screenshots/3024-unread-by-site/after-rsvps.png) |
| ![Check-ins, 2025, on gisday.tamu.edu: "1590 check-ins at 60 events. 1740 accounts could not be read"](../screenshots/3024-unread-by-site/before-check-ins.png) | ![The same: "1590 check-ins at 60 events. 1590 accounts could not be read"](../screenshots/3024-unread-by-site/after-check-ins.png) |

### GIS Day admin: the Research Competitions table reads whole at 1280 px

With the Final file column (#3017), the submissions table was cramped at 1280 px: Files and Final file ran together,
short values broke mid-word ("Mis/sin/g", "Acce/pted"), and each row's checkbox covered the first letter of its title.
The Files count is gone, since Final file now says what mattered and the review page lists the files. Every column keeps
a width its values fit in, so Status, Type, Format, Classification and Final file read whole, and the checkbox has the
room it needs. Where the columns do not all fit beside the admin menu, as at 1280 and 1024 px, the table scrolls
sideways in its own box, as the dashboards' table does, rather than cutting columns off.
([#3026](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3026))

| Research Competitions, sorted by Status, local test submissions (other rows greyed out) | Before | After |
| --- | --- | --- |
| 1280 pixels wide | ![Short values broken mid-word, the checkbox over each title](../screenshots/3026-submissions-table-fit/before-1280.png) | ![No Files column; the checkbox, Name and every value through Classification in view and whole, the table scrolling in its own box to Final file and Status](../screenshots/3026-submissions-table-fit/after-1280.png) |
| 1024 pixels wide | ![Short values broken over up to eight lines](../screenshots/3026-submissions-table-fit/before-1024.png) | ![The checkbox and Name in view at the left, values whole, the table scrolling in its own box to Format and the columns after it](../screenshots/3026-submissions-table-fit/after-1024.png) |

### GIS Day: a Sessions search can be linked to, and copied as a link

The Sessions page's search now works as the Presenters page's does: the address follows the box
(`/sessions?search=competition`) without adding a history entry for each letter, and keeps the page's Tags and
Organizations filters beside it; a link that carries a search opens with the box filled and only the matching
sessions listed; and **Copy link**, inside the box, copies the whole link, ready to send. Both pages now use one
search box, so they cannot drift apart.
([#3027](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3027))

| Before | After |
| --- | --- |
| ![Typing "competition" on the Sessions page: no Copy link, and the address stays /sessions](../screenshots/3027-sessions-search-link/before-sessions-searched.png) | ![Typing "competition": Copy link in the box, and the address is /sessions?search=competition](../screenshots/3027-sessions-search-link/after-sessions-searched.png) |
| ![Opening /sessions?search=competition: the box is empty and every session is listed](../screenshots/3027-sessions-search-link/before-sessions-link-opened.png) | ![Opening /sessions?search=competition: the box is filled and only the competition sessions are listed](../screenshots/3027-sessions-search-link/after-sessions-link-opened.png) |

### GIS Day admin: the dashboards' sideways scrollbar stays in view on a narrow screen

At 1024 px the RSVPs and Check-ins tables are wider than the space beside the admin menu and scroll sideways in their
own box, but that box's scrollbar was at the bottom of a table about 19,000 px tall, so an admin could not see that
there were more columns, or reach them, without scrolling to the very end. The tables now keep a sideways scrollbar at
the bottom of the window while any of the table is on screen, and only while the table is wider than its box. It
scrolls the table, and at the end of the table it sits under the total row in place of the box's own. Both dashboards
share the table, so both have it. At 1280 px the RSVPs table fits, with no scrollbar, as before; the Check-ins table is
6 px wider than its box where the browser draws the page's own scrollbar, as on Windows, so it scrolled there before and
now shows this scrollbar too.
([#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029))

Captured on a local copy of the site with made-up people, served as gisday.tamu.edu, for the 2025 season, in a window
1024 by 768 px with the **By event** heading at the top. Scrollbars are drawn as a Windows browser draws them: the
browser that took the images was started without its default of hiding them.

| Before | After |
| --- | --- |
| ![RSVPs at 1024 px: the table is cut off after Faculty & academia, with no sideways scrollbar anywhere in the window](../screenshots/3029-dashboard-scroll/before-rsvps-1024.png) | ![The same: a sideways scrollbar along the bottom of the window, under the table](../screenshots/3029-dashboard-scroll/after-rsvps-1024.png) |
| ![Check-ins at 1024 px: cut off after the Student column, with no sideways scrollbar in the window](../screenshots/3029-dashboard-scroll/before-check-ins-1024.png) | ![The same: the sideways scrollbar along the bottom of the window](../screenshots/3029-dashboard-scroll/after-check-ins-1024.png) |
| ![Check-ins at 1024 px, the end of the table: the box's own scrollbar under the total row](../screenshots/3029-dashboard-scroll/before-check-ins-1024-end.png) | ![The same: one scrollbar under the total row, where the box's own was](../screenshots/3029-dashboard-scroll/after-check-ins-1024-end.png) |
| | ![RSVPs at 1024 px with that scrollbar moved to its end, from the top of the table: Industry and Not given in view](../screenshots/3029-dashboard-scroll/after-rsvps-1024-right.png) |
| ![RSVPs at 1280 px: every column fits, no sideways scrollbar](../screenshots/3029-dashboard-scroll/before-rsvps-1280.png) | ![The same, unchanged](../screenshots/3029-dashboard-scroll/after-rsvps-1280.png) |

### GIS Day admin: a broadcast's page lists the sessions that use it

To check which sessions a Zoom is attached to, an admin had to open each session. A broadcast's admin page now lists,
under its fields, the sessions that use it: each one's day, time and name, in date and time order, linked to the
session's admin page, with a count, or "No sessions use this broadcast." Sessions hidden from the public schedule are
included, so only admins who can edit broadcasts can see the list. On gisday.tamu.edu it shows only Texas A&M's sessions.
([#3032](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3032))

| Before | After |
| --- | --- |
| ![A broadcast used by three sessions: its admin page shows only its fields](../screenshots/3032-broadcast-sessions/before-broadcast-with-sessions.png) | ![The same broadcast: under its fields, Sessions using this broadcast, "3 sessions use this broadcast." and each session's day, time and linked name](../screenshots/3032-broadcast-sessions/after-broadcast-with-sessions.png) |
| ![A broadcast no session uses: its admin page shows only its fields](../screenshots/3032-broadcast-sessions/before-broadcast-without-sessions.png) | ![The same broadcast: under its fields, Sessions using this broadcast, "No sessions use this broadcast."](../screenshots/3032-broadcast-sessions/after-broadcast-without-sessions.png) |

### GIS Day admin: a tag's page lists the sessions that have it

So tags can be reviewed in one place, a tag's admin page now lists, under its fields, the sessions that have it: each
one's day, time and name, in date and time order, linked to the session's admin page, with a count, or "No sessions have
this tag." It is the same list a broadcast's page shows ([#3032](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3032)), with sessions hidden from the public
schedule included for admins who can edit tags. On gisday.tamu.edu it shows only Texas A&M's sessions.
([#3033](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3033))

| Before | After |
| --- | --- |
| ![A tag four sessions have: its admin page shows only its name](../screenshots/3033-tag-sessions/before-tag-with-sessions.png) | ![The same tag: under its name, Sessions with this tag, "4 sessions have this tag." and each session's day, time and linked name](../screenshots/3033-tag-sessions/after-tag-with-sessions.png) |
| ![A tag no session has: its admin page shows only its name](../screenshots/3033-tag-sessions/before-tag-without-sessions.png) | ![The same tag: under its name, Sessions with this tag, "No sessions have this tag."](../screenshots/3033-tag-sessions/after-tag-without-sessions.png) |

### GIS Day admin: Events can list only the sessions with no tags

Finding the sessions with no tags meant opening every one. Admin, Events now has **Only sessions with no tags**, beside
the list's other filters: ticked, it lists only those, each opening in the editor as before. The list shrinks as they are
tagged, and the choice is kept when an admin comes back from a session.
([#3034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3034))

| Before | After |
| --- | --- |
| ![Admin, Events for 2026: the search and the list of 46 events, with no way to pick out the untagged ones](../screenshots/3034-untagged-sessions/before-events.png) | ![The same list, with an unticked "Only sessions with no tags" box under the search](../screenshots/3034-untagged-sessions/after-events.png) |
| | ![Ticked: 1 event, the one 2026 session with no tags](../screenshots/3034-untagged-sessions/after-events-no-tags.png) |
| | ![That session's edit page with the Career tag ticked, before Update](../screenshots/3034-untagged-sessions/after-edit-tag-ticked.png) |
| | ![Back on the list after saving: still ticked, 0 events, the tagged session gone](../screenshots/3034-untagged-sessions/after-events-no-tags-tagged.png) |
| | ![2025, ticked: 10 events, the sessions with no tags, under their days](../screenshots/3034-untagged-sessions/after-events-no-tags-2025.png) |

### GIS Day: one Competition settings panel on Research Competitions, for which competitions run and their deadlines, with one Save

Research Competitions had two sections above its submissions: **Competitions in 2026**, which competitions the season
runs (#2948), with its own **Save competitions**, and the **Submission deadlines** panel (#2969, #3012), with **Save
deadlines**. They are one collapsible panel, **Competition settings**, the box #3012 made: closed, its line names the
competitions the season runs and their deadlines; open, it has the competitions' boxes, a row of deadlines for each
competition ticked, and **one Save** that sends both. If either is refused, it says which and why, and keeps what was
typed. ([#3037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3037))

| Before | After |
| --- | --- |
| ![Research Competitions before, at 1280 px: a Competitions in 2026 section with four boxes and a full-width Save competitions button, then the closed Submission deadlines box](../screenshots/3037-competition-settings/before-closed-1280.png) | ![Research Competitions after, at 1280 px: one closed Competition settings box, with Edit and a line naming the four competitions and their deadlines](../screenshots/3037-competition-settings/after-closed-1280.png) |
| ![Before, Submission deadlines opened: two sections, with Save competitions and Save deadlines](../screenshots/3037-competition-settings/before-open-1280.png) | ![After, Competition settings opened: the competitions' boxes, the deadlines table and one Save](../screenshots/3037-competition-settings/after-open-1280.png) |
| | ![After one Save: "Competitions and deadlines saved." beside Save, and the panel still open](../screenshots/3037-competition-settings/after-saved-1280.png) |
| | ![After, every competition unticked and Save: "Nothing was saved. A season must run at least one competition."](../screenshots/3037-competition-settings/after-refused-1280.png) |

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

### GIS Day admin: the finalists' profile email reaches their co-authors, and says who it can't reach

Research Competitions' **Send profile email** matched each participant's whole email box to a presenter, so a co-author
typed into the same box as someone else, or entered by NetID, matched nobody and got no email, though they are on the
program. The box is now read as the finalists' presenter records were made from it: several addresses split on commas,
semicolons and spaces, and a bare NetID read as its tamu.edu address
([#3043](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3043)).
The email starts from the maintainer's text for the competition finalists
([#3045](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3045)), and the window lists, before
anything is sent, the people on the selected submissions who have no presenter record and will not be emailed, with their
submissions, so they can be added first
([#3046](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3046)).

The same made-up group submission in both: its lead, two co-authors typed into one email box (one of them by NetID), and
one person with no presenter record.

| Before (`development`, the local site): one email, the co-authors missed, nobody listed, the old text | After (the local site): three emails, the person with no presenter record named, the new text |
| --- | --- |
| ![The profile email's window from Research Competitions for a group submission of 3 entries: Presenter profile emails (1) and Send 1 email, the two co-authors in one email box missed, and the old short text](../screenshots/profile-email-finalists/before-research-competition-window.png) | ![The same window on the branch: 1 person on these submissions will not be emailed, Drew Nospeaker3071, with the submission; Presenter profile emails (3) and Send 3 emails; the finalists' text in the box and the preview](../screenshots/profile-email-finalists/after-research-competition-window.png) |

### GIS Day admin: The editable emails take Markdown, so they can be sent with bold text, links and lists

The profile, acceptance and final-reminder emails, which an admin reads and edits before they go (#2980, #3017, #3023),
went out as plain text only, so nothing in them could be bold. Their text may now use Markdown: `**bold**`, `*italic*`,
`[link text](https://...)` and lists. Each email goes out as HTML formatted from it, with the plain text beside it, and
the window's preview shows it formatted, as it will arrive. HTML typed into the text is shown as written, never obeyed.
([#3044](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3044))

The same text, with `**Please complete your bio by Friday.**` and `*about five minutes*` typed into it, in Research
Competitions > **Send profile email**, for a made-up test presenter on a local copy of the site:

| Before | After |
| --- | --- |
| ![The preview shows the asterisks as typed](../screenshots/3044-email-markdown/before-profile-preview.png) | ![The preview shows "Please complete your bio by Friday." in bold and "about five minutes" in italics](../screenshots/3044-email-markdown/after-profile-preview.png) |
| ![The whole window before](../screenshots/3044-email-markdown/before-profile-window.png) | ![The whole window after, with the Markdown note under the placeholders](../screenshots/3044-email-markdown/after-profile-window.png) |

The HTML part of that email as the API builds it, drawn by a browser from a file: no email was sent, and the edit link
is a made-up one. A mail client applies its own fonts.

![The email's HTML part: the bold and italic line, and the edit link as a link](../screenshots/3044-email-markdown/after-email-html.png)

### GIS Day: broadcasts are listed by name, with numbers in order, on Admin > Broadcasts and in every Broadcast drop-down

The API now sorts every list of broadcasts it gives (all of them, a season's, and the active season's, which an
event's Broadcast drop-down reads) by name, once, so the list page and every drop-down agree: case is ignored and
numbers are compared as numbers, so "Zoom 2" comes before "Zoom 10". The database's own ordering compared numbers
as text and put "Zoom 10" between "Zoom 1" and "Zoom 2".
([#3047](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3047))

The screenshots are from the local site with two made-up broadcasts added for the capture, "TAMU GIS Day(s) 2025 -
Zoom 10" and "TTU 10" (Meeting ID `test-3047`), and removed afterwards. The drop-down is a native list the browser
draws outside the page, so for its screenshot the list was given a height that shows every option in the page.

| Before | After |
| --- | --- |
| ![Admin > Broadcasts for 2026 before, at 1280 px: Zoom 1, Zoom 10, Zoom 2, Zoom 3, then TTU 1, TTU 10, TTU 2, TTU 3](../screenshots/3047-broadcasts-sorted/before-broadcasts-list.png) | ![Admin > Broadcasts for 2026 after: Zoom 1, Zoom 2, Zoom 3, Zoom 10, then TTU 1, TTU 2, TTU 3, TTU 10](../screenshots/3047-broadcasts-sorted/after-broadcasts-list.png) |
| ![An event's Broadcast drop-down before, every option shown: Zoom 10 after Zoom 1, TTU 10 after TTU 1](../screenshots/3047-broadcasts-sorted/before-event-broadcast-dropdown.png) | ![An event's Broadcast drop-down after: the same order as the list page, Zoom 10 and TTU 10 last in their groups](../screenshots/3047-broadcasts-sorted/after-event-broadcast-dropdown.png) |

### GIS Day: a broadcast belongs to an organization, so each site lists only its own Zooms

gisday.tamu.edu shares txgisday.org's database, and its Admin > Broadcasts and every event's Broadcast drop-down listed
every organization's Zooms in the season: TTU 1-3, Main UT, Main Texas DSHS, SWIGGIS and ATX GIS Day beside Texas A&M's
four, so another university's Zoom could be picked for a Texas A&M session by mistake. A broadcast now has an
organization (a place), set first on its admin page as a venue's is, and required when it is saved.

- **Admin > Broadcasts** on gisday.tamu.edu lists its own organization's broadcasts, and any with no organization yet so
  an admin can find and set it, with an **Organization** column and a **Show every organization's broadcasts** switch,
  as Admin > Events does for sessions.
- **An event's Broadcast drop-down** lists the same, plus the broadcast the event already has, whoever's it is, so
  opening an event never drops its broadcast.
- txgisday.org and gisday.ucgis.org, which list every organization's sessions, still list every broadcast.

([#3048](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3048))

| gisday.tamu.edu, 1280 pixels wide | Before | After |
| --- | --- | --- |
| Admin > Broadcasts | ![Every organization's broadcasts: TTU 1-3, Main UT, Main Texas DSHS, SWIGGIS and ATX beside Texas A&M's](../screenshots/3048-broadcast-organization/before-broadcasts-list.png) | ![Texas A&M's Zooms and those with no organization yet, with an Organization column and a switch; TTU 1 and Main UT, given their organizations, are gone](../screenshots/3048-broadcast-organization/after-broadcasts-list.png) |
| The switch ticked | | ![Every organization's broadcasts again, each with its organization](../screenshots/3048-broadcast-organization/after-broadcasts-list-every-organization.png) |
| A broadcast's admin page (TTU 1) | ![No organization field](../screenshots/3048-broadcast-organization/before-broadcast-page.png) | ![Select organization first, set to Texas Tech University GIS Day](../screenshots/3048-broadcast-organization/after-broadcast-page.png) |
| An event's Broadcast drop-down | ![Every organization's broadcasts](../screenshots/3048-broadcast-organization/before-event-broadcast-dropdown.png) | ![Texas A&M's Zooms and those with no organization yet; TTU 1 and Main UT are not offered](../screenshots/3048-broadcast-organization/after-event-broadcast-dropdown.png) |

**In this order, on both sites:** the production migration `migrate-prod-3048.ps1` (kubernetes-config, `6. GIS Day/migrations`)
adds the empty, nullable column `event_broadcast.placeGuid` (`AddBroadcastPlace1794772810966`); then the API and the site;
**then** `set-broadcast-places.ps1` (`6. GIS Day/data`), dry run first, which gives each existing broadcast the
organization of the sessions that use it. It lists, and leaves alone, a broadcast whose sessions are at more than one
organization and one no session uses, for the maintainer to set on its admin page. Until a broadcast has an organization
it is listed on every site, as now. The data script needs the migration, and stops without it.

### GIS Day Admin › Events: "No sessions match the search or filters", not "no events for the selected season"

When a season had sessions but the search or a filter hid every one, Admin › Events said "There are no events for the
selected season", which reads as if the season had lost its sessions. On gisday.tamu.edu, which starts the list with
Texas A&M's sessions only, choosing 2023 said so of a season with 66. The list now tells the two apart: it says
"No sessions match the search or filters." while the season has sessions, with a button that clears the search and
filters when one is on, and keeps "There are no events for the selected season." for a season with none. The shared
admin list behind every admin page now knows the difference, so any other list that gains a filter can say the same.
([#3049](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3049))

| Admin › Events on gisday.tamu.edu (local test data) | Before | After |
| --- | --- | --- |
| A search that matches nothing, 1280 pixels wide | ![No events match the search, with no way to clear it](../screenshots/3049-no-match-message/before-events-search.png) | ![No sessions match the search or filters, with a button that clears them](../screenshots/3049-no-match-message/after-events-search.png) |
| After pressing the button | | ![The search cleared and the list back](../screenshots/3049-no-match-message/after-events-cleared.png) |
| 2023, every session another organization's | ![There are no events for the selected season](../screenshots/3049-no-match-message/before-events-2023.png) | ![No sessions match the search or filters](../screenshots/3049-no-match-message/after-events-2023.png) |

### GIS Day: every admin search box has the X that clears it

The public Sessions and Presenters searches have had an X that empties them since #2963; the admin lists' search box
did not, so a search could only be cleared by deleting it. The search box the admin lists share (Classes, Venues,
Events, Organizations, Affiliations, Speakers, Sponsors, Universities, Users and others) now has it, and so does the
Speaker badges dashboard's own search. Pressing it empties the box and lists everything again.
([#3051](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3051))

| Before | After |
| --- | --- |
| ![Admin > Speakers before, at 1280 px: "texas" typed in the search, Showing 338 of 773 speakers, and no way to clear it](../screenshots/3051-admin-search-clear/before-speakers-search-1280.png) | ![Admin > Speakers after, at 1280 px: the same search, with an X at the right of the box](../screenshots/3051-admin-search-clear/after-speakers-search-1280.png) |
| | ![After pressing the X: the box empty with its placeholder, and "773 speakers." listed again](../screenshots/3051-admin-search-clear/after-speakers-cleared-1280.png) |
| ![Speaker badges before: "texas" typed, Showing 13, and no way to clear it](../screenshots/3051-admin-search-clear/before-badges-search-1280.png) | ![Speaker badges after: the same search with an X inside the box](../screenshots/3051-admin-search-clear/after-badges-search-1280.png) |
| | ![Speaker badges after pressing the X: the box empty and Showing 18 again](../screenshots/3051-admin-search-clear/after-badges-cleared-1280.png) |

### GIS Day: a session's Online Broadcast panel shows its dial-in number, not its password

On a hybrid or virtual session's page, signed in, the **Online Broadcast** panel's "Dial-in number" line showed the
meeting's password whenever the broadcast had a phone number, so someone dialling in had no number to call. It now
shows the phone number. ([#3055](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3055))

| Before | After |
| --- | --- |
| ![The Online Broadcast panel before, at 1280 px, on the local copy's placeholder broadcast: Dial-in number reads 000000, the same as the Password](../screenshots/3055-dial-in-number/before-broadcast-panel-1280.png) | ![The panel after: Dial-in number reads 000-000-0000, the broadcast's phone number](../screenshots/3055-dial-in-number/after-broadcast-panel-1280.png) |

### gisday.tamu.edu lists 2023's Texas A&M sessions

gisday.tamu.edu lists only Texas A&M's sessions, found by the name of the organization they are held under, "Texas A&M
University GIS Day(s)". In 2023 that organization was named "Texas A&M University", so the site's admin Events list,
and its pages for 2023, showed none of that year's Texas A&M sessions. Both names now count as Texas A&M's, so 2023's
20 sessions are listed; Texas A&M University-Corpus Christi's, whose name begins with the same words, are not.
([#3057](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3057))

| Admin > Events, 2023, on the local site served as gisday.tamu.edu (site header greyed out) | Before | After |
| --- | --- | --- |
| 1280 pixels wide | ![2023 with no sessions: no sessions match the search or filters](../screenshots/3057-tamu-2023-sessions/before-events-2023.png) | ![2023 with Texas A&M's 20 sessions, starting Sunday 12 November](../screenshots/3057-tamu-2023-sessions/after-events-2023.png) |
| The whole page, after | | ![All 20 sessions, Sunday 12 to Tuesday 14 November](../screenshots/3057-tamu-2023-sessions/after-events-2023-full.png) |

### GIS Day: every image picker refuses what the server would, as soon as a file is chosen

The sponsor form's logo picker already refused a file the server would refuse as soon as it was chosen, in the server's
words ([#3009](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3009)). The organization, place and speaker forms and a presenter's own edit page each had their own copy of
the allowed types, or none, so an SVG was taken, previewed, and only refused on save. Every picker now uses one shared
rule: JPEG or PNG, up to 5 MB, refused at once with the same message
([#3074](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3074)).

| Before | After |
| --- | --- |
| ![An organization's admin page before, at 1280 px, with an SVG chosen as its logo: the SVG is previewed and shown as chosen, with nothing to say it will be refused](../screenshots/3074-image-upload-rule/before-organization.png) | ![After: the SVG is refused at once, "The logo must be a JPEG or PNG image." under the picker, and the saved logo kept](../screenshots/3074-image-upload-rule/after-organization.png) |
| ![A place's admin page before: the SVG is taken and previewed in the same way](../screenshots/3074-image-upload-rule/before-place.png) | ![After: "The logo must be a JPEG or PNG image.", and the saved logo kept](../screenshots/3074-image-upload-rule/after-place.png) |
| ![A made-up speaker's admin page before: the SVG is taken and previewed as the photo](../screenshots/3074-image-upload-rule/before-speaker.png) | ![After: "The photo must be a JPEG or PNG image.", and no photo taken](../screenshots/3074-image-upload-rule/after-speaker.png) |
| ![A made-up presenter's edit link before, at 390 px: the SVG was already refused there, in its own words, "image.svg is not a JPEG or PNG photo."](../screenshots/3074-image-upload-rule/before-edit-link-390.png) | ![After: the same refusal in the shared words, "The photo must be a JPEG or PNG image."](../screenshots/3074-image-upload-rule/after-edit-link-390.png) |

### Scanning a session's QR code checks the attendee in, at every session

A session's check-in QR code only opened the session's page with its code. The attendee then had to find and press
CHECKIN, which shows only while check-in is open and only to someone signed in with a complete profile; signed out, the
page said only "You must be logged in", with no way to sign in from there. Tested before GIS Day, the codes seemed to
take people back to the same page and do nothing.

- **Scanning is the check-in.** Arriving from the code, signed in with a complete profile while check-in is open, checks
  the attendee in with no button press. A refusal shows beside the button, which stays for a second try.
- **Sign-in first.** Signed out, the page offers sign-in, or a new account, and comes back to the same link, code
  included, which then checks in.
- **Too early, it says when.** "Check-in opens at 2:00 PM.", with the day when it is not today, in Central time.
- **Every session has a code.** At an in-person session it is the backup for a phone that will not give its location:
  the code checks the attendee in without it. The location button is unchanged for everyone else.
([#3077](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3077))

| The session's Checkin section, on the local site served as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| Signed out, with the code | ![You must be logged in to checkin](../screenshots/3077-qr-checkin/before-signed-out.png) | ![Sign in, or create an account, with a SIGN IN button](../screenshots/3077-qr-checkin/after-signed-out.png) |
| Signed in, with the code | ![A CHECKIN button to press](../screenshots/3077-qr-checkin/before-signed-in.png) | ![Your attendance has been registered, with no press](../screenshots/3077-qr-checkin/after-signed-in.png) |
| Before check-in opens | ![Checkin will be available at the start of the session](../screenshots/3077-qr-checkin/before-not-open.png) | ![Check-in opens at a named time](../screenshots/3077-qr-checkin/after-not-open.png) |
| An organizer, an in-person session | ![No check-in QR code panel](../screenshots/3077-qr-checkin/before-organizer-in-person.png) | ![The check-in QR code panel, with its in-person wording](../screenshots/3077-qr-checkin/after-organizer-in-person.png) |

### GIS Day: a venue's check-in zone is drawn and seen on a map

A venue's check-in zone was set only by typing its corners, one `latitude, longitude` per line, and could not be seen.
Admin > Venues now shows a map beside the Check-In Zone Corners box, stacked under it on a phone. A venue's corners
show on the map as the page opens; with none, the map opens on campus. **Draw** starts a zone (click each corner,
double-click the last), clicking the zone lets a corner or the whole zone be dragged, and **Clear** removes it. The
map and the box are one value: what is drawn is written into the box in its own format, and what is typed is drawn.
The box is still what is saved, so nothing changes in the API or the database, and an event still uses its venue's
zone. ([#3078](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3078))

| Admin > Venues > TAMU OMB Lobby, with test corners around the Eller O&M Building set on the local database (site header greyed out; nothing saved) | Before | After |
| --- | --- | --- |
| 1280 pixels wide | ![The Check-In Zone Corners box with four typed corners, and no map](../screenshots/3078-zone-map/before-1280.png) | ![The box beside a map with the zone drawn around the Eller O&M Building](../screenshots/3078-zone-map/after-1280.png) |
| 390 pixels wide | ![The box with four typed corners](../screenshots/3078-zone-map/before-390.png) | ![The map stacked under the box, with the zone drawn](../screenshots/3078-zone-map/after-390.png) |
| After dragging the zone's north-west corner on the map | | ![The zone being changed on the map, and the box's first line rewritten with the corner's new position](../screenshots/3078-zone-map/after-1280-corner-moved.png) |

### A session's QR code opens a check-in page that says whether you are checked in

Scanning a session's check-in QR code opened the session's own page, which checked the attendee in with nothing on the
first screen to say so; signed out, its sign-in button was below the fold. Testing it the day before GIS Day, there was
no telling whether the code had done anything.

The code now opens a page of its own. It says "Checking you in…", then the outcome in words: "You're checked in",
"You're already checked in", or "You are not checked in" with the reason (check-in has not opened yet, has closed, the
code is another session's, the profile is not complete). A "Go to the session" button leads on, and nothing moves on by
itself, so the status stays on screen. An attendee who is signed out is sent to sign in, or create an account, and comes
back to the page to be checked in. The session's own page no longer checks anyone in by itself.
([#3081](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3081))

| On a phone, 390 pixels wide | Before | After |
| --- | --- | --- |
| Scanning the code, signed in | ![The session page, with nothing on the first screen about check-in](../screenshots/3081-checkin-page/before-scan.png) | ![You're checked in, with Go to the session](../screenshots/3081-checkin-page/after-checked-in.png) |
| Scanning it again | | ![You're already checked in](../screenshots/3081-checkin-page/after-already.png) |
| Before check-in opens | | ![You are not checked in, with when it opens](../screenshots/3081-checkin-page/after-not-open.png) |
| Signed out, after cancelling sign-in | | ![You are not checked in yet, with SIGN IN](../screenshots/3081-checkin-page/after-signed-out.png) |
| The organizer's QR code, 1280 pixels | | ![The QR panel, its link to the check-in page](../screenshots/3081-checkin-page/after-organizer-link.png) |

### GIS Day admin: a speaker-edit decision that fails says why

When approving or rejecting a speaker's edit failed, Admin > Speakers > edits said only "Please try again.", whatever
the server answered. It now says the server's own reason (for example "That edit is not waiting for review." when
another admin got there first), names the permission an account lacks as the dashboards do, and keeps "Please try again."
for when the server itself failed.
([#3083](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3083))

| Admin, Speakers, edits, 1280 pixels | Before | After |
| --- | --- | --- |
| The edit was already decided (404) | ![Could not save the decision, Please try again](../screenshots/3083-edit-decision-message/before-404.png) | ![That edit is not waiting for review](../screenshots/3083-edit-decision-message/after-404.png) |
| The account lacks the permission (403) | ![Could not save the decision, Please try again](../screenshots/3083-edit-decision-message/before-403.png) | ![The missing permission named](../screenshots/3083-edit-decision-message/after-403.png) |

### GIS Day: On gisday.tamu.edu, a search box's focus outline and its Copy link are maroon

Texas A&M's GIS Day site wears the university's maroon, but its search boxes still lit up light blue when clicked into,
and the Copy link inside them was blue. Both now take the site's own maroon (`#500000`), from the same setting that
makes its header and links maroon, so txgisday.org and UCGIS keep their blue. Every text box on gisday.tamu.edu gets
the maroon outline, not only the search boxes.
([#3084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3084))

| Before (the local site as gisday.tamu.edu, search box focused) | After |
| --- | --- |
| ![The Sessions page on gisday.tamu.edu searching for intel, the focused box outlined in light blue and Copy link in blue beside the maroon header](../screenshots/3084-tamu-maroon/before-tamu-1280.png) | ![The same page after, the focused box outlined in maroon and Copy link in maroon](../screenshots/3084-tamu-maroon/after-tamu-1280.png) |
| ![The same page at phone width before, blue outline and Copy link](../screenshots/3084-tamu-maroon/before-tamu-390.png) | ![The same page at phone width after, maroon outline and Copy link](../screenshots/3084-tamu-maroon/after-tamu-390.png) |
| ![txgisday.org's Sessions page before, a light blue outline and a blue Copy link](../screenshots/3084-tamu-maroon/before-txgisday-1280.png) | ![txgisday.org's Sessions page after, unchanged](../screenshots/3084-tamu-maroon/after-txgisday-1280.png) |

### The QR check-in page says it once, names the day check-in opens, and spaces its buttons

Three things the lab found on the new check-in page (#3081). A successful check-in also raised the site's older pop-up,
"Successfully checked-in for this event.", over the page that already said so; it no longer does, there or on the session
page, which says the outcome in its Checkin section. A code scanned before the session's day was refused with "opens when
it starts, at 9:00 AM", which read as if it opened that day; the reason now names the day when it is not today, in
Central time, as the session page's own message does. Signed out, SIGN IN and "Go to the session" sat side by side with
no space; they are now one per row.
([#3089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3089))

| On a phone, 390 pixels wide | After |
| --- | --- |
| Checked in: no pop-up over the page | ![You're checked in, with nothing in the corner](../screenshots/3089-checkin-polish/after-checked-in.png) |
| The day before the session | ![Opens when it starts, on a named day](../screenshots/3089-checkin-polish/after-day-before.png) |
| Signed out, after cancelling sign-in | ![SIGN IN above Go to the session](../screenshots/3089-checkin-polish/after-signed-out.png) |

### GIS Day: The admins preview a submission's PDFs on its review page

The admins reviewing a research competition submission can now look through its PDFs on the page, without downloading
each one. A Preview beside each PDF opens it under the list, in the browser's own viewer, with Previous and Next between
the submission's PDFs. A PowerPoint is still downloaded: no browser draws one, and converting them on the server is
waiting on a decision about the size it would add. Only the admins see the preview; a student still downloads their own
files.
([#3090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3090))

| Desktop, 1280 pixels | Before | After |
| --- | --- | --- |
| A submission's files | ![The files, each only a download](../screenshots/3090-submission-file-preview/before-files.png) | ![A Preview beside each PDF, none beside the PowerPoint](../screenshots/3090-submission-file-preview/after-files.png) |
| A PDF previewed | | ![The made-up poster shown under the list, with Previous, Next and Close](../screenshots/3090-submission-file-preview/after-preview-pdf.png) |

The submission and its files are made up.

### A new speaker photo shows at once, instead of the old one

A speaker who sent a new photo through their profile link, once an admin approved it, kept seeing the old one: on
Presenters, on the admin's speaker page, and as "Now" in the next edit review. The photo had been saved, but under the
same address as the old one, and the site tells browsers to keep an uploaded image for a year, so a browser that had seen
the old photo never fetched the new one. Every new speaker photo now gets an address of its own, whether it comes through
a profile link or the admin page, so it shows as soon as it is saved. A photo approved before this keeps its address:
send the speaker a new link, or upload it again from the admin page, to give it a new one.
([#3091](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3091))

### GIS Day admin: a session's speakers get its details by email, and a page's email actions are one menu

A session's admin page could email its speakers only their profile links. It can now send them the session's details
too, and both emails are in one **Email these speakers** menu, so email actions no longer stack across the page.

- **Session details** opens the window the profile and acceptance emails use: the subject and text editable, Markdown,
  and a preview of what the first speaker gets, with anyone who has no email address named before sending. The text
  starts from the session as it is saved: its name; its day and time in Central; its building and room, or "Online"
  for a virtual session; for a hybrid or virtual one, its broadcast's link, password, dial-in number and meeting ID, as
  the session's page shows them; that attendees check in by scanning the session's QR code, shown at the session; and
  what to bring, from the session's requirements.
- It is sent like the profile email: several at a time, only by an admin who can edit speakers, and never twice to the
  same speaker for the same session within 10 minutes, so a repeated request emails no one twice.
- **Research Competitions'** selection bar has one **Email** menu, **Profile email** and **Final reminder**, in place
  of the two actions side by side. Approve, Reject and Delete are unchanged.
- The menu is a shared one (`tamu-gisc-action-menu`) that works from the keyboard and with a screen reader: the arrow
  keys move through it, Enter chooses, and Escape closes it without leaving the page.

([#3092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3092))

| On the local site, as an admin, with made-up test speakers | Before | After |
| --- | --- | --- |
| A session's Speakers section | ![Send profile emails to these speakers, a link on its own](../screenshots/3092-session-details-email/before-session-speakers.png) | ![One Email these speakers button with a drop-down arrow](../screenshots/3092-session-details-email/after-session-speakers.png) |
| The menu open | | ![Profile email and Session details in a small menu under the button](../screenshots/3092-session-details-email/after-session-menu-open.png) |
| The session details email | | ![The window with the subject and text filled in from the session, and its preview](../screenshots/3092-session-details-email/after-session-details-window.png) |
| Its preview, closer | | ![When, where, the session page, the online link, password, dial-in and meeting ID, check-in by QR code and what to bring](../screenshots/3092-session-details-email/after-session-details-preview.png) |
| Research Competitions, one selected | ![Approve, Reject, Send profile email, Send final reminder and Delete side by side](../screenshots/3092-session-details-email/before-research-competition-bar.png) | ![Approve, Reject, Email and Delete](../screenshots/3092-session-details-email/after-research-competition-bar.png) |
| Its Email menu open | | ![Profile email and Final reminder in a menu above the bar](../screenshots/3092-session-details-email/after-research-competition-menu.png) |

### GIS Day: speakers upload their sessions' slides from their edit link, and admins see them

Session speakers can now send their slides from the private link they already get by email to edit their profile, with
no account and no sign-in, as competition finalists send their files.

- **Your sessions**, under the profile on the edit-link page, lists each session the speaker presents this season, with
  its day, time and room. Each has the speaker's own slides: **Upload slides** (PDF or PowerPoint, up to 100 MB), and
  what they have uploaded with its name, size and when, each with its own **Remove**. Each speaker uploads their own,
  **up to three files for each session**; a fourth is refused with the reason. An upload is kept at once, with no
  approval and no deadline, and only the speaker who uploaded it and the GIS Day team can see it (decided 15 November
  2026).
- A speaker sees and removes **only their own files**: another speaker on the same session uploads theirs separately,
  and neither sees the other's. A link reaches only its own speaker's sessions and files. The files are received,
  checked and kept exactly as competition submissions' files are, with the same rules and the same words when a file is
  refused.
- **Admins** see every speaker's files in a new **Slides** section on the session's page, **each labelled with who
  uploaded it**, where the file name downloads the original, and in the **Events** list: a **Slides** column with the
  date they came, or None, and **Only sessions with no slides**, to see which sessions are still to send theirs. A
  session has slides when any of its speakers has uploaded one.

**Before deploying:** the database needs the migration `AddSessionFiles1794786922753`, which adds two nullable columns
to `assets`: `eventGuid`, with a foreign key to `events` that deletes a session's slides with the session, and
`uploadedByGuid`, the speaker who uploaded each file, with a foreign key to `speakers` that keeps the file if the speaker
is deleted. It is run on production by `6. GIS Day/migrations/migrate-prod-3093.ps1` in kubernetes-config, which needs
`AddBroadcastPlace1794772810966` ([#3048](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3048)) first.

([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093))

| On the local site, with made-up test speakers and sessions | Before                                                                                                  | After                                                                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The speaker's edit-link page                               | ![The profile form and nothing about sessions](../screenshots/3093-speaker-slides/before-edit-link.png) | ![Your sessions under the profile, each session with Upload slides and up to 3 files](../screenshots/3093-speaker-slides/after-edit-link-sessions.png) |
| After an upload                                            |                                                                                                         | ![The PDF's name, size and time, with Remove, and Upload slides for another](../screenshots/3093-speaker-slides/after-edit-link-uploaded.png)          |
| Three files on a session                                   |                                                                                                         | ![Three files, each with its own Remove, and no upload](../screenshots/3093-speaker-slides/after-edit-link-three-files.png)                            |
| Another speaker on the same session                        |                                                                                                         | ![The second speaker's own file only](../screenshots/3093-speaker-slides/after-edit-link-other-speaker.png)                                            |
| The whole page                                             |                                                                                                         | ![The profile, then Your sessions](../screenshots/3093-speaker-slides/after-edit-link-full.png)                                                        |
| On a phone, 390 px                                         | ![The profile form only](../screenshots/3093-speaker-slides/before-edit-link-390.png)                   | ![Your sessions at phone width](../screenshots/3093-speaker-slides/after-edit-link-390.png)                                                            |
| The session's admin page                                   | ![Speakers, then Tags](../screenshots/3093-speaker-slides/before-admin-session.png)                     | ![A Slides section with both speakers' files, each labelled with who uploaded it](../screenshots/3093-speaker-slides/after-admin-session-slides.png)   |
| The admin Events list                                      |                                                                                                         | ![A Slides column: the upload date for one session, None for the other](../screenshots/3093-speaker-slides/after-admin-sessions-slides.png)            |
| Only sessions with no slides                               |                                                                                                         | ![Only the session without slides](../screenshots/3093-speaker-slides/after-admin-sessions-no-slides.png)                                              |

### GIS Day admin: a repeated session details email is caught whichever copy of the API it reaches

A session's details email (#3092) is never sent twice to the same speaker within ten minutes, so a repeated request
emails no one again. That guard was kept in each copy of the API's memory, and production runs two copies, so a repeat
that reached the other copy went out again. Each send is now recorded, before it goes, in a table both copies share
(which speaker was sent which session's details, and when), as the profile email's guard already was. A together
email's whole group is guarded at once.

**Before the API is deployed**, the production migration `migrate-prod-3098.ps1` runs
`AddSessionDetailsSends1795448491167`, which adds the one empty table it needs, `session_details_sends`.
([#3098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3098))

### GIS Day admin: choose who an email is sent as, your own address by default

Every email the admins send from the site came from the site's address, with replies to its shared inbox. The email
window now has a **Send as** box, so an email can come from the admin sending it, which reads as less like spam.

- **Every email that uses the window gets it**: the profile email (from Speakers, an event and Research Competitions),
  the session details email, the acceptance and rejection emails, and the final reminder.
- **The choices**: your own address, chosen by default, sent as "Your Name (Site name)" with replies to you; the site's
  address, as before; and shared addresses listed in the API's new **`MAILROOM_SENDERS`** setting, comma-separated. They
  are offered, not typed.
- **Only tamu.edu addresses.** The API checks the choice on every send before anything is sent or decided: your own
  address comes from your sign-in, never from the request, and anything that is not yours, the site's or a listed shared
  address is refused with a reason. An entry of `MAILROOM_SENDERS` outside tamu.edu is ignored, with a warning in the
  API's log. An admin signed in with an address outside tamu.edu is told why theirs is not offered.
- The preview shows the **From** recipients will see and where replies go.

`MAILROOM_SENDERS` is documented in the API's `.env.sample` and in kubernetes-config's GIS Day settings table. Unset,
the box offers your own address and the site's.

([#3100](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3100))

| On the local site, as an admin, with a made-up test submission and made-up shared addresses | Before | After |
| --- | --- | --- |
| The profile email's window | ![The window with no choice of sender and no From line in the preview](../screenshots/3100-send-as/before-composer.png) | ![A Send as box at the top, and a From and Replies to line in the preview](../screenshots/3100-send-as/after-composer.png) |
| The box open | | ![The Send as box listing the shared addresses](../screenshots/3100-send-as/after-composer-choices.png) |
| Another address chosen | | ![The preview's From and Replies to following the address chosen](../screenshots/3100-send-as/after-composer-other-choice.png) |

The local test account's address is not a tamu.edu one, so these show the shared addresses and the line saying why its
own is not offered; the local site has no `MAILROOM_FROM`, so the site's address is not offered there either.

### GIS Day admin: choose which speakers get an email, together or a copy each

The session details email went to every speaker on the session, a copy each, and the profile email to every speaker the
page named. The email window now lists the speakers, so the admin chooses who gets it.

- **Who gets it**: each speaker with an address has a tick box, all ticked to start. Anyone without an address is still
  named above, as before. Nothing can be sent with no one ticked.
- **One email to all of them together, or a copy each.** With more than one speaker ticked, the session details email
  goes to all of them together by default: one email with every one on the To line, so they see each other and can
  reply to all, and a greeting that names them all ("Howdy Ana and Ben,", "Howdy Ana, Ben and Cara,"). The preview shows
  that email exactly. **A copy each** sends each their own, as before.
- **The repeat guard counts a together email once**, for its whole group: sent again within 10 minutes, it is skipped
  once, naming the group, and each of the group counts as emailed.
- **The profile email is always a copy each.** It carries each speaker's own link to edit their profile, so one email to
  several would hand each of them the others' links. The window says so, and the API refuses a profile email asked to go
  together. Its tick boxes work the same way, from the Speakers list, an event and Research Competitions.
- **A broadcast line with no value is left out** of the session details email: "Dial-in number: None" is no longer
  written when a broadcast has no phone number.

Any speaker email the window sends can offer the same choice, which the coming slides request
([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113)) will use.

([#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104))

| On the local site, as an admin, with a made-up hybrid session and three made-up speakers | Before | After |
| --- | --- | --- |
| Session details: the window's top | ![No list of speakers: each person gets their own copy](../screenshots/3104-speaker-choice/before-session-details-composer.png) | ![Who gets it: three speakers ticked, and One email to all of them together chosen](../screenshots/3104-speaker-choice/after-session-details-composer.png) |
| Session details: the preview | ![As the first speaker gets it, To one address, with Dial-in number: None](../screenshots/3104-speaker-choice/before-session-details-preview.png) | ![The one email to all of them: every address on To, Howdy Ana, Ben and Cara, and no dial-in line](../screenshots/3104-speaker-choice/after-session-details-preview.png) |
| A copy each, one speaker unticked | | ![Two ticked, A copy each chosen, two emails](../screenshots/3104-speaker-choice/after-session-details-copy-each.png) |
| Profile email | ![No list of speakers](../screenshots/3104-speaker-choice/before-profile-composer.png) | ![The same tick boxes, no together choice, and why: each copy carries the speaker's own edit link](../screenshots/3104-speaker-choice/after-profile-composer.png) |

The local test account's address is not a tamu.edu one and the local site has no `MAILROOM_FROM`, so the windows say the
email will be sent from the site's address (the Send as box of
[#3100](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3100), on which this is built).

### GIS Day admin: admins can remove a session's slide files

A session's slides ([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093)) could be removed only by the speaker who uploaded them, so a file whose speaker had since been
deleted, shown as "A speaker no longer listed", stayed on the session for good. On the session's admin page each file
now has a **Remove**, which asks on the page first, naming the file and who uploaded it, and then removes the file and
its record ([#3105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3105)).

| Before | After |
| --- | --- |
| ![A session's Slides on its admin page with one made-up file, which can only be downloaded](../screenshots/3105-remove-session-files/before-slides.png) | ![The same Slides, the file now with a Remove](../screenshots/3105-remove-session-files/after-slides-remove.png) |
|  | ![After Remove, the question asked on the page: remove the file, uploaded by its speaker? It cannot be undone. With Remove the file and Keep it](../screenshots/3105-remove-session-files/after-confirm.png) |
|  | ![After Remove the file, the Slides list reads No slides uploaded yet.](../screenshots/3105-remove-session-files/after-removed.png) |

### GIS Day admin: ask a session's speakers for their slides

A session's **Email these speakers** menu has a third email, **Ask for slides**, beside Profile email and Session
details. It opens the same window, with a template of its own that the admin reads and can edit first, subject included:

- **The session**: its name, its day and time in Central, and its room, as the session details email gives them.
- **Where to upload**: each speaker's own link to their presenter page, where **Your sessions** takes their slides
  ([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093)). It is the same link the
  profile email sends, made when the email goes; the preview shows a stand-in, never a real link.
- **What may be uploaded**, in words made from the upload rule itself (PowerPoint or PDF files, .pdf, .ppt or .pptx, up
  to 100 MB each, up to 3 files for each session), so the email cannot promise what the upload refuses.

**It always goes as a copy each.** Every copy carries its speaker's own link, so one email to several would hand each
of them the others'. The speakers are chosen with the tick boxes of
[#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104); the window offers no
"together" and says why, and the API refuses one asked to go together. It goes from the sender chosen in **Send as**
([#3100](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3100)), and, as the other speaker
emails, a speaker asked for a session's slides in the last 10 minutes is skipped and named, so a repeated click emails
no one twice.

([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113))

| On the local site, as an admin, with a made-up hybrid session and two made-up speakers | Before | After |
| --- | --- | --- |
| Email these speakers | ![Two items: Profile email and Session details](../screenshots/3113-ask-for-slides/before-menu.png) | ![Three items: Profile email, Session details and Ask for slides](../screenshots/3113-ask-for-slides/after-menu.png) |
| Ask for slides: the window's top | | ![Both speakers ticked, no together choice, and why: each copy carries their own link to upload their slides](../screenshots/3113-ask-for-slides/after-composer.png) |
| Ask for slides: the preview | | ![As the first speaker gets it: the session's day, time and room, the stand-in for their own link, and what may be uploaded](../screenshots/3113-ask-for-slides/after-preview.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site.

### GIS Day: Texas A&M GIS Day's emails use the GIS Day email design

Every email gisday.tamu.edu sends to a person now arrives in the Texas A&M GIS Day email design the department uses for
its campaign emails, rather than as plain text
([#3114](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3114)):

- a maroon top bar, a title block with this season's dates, and a strip of the season's days, all filled in from the
  season rather than typed;
- the email's own text, as edited in the window, with its Markdown formatting;
- for the session details email, the session's name, when, where and online link in a details box;
- a sign-off with the name and address chosen in Send as, and a footer saying why the person is getting it, with no
  unsubscribe line, since each is a one-to-one email about the person's own profile, session or submission.

That covers the presenter profile email and edit links, the session details email, and the competition's decision,
finalist and reminder emails. Each still carries a plain-text version. The email window's preview shows the whole email
as it will arrive. txgisday.org and the UCGIS site keep their plain emails until each has a design of its own.

| The email window's preview, 1280 pixels | Before | After |
| --- | --- | --- |
| gisday.tamu.edu, profile email: title block | ![The profile email as plain text](../screenshots/3114-tamu-email-design/before-profile.png) | ![The maroon bar, YOUR PRESENTER PROFILE, GIS DAY(S), November 16–20, 2026 and the day strip](../screenshots/3114-tamu-email-design/after-profile-title.png) |
| gisday.tamu.edu, profile email: sign-off | | ![The text's closing line, the divider and the footer, with no unsubscribe line](../screenshots/3114-tamu-email-design/after-profile-signoff.png) |
| gisday.tamu.edu, session details: title block | ![The session details email as plain text](../screenshots/3114-tamu-email-design/before-session-details.png) | ![YOUR SESSION over GIS DAY(S), the season's dates and days](../screenshots/3114-tamu-email-design/after-session-details-title.png) |
| gisday.tamu.edu, session details: text | | ![The email's own text, with its Markdown formatting](../screenshots/3114-tamu-email-design/after-session-details-text.png) |
| gisday.tamu.edu, session details: details box and sign-off | | ![The session's name, when, where and online link in the details box, then the footer](../screenshots/3114-tamu-email-design/after-session-details-box.png) |
| gisday.tamu.edu, review decision (Approve): title block | ![The acceptance email as plain text](../screenshots/3114-tamu-email-design/before-review.png) | ![YOUR SUBMISSION over GIS DAY(S), the season's dates and days](../screenshots/3114-tamu-email-design/after-review-title.png) |
| gisday.tamu.edu, review decision (Approve): sign-off | | ![The closing lines and the footer about the person's submission](../screenshots/3114-tamu-email-design/after-review-signoff.png) |
| txgisday.org, session details | | ![The same email, still plain](../screenshots/3114-tamu-email-design/after-txgisday-plain.png) |

### Admin, Users' search finds people instead of spinning

The search added to Admin, Users the same evening asked Auth0 for any name or email containing the words, which Auth0's
user search refuses, so every search spun for ever. It now finds names, first names, last names and email addresses that
start with each word typed, asks for at least 3 letters (Auth0 needs them), and says why when a search is refused.
([#3116](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3116))

| Admin, Users, 1280 pixels (no before: locally the old search answered rather than spinning) | After |
| --- | --- |
| "zh", 2 letters | ![Type at least 3 letters of a name or email to search](../screenshots/3116-user-search/after-hint.png) |
| A first name from the local test tenant (the name, the row and the search box masked) | ![Showing 1 of 1 user](../screenshots/3116-user-search/after-search.png) |

### GIS Day admin: a long people list keeps its sideways scrollbar in view

An opened row's people, on every admin dashboard, now sit in a box no taller than the window, which scrolls up and down
inside itself ([#3120](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3120)). On VGI
submissions, opening a feature type with 705 submitters drew a box as tall as all of them, so its own sideways scrollbar,
the only way to reach the count and date columns, was about 38,000 px down the page. It is now at the bottom of the box,
in the same window as the row's name. The page itself is 2,885 px tall with that type open, not 40,293.

A short list is only as tall as its people. The email column is 10 px narrower at its narrowest, so an RSVP or check-in
list still fits beside the admin menu at 1280 px with the box's up-and-down scrollbar, with no sideways one.

Measured in a local copy at 1280 x 900, names and emails hidden:

| Before | After |
| --- | --- |
| ![Unknown Art Piece opened: the people box runs off the bottom of the window, with no sideways scrollbar in sight](../screenshots/3120-people-scroll-cap/before-feature-type-open.png) | ![The same row opened: the box ends above the window's bottom, with its own up-and-down and sideways scrollbars](../screenshots/3120-people-scroll-cap/after-feature-type-open.png) |
| | ![The box scrolled sideways by its own scrollbar to its last columns: New finds, Repeats, First submitted](../screenshots/3120-people-scroll-cap/after-feature-type-open-right.png) |
| ![RSVPs on gisday.tamu.edu, 2025, the largest event opened: 123 people running off the window](../screenshots/3120-people-scroll-cap/before-rsvps-open.png) | ![The same, in a capped box with an up-and-down scrollbar and no sideways one](../screenshots/3120-people-scroll-cap/after-rsvps-open.png) |
| ![Check-ins, 2025, the largest event opened: 78 people running off the window](../screenshots/3120-people-scroll-cap/before-check-ins-open.png) | ![The same, in a capped box](../screenshots/3120-people-scroll-cap/after-check-ins-open.png) |

### GIS Day: a dashboard's people table keeps its column headings in view as it scrolls

On Admin, Dashboards, the people under an opened row are kept in a box no taller than the window, which scrolls up and
down inside itself ([#3120](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3120)). Its
column headings scrolled away with the rows, so halfway down a long list, such as the 705 people under one VGI feature
type, nothing said which column was which. The headings now stay at the top of the box while the rows scroll under
them, on the page's own background
([#3125](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3125)).

| VGI submissions, season 2025, Unknown Art Piece opened, at 1280 × 900 on the local site as gisday.tamu.edu, the people's box scrolled halfway down | Before | After |
| --- | --- | --- |
| Scrolled inside the box | ![The box of people scrolled halfway down, with no column headings in it](../screenshots/3125-people-headings/before-scrolled.png) | ![The same box with its column headings at its top](../screenshots/3125-people-headings/after-scrolled.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. People's names and emails
are blanked in the images.

### GIS Day admin: Ask for slides uses Texas A&M's GIS Day email design on gisday.tamu.edu

The **Ask for slides** email ([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113))
now goes from gisday.tamu.edu in the Texas A&M GIS Day email design, as the session details email already does
([#3114](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3114)), rather than as plain text
([#3126](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3126)):

- the maroon top bar, YOUR SESSION over GIS DAY(S) with this season's dates, and the strip of the season's days;
- the email's own text, as edited in the window, with its Markdown formatting;
- the session's name, when and where in the design's details box. The text the window starts from then leaves out its
  own When and Where lines, so they are said once.

The email window's preview shows the whole email as it will arrive, and it still carries a plain-text version.
txgisday.org and the UCGIS site keep the plain email, with When and Where in its text.

| The Ask for slides preview, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up session and two made-up speakers | Before | After |
| --- | --- | --- |
| gisday.tamu.edu, Ask for slides | ![The email as plain text, with When and Where in its text](../screenshots/3126-slides-email-design/before-preview.png) | ![The whole email in the Texas A&M GIS Day design, with the session's name, When and Where once, in the details box](../screenshots/3126-slides-email-design/after-preview.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. In the after image the
preview's frame, which shows 32rem and scrolls, was made as tall as the email so the whole of it shows at once.

### GIS Day: a dashboard's table reaches its last columns at any width, and shows a spinner while it fits a resized window

On Admin, Dashboards, the By event table on RSVPs and Check-ins was cut off at its box's right edge on a narrower
window, with no scrollbar to reach its last columns: at 1024 pixels, and on Check-ins at 1280 pixels too, whose ten
columns are a few pixels wider than the box there. The scrollbar pinned under the table ([#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029)) never appeared, because the
table's bordered frame was only as wide as the box and hid what did not fit, so the box held nothing wider than itself.
The frame is now as wide as the table, and the box scrolls it as [#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029) meant
([#3135](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3135)).

When the window changes width, the table now waits for its columns to be worked out again before it measures its
scrollbar, and shows the site's spinner over the table meanwhile, so the moment between the old layout and the new one
does not look broken. The same goes for the people under an opened row, and for the VGI dashboard's tables.

| Check-ins, season 2025, on the local site as gisday.tamu.edu, loaded at 1280 pixels and resized to 1024 | Before | After |
| --- | --- | --- |
| At 1024 pixels | ![The table cut off part-way through its columns, with no scrollbar under it](../screenshots/3135-dashboard-resize/before-resized-1024.png) | ![The same table with a scrollbar pinned under it at the bottom of the window](../screenshots/3135-dashboard-resize/after-resized-1024.png) |
| The scrollbar at its end | | ![The table scrolled to its last column, Not given](../screenshots/3135-dashboard-resize/after-resized-1024-rail-end.png) |
| While it fits the new width | | ![The table veiled, with the spinner over it](../screenshots/3135-dashboard-resize/after-spinner.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The images show events
and counts only; no row was opened.

### GIS Day admin: Who gets it lists speakers alphabetically, with Select all to tick or untick everyone

The **Who gets it** list in a session's Email these speakers window
([#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104)), for Session details and Ask
for slides, now lists the session's speakers alphabetically by last name, rather than in the order the API returned
them, and has a **Select all** box above them
([#3142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3142)):

- with every speaker ticked, Select all is ticked, and choosing it unticks everyone;
- with any speaker unticked, choosing it ticks everyone.

On a session with a dozen or more speakers, sending to all but a few, or to only a few, no longer means clicking each box.

| Who gets it in Session details, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up session and five made-up speakers | Image |
| --- | --- |
| Before: in the API's order (Zulu, Mike, Alpha, Romeo, Delta), no Select all | ![Five made-up speakers, all ticked, in the order Zulu, Mike, Alpha, Romeo, Delta, with no Select all](../screenshots/3142-who-gets-it-order/before-who-gets-it.png) |
| After, as the window opens: alphabetical, Select all ticked | ![Select all ticked above the five made-up speakers, all ticked, in the order Alpha, Delta, Mike, Romeo, Zulu](../screenshots/3142-who-gets-it-order/after-who-gets-it.png) |
| After, Select all chosen: everyone unticked | ![Select all and all five speakers unticked, with Tick at least one speaker to send it](../screenshots/3142-who-gets-it-order/after-select-none.png) |
| After, one speaker ticked, then Select all chosen: everyone ticked again | ![Select all and all five speakers ticked again](../screenshots/3142-who-gets-it-order/after-select-all.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, and nothing was sent.

### GIS Day: gisday.tamu.edu's inline links and slide toggles are maroon, not txgisday's blue

On gisday.tamu.edu, a few things were still txgisday.org's blue: the file names in a session's **Slides** list (Admin,
Events, a session), which showed light blue beside the **Remove** link, and the slide toggles, such as a competition
submission's **Undergraduate / Graduate** and **Individual / Group** choices, with a blue edge, and the tick of the
chosen competition type. They now take the Texas A&M site's maroon, like its other links
([#3143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3143)). txgisday.org and the UCGIS
site keep their blues.

| 1280 pixels, on the local site, signed in as an admin, with a made-up session and a made-up slide file | Before | After |
| --- | --- | --- |
| A session's Slides, on gisday.tamu.edu | ![The made-up slide file's name in light blue, beside a red Remove](../screenshots/3143-maroon-links/before-slides-tamu.png) | ![The same file name in maroon](../screenshots/3143-maroon-links/after-slides-tamu.png) |
| A session's Slides, on txgisday.org | | ![The file name still light blue on txgisday.org, unchanged](../screenshots/3143-maroon-links/after-slides-txgisday.png) |
| New submission's competition type and slide toggles, on gisday.tamu.edu | | ![The Presentation radio tick and the Undergraduate toggle's selected option and its edge in maroon, nothing blue](../screenshots/3143-maroon-links/after-toggle-tamu.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The signed-in account's
name and email were blanked in the images.

### GIS Day: a submission's Presentation files come first on its page, where finalists will see them

On a competition submission's page (Account, Student Competitions, open one), **Presentation files**, where a finalist
attaches the slides or poster they will present from, was the last thing on the page, below the whole submission form.
Finalists sent there by the review emails to upload stopped at the form and did not find it. It is now at the top,
above the form, so it is the first thing they see
([#3144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3144)). Its box, its deadline line
and its picker are as they were, and it still shows only on a submission that has been saved, not on a new one.

| A submission's page, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up submission and a made-up file | Before | After |
| --- | --- | --- |
| As the page first loads | ![The submission form, with Presentation files out of sight below it](../screenshots/3144-presentation-files-first/before-first-view.png) | ![Presentation files, with the made-up file and Attach A File, first on the page, above the form](../screenshots/3144-presentation-files-first/after-first-view.png) |
| Scrolled to the end of the form | ![Presentation files below the form's last field, just above Withdraw Submission and Update](../screenshots/3144-presentation-files-first/before-bottom.png) | |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The signed-in account's
name and email were blanked in the images.

### GIS Day admin: a session can be marked No slides, so its speakers are not asked for any

A panel, a social or lunch has no slides, but nothing said so, and Ask for slides could be sent to its speakers. A
session's admin form now has a **No slides for this session** box, unticked on every session until someone ticks it
([#3147](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3147)). It is stored in a new column
of the sessions table, added by migration AddEventNoSlides. With it ticked:

- **Email these speakers** offers no Ask for slides, and the session's Slides section says no slides are expected;
- the site refuses to preview or send an Ask for slides email for the session, whichever page asks;
- each of its speakers' presenter pages lists the session with "No slides are needed for this session." and no upload,
  and the site refuses an upload to it.

| A made-up session's admin form, and one of its made-up speakers' presenter page, 1280 pixels, on the local site as gisday.tamu.edu | Image |
| --- | --- |
| Before: the session's checkboxes, with nothing about slides | ![Five checkboxes: Event active, Requires RSVP, Is accepting RSVPs, Is bring your own device, Check-in open at any time](../screenshots/3147-no-slides/before-form.png) |
| Before: Email these speakers offers Ask for slides on every session | ![The Email these speakers menu open with Profile email, Session details and Ask for slides](../screenshots/3147-no-slides/before-menu.png) |
| After: No slides for this session, ticked on this session | ![The five checkboxes, then No slides for this session ticked, with Its speakers are not asked for slides and cannot upload any](../screenshots/3147-no-slides/after-form.png) |
| After: with it ticked, Email these speakers has no Ask for slides | ![The Email these speakers menu open with Profile email and Session details only](../screenshots/3147-no-slides/after-menu.png) |
| After: the speaker's presenter page, reached through their own edit link, lists the session with no upload | ![Your sessions on a presenter page: the made-up session, its day, time and room, and No slides are needed for this session, with no upload](../screenshots/3147-no-slides/after-presenter-page.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, with the box ticked in the
local database by hand and the speaker's edit link made there by hand, and nothing was sent or saved from the page.

### GIS Day: the FAQ page's sign-up, login and classes links lead where they say

On the public **FAQ** page, the four "create an account" links went to `/signup`, which the site had no page for, so
visitors got "We couldn't find that page"; the three "logged into your account" links went to `/login`, an empty page
that signed nobody in; and the classes link went to `/account/my-classes`, which does not exist
([#3148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3148)). `/signup` and `/login` now
start signing in, as the header's Login/Signup does, and bring the visitor back to the page they were on; the classes
link goes to `/account/classes`, which asks a signed-out visitor to sign in first
([#3151](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/3151)).

| The FAQ page's links, clicked while signed out, 1280 pixels, on the local site as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| "create an account." (`/signup`) | ![The site's "Sorry, we couldn't find that page", at /signup](../screenshots/3148-faq-links/before-signup.png) | ![The sign-in page, Log in to continue to GIS Day, with Sign up below it](../screenshots/3148-faq-links/after-signup.png) |
| "logged into your account" (`/login`) | ![The header and footer with nothing between them, at /login](../screenshots/3148-faq-links/before-login.png) | Not captured: `/login` starts the same sign-in as `/signup` |
| "Open the My Classes menu item" (`/account/my-classes` before, `/account/classes` after) | | ![The sign-in page, which a signed-out visitor is sent to before Account, Classes](../screenshots/3148-faq-links/after-classes.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, signed out, with nothing
typed on the sign-in page. Locally the sign-in page is the development Auth0
tenant's, which names "GIS Day (local development)".

### GIS Day: the FAQ page's instructions match the site: its name, check-in, Classes, Online Broadcast, competitions

The FAQ page's answers had fallen behind the site
([#3152](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3152)). Every answer said
"TxGIS Day", so on gisday.tamu.edu the page named the wrong site; it now uses the site's own name, as the other pages
do. Checking in now says what the session page asks for: a complete **Profile** first, then the visitor's location for
an in-person session (or the session's QR code if the phone will not share it), and the QR code on the presenter's
slides for a hybrid or online session, until 15 minutes after the session ends. Certifying attendance points to the
**Classes** page rather than "My Classes", the Zoom answer to the **Online Broadcast** section rather than "Online Zoom
Meeting Info", and the garbled competitions answer now says they are open only to current Texas A&M students. The
answer that the site's account is separate from Howdy is kept.

| The FAQ page, 1280 pixels, signed out, on the local site as gisday.tamu.edu, with the question open | Before | After |
| --- | --- | --- |
| How do I check in | ![Click Check-in during the event, on the TxGIS Day Website](../screenshots/3152-faq-instructions/before-checkin.png) | ![A complete Profile, then location in person or the QR code online, until 15 minutes after the end, on the Texas A&M GIS Day website](../screenshots/3152-faq-instructions/after-checkin.png) |
| Who may enter the competitions | ![Two garbled bullets about the public and TAMU students](../screenshots/3152-faq-instructions/before-competitions.png) | ![Open only to current Texas A&M students, graduate and undergraduate](../screenshots/3152-faq-instructions/after-competitions.png) |
| Certifying attendance and the Zoom link | | ![The Classes page under Account, Profile, and the Online Broadcast section, shown when logged in](../screenshots/3152-faq-instructions/after-certify-zoom.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, signed out.

### GIS Day: a visitor already signed in who follows a sign-up or log-in link is told so, with Continue to the site and Log out

Since [#3148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3148), the FAQ's "create an
account" and "log in" links (`/signup` and `/login`) start signing in. For a visitor who is already signed in, Auth0
sent them straight back, so the page they were on simply came back and the link seemed to do nothing. They now see a
page that says they are already signed in, and as whom, with **Continue to the site** and **Log out**, the header's
own Logout ([#3154](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3154)). Signed-out
visitors are unchanged: they go to sign in, as before. `/logout` now logs out too, instead of drawing an empty page.

| Signed in, the FAQ's first question opened and "create an account" followed, 1280 pixels, on the local site as gisday.tamu.edu | Before | After |
| --- | --- | --- |
| What comes back | ![The FAQ page again, reloaded, with its first question closed: nothing says what happened](../screenshots/3154-already-signed-in/before-signed-in.png) | ![A page headed You're already signed in, saying You are signed in as, then the account's name (blanked here), and There is nothing more to sign in or sign up for. To use another account, log out first, with Continue to the site and Log out](../screenshots/3154-already-signed-in/after-signed-in.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, served as gisday.tamu.edu
at `http://gisday.local.test:4201` rather than `localhost`, because the development Auth0 tenant always asks for consent
from a `localhost` address and skips it for that one. The after page names the signed-in account; in the image that
name is blanked in place, leaving the words around it, and neither image shows the account's name or email, which were
checked for before each was captured.

### GIS Day: the phone menu's Account tile has Admin, for admins, managers and organizers, as on desktop

On a phone, the GIS Day site's menu had no way to the admin pages. Its **Account** tile listed Profile, Classes, Checkins
and Logout, while the desktop header's Account menu also lists **Admin** for admins, managers and organizers, so an admin
on a phone had to type `/admin`. The phone menu's Account tile now lists **Admin** for the same three roles, and it opens
the admin pages, as the desktop link does
([#3162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3162)). Everyone else sees the tile as
before.

| The phone menu, 390 by 844 pixels, on the local site as gisday.tamu.edu, signed in as an admin | Before | After |
| --- | --- | --- |
| Menu open, Account tapped | ![Account lists Profile, Classes, Checkins and Logout, with no Admin](../screenshots/3162-phone-menu-admin/before-account-menu.png) | ![Account lists Profile, Classes, Checkins, Admin and Logout](../screenshots/3162-phone-menu-admin/after-account-menu.png) |
| Admin tapped | | ![The admin pages' Seasons list, at /admin/seasons, with the Admin Menu button above it](../screenshots/3162-phone-menu-admin/after-admin-page.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site. The signed-in account's
name and email do not appear in these views; the captures checked for them and would have blanked them.

### GIS Day admin: every email sent to a speaker is recorded, and Who gets it says who was already sent it

Every email the site sends a speaker (the profile email, a session's details and Ask for slides, from whichever page) is
now recorded, one row per speaker it went to, in a new table written by migration AddSpeakerEmailSends
([#3167](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3167)).

A session's **Email these speakers** window uses that record in **Who gets it**:

- under each speaker, after their address, whether they were sent this email for this session: "Not sent yet", or how
  many times and when last;
- how many of the speakers have not been sent it yet, with **Tick only those not sent it yet**, which ticks them and
  unticks everyone already sent it, and **List those not sent it yet first**;
- **Every email each was sent**, which opens a list of every email each speaker was sent, with its date, this one and
  the others.

So a speaker added to a session after its details went out can be sent them alone, without anyone having to remember
who already had them.

| Who gets it in Session details, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up session and three made-up speakers, and made-up records of what was sent | Image |
| --- | --- |
| Before: each speaker's name and address, and nothing about what they were sent | ![Three made-up speakers, all ticked, each with only an address](../screenshots/3167-email-sends/before-who-gets-it.png) |
| After, as the window opens: 2 of 3 not sent this email yet; Sample was sent it twice, last Nov 13 | ![The three made-up speakers ticked, two marked Not sent yet and one Sent 2 times, last Nov 13, 3:40 PM, under 2 of 3 have not been sent this email yet, Tick only those not sent it yet and List those not sent it yet first](../screenshots/3167-email-sends/after-who-gets-it.png) |
| After, Tick only those not sent it yet chosen: the speaker already sent it is unticked | ![The two speakers not sent it ticked, the one sent it twice unticked, and Select all unticked](../screenshots/3167-email-sends/after-tick-not-sent.png) |
| After, Every email each was sent opened: one speaker had only the profile email, one nothing, one this email twice | ![The list of every email each was sent: the presenter profile email on Nov 12 for one, nothing yet for another, and this email on Nov 13 and Nov 9 for the third](../screenshots/3167-email-sends/after-history.png) |

GIS Day has no dev site, so this cannot be checked on dev; it was checked on the local site, with the records of what
was sent added by hand, and nothing was sent.

### GIS Day: The VGI leaderboard names participants by a masked email, for everyone

The competition's leaderboard showed admins and managers every participant's full email address, so anyone who saw an
organizer's screen, projected or shared, saw students' emails. Students saw the last four characters of an account id,
which told nobody anything. Everyone now sees the first few letters of each email, then `****@` and the domain, such as
`jsm****@tamu.edu`. The server masks it, so a full address is never sent to anyone's browser. Your own row still says
**You**, and an admin can still click a row to see that person's finds on the map.
([#3168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3168))

| Before | After |
| --- | --- |
| ![What the API named participants as: the last characters of an account id for students, the full email for admins](../screenshots/3168-leaderboard-masked-emails/before-api-names.jpg) | ![What the API names participants as now: the masked email, for students and admins alike](../screenshots/3168-leaderboard-masked-emails/after-api-names.jpg) |

### GIS Day: The Monument Trail page has a button to the leaderboard

The VGI competition's standings could only be reached from the tab bar inside the competition app, so nobody reading
about the competition could find them, and bringing them up to show a room meant knowing the app's address. The
competition page now has a **View the leaderboard** button at the top, before any of its text, and another beside the
survey and submission-form buttons at the bottom. The leaderboard still asks visitors to sign in.
([#3169](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3169))

| Before | After |
| --- | --- |
| ![The competition page, with no way to the leaderboard](../screenshots/3169-leaderboard-button/before-competition-page.jpg) | ![The competition page, with a View the leaderboard button above the first paragraph](../screenshots/3169-leaderboard-button/after-competition-page.jpg) |

### GIS Day: A session's slides, and the competition submissions picked, download as one zip

A session's slides could only be downloaded one file at a time from its admin page, and the Student Competition
submissions list had one download, every file in the season, whatever was ticked or filtered. Now a session whose
speakers have uploaded two or more files has **Download all N files** under its Slides, which saves one zip named for the
session with a folder for each speaker. The submissions list's download takes the ticked rows, and says how many
(**Download files (2 ticked)**); with none ticked, it takes the rows the filters show (**Download files (2 shown)**); with
no filter either, it is **Download all files**, as before. Each submission is still its own folder in the zip.
([#3174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3174))

Captured locally, with a made-up session, made-up speakers and made-up submissions and files.

| Before | After |
| --- | --- |
| ![A session's Slides section listing two speakers' files, with no way to download them together](../screenshots/3174-zips/before-session-slides.png) | ![The same Slides section with a Download all 2 files button under the list](../screenshots/3174-zips/after-session-slides.png) |
| ![The submissions list with two rows ticked and the toolbar still offering Download all files](../screenshots/3174-zips/before-submissions.png) | ![The same two rows ticked, the toolbar now offering Download files (2 ticked)](../screenshots/3174-zips/after-submissions-ticked.png) |
| | ![Nothing ticked and the Type filter on Cartography, the toolbar offering Download files (2 shown)](../screenshots/3174-zips/after-submissions-filtered.png) |

### GIS Day: a speaker photo is shrunk before it is sent, so a large one is no longer refused

Saving a speaker with a new photo failed on production with "Error updating speaker: 413", for a photo of 745 KB
([#3177](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3177)). The API refuses an image over
8,000 pixels a side or 40 megapixels however few bytes it is, and the photo was sent as chosen.

- **The admin's speaker form and a speaker's own edit link** now send the photo shrunk in the browser, as a JPEG at most
  1,600 pixels a side, with the shared `shrinkImage` that competition photos already use. Logos are sent as chosen.
- **A refusal says why**: the admin's toast gives the API's reason, rather than only its status.

| A made-up speaker's admin edit form, 1280 pixels, on the local site as gisday.tamu.edu, with a made-up 9,000 x 6,000 JPEG of 1.5 MB chosen | Image |
| --- | --- |
| Before: Update fails with "Error updating speaker: 413", and the API answers that the photo is too large in pixels | ![The Update Speaker form with the large photo chosen, and a toast reading Update Speaker, Error updating speaker: 413](../screenshots/3177-photo-pixels/before-413.png) |
| After: Update saves, and the speaker's edit page, opened again, shows the stored photo | ![The Update Speaker form opened again, showing the speaker's saved photo above Select Profile Picture](../screenshots/3177-photo-pixels/after-saved.png) |

Checked on the local site, where the API refuses the photo with 413 as on production. After the fix the whole update
request was 21 KB, and the API fitted the photo it was sent as it fits every speaker photo (840 pixels on the shorter
side), so the file stored is a 1,260 x 840 JPEG. Locally nothing serves uploaded files, so for the second image the
stored file was copied out of the API's storage and served to the page unchanged.

### GIS Day: judges score the research competitions in the site, against rubrics, from an emailed judging link

Judges of the poster and research presentation competitions can now score the entries in the site
([#3183](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3183)). Each judge is sent their own
judging link, which opens a page listing every accepted entry of the competition they judge, with the rubric's criteria and
its four levels, and a score for each criterion. The admins see the results.

- **Rubrics**: Research Competitions in the admin menu now has **Rubrics** and **Judging results** under Submissions. A
  season with no rubric for a competition offers **Start from the standard rubric**: the competition organizer's rubric, seven
  criteria and 100 points, with each criterion's Excellent, Proficient, Developing and Needs Improvement levels. Graduate and
  undergraduate share a rubric.
- **The session's page** has a **Judging** section: the Judged competition, its Judges ticked from the session's speakers,
  and Judging closed. **Ask to judge** in Email these speakers sends each judge their own link, a copy each, read and edited
  first in the same window.
- **The judge's page** (`/judging/<link>`) needs no account. A judge can change their scores until the admins tick Judging
  closed; then the page shows their scores read only. Judges see only their own scores.
- **Judging results**, per competition and season: each judge's progress, and a row per accepted entry with each judge's
  total, the average total and each criterion's average, highest average first, and **Download CSV** with the same.

Every person below is made up, at example.com, and every image is from a local run of the site as gisday.tamu.edu, at
1280 px unless it says otherwise.

| | |
| --- | --- |
| Before: Research Competitions has no entries under it | ![The admin menu with Research Competitions and nothing under it](../screenshots/3183-judging/before-admin-menu.png) |
| After, on a Research Competitions page: Submissions, Rubrics and Judging results | ![The admin menu with Submissions, Rubrics and Judging results under Research Competitions](../screenshots/3183-judging/after-admin-menu.png) |
| Before: a poster session's admin page, with no Judging section | ![A made-up poster session's admin page: Basic, Speakers, Slides, Tags and Attendance](../screenshots/3183-judging/before-session-form.png) |
| After: the poster rubric, started from the standard one (its first two of seven criteria) | ![The Geography Poster Presentation Rubric, with Geographic Understanding and Accuracy and Spatial Data and Visual Representation, 20 points each, each with four levels](../screenshots/3183-judging/after-rubrics.png) |
| After: the session's Judging section, saved with Graduate posters and two judges | ![Judged competition Graduate poster competition, two made-up judges ticked, Judging closed unticked](../screenshots/3183-judging/after-session-judging.png) |
| After: Email these speakers offers Ask to judge | ![The Email these speakers menu with Profile email, Session details, Ask for slides and Ask to judge](../screenshots/3183-judging/after-menu.png) |
| After: Ask to judge's window, as it opens (nothing was sent) | ![Send judging emails: the two made-up judges ticked, a copy each, and the prefilled subject and text](../screenshots/3183-judging/after-ask-to-judge-preview.png) |
| After: the same window at its end, the email as the first judge gets it | ![The email preview to the first made-up judge, with Cancel and Send 2 emails](../screenshots/3183-judging/after-ask-to-judge-preview-end.png) |
| After: the judge's page, an entry with its criteria and the first criterion's levels | ![The Judging page: the graduate poster competition, 0 of 3 scored, an entry with seven criteria, each a score box](../screenshots/3183-judging/after-judge-page.png) |
| After: the same at 390 px, a phone's width | ![The Judging page at phone width](../screenshots/3183-judging/after-judge-page-phone.png) |
| After: the same at 360 px, a narrower phone | ![The Judging page at 360 px, every score box and Save inside the width](../screenshots/3183-judging/after-judge-page-phone-360.png) |
| After: the entry scored and saved | ![The entry's seven scores and a comment, Saved, 86 of 100 points, 1 of 3 scored](../screenshots/3183-judging/after-judge-saved.png) |
| After: Judging results with two entries scored and one not | ![Judging results: one judge 2 scored, the other 1; the first entry with 2 judges, average 85.5, totals 86 and 85; the second with 1 judge, 75; the third, 0 judges, Not scored yet](../screenshots/3183-judging/after-results.png) |
| After: the same table scrolled sideways in its own box to its last criterion | ![Judging results scrolled to the right end: Creativity and Visual Impact, and Interpretation and Geographic Insight, the last criterion, 8.5 and 8.5 for the first entry, 7 and 8 for the second](../screenshots/3183-judging/after-results-scrolled.png) |
| After: Judging closed ticked, the judge's page again | ![Judging is closed for this competition. The scores shown greyed, with no Save](../screenshots/3183-judging/after-judging-closed.png) |

### GIS Day: The email window says why an email could not be loaded

When the site refuses to make an email, the email window now says why, in the site's own words, rather than only
"Please try again"
([#3189](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3189)). Choosing **Ask to judge**
for a session whose judges are ticked but not saved now says to save them first; trying again could never have
worked. It is one window for every email (presenter profiles, session details, Ask for slides, Ask to judge and the
competition's emails), so each says why in the same way. When the site itself fails, or cannot be reached, the window
still says to try again.

| Before | After |
| --- | --- |
| ![A made-up session's edit form with one judge ticked and not saved, and the Ask to judge window over it: "The email could not be loaded, so nothing was sent. Please try again."](../screenshots/3189-email-preview-reason/before-ask-to-judge.png) | ![The same form and window: "The email could not be loaded, so nothing was sent. This session has no judges. Tick its judges and save it first."](../screenshots/3189-email-preview-reason/after-ask-to-judge.png) |

### GIS Day: a judge's scores and a rubric's changes save

On the first night of judging, a judge's **Save** failed with "Your scores were not saved. Please try again.", and so did saving an edited rubric ([#3190](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3190)). The site and its API are at different addresses, so the browser sends only the kinds of request the API says it accepts from the site. The two saves were the only requests of their kind, and they were not on that list, so the browser stopped them before they were sent. They are on it now, and a check fails if a request the API serves is ever left off it again.

### GIS Day: the judging page shows a criterion's four levels as boxes side by side, like the rubric

On a judge's page, each criterion's levels were behind a **Levels** toggle, one under another. They are now always shown,
as boxes side by side, as the rubric's own table lays them out
([#3191](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3191)): four across on a wide screen,
fewer as the screen narrows, and one per row on a phone. No box is lit for the score, because the rubric does not say which
scores belong to which level.

Every person below is made up, at example.com, and every image is from a local run of the site as gisday.tamu.edu, with the
standard research presentation rubric, at 1280 px unless it says otherwise.

| | |
| --- | --- |
| Before: a criterion with its Levels opened, one under another | ![A made-up presentation entry's first criterion, Geographic Understanding and Content Accuracy, 0 to 20, with Levels opened: Excellent, Proficient, Developing and Needs Improvement, each with its description, one under another](../screenshots/3191-rubric-boxes/before-levels.png) |
| After: the same criterion, its four levels as boxes side by side | ![The same criterion with its four levels as four boxes in a row under the score box, each with its label and description](../screenshots/3191-rubric-boxes/after-levels.png) |
| After: at 768 px, a tablet's width | ![The same criterion at 768 px: two level boxes in each of two rows, Excellent and Proficient above Developing and Needs Improvement](../screenshots/3191-rubric-boxes/after-levels-tablet.png) |
| After: at 390 px, a phone's width, one box per row | ![The same criterion at 390 px: the four level boxes one under another, each the card's full width](../screenshots/3191-rubric-boxes/after-levels-phone.png) |

### GIS Day: Judging results break an entry down by judge, and give every score as a CSV

Judging results showed each judge's total for an entry and each criterion's average, but not what each judge gave on each
criterion, or their comments
([#3193](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3193)).

- **An entry's breakdown**: clicking an entry's row (or Enter or Space on it) opens a line per judge of the competition
  under it, with their total and their comment first, then their score on each criterion in the rubric's order. It is as
  wide as the page shows, and scrolls on its own when the criteria need more room. A judge who has not
  scored the entry shows **Not scored yet**. One entry is open at a time; clicking it again closes it.
- **Every score**: a second download beside **Download CSV**, with a row per judge per entry, scored or not: the entry's
  title and presenters, the judge, each criterion's score, the total (or Not scored yet) and the comment. Its file is
  `judging-<competition>-every-score-<year>.csv`.
- The comments are only on the admins' results. A judge's own page still shows only their own scores.

Every person below is made up, at example.com, and every image is from a local run of the site as gisday.tamu.edu, at
1280 px.

| | |
| --- | --- |
| Before: Judging results, with Download CSV the only download | ![Judging results for the graduate presentation competition: two made-up judges' progress and three entries, with Download CSV in the toolbar](../screenshots/3193-judge-breakdown/before-results.png) |
| After: the toolbar, with Every score beside Download CSV | ![The Judging results toolbar: Download CSV, Every score, the Competition and the Season](../screenshots/3193-judge-breakdown/after-toolbar.png) |
| After: an entry both judges scored, opened: a line per judge with their total, comment and scores | ![The first entry opened: a line for each made-up judge, with their total, their comment and their score on the first criteria, under the entry's row](../screenshots/3193-judge-breakdown/after-breakdown.png) |
| After: an entry only one judge scored: the other is Not scored yet | ![The second entry opened: the first made-up judge's scores, and Not scored yet for the second](../screenshots/3193-judge-breakdown/after-breakdown-unscored.png) |

### GIS Day: a session's presenters are listed by last name, not grouped by company

A session's page listed its **Presenters** grouped by company, and by name within each company, so a reader looking
for one person had to know where they worked
([#3196](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3196)). They are now in order of
last name, then first name, A to Z, as on the session's edit page; each still shows their organization under their
name.

| | |
| --- | --- |
| Before: a made-up session's five made-up presenters, grouped by company: Moore and Zimmer (Example Agency), Adams and Young (Sample Labs), Baker (Test Works) | ![Presenters: Casey Moore, Avery Zimmer, Blake Adams, Emery Young, Drew Baker](../screenshots/3196-presenters-last-name/before-presenters.png) |
| After: the same five by last name: Adams, Baker, Moore, Young, Zimmer | ![Presenters: Blake Adams, Drew Baker, Casey Moore, Emery Young, Avery Zimmer](../screenshots/3196-presenters-last-name/after-presenters.png) |

### GIS Day: a session's Check-in QR code is at the top of its page, for organizers

An organizer showing a session's check-in code to a room had to scroll past the session's time, description, presenters,
attendance and check-ins to reach it. **Check-in QR Code**, with the code and its **Full screen**
and **Download PNG** buttons, is now the first thing under the session's title
([#3197](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3197)). It is still shown only to
admins, managers and organizers, and the code itself is unchanged. The attendees' **Checkin** section stays where it was.

| | |
| --- | --- |
| Before: the top of a made-up session's page, signed in as an admin: time and place, description, registration, check-in and presenters, and no QR code | ![A made-up hybrid session's page from its title down to its presenters, with no Check-in QR Code section in view](../screenshots/3197-qr-at-top/before-top.png) |
| After: the same, with Check-in QR Code the first thing under the title, above the time and place | ![The session's title, then Check-in QR Code with its text, the code, Full screen, Download PNG and the link, then the time and place](../screenshots/3197-qr-at-top/after-top.png) |
| After: the same at 390 px, a phone's width. The session's page is laid out wider than a phone (927 px), before this change as after, so its left side is cut off | ![The session's page at phone width, cut off on the left, with the Check-in QR Code text under the title](../screenshots/3197-qr-at-top/after-top-phone.png) |
| After: the page signed out, with no Check-in QR Code section | ![The same session's page signed out: title, time and place, description, registration, check-in and presenters, with no QR code](../screenshots/3197-qr-at-top/after-signed-out.png) |

### GIS Day: a tap anywhere on a phone menu tile follows it, not only on its title

On a phone, the site's menu shows each choice as a white box with an icon and a title. Only the title's words could be
tapped: a tap on the icon or the space around the words did nothing, so a visitor had to hit a few words in the middle of a
large box ([#3198](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3198)). The whole box is now
the tap target, for the tiles that go to a page (Sessions, Presenters, Competitions, FAQs) and for Login. The tiles that open
a list (About, Account) already worked this way.

The fix is in the shared phone menu, so the other site that uses it (the geoservices documentation's menu) gets it too.

There are no images: the boxes look the same as before, and the change is in where a tap lands, which a still image cannot
show.

### GIS Day: a judge's page has a tab per competition, and each entry collapsed, by first author

A judge's page listed every competition they judge, undergraduate and graduate, with every entry and rubric open, so a
judge scoring one had to scroll past everything else
([#3200](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3200)).

- **A tab per competition.** The first is open, and a click on another switches to it.
- **Each entry starts closed**, showing its title, its authors and the judge's score, or **Not scored yet**. Tapping one
  opens its abstract, rubric, comment and Save.
- **In order by the first author's last name**, ignoring case and accents; an entry with no authors comes last.
- Switching tabs, or closing an entry, keeps anything typed.

| | |
| --- | --- |
| Before: a made-up judge's page, both competitions open, every entry and criterion one after another | ![The Judging page: the graduate presentation competition, 1 of 2 scored, its two entries with seven criteria each, then the undergraduate competition and its two entries](../screenshots/3200-collapse-competitions/before-judge-page.png) |
| After: the same made-up judge, the graduate competition's tab open, its three entries closed, by first author (Adams, Moore, Young) | ![The Judging page: a tab for each competition, the graduate presentation competition's chosen and underlined in maroon, then 1 of 3 scored and three closed entries, each showing its title, authors and Not scored yet or Scored 93 of 100](../screenshots/3200-collapse-competitions/after-tabs.png) |
| After: one entry opened, its saved score in the boxes | ![The graduate competition's tab with its second entry open, its form indented as its heading is: its abstract, the seven criteria with their scores and levels, the comment, Scored 93 of 100 points and Save, between the two closed entries](../screenshots/3200-collapse-competitions/after-entry-open.png) |
| After: the undergraduate competition chosen | ![The Judging page with the undergraduate presentation competition's tab chosen and underlined, 0 of 2 scored, and its two closed entries, by first author (Ellis, Pupil)](../screenshots/3200-collapse-competitions/after-other-tab.png) |
| After: on a phone, 390 pixels wide | ![The Judging page on a phone: the graduate competition's tab chosen and underlined, the undergraduate tab beginning at the right edge of a row that scrolls sideways, then 1 of 3 scored and its three closed entries, nothing past the page's right edge](../screenshots/3200-collapse-competitions/after-tabs-phone.png) |
| After: on a smaller phone, 360 pixels wide | ![The Judging page at 360 pixels: the graduate competition's tab chosen and underlined, the start of the undergraduate tab at the edge of the tab row, then 1 of 3 scored and its three closed entries, nothing past the page's right edge](../screenshots/3200-collapse-competitions/after-tabs-phone-360.png) |
| After: on a phone, the tab row swiped and the undergraduate tab tapped | ![The Judging page on a phone with the tab row scrolled to its end: the undergraduate presentation competition's tab chosen and underlined in full, then 0 of 2 scored and its two closed entries](../screenshots/3200-collapse-competitions/after-tabs-phone-scrolled.png) |

### GIS Day: a session's page fits a phone again for organizers, with its check-in link shortened to fit

Signed in as an organizer, a session's page on a phone was laid out about 930 px wide and cut off on the left, title, Check-in
QR Code text and the code itself included
([#3205](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3205)). The cause was the check-in
link under the code: a single 124-character line, which the shared copy field sized itself to. The copy field now takes
only the room it is given, and a value too long for it ends in "…"; **Copy** still copies all of it.

The copy field is shared, so AggieMap's and the event maps' popups get the same: their values look as before, and one too
long for its box now ends in "…" instead of being cut off mid-letter.

A made-up session's page, signed in as the local test admin, with its check-in QR code shown:

| Width | Before | After |
| --- | --- | --- |
| Phone, 390 pixels | ![The page laid out 683 px wide and cut off on the left: the title, the text and the code are missing their left side](../screenshots/3205-copy-field-width/before-phone.png) | ![The page fits the phone: title, text and the whole code, with the check-in link ending in "…" beside Copy](../screenshots/3205-copy-field-width/after-phone.png) |
| Desktop, 1280 pixels | ![The check-in link cut off mid-character at the edge of its box](../screenshots/3205-copy-field-width/before-desktop.png) | ![The same field, the same width, its link ending in "…"](../screenshots/3205-copy-field-width/after-desktop.png) |
| Phone, 360 pixels | Cut off on the left, as at 390 | ![The page at 360 px, with the code and its link ending in "…"](../screenshots/3205-copy-field-width/after-phone-360.png) |

AggieMap's building popup (Sterling C. Evans Library), on a local dev server, at 390 pixels as a phone and at 1280:

| Before | After |
| --- | --- |
| ![The popup's share link and Copy, at 390 and at 1280](../screenshots/3205-copy-field-width/aggiemap-before.png) | ![The same popup, its copy field looking the same at both widths](../screenshots/3205-copy-field-width/aggiemap-after.png) |

### GIS Day: A session's page fits a 360 px phone

On a 360 px wide phone, a session's page was a little wider than the screen and scrolled sideways
([#3208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3208)). Its presenter cards were a
fixed width. They now take the width they are given, up to 25rem with their padding inside, so the page fits the screen. A
long name or organization wraps instead of widening the card. The same cards in the session form fit the same way. A
smoke check now opens a session with presenters at 360 px and checks that the page is no wider than the screen.

| Before | After |
| --- | --- |
| ![A made-up session's Presenters on a 360 pixel phone: three made-up presenter cards 364 pixels wide, so the page is 371 pixels wide and scrolls sideways](../screenshots/3208-presenter-card-width/before-session-360.png) | ![The same at 360: each card 332.5 pixels wide inside the screen, the long organization wrapping beside the picture, the page 360 pixels wide](../screenshots/3208-presenter-card-width/after-session-360.png) |
| ![The same at 390 pixels: the cards 364 pixels wide, the page fitting](../screenshots/3208-presenter-card-width/before-session-390.png) | ![The same at 390: the cards 350 pixels wide, the page fitting](../screenshots/3208-presenter-card-width/after-session-390.png) |
| ![The session form's speakers at 360: the cards 364 pixels wide, the form 387 pixels wide](../screenshots/3208-presenter-card-width/before-edit-form-360.png) | ![The session form's speakers at 360 after: the cards 314 pixels wide, the form 360 pixels wide](../screenshots/3208-presenter-card-width/after-edit-form-360.png) |
| ![The session's Presenters at 1280 pixels: two columns of cards 390 pixels wide, the long organization's picture squeezed narrower so its name sits further left](../screenshots/3208-presenter-card-width/before-session-1280.png) | ![The same at 1280 after: the cards 375 pixels wide, a little narrower, and every name lined up beside its picture](../screenshots/3208-presenter-card-width/after-session-1280.png) |

### GIS Day: Check-in opens 5 minutes before a session and closes 10 minutes after, and each session can change it

Check-in to every session opened at its start and closed 15 minutes after its end, so attendees who arrived early had
to wait for the start to check in. It now opens 5 minutes before a session starts and closes 10 minutes after it ends,
and organizers can change either for one session on its edit page in Admin → Events: **Check-in opens, minutes before
the start** and **Check-in closes, minutes after the end**, from 0 to 1440. The Check In button on the session's page
and the API keep to the same window, an attendee checking in too early is told when it opens, and the FAQ says the
new times. Sessions open for check-in at any time are unchanged. Production needs the migration `AddCheckInMinutes`
run on both GIS Day databases before the new API starts; it gives every existing session 5 and 10.
([#3209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3209))

| Before | After |
| --- | --- |
| ![The session edit form, with no check-in settings](../screenshots/3209-checkin-window/before-admin-form.png) | ![The session edit form, with check-in minutes before the start and after the end beside the times](../screenshots/3209-checkin-window/after-admin-form.png) |

### GIS Day: The check-in QR code's Full screen works on an iPad

Pressing **Full screen** under a session's check-in QR code did nothing on an iPad, so an organizer could not hold up
or project the code from one. Safari on an iPad before iPadOS 16.4 offers full screen for a page only under an older
name, and on an iPhone not at all, and the button asked only for the standard one. It now asks for whichever the
browser has, and where it has neither, or refuses, the code fills the browser window instead, white with its caption
under it. **Exit full screen** leaves either.
([#3211](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3211))

| Before                                                                                                                                                            | After                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![On an iPad-sized window with no full screen, Full screen pressed and the page unchanged](../screenshots/3211-qr-fullscreen-ipad/before-full-screen-pressed.jpg) | ![The same window after the change: the code fills it, with its caption and Exit full screen](../screenshots/3211-qr-fullscreen-ipad/after-full-screen-pressed.jpg) |

### GIS Day: The dashboards' charts compare seasons, lined up on GIS Day week

The four dashboards' charts (RSVPs, Check-ins, VGI submissions and User accounts) showed one season at a time, so
comparing this year's build-up with last year's meant switching seasons and remembering the numbers. Each chart now has
a row of year buttons, and opens with the selected season and the year before it drawn together. The years are lined up
on GIS Day week rather than on the calendar: each year's line is moved so the Monday of its own GIS Day week falls on
the same day, and the axis counts days before and after it, so "two weeks before GIS Day week" is the same point for
every year. An earlier year's line runs from its first record to the end of its GIS Day week. Hovering gives each
year's total that day with its own date. A year whose records could not be read, that has none, or that has no GIS Day
week days set has its button greyed out, saying why. With only the selected season shown, the chart is as it was.
([#3215](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3215))

| Before | After |
| --- | --- |
| ![The RSVPs dashboard for 2026: one line, the running total of a made-up season's RSVPs, on dates from Oct 19 to the GIS Day week of Nov 16](../screenshots/3215-compare-seasons/before-rsvps.png) | ![The RSVPs dashboard for 2026 with a row of year buttons, 2026 and 2025 pressed and 2024 greyed out, and two lines with a legend, 2026 in maroon and 2025 in orange, on an axis counting days from the Monday of GIS Day week, from −42 to +7, with the shaded GIS Day week labelled and 2025's line held at its total to the end of its week](../screenshots/3215-compare-seasons/after-rsvps.png) |
| | ![The same chart hovered two weeks before GIS Day week: 2025's tooltip, 22 RSVPs on Mon, Nov 3, 2025, and 2026's, 10 RSVPs on Mon, Nov 2, 2026, above −14 days](../screenshots/3215-compare-seasons/after-rsvps-hover.png) |
| | ![The same chart with 2025 switched off: one line again, on dates from Oct 19 to the GIS Day week of Nov 16, as before](../screenshots/3215-compare-seasons/after-rsvps-one-year.png) |
| | ![The Check-ins dashboard for 2026 with the same year buttons, and 2026's and 2025's check-ins during each GIS Day week, on an axis from 0 to +7 with a tick at the start of each day, 2025's line held at its total to the end of its week](../screenshots/3215-compare-seasons/after-check-ins.png) |
| | ![The RSVPs dashboard on a phone, 390 pixels wide: the year buttons in one row above the two years' lines and their legend, the axis in two-week steps counted from day 0 (−42, −28, −14, 0), nothing past the right edge](../screenshots/3215-compare-seasons/after-rsvps-phone.png) |

### GIS Day: Dashboard headings break only between words

On the Check-ins dashboard the **Checked in** heading was cut to "Checkec / in" at 1280 px
([#3219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3219)). Its column, at its
narrowest, was a tenth of a pixel wider than the word. That column is now a little wider, with the width taken from the
name column, so the table is no wider than before. Three other headings that could be cut in a narrow window
("classification", "Unverified" and "Discarded") now break with a hyphen instead. A check now measures every dashboard
heading against its column, so a heading added or renamed later cannot be cut without the check failing.

| Before | After |
| --- | --- |
| ![The Check-ins dashboard's table at 1280 pixels: the Checked in heading cut to "Checkec" over "in"](../screenshots/3219-checked-in-heading/before-check-ins-heading.png) | ![The same table: "Checked" over "in", in whole words](../screenshots/3219-checked-in-heading/after-check-ins-heading.png) |
| ![The same table on a phone, 390 pixels wide, scrolled sideways to the Checked in column: "Checked" over "in"](../screenshots/3219-checked-in-heading/before-check-ins-heading-phone.png) | ![The same on a phone after: "Checked" over "in"](../screenshots/3219-checked-in-heading/after-check-ins-heading-phone.png) |

### GIS Day: An Edit session button on a session's page, for organizers

Getting from a session's public page to its edit form meant going to Admin → Sessions and finding the session in the
list. A signed-in GIS Day admin, manager or organizer, the roles the admin area lets in, now sees an **Edit Session**
button beside the session's title, which opens its edit form. Nobody else sees it.
([#3220](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3220))

| Before | After |
| --- | --- |
| ![A made-up session's page signed in as a GIS Day admin: its title at the left, then the check-in QR code section and the time and place, with no Edit session button](../screenshots/3220-edit-session-button/before-organizer.png) | ![The same page signed in as a GIS Day admin: the title at the left as before, and an Edit Session button at the right of its row](../screenshots/3220-edit-session-button/after-organizer.png) |
| | ![A made-up session with a title of 73 characters, signed in as a GIS Day admin: the title on two lines at the left, and the Edit Session button beside it at the right](../screenshots/3220-edit-session-button/after-organizer-long.png) |
| | ![The page the button opens: the made-up session's edit form under Admin → Events, Update Event, its day, times, check-in minutes, name and abstract](../screenshots/3220-edit-session-button/after-edit-form.png) |
| | ![The same session's page signed out: no Edit Session button and no check-in QR code, the title at the left as before](../screenshots/3220-edit-session-button/after-signed-out.png) |
| | ![The same page on a phone, 390 pixels wide, signed in as a GIS Day admin: the Edit Session button under the title, nothing past the right edge](../screenshots/3220-edit-session-button/after-organizer-phone.png) |

### GIS Day: Each day on the Sessions page collapses, and the days already passed start collapsed

During GIS Day week the Sessions page opened on the days already over, so a visitor scrolled past them to reach today.
Each day's heading now opens and closes it, and on the current year's page a day before today, in Central time, starts
collapsed, its heading giving its date and how many sessions it has. Today and the days to come start open. A search
opens every day it finds something in, and the Day 1, Day 2 links open the day they jump to. On a past year's page,
where every day has passed, every day starts open. Nothing is remembered between visits.

The day's heading uses the site's shared accordion, which now opens and closes when a page tells it to after it is
first drawn, and whose header is a button that works from the keyboard. AggieMap's bus stops list in the trip planner
binds that same setting to its toggle, so it should now follow it; that has not yet been checked in AggieMap itself.
([#3221](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3221))

| Before | After |
| --- | --- |
| ![The Sessions page on Thursday 19 November with a made-up season of four GIS Day days, the 17th to the 20th: every day open, each listing its three made-up sessions](../screenshots/3221-collapse-days/before-sessions.png) | ![The same page: Tuesday 17 and Wednesday 18, already passed, each collapsed to one line reading its date and "· 3 sessions" with a plus at the right; Thursday 19, today, and Friday 20 open, with a minus](../screenshots/3221-collapse-days/after-sessions.png) |
| | ![Tuesday 17 opened by pressing its heading: its three sessions listed, its count gone and its mark a minus; Wednesday 18 still collapsed](../screenshots/3221-collapse-days/after-opened.png) |
| | ![A search for "drone": every day open, the two past days included, each listing only its drone imagery session](../screenshots/3221-collapse-days/after-search.png) |
| | ![The 2025 Sessions page, a past year whose days have all passed: both days open](../screenshots/3221-collapse-days/after-past-year.png) |
| | ![The Sessions page on a phone, 390 pixels wide: each collapsed day's date on one line with "· 3 sessions" under it and the plus at the right, today and tomorrow open, nothing past the right edge](../screenshots/3221-collapse-days/after-sessions-phone.png) |

### GIS Day: The judge's page searches entries, and scores each in its own details panel that Escape closes

A judge's page listed every entry in a competition, and opened each one in place, inside the list, so the rubric of one
entry pushed the rest of the list a long way down, and a judge looking for one poster in the room had to scroll for it.
The page now has a search box above the list that finds an entry by its title or one of its authors, in every competition
the judge has, and says which competition each match is in. Each entry opens in its own panel over the list: on a
computer, on the right with the list dimmed beside it, and on a phone, the whole screen. The panel has the search box at
its top, to go straight to another entry, and Previous and Next to the entries beside it. Escape, Close, or a click beside
the panel closes it. If its scores have been changed and not saved, it asks first: Stay keeps them, and Leave without
saving puts back what was saved. The panel is a new shared component (`tamu-gisc-details-panel`), for any page that opens
one record over a list.
([#3230](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3230))

| Before | After |
| --- | --- |
| ![A judge's page for two made-up poster competitions: five entries in the graduate competition, each a box giving its title, authors and score, opened in place](../screenshots/3230-judge-search-panel/before-list.png) | ![The same page with a search box above the tabs, and each entry a row giving its title, authors and score](../screenshots/3230-judge-search-panel/after-list.png) |
| ![The same page with one entry opened in the list, its rubric between the entries above and below it](../screenshots/3230-judge-search-panel/before-entry-open.png) | ![An entry open in a panel on the right, the list dimmed beside it: the search box, Previous, "2 of 5", Next and Close, then the competition, title, authors, abstract and rubric](../screenshots/3230-judge-search-panel/after-panel.png) |
| ![On a phone, 390 pixels wide, an opened entry's rubric runs down the page between the other entries](../screenshots/3230-judge-search-panel/before-entry-open-phone.png) | ![On a phone, the entry's panel fills the screen, with the search box, Previous, Next and Close at its top](../screenshots/3230-judge-search-panel/after-panel-phone.png) |
| | ![The search box listing the entries an author's name finds in both competitions, each naming its competition](../screenshots/3230-judge-search-panel/after-search.png) |
| | ![On a phone, the search box at the top of the panel listing what "drone" finds, to open it straight from this entry](../screenshots/3230-judge-search-panel/after-panel-search-phone.png) |
| | ![The panel asking "Your scores for this entry have changed and are not saved. Leave without saving them?" with Leave without saving and Stay](../screenshots/3230-judge-search-panel/after-leave-ask.png) |

### GIS Day: The research competitions' winners on gisday.tamu.edu's homepage

Once a season's GIS Day is over, gisday.tamu.edu's homepage shows the winners of its research competitions
([#3239](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3239)). These are the graduate and
undergraduate poster and presentation competitions, each with its 1st, 2nd and 3rd place, the winners' names and their
entry's title, in plain text. The section appears from the day after the season's last day and stays until the next
season becomes active.

Admins pick the winners on a new **Winners** page under Research Competitions, from that season's accepted entries.
Nothing is typed: each name and title is read from the entry itself whenever the homepage is shown, so a correction to
an entry shows on the homepage too. Next year's winners are picked the same way, with no change to the site.

The trail challenge's winners are picked on the same page ([#3243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3243)).
txgisday.org and the UCGIS site don't show winners, since the competitions ran on gisday.tamu.edu.

This adds a table, `season_winners`, whose migration runs before the release reaches production.

| Before | After |
| --- | --- |
| ![gisday.tamu.edu's homepage at 1280 pixels: the title, the dates, then The GIS Day Experience, with no winners](../screenshots/3239-homepage-winners/before-homepage.png) | ![The same homepage after GIS Day week, with made-up winners: a 2026 Competition Winners section under the dates, 1st, 2nd and 3rd of each of the four research competitions, each with its people's names and its title](../screenshots/3239-homepage-winners/after-homepage.png) |
| ![The same homepage on a phone, 390 pixels wide, with no winners](../screenshots/3239-homepage-winners/before-homepage-phone.png) | ![The same on a phone, the four competitions' winners one under another, nothing past the right edge](../screenshots/3239-homepage-winners/after-homepage-phone.png) |
| ![The admin menu's Research Competitions: Submissions, Rubrics and Judging results](../screenshots/3239-homepage-winners/before-admin-menu.png) | ![The same menu with Winners after Judging results](../screenshots/3239-homepage-winners/after-admin-menu.png) |
| | ![The new Winners page for 2026: a 1st, 2nd and 3rd place box for each research competition, picked from its accepted made-up entries, the Trail challenge not picked here yet, and Saved.](../screenshots/3239-homepage-winners/after-admin-winners.png) |
| | ![txgisday.org's homepage after the same winners were saved: no winners section](../screenshots/3239-homepage-winners/after-txgisday-homepage.png) |

### GIS Day: The trail challenge's winners on gisday.tamu.edu's homepage

The Winners page now picks the trail challenge's 1st, 2nd and 3rd place too
([#3243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3243)), and the homepage shows each
place with the winner's name beside the research competitions' winners. The choices are the season's trail
submitters in the leaderboard's order, each with their name and points as the leaderboard scores them, so no name is
typed. A winner is kept by their account, and their name is read from their profile when the homepage is shown. No
other detail about them leaves the site.

These images were taken locally on made-up data. The made-up trail submitters have no sign-in profile, so the Winners
page lists them as "No name given (N points)", and the homepage's Trail challenge block cannot be shown locally: the
site leaves a place whose winner has no name off the homepage, by design.

| Before | After |
| --- | --- |
| ![The Winners page before: each research competition's places picked, and the Trail challenge saying its winners are people rather than entries and are not picked here yet](../screenshots/3243-trail-winners/before-admin-winners.png) | ![The Winners page's Trail challenge after: 1st, 2nd and 3rd picked and saved from the made-up submitters in the leaderboard's order, each listed as "No name given (N points)" (5, 3 and 2 points) because they have no sign-in profile](../screenshots/3243-trail-winners/after-admin-trail.png) |
| ![gisday.tamu.edu's homepage at 1280 pixels before: the 2026 Competition Winners section with the four research competitions' made-up winners](../screenshots/3243-trail-winners/before-homepage.png) | ![The same homepage after the trail places were saved: the research competitions' winners and no Trail challenge block, because the made-up winners have no names and unnamed places are left off by design](../screenshots/3243-trail-winners/after-homepage.png) |
| ![The same homepage on a phone, 390 pixels wide, before](../screenshots/3243-trail-winners/before-homepage-phone.png) | ![The same on a phone after: the research winners only, no Trail challenge block for the same reason, nothing past the right edge](../screenshots/3243-trail-winners/after-homepage-phone.png) |

### GIS Day admin: a repeated Ask to judge or Ask for slides email is caught whichever copy of the API it reaches

The Ask to judge and Ask for slides emails, like the session details email, never go to the same person about the same
session twice within ten minutes. Their guard was kept in each copy of the API's memory, and production runs two, so a
repeat that reached the other copy went out again. All three emails now claim each send, before it goes, in one table
both copies share (which email, which session, which person, and when), so two sends racing in either copy agree on
which goes. The session details email's own table from
[#3098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3098) is folded into it.

**Before the API is deployed**, the production migration runs `AddSpeakerEmailClaims1795459774518`, which adds
`speaker_email_claims` and copies `session_details_sends` into it. It only adds: `session_details_sends` stays, unused by
the new API, so the API before this keeps working once it has run, and can be rolled back to. A later migration drops
it ([#3269](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3269)).
([#3260](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3260))

### GIS Day: The Winners page offers each entry by its main author first

On the admin Winners page, each place's box listed an entry as its title and then its people in brackets, so a long
title pushed the names off the end of the box and an admin could not see whose entry it was. Each entry now reads
**Main author - Title (with Others)**, so the name an admin is looking for comes first.
([#3292](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3292))

| Desktop, 1280 pixels | Before | After |
| --- | --- | --- |
| A competition's 1st place, its entries shown | ![The long entry's title fills the box and its third name is cut off](../screenshots/3292-winners-author-first/before-winners-dropdown.png) | ![Each entry starts with its main author](../screenshots/3292-winners-author-first/after-winners-dropdown.png) |
| Phone, 390 pixels | | ![The same on a phone: each entry starts with its main author](../screenshots/3292-winners-author-first/after-winners-dropdown-phone.png) |

The boxes are drop-downs; the images show their options drawn as a list in the page, as a browser does when a drop-down
is given a height, because an open drop-down is drawn by the system and cannot be captured. The entries and people are
made up.

### GIS Day: the Paper competition's page gives this season's dates, not 2020's

The Paper competition's page still gave 2020's dates, times and rooms: a submission deadline of November 9, 2020, finalists
told on November 16, 2020, and an awards session on "Wednesday, November 18". It now reads them from the season, as the
Posters and Presentation pages do: the season's paper deadline in Central time, the finalists date from the Paper
competition's settings (the line left out when there is none), and the awards session named with its day, time and room,
or "to be announced"
([#3321](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3321)).

| | Before | After |
| --- | --- | --- |
| The dates, at 1280 | ![Before: 2020's deadline, finalists date, session and awards](../screenshots/3321-papers-dates/before-papers-1280.png) | ![After: the season's deadline, finalists date and awards session](../screenshots/3321-papers-dates/after-papers-1280.png) |
| With no finalists date set | | ![After: the finalists line left out](../screenshots/3321-papers-dates/after-no-finalists-papers-1280.png) |
| At 390 | ![Before on a phone](../screenshots/3321-papers-dates/before-papers-390.png) | ![After on a phone](../screenshots/3321-papers-dates/after-papers-390.png) |

GIS Day has no dev site, so this was checked on the local site, signed out, with made-up season settings: a paper deadline,
a Paper competition finalists date and a made-up `AWARDS:` session.

### GIS Day admin: the RSVP-type and submission-type pages look like the other admin pages

The admin pages for RSVP types and submission types were the last built on the old admin bases, with bare View, Add and
Edit links above them, no title, and an "Update entity" button. They are now one set of pages on the same bases as the
rest of the admin: each list has its title and an Add link in its toolbar, the add page says Create, and the edit page
has Update with Delete beside it
([#3328](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3328)).

| | Before | After |
| --- | --- | --- |
| RSVP types, list | ![Before: RSVP types, list](../screenshots/3328-type-pages/before-rsvp-types-list.png) | ![After: RSVP types, list](../screenshots/3328-type-pages/after-rsvp-types-list.png) |
| RSVP types, add | ![Before: RSVP types, add](../screenshots/3328-type-pages/before-rsvp-types-add.png) | ![After: RSVP types, add](../screenshots/3328-type-pages/after-rsvp-types-add.png) |
| RSVP types, edit | ![Before: RSVP types, edit](../screenshots/3328-type-pages/before-rsvp-types-edit.png) | ![After: RSVP types, edit](../screenshots/3328-type-pages/after-rsvp-types-edit.png) |
| Submission types, list | ![Before: Submission types, list](../screenshots/3328-type-pages/before-submission-types-list.png) | ![After: Submission types, list](../screenshots/3328-type-pages/after-submission-types-list.png) |
| Submission types, add | ![Before: Submission types, add](../screenshots/3328-type-pages/before-submission-types-add.png) | ![After: Submission types, add](../screenshots/3328-type-pages/after-submission-types-add.png) |
| Submission types, edit | ![Before: Submission types, edit](../screenshots/3328-type-pages/before-submission-types-edit.png) | ![After: Submission types, edit](../screenshots/3328-type-pages/after-submission-types-edit.png) |
| RSVP types, list, at 390 | | ![After: the RSVP types list on a phone](../screenshots/3328-type-pages/after-rsvp-types-list-390.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with two
made-up RSVP types and two made-up submission types. No form was saved.

### GIS Day admin: the season an admin page shows is kept in its address, on every page

Admin lists, the judging pages and the dashboards each picked their season their own way, and only some kept the choice in
the page's address. On Rubrics, Judging results and Winners a reload, or a link sent to someone, went back to the current
season. They now share one season picker, which keeps the season in the address, so a reload or a shared link shows the
season that was chosen
([#3329](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3329)).

| | Before | After |
| --- | --- | --- |
| Rubrics, 2025 chosen | ![Before: Rubrics with 2025 chosen](../screenshots/3329-season-picker/before-rubrics-2025.png) | ![After: Rubrics with 2025 chosen](../screenshots/3329-season-picker/after-rubrics-2025.png) |
| Rubrics, after a reload | ![Before: Rubrics after a reload](../screenshots/3329-season-picker/before-rubrics-reloaded.png) | ![After: Rubrics after a reload](../screenshots/3329-season-picker/after-rubrics-reloaded.png) |
| Tags, 2025 chosen | ![Before: Tags with 2025 chosen](../screenshots/3329-season-picker/before-tags-2025.png) | ![After: Tags with 2025 chosen](../screenshots/3329-season-picker/after-tags-2025.png) |
| Tags, after a reload | ![Before: Tags after a reload](../screenshots/3329-season-picker/before-tags-reloaded.png) | ![After: Tags after a reload](../screenshots/3329-season-picker/after-tags-reloaded.png) |
| User accounts dashboard, 2025 chosen | ![Before: User accounts dashboard with 2025 chosen](../screenshots/3329-season-picker/before-accounts-2025.png) | ![After: User accounts dashboard with 2025 chosen](../screenshots/3329-season-picker/after-accounts-2025.png) |
| User accounts dashboard, after a reload | ![Before: User accounts dashboard after a reload](../screenshots/3329-season-picker/before-accounts-reloaded.png) | ![After: User accounts dashboard after a reload](../screenshots/3329-season-picker/after-accounts-reloaded.png) |

Before, Rubrics went back to 2026 on a reload, and Tags and the dashboard already kept 2025. After, all three keep it. GIS
Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with made-up tags and
rubrics in 2025 and 2026. No form was saved.

### GIS Day: names with numbers in them sort as numbers, on every list

About ten lists sorted names, each in its own way, so a list could sort one way on screen and another in an email. They now
share one order. Where it shows: a number in a name now sorts as a number on the Presenters page, in the email composer's
recipients, in a judge's entries, in the judging results and in the season's winners, so "Team 2" comes before "Team 10",
where "Team 10" came first. Names without numbers keep their order
([#3331](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3331)).

| | Before | After |
| --- | --- | --- |
| Presenters, at 1280 | ![Before: Team 10 Zmadeup listed before Team 2 Zmadeup](../screenshots/3331-one-name-order/before-presenters.png) | ![After: Team 2 Zmadeup before Team 10 Zmadeup](../screenshots/3331-one-name-order/after-presenters.png) |

GIS Day has no dev site, so this was checked on the local site, signed out, with two made-up presenters whose names differ
only by that number.

### GIS Day admin: the admin forms say the same thing when they save or delete

Six admin forms (broadcasts, classes, venues, organizations, tags and universities) each wrote their own save and delete,
and their messages had drifted apart: "Tag deleted successfully." on one, "University updated successfully" with no full
stop on another, a lower-case "Update organization" on a third. They now share one, and each says "<Thing> was
successfully created, updated or deleted." under a title in the same case
([#3340](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3340)).

| | Before | After |
| --- | --- | --- |
| Deleting a tag | ![Before: Tag deleted successfully.](../screenshots/3340-admin-entity-form/before-tag-delete.png) | ![After: Tag was successfully deleted.](../screenshots/3340-admin-entity-form/after-tag-delete.png) |
| Saving a university | ![Before: University updated successfully](../screenshots/3340-admin-entity-form/before-university-update.png) | ![After: University was successfully updated.](../screenshots/3340-admin-entity-form/after-university-update.png) |
| Saving an organization | ![Before: the title Update organization](../screenshots/3340-admin-entity-form/before-organization-update.png) | ![After: the title Update Organization](../screenshots/3340-admin-entity-form/after-organization-update.png) |

The message is at the bottom right of each image. GIS Day has no dev site, so this was checked on the local site, signed in
as the txgisday-dev test admin, by saving a made-up university and organization and deleting two made-up tags in a
scratch database.

### GIS Day: a session hidden from the schedule is not shown to the public by its link

A session hidden from the public schedule could still be opened by anyone who had its link, signed in or not, and its
name, time, place and abstract read. The API now answers "not found" for a hidden session unless the person asking may
manage sessions, so the public sees nothing of it, and admins see it as before
([#3354](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3354)).

| | Before | After |
| --- | --- | --- |
| A hidden session's link, signed out | ![Before: the made-up hidden session's page, its name and abstract shown to a visitor](../screenshots/3354-public-event-hidden-sessions/before-signed-out.png) | ![After: nothing of the session is shown](../screenshots/3354-public-event-hidden-sessions/after-signed-out.png) |
| The same link, signed in as an admin | ![Before: the session's page](../screenshots/3354-public-event-hidden-sessions/before-signed-in.png) | ![After: the session's page, unchanged](../screenshots/3354-public-event-hidden-sessions/after-signed-in.png) |

Signed out, the page now shows nothing between the header and the footer rather than saying the session was not found.
GIS Day has no dev site, so this was checked on the local site with a made-up hidden session, signed out and signed in as
the txgisday-dev test admin.

### GIS Day admin: the Speakers list fits a phone's screen

On a phone the admin Speakers list was wider than the screen, so the whole page scrolled sideways, and the season select
beside the heading was squeezed to a sliver too narrow to read or use. The table now scrolls sideways in its own box, as
the admin dashboards' tables do, so the page stays the width of the screen. The season select and the two links move
under the heading, where the select has room
([#3370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3370)). On a desktop nothing moves.

| | Before | After |
| --- | --- | --- |
| At 390 | ![The list wider than the screen, the season select a sliver beside the heading](../screenshots/3370-speakers-list-phone/before-speakers-390.png) | ![The list the width of the screen, the season select and links on one line under the heading](../screenshots/3370-speakers-list-phone/after-speakers-390.png) |
| At 1280 | ![The Speakers list on a desktop](../screenshots/3370-speakers-list-phone/before-speakers-1280.png) | ![The same, unchanged](../screenshots/3370-speakers-list-phone/after-speakers-1280.png) |

GIS Day has no dev site, so this was checked on the local site, signed in as the txgisday-dev test admin, with three
made-up speakers.

### GIS Day admin: the season, session, place, speaker and sponsor forms say the same thing as the others

The last five admin forms (seasons, sessions, places, speakers and sponsors) now save and delete through the same shared
code as the six changed in #3340, so their messages match: the season's "Update season" and the session's "Delete event"
are now "Update Season" and "Delete Event". When the site refuses to delete a place or a speaker and says why, the
message now gives that reason
([#3382](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3382)).

| | Before | After |
| --- | --- | --- |
| Saving a season | ![Before: Update season](../screenshots/3382-admin-entity-form-2/before-season-update.png) | ![After: Update Season](../screenshots/3382-admin-entity-form-2/after-season-update.png) |
| Deleting a session | ![Before: Delete event](../screenshots/3382-admin-entity-form-2/before-event-delete.png) | ![After: Delete Event](../screenshots/3382-admin-entity-form-2/after-event-delete.png) |
| A place the site could not delete | ![Before: Error deleting place: 500](../screenshots/3382-admin-entity-form-2/before-place-delete-refused.png) | ![After: the same, as the site gave no reason](../screenshots/3382-admin-entity-form-2/after-place-delete-refused.png) |

The message is at the bottom right of each image. The site gives no reason when a place or speaker cannot be deleted
today: it answers with a server error, which is not a reason anyone can act on, so both say "Error deleting place: 500"
as before. A refusal that gives a reason is shown as it is said. GIS Day has no dev site, so this was checked on the local
site, signed in as the txgisday-dev test admin, by saving a made-up season, deleting two made-up sessions, and trying to
delete a made-up place that a made-up broadcast uses, in a scratch database.

### GIS Day admin: deleting an organization a broadcast still uses says why it can't

Deleting an organization (a place) that a broadcast still names was refused by the database, and the admin form could
only say "Error deleting place: 500"
([#3397](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3397)). The site now refuses it
first and says why, naming the broadcasts, for example "Made-up North Campus is used by 1 broadcast (Made-up stream).
Give it another place first." Nothing is deleted. An organization no broadcast uses is deleted as before, its venues
left without an organization, as they were.

Deleting a speaker who is on a session is not refused: the site removes them from their sessions and deletes them, as it
did before.

| Before | After |
| --- | --- |
| ![The organization form after Delete Organization: the message "Delete Place, Error deleting place: 500"](../screenshots/3397-in-use-delete-reason/before-place-delete-refused.png) | ![The same form after Delete Organization: the message "Delete Place, Made-up North Campus is used by 1 broadcast (Made-up stream). Give it another place first."](../screenshots/3397-in-use-delete-reason/after-place-delete-refused.png) |
| ![The same on a phone, 390 pixels wide: "Error deleting place: 500"](../screenshots/3397-in-use-delete-reason/before-place-delete-refused-phone.png) | ![The same on a phone: the message naming the broadcast](../screenshots/3397-in-use-delete-reason/after-place-delete-refused-phone.png) |

The images were taken locally on made-up records: a made-up organization that a made-up broadcast names.

### GIS Day: UCGIS's Sign in goes straight to Tradewing

UCGIS's members, and its organizers, sign in to gisday.ucgis.org only with their UCGIS Tradewing accounts. Its **Login/Signup** used to open a Texas A&M Geoservices page offering an email address, Google and Tradewing; it now goes straight to Tradewing's own sign-in page. Organizers who are not UCGIS members get a UCGIS Tradewing account with the admin role on it. txgisday.org and gisday.tamu.edu are unchanged ([#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575)).

| Before | After |
| --- | --- |
| ![UCGIS's sign-in: a Texas A&M Geoservices page with email, Google and Tradewing](../screenshots/2575-ucgis-tradewing-sign-in/before-ucgis-sign-in.png) | ![UCGIS's sign-in: "Log in with Tradewing" on www.ucgis.org](../screenshots/2575-ucgis-tradewing-sign-in/after-ucgis-sign-in.png) |

### The VGI map shows your own submissions, where you are, and one ring per thing found last year

Three things that made the competition map hard to play from a phone
([#2625](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2625)):

- **Your own submissions stand out.** Every 2026 submission used to be the same grey dot. Yours are now solid
  maroon, above everyone else's, with a key. They come from your own submissions; the map of everyone's still
  says nothing about whose each one is
  ([#1792](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1792)).
- **A "you are here" dot.** Blue, inside a circle as wide as the phone says its location may be off, following
  you as you walk, with a button that centres the map on it. It uses the location only where the site is
  already allowed it, or once you tap the button, so it never asks on its own
  ([#2559](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2559)). It is a shared map
  feature, `maps-feature-location`, for any other map that wants one.
- **One ring per thing found last year.** A memorial submitted several times in 2025 showed as several rings a few
  metres apart. Finds of one type close enough to count as the same thing for scoring are now one ring, which
  says how many times it was found. The distance is the one scoring uses to call a 2026 find already found (15 m
  for monuments, 3 m for tree and bench plaques), so a ring still means "a find here scores as already found".
  On the local copy of the database, 504 rings became 316.

| | Before | After |
| --- | --- | --- |
| The map | ![Every submission a grey dot, and rings stacked on one memorial](../screenshots/2625-vgi-map/before-phone.jpg) | ![Your submissions in maroon, a key, one ring per memorial, and the location button](../screenshots/2625-vgi-map/after-phone.jpg) |
| A ring from last year | ![One of five rings for the same monument, saying only Monument](../screenshots/2625-vgi-map/before-popup.jpg) | ![One ring, saying Monument. Found 10 times in 2025.](../screenshots/2625-vgi-map/after-popup.jpg) |
| Where you are | | ![A blue dot inside its accuracy circle](../screenshots/2625-vgi-map/after-location.jpg) |

### GIS Day: VGI monuments and memorial markers reach the ArcGIS Online layer with their names

The submission form asks every find for its name, but only plaques reached the competition's ArcGIS Online layer
with one: a monument or memorial marker arrived with `memorial_name` blank. The publisher found the name through a
scoring setting only the plaque type has. It now publishes the name for every type. How finds are scored and
reviewed is unchanged. Points already on the layer get their names when next published, by a review or by
**Publish to ArcGIS** in Admin.
([#2628](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2628))

Before: a monument's point on the layer, with `memorial_name` blank although a name was typed. The after image
is taken on production after release, as the *What to test* row says, because the local test layer does not
accept edits at the moment.

![A monument's point on the layer, with memorial_name blank](../screenshots/2628-vgi-memorial-name/before-popup.png)

### GIS Day: open a session's check-in at any time, and see check-ins made outside its time

A session's check-in used to be open only from its start until 15 minutes after its end
([#1795](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1795)), which made
check-in, and the location check above all, hard to test, and left no way to accept a late check-in. An
admin can now tick **Check-in open at any time?** on a session's event form. Its page then offers
**CHECKIN** before, during and after the session, and the API accepts it. Every other rule still applies:
an in-person session still needs the attendee inside its check-in zone
([#1766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1766)), and a hybrid
or virtual one its QR code
([#2560](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2560))
([#2635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2635)).

A check-in made outside the session's time is marked **Outside Session Time Check-In**. The mark is
decided when the check-in is made, so moving the session later does not change it, and check-ins an
organizer adds by hand are never marked. Admins see each session's check-ins in the organizer section of
its page: who, when in Central time, and the mark. Every other session keeps its window. Production needs
the `AddCheckInAnyTime` migration before this release.

| Before | After |
| --- | --- |
| ![A session outside its time: "Checkin will be available at the start of the session."](../screenshots/2635-gisday-checkin-any-time/before-outside-time.jpg) | ![The same session, open at any time: a CHECKIN button outside its time](../screenshots/2635-gisday-checkin-any-time/after-outside-time.jpg) |
| ![The admin event form's check boxes, with no check-in setting](../screenshots/2635-gisday-checkin-any-time/before-admin-form.jpg) | ![The admin event form with "Check-in open at any time?" ticked](../screenshots/2635-gisday-checkin-any-time/after-admin-form.jpg) |
| ![The session's organizer section: Attendance and the QR code, with no list of check-ins](../screenshots/2635-gisday-checkin-any-time/before-organizer-section.jpg) | ![The organizer section's Check-ins list, with a check-in marked "Outside Session Time Check-In"](../screenshots/2635-gisday-checkin-any-time/after-checkins-list.jpg) |

### GIS Day: each sponsor's logo can be drawn small, regular, large or extra large

Every logo on the Sponsors page was fitted into the same 250 × 60 px box, whatever its shape, so a logo with
small text, like the Bush School's seal and two lines beside it, read as tiny next to its neighbours and nothing
could make it bigger. A sponsor's form now has a **Logo size**: Small, Regular, Large or Extra large. Regular is
the box before and stays the size of every existing sponsor until someone changes it; Large and Extra large draw
the logo 1.5 and 2 times as large (375 × 90 and 500 × 120 px), and no logo is ever wider than a phone's screen
([#2638](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2638)).

The size is a new column on the sponsors table, added by the migration `AddSponsorLogoSize`. It only adds, so it
is run on both production databases before the new API is rolled out, and the API already running keeps working
once it has.

| Before | After |
| --- | --- |
| ![Both LiDAR logos in the same small box](../screenshots/2638-sponsor-logo-size/before-public-sponsors.png) | ![One Raster sponsor drawn extra large beside four at regular; each logo's box outlined, because the local copy has no logo files](../screenshots/2638-sponsor-logo-size/after-public-sponsors.png) |
| | ![The sponsor form's Logo size select](../screenshots/2638-sponsor-logo-size/after-admin-sponsor-form.png) |

### GIS Day: a stacked sponsor logo set to Large or Extra large grows in height too

The logo sizes added in [#2638](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2638) were boxes with the same wide shape as Regular, so a stacked logo stopped at the box's height. The Bush School's stacked logo, set to Extra large, came out about 260 × 120 px, smaller than the wide logo it replaced. Large and Extra large are now about 2:1 boxes, 450 × 200 and 650 × 300 px, so a stacked logo grows in height. A wide logo still stops at the box's width, so it looks no different. Small and Regular are unchanged ([#2646](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2646)).

| Before | After |
| --- | --- |
| ![The stacked Bush School logo small inside the Extra large box](../screenshots/2646-stacked-logo-size/before-public-sponsors.png) | ![The stacked Bush School logo filling a 650 × 300 px box beside ConocoPhillips](../screenshots/2646-stacked-logo-size/after-public-sponsors.png) |

### GIS Day: each site's link preview shows its own name, description and image

A post linking to gisday.ucgis.org showed "TxGIS Day", TxGIS Day's description and a grey placeholder, and gisday.tamu.edu's links did the same. Link previews read the page a site serves without running the app, and every site served txgisday.org's page, with no image at all. Each site now serves its own page, written when the app is built from the same site settings as the rest of its branding, with its name, a description, its address and a 1200 × 630 preview image made from its homepage banner. The site's server picks the page by the address it is reached at. UCGIS's description is its homepage's first line until UCGIS sends its own ([#2649](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2649)).

The pictures are preview cards drawn from each page's own tags: before from the live site, after from the new build.

| Before | After |
| --- | --- |
| ![gisday.ucgis.org's preview: TxGIS Day, TxGIS Day's description, no image](../screenshots/2649-site-link-previews/before-ucgis-preview.png) | ![gisday.ucgis.org's preview: UCGIS GIS Day, UCGIS's description and logo](../screenshots/2649-site-link-previews/after-ucgis-preview.png) |
| ![gisday.tamu.edu's preview: TxGIS Day, no image](../screenshots/2649-site-link-previews/before-tamu-preview.png) | ![gisday.tamu.edu's preview: Texas A&M GIS Day and the block ATM](../screenshots/2649-site-link-previews/after-tamu-preview.png) |

### GIS Day: university and organization lists can be searched by typing

The University and Organization fields on the admin speaker form, and Institution and Employer on the profile page, were plain drop-downs of about 80 universities and 290 organizations. They now take typed text as well: clicking one opens the whole list, and typing narrows it to the names that contain the text. What is saved is the same as before. It is the shared select with a new `searchable` option, which uses the shared autocomplete for the typing and the list, so any other drop-down can turn it on ([#2656](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2656)).

| Before | After |
| --- | --- |
| ![The speaker form's University field, a plain drop-down](../screenshots/2656-searchable-select/before-speaker-university.png) | ![The University field with "texas" typed and the Texas universities listed](../screenshots/2656-searchable-select/after-speaker-university-typed.png) |
| ![The profile page's Employer field, a plain drop-down](../screenshots/2656-searchable-select/before-profile-employer.png) | ![The Employer field with "esri" typed and Esri listed over the fields below](../screenshots/2656-searchable-select/after-profile-employer.png) |

### GIS Day: UCGIS's Login/Signup says to use a UCGIS account first

Since [#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575), Login/Signup on
gisday.ucgis.org goes straight to UCGIS's own Tradewing sign-in page. That page says only "Log in with Tradewing", with
no UCGIS logo and nothing to say it wants a UCGIS member account, and it is UCGIS's page, which this site cannot change.

Login/Signup now first opens a short window with the UCGIS logo:
- **Sign in with your UCGIS account**: the next page is the UCGIS sign-in titled "Log in with Tradewing", and visitors use the email and password they use on ucgis.org.
- **Continue** goes on to that page.
- **Cancel** stays on the site.

txgisday.org and gisday.tamu.edu are unchanged
([#2662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2662)).

| Before: Login/Signup went straight here | After: Login/Signup says first whose account to use |
| --- | --- |
| ![UCGIS's Tradewing sign-in, saying only Log in with Tradewing](../screenshots/2662-ucgis-sign-in-note/before-ucgis-sign-in.png) | ![A window with the UCGIS logo saying Sign in with your UCGIS account, with Cancel and Continue](../screenshots/2662-ucgis-sign-in-note/after-ucgis-sign-in-note.png) |

### GIS Day: the presentation and poster competitions give the new deadline

The student presentation competition and the poster competition took submissions until Monday, November 9. Their
deadline is now **Friday, November 13, 2026, at 5:00 PM Central**, and finalists for both are notified on **Saturday,
November 14**. The poster page had said finalists would hear on Wednesday, November 11, which would have come before
the new deadline. The sessions on Tuesday, November 17 and the awards on Wednesday, November 18 are unchanged
([#2663](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2663)).

| Before | After |
| --- | --- |
| ![Poster submission due Monday November 9th](../screenshots/2663-competition-deadline/before-posters-two.png) | ![Poster submission due Friday November 13th](../screenshots/2663-competition-deadline/after-posters-two.png) |
| ![Poster finalists notified Wednesday November 11th](../screenshots/2663-competition-deadline/before-posters-five.png) | ![Poster finalists notified Saturday November 14th](../screenshots/2663-competition-deadline/after-posters-five.png) |
| ![Abstract submission due Monday November 9th](../screenshots/2663-competition-deadline/before-presentation-two.png) | ![Abstract submission due Friday November 13th](../screenshots/2663-competition-deadline/after-presentation-two.png) |
| ![Presentation finalists notified November 14th](../screenshots/2663-competition-deadline/before-presentation-four.png) | ![Presentation finalists notified Saturday November 14th](../screenshots/2663-competition-deadline/after-presentation-four.png) |

### GIS Day: the poster and presentation competitions no longer credit the Center for Teaching Excellence

The Prizes section of the poster and presentation competition pages said the prizes were provided by the Texas A&M
Center for Teaching Excellence, through a Montague-CTE Scholar Award won by Dr. Heng Cai. That sentence is removed from
both pages. The prize amounts are unchanged
([#2676](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2676)).

| Before | After |
| --- | --- |
| ![The poster competition's prizes, credited to the Center for Teaching Excellence](../screenshots/2676-cte-credit/before-posters.png) | ![The poster competition's prizes, with no credit](../screenshots/2676-cte-credit/after-posters.png) |
| ![The presentation competition's prizes, credited to the Center for Teaching Excellence](../screenshots/2676-cte-credit/before-presentation.png) | ![The presentation competition's prizes, with no credit](../screenshots/2676-cte-credit/after-presentation.png) |

### GIS Day: the VGI competition page credits the Office of the University Architect

The VGI competition page now says, under the 2026 competition, that its prizes are provided by the Texas A&M Office of
the University Architect. The Monument Trail page it links to already said so
([#2677](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2677)).

| Before | After |
| --- | --- |
| ![The 2026 VGI competition, with no prize credit](../screenshots/2677-vgi-sponsor/before-vgi.png) | ![The 2026 VGI competition, with the Office of the University Architect credited for the prizes](../screenshots/2677-vgi-sponsor/after-vgi.png) |

### AggieMap tells visitors about GIS Day

Texas A&M GIS Day is **Monday 16 to Friday 20 November 2026**, and AggieMap would have said nothing about
it. The main map raises a notice for an event that is on now or within a week - Ring Day, Big Event, football
and the rest all have one - and GIS Day's never appeared.

Its dates were right all along. What it did not have was a notice to raise: the service skips an event with
no notice configured before it ever looks at a date, so GIS Day's could not have appeared in any year,
whatever the dates said. **The absence of a notice looks exactly like a quiet week**, which is why it went
unnoticed for several of them.

From a week before the event, a visitor to the main map now gets a notice that opens the GIS Day map, where
the building and parking locations around the MSC and Rudder Tower are. It can be dismissed for good, and it
comes back next year on its own: the service stamps the season onto the notice from the event's own earliest
date, so giving the map next year's dates is all anybody has to do.

#### Behind the scenes

Twenty-seven other event maps carry dates and no notice, and that is correct - a notice is for an event the
public is invited to, not for every permit map. So the new check asserts GIS Day's notice specifically, and
then asserts what must be true of *every* notice, which is where a copied definition goes wrong: no season
typed into an id, each notice opening its own map, and no two events sharing an id and so silencing each
other. All three already held across the existing twelve.

### GIS Day: signing in on UCGIS GIS Day comes back to GIS Day again

For a few hours on 6 November, signing in on gisday.ucgis.org stopped at Tradewing. The email and password were
accepted and the visitor was signed in to ucgis.org, but never sent back to GIS Day. The cause was the change for
[#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672) in
[PR 2683](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2683), which asked Tradewing for the
password at every sign-in, which opened Tradewing's own sign-in form:

![Before: Tradewing's "Log in with Tradewing" form, which signed visitors in to ucgis.org and stopped there](../screenshots/2700-ucgis-signin/before-tradewing-form.jpg)

The UCGIS site was rolled back the same day, and this takes that one change out
([#2700](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2700)).

The rest of PR 2683 stays: Logout ends only the site's own session, on every site, and clears the API answers the
browser kept. What PR 2683 was for is open again: after Logout, the next sign-in on UCGIS GIS Day signs straight back
in while ucgis.org still has a session, and only Tradewing can end that session.

### GIS Day admin: a new event starts out accepting RSVPs

The form for adding an event started with "Is accepting RSVPs?" unticked, although the database treats an event as
accepting RSVPs unless told otherwise. So every event added in the admin pages was saved as not accepting them: on
6 November 2026 all 45 active events on each site were, and a script had to set them. A new event now starts with the
box ticked; an organizer can still untick it, and an event being edited keeps what it has.
([#2706](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2706))

| Admin > Events > Add | Before | After |
| --- | --- | --- |
| A new event | ![Is accepting RSVPs? unticked](../screenshots/2706-new-event-accepts-rsvps/before.png) | ![Is accepting RSVPs? ticked](../screenshots/2706-new-event-accepts-rsvps/after.png) |

### GIS Day: the Sessions page names each day's weekday

Each day on the Sessions page is now headed with its weekday, "Thursday, November 19" rather than "November 19", on
all three GIS Day sites.

The headings are now also in Central time, as the page's times already were. A day arrives from the server as
midnight Central, which is still the evening before further west, so a visitor in Pacific time saw every day a day
early: 15 to 19 November for a week that runs 16 to 20 November.
([#2708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2708))

| | Before | After |
| --- | --- | --- |
| Central time | ![The day heading reads November 19](../screenshots/2708-gisday-schedule-weekday/before-chicago.png) | ![The day heading reads Thursday, November 19](../screenshots/2708-gisday-schedule-weekday/after-chicago.png) |
| Pacific time | ![The same day reads November 18](../screenshots/2708-gisday-schedule-weekday/before-los_angeles.png) | ![The same day reads Thursday, November 19](../screenshots/2708-gisday-schedule-weekday/after-los_angeles.png) |

### GIS Day: session times are Central wherever the visitor is

The Sessions page says all its times are in Central time, but it showed each session in the visitor's own time zone.
Further west it was also a day early on a session's own page: in Pacific time, a session at 9:00 AM on Thursday 19
November read 7:00 AM, on 18 November. The Sessions page, a session's page and a speaker's page now show every
session's day and times in Central time, for every visitor. Check-in already read them this way, and the pages now
use the same reading.
([#2710](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2710))

| Pacific time | Before | After |
| --- | --- | --- |
| Sessions page | ![The session reads 7:00 AM](../screenshots/2710-gisday-session-times/before-sessions-los_angeles.png) | ![The session reads 9:00 AM](../screenshots/2710-gisday-session-times/after-sessions-los_angeles.png) |
| A session's page | ![Nov 18, 2026, 7:00 AM](../screenshots/2710-gisday-session-times/before-session-page-los_angeles.png) | ![Nov 19, 2026, 9:00 AM](../screenshots/2710-gisday-session-times/after-session-page-los_angeles.png) |

### GIS Day: every UCGIS member institution is in the institution list

When visitors complete their profile, they choose the institution they attend or work at from a list, and choose
**Other** when theirs is missing. The list had 23 institutions on the UCGIS site and 92 on txgisday.org, and many UCGIS
members were not among them. All 67 members on UCGIS's
[members page](https://www.ucgis.org/site/members) are now in each site's list for this season. A new script adds
those that are missing, and leaves alone those that were already there under another spelling ("Pennsylvania State
University" for Penn State, "Clemson" for Clemson University), so none is listed twice. Esri and the US Geological
Survey, UCGIS's government and commercial affiliates, are not in the list, because it is a list of schools.
([#2721](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2721))

### The GIS Day competition maps draw the campus vector basemap

The competition maps drew the older raster campus basemap, whose service is no longer maintained. They now draw the
campus vector basemap AggieMap opens on. It looks a little different: parking garages are blue, and buildings under
construction are patterned.
([#2792](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2792))

| Before | After |
| --- | --- |
| ![The signage competition map on the raster campus basemap](../screenshots/gisday-maplibre-vector-tiles/before-production-signage.png) | ![The same map on the campus vector basemap](../screenshots/gisday-maplibre-vector-tiles/after-local-signage.png) |

### GIS Day admin: the submissions list shows who submitted each, and when

The admin list of student competition submissions showed each one's title, type, format, classification and status,
but not who submitted it or when. Checking whether a particular student's poster had arrived meant opening each
submission in turn, and even then it showed only the participants typed into the form, not the account that submitted
it. The list now shows the date and time each was submitted, and the submitter's first and last name, email and
department (the field of study for a student, the department for anyone else), read from their account, stacked in one
Submitted by column. A submission
whose account no longer exists still appears, marked "Account not found".
([#2799](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2799))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| The 2026 list (local test data) | ![Title, type, format, classification and status only](../screenshots/2799-submission-submitters/before.png) | ![The same, with when it was submitted and the submitter's name, email and department](../screenshots/2806-admin-tables-fit/after.png) |

### GIS Day admin: tables use the screen's width and no longer scroll sideways

The admin pages were held to a fixed 1140-pixel layout, and a table wider than its column scrolled sideways inside it.
The competition submissions list, with its new submitter columns, overlapped its own headings and cut names to three
letters. On a desktop the admin pages now use the screen's width, as every GIS Day page already does on a phone; the
menu keeps its width, and each table takes the rest and wraps between words instead of scrolling.
([#2806](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2806))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide (local test data) | ![Eleven narrow columns, headings overlapping](../screenshots/2806-admin-tables-fit/before.png) | ![The table across the page, every value whole](../screenshots/2806-admin-tables-fit/after.png) |

### GIS Day admin: filter, count and sort the competition submissions

The admin list of student competition submissions showed every entry of the season at once, in no particular order.
It can now be narrowed by classification (undergraduate or graduate) and by type (poster, presentation and the
rest), says how many entries it is showing out of the season's total, and sorts by any column when its heading is
clicked, newest first to begin with. The filters offer the same choices as the submission form, and the table is
the one the VGI review list already uses, which also gains a visible sort arrow.
([#2807](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2807),
[#2808](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2808))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide (local test data) | ![Every submission, no filters, no sorting](../screenshots/2806-admin-tables-fit/after.png) | ![Filters, a count, and the table sorted by date](../screenshots/2807-submission-filters-sort/after.png) |

### GIS Day admin: the submissions filters offer only the season's choices; department or major is a column

The submissions list's filters offered every choice the submission form has, so picking Paper in a season with no
papers showed nothing. Each filter now offers All and only the choices the selected season's submissions have. The
submitter's department or major, until now a grey line under their email, is a column of its own and can be sorted.
([#2817](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2817))

| Admin > Research Competitions | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide (local test data) | ![Every type offered, department under the email](../screenshots/2807-submission-filters-sort/after.png) | ![Only Paper and Poster offered, a Department / major column](../screenshots/2817-filters-with-data/after.png) |

Nothing has merged since the 30 October release.

---

---

### GIS Day Presenters: search by name or organization, and listed by last name

The Presenters page showed every presenter, 77 this year, in order of first name, with no way to find one person or
everyone from one organization except scrolling. A search box above the cards now narrows them to the presenters
whose first name, last name or organization contains what is typed, in any case and ignoring accents, and says how
many it is showing. The cards are in order of last name, as a printed program would list them.
([#2859](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2859),
[#2860](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2860))

| Presenters | Before | After |
| --- | --- | --- |
| Desktop, 1440 pixels wide | ![By first name, no search](../screenshots/2859-presenters-search-sort/before.png) | ![A search box, by last name (local test data, whose photos are not on that machine)](../screenshots/2859-presenters-search-sort/after.png) |

### GIS Day: presenter photos load as they come into view

The Presenters page asked for every presenter's photo the moment it opened, 76 of them and 8.6 MB on
11 November 2026, before any could be seen. A photo is now loaded as its card nears the screen, so the page draws
without waiting for photos further down. The same photo component is used wherever a presenter appears, so their
own pages and session pages gain it too. The largest stored photos are resized separately, on production.
([#2861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2861))

### Edit Speaker's university and organization lists stay closed until used

On the GIS Day admin's Edit Speaker page, the University and Organization lists opened as soon as the page
loaded, with nothing touched, and lay over each other and over Affiliation, Is organizer and Delete Speaker.

Both are the shared searchable select (#2656), which fills its text field with the saved item's name. That
field reports every value written to it as a change, and the autocomplete inside opened its list on any change.
It now opens the list for a change only while someone is typing in it, so a saved value leaves it closed.
Focusing the field still opens the whole list, as before.

This is the shared autocomplete, so it covers every searchable select, and AggieMap's All Maps search, which
only opens on typing already. ([#2867](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2867))

| Before | After | After, University clicked |
| --- | --- | --- |
| ![Both lists open on load, over the fields below](../screenshots/edit-speaker-lists/before.png) | ![Both fields show the saved names, lists closed](../screenshots/edit-speaker-lists/after.png) | ![The University list open over the fields below](../screenshots/edit-speaker-lists/after-focused.png) |

### GIS Day: the Presenters search finds a university, by name or abbreviation

The search on the Presenters page found a presenter by name or organization. It now also finds them by their
university, by its full name or its abbreviation, so `TAMU` lists everyone from Texas A&M, including those who now
work elsewhere. On the local site, `TAMU` found none of its 13 presenters before and 5 after.
([#2869](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2869))

| Before | After |
| --- | --- |
| ![Searching TAMU finds no presenters](../screenshots/presenters-university-count/search-before.png) | ![Searching TAMU finds 5 of 13 presenters](../screenshots/presenters-university-count/search-after.png) |

### GIS Day: the Presenters page says how many presenters are listed, under the list

Under the last card, the Presenters page now says how many presenters there are, and while a search is typed, how
many of them it shows. The count above the list, under the search box, stays as it was. ([#2870](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2870))

| Before | After |
| --- | --- |
| ![The bottom of the list, with no count](../screenshots/presenters-university-count/count-before.png) | ![13 presenters, under the list](../screenshots/presenters-university-count/count-after.png) |

### GIS Day admin: the event form's speaker search closes once a speaker is added

On the admin's event pages, clicking a speaker in the Speakers search added them but left the results open over the
rest of the form. The list stays open while anything in it has focus, and the speaker just clicked kept it. Choosing a
speaker now adds them, clears the search and closes the list. Enter and Space still choose a speaker from the
keyboard. ([#2871](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2871))

| Before | After |
| --- | --- |
| ![The results still open after clicking Andrew Shensky](../screenshots/event-speaker-search/before.png) | ![Andrew Shensky added under a closed, empty search](../screenshots/event-speaker-search/after.png) |

### GIS Day admin: Create Class adds several sections at once

A class with several sections used to be entered once for each. Create Class's section field now takes a list,
separated by commas (`501, 502, 503`), and adds one class for each section, with the same code, number, name and
professor. The form says how under the field. If a section cannot be added, for example because it already exists,
the page names it, leaves it in the field to correct, and stays open; the others are kept. A single section works as
before, and Edit Class still edits one. ([#2872](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2872))

| Before | After |
| --- | --- |
| ![Create Class with one Course Section field](../screenshots/class-sections/before.png) | ![Course Section(s), with three sections and how to enter them](../screenshots/class-sections/after.png) |

### GIS Day admin: a Dashboards section, starting with RSVPs per event by person type, over time

The admin menu opens with a new **Dashboards** section. Its first dashboard, **RSVPs**, shows for the selected season:

- **RSVPs over time**: the running total at the end of each day, in Central time. Opening an event adds that event's
  own line.
- **By event**: each event, in the order they happen, with its number of RSVPs split by person type, and a total row.
  The types come from what each person chose on My Details: **Undergraduate** and **Graduate** students (read from
  the classification they typed; a student whose classification reads as neither is counted as *Student,
  classification not given*), **Faculty & academia**, **Industry**, and **Not given** for an account that never
  completed its profile.
- **An event, opened**: who RSVP'd, under their type's heading, with their email, classification or position,
  department or field of study, and university or employer, and an **Export as CSV** of the same.

Names and emails are read only when an event is opened, and only by an admin with the `read:rsvps` permission.
([#2878](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2878))

| Before | After |
| --- | --- |
| ![The admin menu, with no dashboards](../screenshots/rsvp-dashboard/menu-before.png) | ![Dashboards first in the admin menu, with RSVPs under it](../screenshots/rsvp-dashboard/menu-after.png) |

![The RSVP dashboard: the chart of RSVPs over time and each event's RSVPs by person type](../screenshots/rsvp-dashboard/dashboard-after.png)

![The chart with an event opened: its own line beside every event's](../screenshots/rsvp-dashboard/chart-expanded-after.png)

![An event opened: its people under their types, with names, emails and employers masked here](../screenshots/rsvp-dashboard/dashboard-expanded-after.png)

### GIS Day: signed-in visitors get the Account card in the phone menu again

On a phone, a signed-in visitor who opened the menu found no **Account** card, and so had no way to their profile,
classes, check-ins or Logout. The card is back on every GIS Day site. It had been missing since the Angular 20 upgrade
of 5 October 2026, whose conversion of the templates left the card nested where the menu does not look for it.
([#2884](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2884))

| Before | After |
| --- | --- |
| ![The phone menu signed in, with no Account card](../screenshots/mobile-account-tile/phone-menu-before.png) | ![The phone menu signed in, with an Account card after About](../screenshots/mobile-account-tile/phone-menu-after.png) |

![The Account card opened: Profile, Classes, Checkins and Logout](../screenshots/mobile-account-tile/phone-account-submenu-after.png)

### GIS Day admin: the RSVP chart redrawn, readable at any width, with each day's numbers on hover

The **RSVPs over time** chart on the RSVP dashboard is drawn again, with amCharts. The first version scaled with the
page, so on a wide screen it stood about 600 px tall, with text and dots several times the page's size, a scale running
to 1,500 for a total of 1,071, and no numbers anywhere.

Now the chart is a fixed 320 px tall, at the page's own text size, and its scale ends just above the total.
- **Hovering** any day shows that day's total and how many RSVPs it gained.
- **Columns under the line** show each day's new RSVPs, so the days that drove sign-ups stand out.
- **The GIS Day week is shaded.**
- **Dragging across the chart** zooms into a stretch of time, and a double-click shows it all again.
- **Opening an event** adds its own line and a legend, as before.

([#2886](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2886))

| Before | After |
| --- | --- |
| ![The old chart at 1920 px wide: tall, with large text and a dot on every day](../screenshots/rsvp-chart/chart-1920-before.png) | ![The new chart at 1920 px wide: 320 px tall, columns of new RSVPs beneath, GIS Day week shaded](../screenshots/rsvp-chart/chart-1920-after.png) |

![Hovering a day: its total and its new RSVPs](../screenshots/rsvp-chart/chart-hover-after.png)

![An event opened: its own line and a legend](../screenshots/rsvp-chart/chart-event-after.png)

![Zoomed into October by dragging across the chart](../screenshots/rsvp-chart/chart-zoomed-after.png)

### GIS Day admin: sort the RSVP dashboard's table by any column

On the RSVP dashboard, a click on any heading of the **By event** table sorts the table by it, and a second click
reverses it; an arrow on the heading shows which. Counts sort highest first, **Event** A to Z, and the event's start,
now in its own **When** column, earliest first, which brings back the date order. The **All events** row stays at the
bottom, and an opened event's people stay under its row.
([#2891](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2891))

The table and its list of people are now shared pieces, which the coming dashboards for user accounts, check-ins and
VGI submissions will use.

| Before | After, sorted by Industry |
| --- | --- |
| ![The RSVP table, in date order, with no way to sort it](../screenshots/dashboard-table-sort/table-before.png) | ![The RSVP table sorted by Industry, highest first, with the arrow on that heading](../screenshots/dashboard-table-sort/table-sorted-industry-after.png) |

![An event opened under its row, sorted, with names, emails and employers masked here](../screenshots/dashboard-table-sort/table-opened-after.png)

### GIS Day admin: a User accounts dashboard, by university or employer and person type

The admin's **Dashboards** section has a second dashboard, **User accounts**. For the selected season it counts the
accounts with a GIS Day profile made between the previous GIS Day and the end of this one, and shows:

- **A summary**: how many, and how many accounts the sign-in service made in the same time, with or without a profile.
  The sign-in service is shared with other sites, so the difference is at most the GIS Day sign-ups that never
  finished a profile.
- **Accounts over time**: the running total by day, with each day's new accounts beneath.
- **By university or employer**: a row each, counted by person type, with a total row, sortable by any heading. A row
  opens to its people, with an **Export as CSV**.

Accounts are read from Auth0 by when they were made, in slices small enough that none is cut off at the 1,000 a search
returns. ([#2892](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2892))

The charts on both dashboards now end at the end of their last day, which they had cut off.

| Before | After |
| --- | --- |
| ![The Dashboards menu with RSVPs only](../screenshots/accounts-dashboard/menu-before.png) | ![The Dashboards menu with User accounts under RSVPs](../screenshots/accounts-dashboard/menu-after.png) |

![The User accounts dashboard](../screenshots/accounts-dashboard/dashboard-after.png)

![A university opened to its people, with names, emails and employers masked here](../screenshots/accounts-dashboard/dashboard-opened-after.png)

### GIS Day admin: a Speaker badges dashboard, to print name badges from

The admin's **Dashboards** section has a **Speaker badges** page: the season's presenters, as the Presenters page lists
them, in a table to copy into the software that prints name badges.

- **Columns:** First name, Last name, Company / organization, Email, Former student year.
  - **Company / organization** is the speaker's organization or affiliation, as the site shows it, else their
    university.
  - **Former student year** is a Texas A&M former student's class year, written as the site writes it after their name
    ('14). It is blank for anyone else.
- **A search** above the table narrows it by name, company or organization, or email, ignoring case and accents, as
  the Presenters page's search does.
- **Every heading sorts** the table, and **Export as CSV** downloads what the table shows, in its order.

([#2899](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2899))

| Before | After |
| --- | --- |
| ![The Dashboards menu with RSVPs only](../screenshots/speaker-badges/menu-before.png) | ![The Dashboards menu with Speaker badges under RSVPs](../screenshots/speaker-badges/menu-after.png) |

![The Speaker badges table, with emails masked here](../screenshots/speaker-badges/badges-after.png)

![Searching for "texas", sorted by company](../screenshots/speaker-badges/badges-search-after.png)

### GIS Day admin: Speaker badges records which badges are printed, and shows only the ones still to print

The **Speaker badges** page now remembers which badges have been printed, so that as presenters are added only the
new ones are shown and exported.

- **It opens on Not printed yet.** A **Show** choice switches to Printed or All.
- **Mark these N as printed** marks exactly the rows shown, after asking on the page. Export and print first; the
  mark is only made when you say the badges have printed.
- **A Printed column** gives the date each badge was marked. A speaker whose badge would now say something else (their
  name, organization or class year has changed) is flagged **Changed since printed**, to be reprinted.
- **Not printed** on a row puts that badge back on the list, to undo a mistake or to reprint it.

A badge printed one year starts unprinted the next. Whether a badge is printed is seen only by admins who can edit
speakers. ([#2908](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2908))

| Before | After |
| --- | --- |
| ![Speaker badges, with no record of printing](../screenshots/badges-printed/badges-before.png) | ![Speaker badges opening on Not printed yet](../screenshots/badges-printed/not-printed-after.png) |

![Mark these as printed asks first](../screenshots/badges-printed/confirm-after.png)

![The printed badges, with their dates and one flagged as changed since printed](../screenshots/badges-printed/printed-after.png)

## What to check, and where

Each row was written by the change that made it. GIS Day has no dev site, so every link is a live site:
check on the local stack before a promotion, and on these pages after one.

| Change | Open this on dev | Look for |
| --- | --- | --- |
| GIS Day admin: the Events list's Organization choice ([#434](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/434)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: Admin, Events, then choose an organization in **Organization** | Only that organization's sessions are listed, by their venues, and **Every organization** lists them all again |
| A venue needs its hosting organization ([#443](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/443)) | GIS Day dev site, as an admin: Admin > Venues > Add | The hosting organization is the first field; Create without one says "Select the venue's hosting organization" and saves nothing |
| A new competition submission starts from a button ([#451](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/451)) | GIS Day dev site, signed in: Account > Submissions | A **New submission** button under "Submit your work for TX GIS Day's yearly student competitions"; it opens the submission form. The small text link in the section's top right is gone |
| GIS Day admin: the VGI export ([#545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/545)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, VGI Competition, Submissions, then **Download all as a zip** | A zip downloads holding `submissions.csv`, a row per submission with its location, status and answers, and a `medias` folder with each submission's photos. A season with no submissions says so instead |
| GIS Day admin: the date and time picker on a phone ([#1756](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1756)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on a phone, open Admin > Events, edit an event, and press its **Event start time** | The time field opens just below the start time, wholly on screen, and can be used. On a desktop it opens where it always has |
| An unknown address says the page was not found ([#1765](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1765)) | Not on dev: GIS Day has no dev site. After release, open `https://gisday.tamu.edu/no-such-page` | The site's header and footer, "Sorry: We couldn't find that page.", links to the home page and Sessions, and the address left as typed; `/forbidden` still says to sign in or lacks the rights |
| GIS Day: past years' Organizations filter ([#1836](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1836)) | Not on dev: GIS Day has no dev site. After release, once the migration has run, open a past year's Sessions page on txgisday.org, for example [2025](https://txgisday.org/seasons/2025/sessions) and [2023](https://txgisday.org/seasons/2023/sessions), and look at **Organizations** beside the sessions | Each lists the organizations that year's sessions were held at, and no longer says "There are no organizations." Ticking one shows only its sessions. This year's filter is unchanged. The smoke test "a past year's Sessions page offers the organizations its sessions were held at" passes |
| GIS Day: footer My Account links ([#2024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2024)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in on [gisday.tamu.edu](https://gisday.tamu.edu), scroll to the footer and follow each link under **My Account** | The column lists My Check-ins, My Classes and Profile Details. My Check-ins opens `/account/checkins`, My Classes `/account/classes` and Profile Details `/account/details`, each the account's own page; none says "We couldn't find that page", and Registered Sessions is gone |
| GIS Day: Texas A&M site's tab icon ([#2084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2084)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). AggieMap on dev: [dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu); after release, [gisday.tamu.edu](https://gisday.tamu.edu) beside [aggiemap.tamu.edu](https://aggiemap.tamu.edu) | AggieMap's tab icon is unchanged. gisday.tamu.edu's is the same icon, the same size, not the smaller box logo. txgisday.org's and gisday.ucgis.org's are unchanged. In gisday.tamu.edu's page source (before the app runs), the `<link rel="icon">` names `assets/images/logo/favicon.ico` and the title is Texas A&M GIS Day's; this cannot be seen locally. `https://aggiemap.tamu.edu/favicon.ico` still answers |
| GIS Day: the check-in code leaves the address ([#2572](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2572)) | Not on dev: GIS Day has no dev site. After release, during a hybrid or virtual session's check-in window, scan its QR code on a phone (or open the link it holds) while signed in; then once more signed out, and sign in when asked | The page says you are checked in, and the address bar shows `/sessions/<id>/checkin` with no `?checkin=`. Going back does not return to an address with the code. Signed out, sign-in comes back to the page and it still checks you in |
| GIS Day: Admin, Users ([#2574](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2574)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)), and only production's Auth0 tenant has more than 1,000 users. On production after release, signed in as an admin: [Admin, Users](https://gisday.tamu.edu/admin/users) | The list appears instead of spinning, with "Showing the first 1,000 users. Search by name or email to find anyone else." above it. Typing part of a name or email in the search box lists the people who match, including someone whose name sorts late in the alphabet |
| GIS Day admin: VGI Competition, Form Designer ([#2582](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2582)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on gisday.tamu.edu: Admin, VGI Competition, Form Designer | Fetch Schema with `/assets/competitions/2026-monument-trail.json` says "Fetching the schema…", then "Found N fields: ..." and lists the questions. With `https://txgisday.org/assets/competitions/2026-monument-trail.json` it says it couldn't load that address and to use a file on this site. Save says "The form is saved." |
| GIS Day admin: an event's tags when it is edited ([#2887](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2887)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin, open [Admin > Events on gisday.tamu.edu](https://gisday.tamu.edu/admin/events), click an event that has a tag, change nothing and press Update, then open it again | The event's tags are ticked each time it is opened from the list, and still on the event after Update. Ticking another tag adds it beside them; unticking one removes only that one |
| GIS Day admin: Check-ins dashboard, the rest of #2893 ([#2893](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2893)) | Not on dev: GIS Day has no dev site. After release, as an admin open Admin > Dashboards > Check-ins for 2026 | Beside **RSVPs**, each event has **Walk-ins** (people who checked in without an RSVP to it) and **Showed up** (the share of its RSVPs who checked in, or "–" for an event nobody RSVP'd to), and the total row gives the season's rate. Open an event that had check-ins before its window: those people say "Outside the session's time" under their time, and the CSV has an **Outside session time** column with "yes" for them |
| GIS Day admin: Dashboards, VGI submissions ([#2894](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2894)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on txgisday.org or gisday.tamu.edu: Admin, Dashboards, VGI submissions, the 2026 season | A row per feature type on the season's form, with its submissions, new finds and repeats (adding up to the leaderboard's points: 2 a new find, 1 a repeat), people, and review statuses, and a total row that counts each person once. Clicking a type lists who submitted it, with their counts, and Export as CSV downloads them. The chart shows submissions by day. Not in the menu on gisday.ucgis.org, which has no competition |
| GIS Day admin: printed badge wording ([#2912](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2912)) | Not on dev: GIS Day has no dev site. After release, open [Dashboards > Speaker badges on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/speaker-badges) and Show All | Each printed badge reads "Printed" with its date and an Undo link, never "Not printed"; no row has its own scroll bar |
| GIS Day admin: search on the list pages ([#2914](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2914)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on gisday.tamu.edu and open Classes, Events, Venues, Affiliations, Organizations, Speakers, Sponsors, Users and Universities | Each opens with a search box and how many it lists; typing narrows the table to rows whose shown columns match, ignoring case and accents, and says "Showing N of M"; a search that matches nothing says so; selecting rows after searching selects only those shown |
| GIS Day: search from a presenter's page ([#2919](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2919)) | Not on dev: GIS Day has no dev site. After release, open any presenter from [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) and type in the box above them | The other presenters that match are listed under the box, searched as the Presenters page searches; choosing one opens their page; with more than ten matches, "See all matches on the Presenters page" opens the list already searched |
| GIS Day: a link to Presenters already searched ([#2921](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2921)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) and type a company's name | The address shows `?search=` with it; a Copy link button beside the box copies the whole link and says Copied; opening that link shows only those presenters; Back leaves the page rather than stepping through each letter typed |
| GIS Day: presenter search panel, and Copy link and clear in the box ([#2923](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2923)) | Not on dev: GIS Day has no dev site. After release, open any presenter from [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters), then open [Presenters searched for geography](https://gisday.tamu.edu/presenters?search=geography) | On a presenter's page: the box sits under the heading with room before the bio; typing opens the matches over the page without moving it; Escape or a click elsewhere closes them; the x clears the box. On Presenters: Copy link and an x sit inside the box at its right end, Copy link says Copied! and copies the whole link, and the x clears a search the page was opened with |
| GIS Day: a loader on Research Competitions ([#2924](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2924)) | Not on dev: GIS Day has no dev site. After release, open [Research Competitions on gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition) signed in as an admin, then open a submission | While the list, or a submission, is loading, the site's spinning loader shows where it will appear, instead of an empty white area; it goes once the list or submission is there |
| GIS Day: Research Competitions loads faster ([#2925](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2925)) | Not on dev: GIS Day has no dev site. After release, open [Research Competitions on gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition) signed in as an admin | The list appears in a second or two rather than after a long white wait, and every row still shows who submitted it, with their email and department |
| GIS Day: recorded times ([#2926](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2926)) | Not on dev: GIS Day has no dev site. After the migration and release, open [Research Competitions on gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition) signed in as an admin | The submissions made at the 5:00 PM deadline on 13 November show as about 5:00 PM, not 11:00 AM; the RSVP dashboard's times of day move the same way; something submitted or RSVPed now shows the time it was done |
| GIS Day: search box text ([#2930](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2930)) | Not on dev: GIS Day has no dev site. After release, open [Presenters searched for Texas A&M Forest Service](https://gisday.tamu.edu/presenters?search=Texas%20A%26M%20Forest%20Service) | The typed text is in the same font as the rest of the page and level with Copy link and the x; an empty box shows its placeholder on the same line |
| GIS Day: presentation files on submissions ([#2933](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2933)) | Not on dev: GIS Day has no dev site. After release, sign in on [txgisday.org](https://txgisday.org/account/submissions), open one of your poster or presentation submissions, and attach a PDF under **Presentation files**; then, as an admin, open [Research Competitions](https://txgisday.org/admin/research-competition) | The file is listed with its size and can be downloaded and removed; a Word file is refused with a message. The admin list's **Files** column counts it, the submission's review page lists it with a download, and **Download all files** saves a zip with a folder per submission |
| GIS Day: submission deadlines ([#2934](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2934)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition), set a poster deadline a few minutes ahead and save; then, signed in, open [a new submission](https://txgisday.org/account/submissions/add) and choose Poster | Before the deadline the form says when the poster competition closes; after it, it says it closed and when (in Central time) and offers no Submit, an existing poster submission can no longer be changed, and its files can still be attached until the files deadline. Clear the deadlines afterwards to reopen |
| GIS Day: speakers edit their own profile ([#2936](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2936)) | Not on dev: GIS Day has no dev site. After release, on [Speakers](https://txgisday.org/admin/speakers) select yourself and choose **Email edit links**; open the link from the email, change your bio and send it; then open **Edits to review** | The link opens your profile with no sign-in; a `javascript:` link is refused; the edit waits under **Edits to review**, Now beside Proposed, and appears on your public presenter page only after **Approve** |
| GIS Day: image uploads take JPEG and PNG only ([#2937](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2937)) | Not on dev: GIS Day has no dev site. After release, as an admin, edit a sponsor on [Sponsors](https://txgisday.org/admin/sponsors) and choose its logo; then do the same for an organization, a place and a speaker | The file picker offers JPEG and PNG files only; a PNG or JPEG logo saves and shows as before; an SVG chosen with **All files** is refused with an error and nothing is saved |
| GIS Day: Presentation files in a box ([#2938](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2938)) | Not on dev: GIS Day has no dev site. After release, open one of your poster or presentation submissions on [txgisday.org](https://txgisday.org/account/submissions) | **Presentation files** is a blue box above **Withdraw Submission** and **Update**, which are now the last thing on the page; the limits are a line of their own, and **Attach a file** is a button |
| GIS Day: an event's speakers by last name ([#2940](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2940)) | Not on dev: GIS Day has no dev site. After release, open an event with several speakers from [Events](https://txgisday.org/admin/events) | Its speakers are listed by last name, then first name, and stay in that order when one is added or removed |
| GIS Day admin: Escape on a details page goes back to its list ([#2942](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2942)) | Not on dev: GIS Day has no dev site. After release, at [gisday.tamu.edu/admin/events](https://gisday.tamu.edu/admin/events) choose last year's season, search, open an event and press Escape; open it again, change its name and press Escape; open the speaker search on it and press Escape | Escape goes back to the list with the same season and search. With the name changed it first asks "Leave without saving?" in the page: Keep editing stays with the change, Leave without saving goes back with nothing saved. In the open speaker search, Escape only closes the search |
| GIS Day: weekday on admin Events headings ([#2943](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2943)) | Not on dev: GIS Day has no dev site. After release, open [Events](https://txgisday.org/admin/events) | Each day reads as on the public Sessions page, for example "Monday, November 16", not "November 16" |
| GIS Day: search the Sessions list ([#2944](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2944)) | Not on dev: GIS Day has no dev site. After release, open [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) and type part of a session's name, a building or room (e.g. "gates ballroom"), or a presenter's name; then tick a tag | Only the matching sessions are listed, under their days; a day with none is left out; ticking a tag narrows the matches further; a search that finds nothing says No sessions match |
| GIS Day: a tab open across a deploy ([#2945](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2945)) | Not on dev: GIS Day has no dev site, and the change only shows across two deploys. After the release reaches txgisday.org, keep a tab open on [txgisday.org](https://txgisday.org/) through the next deploy, then click to another page | The page reloads into the new version at the page clicked, instead of going blank or staying on the old one. A page with a changed, unsaved form instead says *A newer version of this site is ready* and reloads only on **Reload now** |
| GIS Day: one button colour per site ([#2946](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2946)) | Not on dev: GIS Day has no dev site. After release, [gisday.tamu.edu/presenters/edit](https://gisday.tamu.edu/presenters/edit) and [txgisday.org/presenters/edit](https://txgisday.org/presenters/edit). The shared button also appears on [dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu) (its notices and prompts) | **Email me a link** is maroon on Texas A&M's site and blue on txgisday.org, the same colour as the site's other buttons; AggieMap's and GeoServices' buttons are the blue they were |
| GIS Day: the competitions a season runs ([#2948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2948)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | A **Competitions** section above the deadlines has four boxes, all ticked: Poster, Presentation, Paper and Cartography. Untick Paper and Cartography and save; the deadlines then list only Poster and Presentation, and, signed in, [a new submission](https://txgisday.org/account/submissions/add) offers only Poster and Presentation. A submission already made as Paper still opens, keeps its type, and is still listed for admins. Unticking every box is refused |
| GIS Day: speaker edit follow-ups ([#2951](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2951), [#2952](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2952), [#2953](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2953)) | Not on dev: GIS Day has no dev site. After release, on [Texas A&M's Speakers page](https://gisday.tamu.edu/admin/speakers) select yourself and choose **Send profile email** | The email comes from Texas A&M GIS Day, says so in its subject and text, and links to gisday.tamu.edu; the page is full width, with University and Graduation year, and shows your organization rather than an Affiliation box |
| GIS Day: the photo on a speaker's own page ([#2956](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2956)) | Not on dev: GIS Day has no dev site. After release, on [Texas A&M's Speakers page](https://gisday.tamu.edu/admin/speakers) select yourself, choose **Send profile email**, and open the link | Your photo is a full-size square, as on the admin speaker form, with your school and class year across its corner (for example TAMU '18); changing University or Graduation year changes the banner at once, and choosing a new photo shows it in the same box |
| GIS Day: the acceptance email ([#2957](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2957)) | Not on dev: GIS Day has no dev site. After release, on [Texas A&M's Research Competitions](https://gisday.tamu.edu/admin/research-competition), accept a test submission of your own | The email comes from Texas A&M GIS Day, says your submission has been accepted, and lists three steps: attach your slides or poster under Presentation files, complete your presenter profile from the separate email, and check gisday.tamu.edu/sessions |
| GIS Day: Approve, Reject and Send profile email for the selected submissions ([#2958](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2958)) | Not on dev: GIS Day has no dev site. After release, on [Texas A&M's Research Competitions](https://gisday.tamu.edu/admin/research-competition), select a test submission of your own | Approve, Reject and Send profile email appear beside Delete; each asks first, saying how many will be emailed; Cancel sends nothing. Approving marks it Accepted and the toast says so, and your inbox gets the acceptance email. Send profile email lists anyone on the submission with no speaker record |
| GIS Day: paper and cartography deadlines ([#2962](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2962)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | Submission deadlines lists four competitions, each with its two dates: Poster, Presentation, Paper and Cartography. Set a paper deadline a few minutes ahead and save; signed in, [a new submission](https://txgisday.org/account/submissions/add) of type Paper says when the paper competition closes, and after it says it closed and offers no Submit. Poster and presentation are unchanged. Clear the paper deadline afterwards to reopen |
| GIS Day: clear a search with the box's x ([#2963](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2963)) | Not on dev: GIS Day has no dev site. After release, type in the search on [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions), [gisday.tamu.edu/presenters](https://gisday.tamu.edu/presenters) and a presenter's own page; press Tab from the box to reach the x, then Enter. The shared textbox is also on [dev.aggiemap.tamu.edu/directory](https://dev.aggiemap.tamu.edu/directory) | An x appears in each box once it holds text and empties it, listing everything again, with the cursor back in the box; the Presenters page still has Copy link beside it. AggieMap's directory filter has no x and looks as it did |
| GIS Day: Save, Create and Delete keep the list's season and search ([#2965](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2965)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Universities](https://txgisday.org/admin/universities) | Pick a past season and type in the search, open a university and press **Update** without changing anything: the list comes back on that season with the search still typed, not on the current season with an empty search. The same after **Delete** on a record made to be deleted, and after **Create** from **Add university**. Save never asks "Leave without saving?" |
| GIS Day: refused saves say why ([#2966](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2966)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Add Sponsor](https://txgisday.org/admin/sponsors/add) | Give the sponsor a name and choose an SVG file as its logo (in the file picker, show all files), then Create. The message says "The logo must be a JPEG or PNG image." instead of "Error creating sponsor: 400", and no sponsor is created. The organization, place and speaker forms say the same for their images |
| GIS Day: Submission deadlines panel ([#2969](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2969)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | With this season's deadlines set, Submission deadlines is one line: each competition's dates in Central time, and the submissions list right below it. Click the line (or Tab to it and press Enter) and it opens to a table, one row per competition, each date with its Central time under it and a small Clear, and Save deadlines at the end on the right. Both date columns and every Clear fit without scrolling sideways, on a 1280 or 1024 px wide window. Click the line again and it closes. A season with no deadlines opens with the panel open |
| GIS Day admin: the check-in dashboard ([#3006](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3006)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > Check-ins on txgisday.org](https://txgisday.org/admin/dashboards/check-ins), then open an event and export its CSV | Each event's check-ins counted by person type, with an **RSVPs** column beside them and a total row that matches the summary line; a chart of check-ins by day; an opened event lists who checked in and when, and its CSV has one row per person. In a window 1280 px wide, every column, Export as CSV and the times are in view, on this page and on RSVPs; in a narrower one the table scrolls sideways in its own box, never the page. On [gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/check-ins) only Texas A&M's sessions are listed. If it says the check-ins could not be read, the admin role is missing the `read:checkins` permission |
| GIS Day: editing only an organization's link counts as a change ([#3007](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3007)) | Not on dev: GIS Day has no dev site. After release, signed in as an admin, open Admin > Organizations and an organization with a link | Change only the link's URL or label, then press Escape: "Leave without saving?" appears. Choose Keep editing or Leave without saving; nothing is saved. Open an organization and press Escape without editing: it leaves without asking |
| GIS Day: the sponsor form's logo picker takes only JPEG and PNG ([#3009](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3009)) | Not on dev: GIS Day has no dev site. After release, signed in as an admin, open Admin > Sponsors and a sponsor | Click Select Logo Image: the chooser offers JPEG and PNG files. Switch it to all files and pick an SVG or GIF: "The logo must be a JPEG or PNG image." appears under the picker, no file is shown as chosen and the preview keeps the saved logo. Press Escape and leave without saving |
| GIS Day admin: the RSVPs dashboard lists the site's own sessions ([#3010](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3010)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then the same on [txgisday.org](https://txgisday.org/admin/dashboards/rsvps) | gisday.tamu.edu lists only Texas A&M's sessions (and any with no place yet), and its totals and chart count only those; txgisday.org still lists every organization's |
| GIS Day: competition session times ([#3011](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3011)) | Not on dev: GIS Day has no dev site. After release, open [Presentation](https://gisday.tamu.edu/competitions/presentation) and [Posters](https://gisday.tamu.edu/competitions/posters) | Under Presentation Competition Session, each session's name links to its page, with the same date, time and room the [schedule](https://gisday.tamu.edu/sessions) shows (undergraduate 2:00 to 2:40 PM, graduate 2:40 to 4:00 PM, Bethancourt Ballroom 2300 C). The talk is 5 minutes in all, questions included. The poster session and the awards session read the same way. Change a session's time in the admin and the page follows without a release |
| GIS Day: closed Submission deadlines panel is a box to open ([#3012](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3012)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | With this season's deadlines set, Submission deadlines is a tinted box with a border, apart from the submissions list below it: the chevron, the title and "Set dates" in the link colour, then each competition's dates in grey. Click it and it opens exactly as before (the table of dates, Clear and Save deadlines); click the title again and it closes back to the box |
| GIS Day: slides upload rule ([#3015](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3015)) | Not on dev: GIS Day has no dev site. After release, open [Presentation](https://gisday.tamu.edu/competitions/presentation), Competition Rules | A bold rule: finalists must upload their final presentation slides through the site by Mon, Nov 16, 2026, 12:00 PM Central (the season's presentation file deadline in Admin, Research Competitions), or they will be removed from the competition. Change that deadline and the date on the page follows |
| GIS Day admin: the final file and the final reminder ([#3017](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3017)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | A **Final file** column says Uploaded or Missing for each submission, and sorts when its heading is clicked. Select accepted submissions with and without a file, and a rejected one, choose **Send final reminder**: the window says how many are skipped and why (already has a file, or not accepted), and shows the poster and presentation reminders, editable, with the first submission's filled in. Send, and the toast says how many were reminded and skipped. Selecting only submissions that are skipped sends nothing and says why |
| GIS Day: competition pages' dates ([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)) | Not on dev: GIS Day has no dev site. After release, open [Presentation Competition](https://txgisday.org/competitions/presentation) and [Poster Competition](https://txgisday.org/competitions/posters) | The day under each heading is the competition session's own day (Tuesday, November 17, 2026), and **Due** gives the season's submission deadline (Fri, Nov 13, 2026, 5:00 PM Central). In Admin, Seasons, change the poster deadline, and the Posters page's **Due** follows |
| GIS Day: competition sessions and finalists date ([#3019](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3019)) | Not on dev: GIS Day has no dev site. After release, as an admin open Research Competitions, Competition settings, and under **Sessions and finalists** choose the poster competition's session and set its Finalists notified date; Save. Then open the [Poster Competition](https://txgisday.org/competitions/posters) page | The page names the chosen session, its day under the heading, and "Finalists will be notified on ..." with the date set. With nothing set, the page names the COMPETITION: session as before, and leaves the finalists line out |
| GIS Day admin: the profile email, read and edited first ([#3023](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3023)) | Not on dev: GIS Day has no dev site. After release, as an admin: [Speakers](https://txgisday.org/admin/speakers), select one, **Send profile email**; an event's page, **Send profile emails to these speakers**; [Research Competitions](https://txgisday.org/admin/research-competition), select, **Send profile email** | Each opens the same window: the subject and the text, editable, with a preview for the first person in which the link reads "(their own edit link, added when it is sent)", never a real one. Edit a word and send: the email arrives as edited, with its own link. Remove {edit link} from the text and send: it is refused and nothing goes. Cancel sends nothing |
| GIS Day admin: the dashboards' unread count by site ([#3024](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3024)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then Check-ins | The note under each table ("N accounts could not be read") is no larger than the RSVPs or check-ins shown, and covers only Texas A&M's sessions; on txgisday.org every organization's |
| GIS Day admin: the submissions table fits ([#3026](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3026)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) in a window 1280 px and then 1024 px wide | No Files column beside Final file; Final file, Status, Type, Format and Classification read whole ("Pending Review", "Presentation", "Undergraduate"), never broken mid-word; each row's checkbox and the Name column are in view at the left, the checkbox clear of the title beside it; the table scrolls sideways in its own box to Final file and Status, and the page itself never scrolls sideways; the sorted column shows its arrow |
| GIS Day: a Sessions search as a link ([#3027](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3027)) | Not on dev: GIS Day has no dev site. After release, [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) | Type "competition" in the search: the address becomes /sessions?search=competition, and **Copy link** appears in the box. Paste that link into a new tab: the box is filled and only the competition sessions are listed. Tick a Tags filter as well: the address keeps both. Back leaves the page, not each letter typed. [Presenters](https://gisday.tamu.edu/presenters) works as before |
| GIS Day admin: the dashboards' sideways scrollbar in view ([#3029](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3029)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then Check-ins, in a window about 1024 px wide | As soon as the top of the **By event** table is on screen, a sideways scrollbar is at the bottom of the window; dragging it shows the last columns (Industry, Not given). At the end of the table it sits directly under the total row, and there is only one. The page itself never scrolls sideways. At 1280 px the RSVPs table fits with no scrollbar, as before |
| GIS Day admin: a broadcast's sessions ([#3032](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3032)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Broadcasts](https://txgisday.org/admin/broadcasts) and a broadcast used by some sessions, then one used by none | Under the broadcast's fields, **Sessions using this broadcast**: the count, then each session's day, time and name in date and time order, each name opening the session's admin page; "No sessions use this broadcast." for an unused one. On gisday.tamu.edu, only Texas A&M's sessions |
| GIS Day admin: a tag's sessions ([#3033](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3033)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Tags](https://txgisday.org/admin/tags) and a tag some sessions have, then one none has | Under the tag's fields, **Sessions with this tag**: the count, then each session's day, time and name in date and time order, each name opening the session's admin page; "No sessions have this tag." for an unused one. On gisday.tamu.edu, only Texas A&M's sessions |
| GIS Day admin: the sessions with no tags ([#3034](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3034)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Events](https://txgisday.org/admin/events) and tick **Only sessions with no tags** | Only sessions with no tags are listed. Open one, give it a tag, save, and come back: it is gone from the list, and the box is still ticked. Untick it and every session is listed again. On gisday.tamu.edu, still only Texas A&M's unless "Show every organization's sessions" is ticked |
| GIS Day: one Competition settings panel, one Save ([#3037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3037)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Research Competitions](https://txgisday.org/admin/research-competition) | Above the submissions there is one box, Competition settings for this year, with "Edit" and a line naming the competitions the season runs and their deadlines. Click it: the competitions' boxes, then a row of deadlines for each one ticked (untick one and its row goes), and one Save. Save says "Competitions and deadlines saved." and the panel stays open. With every box unticked, Save says nothing was saved and why. There is no longer a separate Competitions section or Save competitions / Save deadlines button |
| GIS Day admin: a refused dashboard names the missing permission ([#3038](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3038)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Dashboards > Check-ins on txgisday.org](https://txgisday.org/admin/dashboards/check-ins), then RSVPs and User accounts | Each loads as before. An account without the page's permission (`read:checkins`, `read:rsvps` or `read:users`) is told which one it lacks and to sign out and back in once an administrator adds it in Auth0, not "Try again in a moment"; a failure that is not a refusal still says to try again |
| GIS Day admin: the finalists' profile email ([#3043](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3043), [#3045](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3045), [#3046](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3046)) | Not on dev: GIS Day has no dev site. After release, as an admin: [Research Competitions](https://txgisday.org/admin/research-competition), select a group submission whose co-authors share one email box, **Send profile email**, then **Cancel** | The count includes each co-author who has a presenter record, including one entered by NetID; the text starts "One of the best ways for you to get a full-time or internship position..." and ends "- The Texas A&M GIS Day Team"; anyone on the submissions with no presenter record is listed by name and submission before anything is sent |
| GIS Day admin: Markdown in the editable emails ([#3044](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3044)) | Not on dev: GIS Day has no dev site. After release, as an admin: Research Competitions, select a test submission of your own, **Send profile email** (or Approve, or Send final reminder) | In the text, write `**bold**`, `*italic*`, `[a link](https://gisday.tamu.edu)` or a line starting with `- `. The preview below shows it formatted, as the email will arrive. Typed HTML such as `<b>` shows as written and is not obeyed. Send to yourself only: the email arrives with the same formatting, and a plain-text copy for clients that want one |
| GIS Day: broadcasts listed by name, numbers in order ([#3047](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3047)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Broadcasts](https://txgisday.org/admin/broadcasts), then an event's edit page from [Events](https://txgisday.org/admin/events) | Broadcasts are in alphabetical order, case ignored, with numbers in order ("Zoom 2" before "Zoom 10"). An event's Broadcast drop-down lists them in the same order |
| GIS Day: a broadcast belongs to an organization ([#3048](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3048)) | Not on dev: GIS Day has no dev site. After release (the migration, the API, the site, then the data script), as an admin open [Admin > Broadcasts](https://gisday.tamu.edu/admin/broadcasts) on gisday.tamu.edu | Texas A&M's four Zooms, and any broadcast with no organization yet, with an **Organization** column; TTU 1-3, Main UT, Main Texas DSHS and the others are gone until **Show every organization's broadcasts** is ticked. Open a broadcast: **Select organization** is its first field, set, and saving one without it is refused. An event's **Broadcast** drop-down lists the same Zooms, plus the event's own whoever's it is. On [txgisday.org's Admin > Broadcasts](https://txgisday.org/admin/broadcasts) every organization's broadcast is listed, with no switch |
| GIS Day Admin › Events: a search or filter that hides every session ([#3049](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3049)) | Not on dev: GIS Day has no dev site. After release, open Admin › Events on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events) | Type something no session has: it says "No sessions match the search or filters." with a button that clears them and brings the list back. A season with no sessions still says "There are no events for the selected season." |
| GIS Day: the X that clears every admin search box ([#3051](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3051)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Speakers](https://txgisday.org/admin/speakers) and [Speaker badges](https://txgisday.org/admin/dashboards/speaker-badges) | Type in the search box: an X shows at its right. Click it: the box empties, the count goes back to the whole list (e.g. "773 speakers."), and every row is listed again. The same on Classes, Events, Venues, Organizations, Sponsors, Universities and Users. On Speaker badges the X sits inside the box, beside the text, and the box keeps its height |
| GIS Day: the dial-in number on a session's Online Broadcast panel ([#3055](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3055)) | Not on dev: GIS Day has no dev site. After release, signed in, open a hybrid or virtual session on [Sessions](https://txgisday.org/sessions) whose broadcast has a phone number | Open Online Broadcast: "Dial-in number" shows the broadcast's phone number, not the same value as "Password". A broadcast with no phone number says None |
| gisday.tamu.edu lists 2023's Texas A&M sessions ([#3057](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3057)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Admin > Events](https://gisday.tamu.edu/admin/events) on gisday.tamu.edu and choose the 2023 season, with "Show every organization's sessions" left off | 2023 lists Texas A&M's 20 sessions (Sunday 12 to Tuesday 14 November, at the Memorial Student Center and the three socials) instead of none; other organizations' 2023 sessions stay hidden until the box is ticked; 2024 to 2026 are unchanged |
| GIS Day admin and the presenter's edit page: image pickers ([#3074](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3074)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, Organizations, Places, Speakers and Sponsors, each one's edit form; and a presenter's edit link | Choosing an SVG, or an image over 5 MB, says "The logo (or photo) must be a JPEG or PNG image." or "... must be 5 MB or smaller." at once, and the form keeps the image it had. A JPEG or PNG is taken and previewed as before |
| Scanning a session's QR code checks the attendee in ([#3077](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3077)) | Not on dev: GIS Day has no dev site. After release, as an admin tick "Check-in open at any time?" on one hybrid and one in-person session, press "Show check-in QR code" on each, and scan it with a phone; once signed out (a private window) | Signed in, the page says "Your attendance has been registered" with no button to press; signed out, it offers SIGN IN and comes back checked in; the in-person session's code checks in without asking for the phone's location. Untick the box afterwards |
| A venue's check-in zone is drawn and seen on a map ([#3078](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3078)) | Not on dev: GIS Day has no dev site. After release, as an admin open [Admin > Venues](https://txgisday.org/admin/event-locations) on txgisday.org and open a venue with Check-In Zone Corners, then one without | A map sits beside the corners box (under it on a phone). A venue with corners shows its zone on the map as the page opens; one without opens on campus. **Draw**, then a click on each corner and a double-click on the last, writes the corners into the box; dragging a corner rewrites its line; **Clear** empties the box; corners typed into the box appear on the map. Leave without saving (Escape asks first) unless the zone is meant to change |
| A session's QR code opens a check-in page ([#3081](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3081)) | Not on dev: GIS Day has no dev site. After release, as an admin tick "Check-in open at any time?" on one session, press "Show check-in QR code" on its page, and scan the code with a phone, signed in and then signed out | Signed in: a page saying "You're checked in", and "You're already checked in" on a second scan, each with "Go to the session"; signed out: straight to sign-in, then back to the page, checked in; a session not yet open: "You are not checked in" with when it opens. Untick the box afterwards |
| GIS Day admin: why a speaker-edit decision failed ([#3083](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3083)) | Not on dev: GIS Day has no dev site. After release, as an admin open Admin > Speakers > edits with a pending edit open in two tabs; approve it in one, then approve it in the other | The second says "Could not save the decision" with "That edit is not waiting for review.", not "Please try again." An account without update:speakers is told which permission it lacks |
| GIS Day: maroon search boxes on gisday.tamu.edu ([#3084](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3084)) | Not on dev: GIS Day has no dev site. After release, open [gisday.tamu.edu/sessions?search=intel](https://gisday.tamu.edu/sessions?search=intel) and click in the search box, then the same on [txgisday.org/sessions?search=intel](https://txgisday.org/sessions?search=intel) | On gisday.tamu.edu the box's outline and the words Copy link are maroon, as the header's links are; on txgisday.org both stay blue. The Presenters page's search box reads the same way |
| The QR check-in page says it once, names the day, spaces its buttons ([#3089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3089)) | Not on dev: GIS Day has no dev site. After release, scan a session's QR code: signed in; the day before a session; and signed out after cancelling sign-in once | Checked in: only the page says so, with no pop-up in the corner; the day before: "opens when it starts, on <weekday>, <month> <day> at <time>"; signed out: SIGN IN above Go to the session, with space between |
| GIS Day: preview a submission's PDFs ([#3090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3090)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, Research Competition, a submission with files | Each PDF has a Preview beside its name; it opens under the list, with Previous, Next and Close, and pages through the submission's PDFs. A PowerPoint has no Preview and still downloads. A student's own submission page shows no Preview |
| A new speaker photo shows at once ([#3091](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3091)) | Not on dev: GIS Day has no dev site. After release, send yourself a profile link, upload a new photo through it, approve it, and open Presenters in the same browser without clearing anything | The new photo shows on Presenters, the admin speaker page and the next edit review's "Now", with no reload |
| GIS Day admin: the session details email, and email actions in one menu ([#3092](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3092)) | Not on dev: GIS Day has no dev site. After release, as an admin, open a hybrid session that has speakers and a broadcast under [Events](https://txgisday.org/admin/events); then [Research Competitions](https://txgisday.org/admin/research-competition) with one submission selected | The session's Speakers section has one **Email these speakers** button; it opens a menu of **Profile email** and **Session details**, and Escape or a click elsewhere closes it. Session details opens the profile email's window with the subject and text filled in from the session: its day and time in Central, its room "and online", the broadcast's link, password, dial-in number and meeting ID, the check-in QR code note and the session's requirements, with a preview for the first speaker. Cancel sends nothing. Research Competitions' bar shows Approve, Reject, **Email** and Delete; Email opens **Profile email** and **Final reminder**, each opening its window as before |
| GIS Day: speakers upload their slides from their edit link ([#3093](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3093)) | Not on dev: GIS Day has no dev site. After release, open two test speakers' edit links for the same session (from a profile or session details email), then as an admin that session under [Events](https://txgisday.org/admin/events) | Under the profile, **Your sessions** lists each session the speaker presents this season with its day, time and room. **Upload slides** takes a PDF or PowerPoint up to 100 MB and shows its name, size and time at once, beside any already there, up to three files a session, each with its own **Remove**; with three, there is no upload. The second speaker sees none of the first's files and uploads their own. A .docx is refused in words. The session's admin page has a **Slides** section listing every speaker's files, each with who uploaded it, whose file name downloads the original; the Events list has a **Slides** column (the upload date, or None) and **Only sessions with no slides** |
| GIS Day admin: the session details email's repeat guard ([#3098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3098)) | Not on dev: GIS Day has no dev site. After release, as an admin open a session with speakers and send its details email, then send it again within ten minutes | The second send emails no one, and each speaker is listed as "already emailed this session's details in the last 10 minutes". Production runs two copies of the API, so try it several times: it must never send twice |
| GIS Day admin: Send as in the email window ([#3100](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3100)) | Not on dev: GIS Day has no dev site. After release, as an admin signed in with a tamu.edu account, select one submission under [Research Competitions](https://txgisday.org/admin/research-competition) and choose Email, then Profile email | The window opens with a **Send as** box at the top, your own address chosen, then the site's address and any shared addresses in `MAILROOM_SENDERS`. The preview shows **From:** your name with the site's in brackets and your address, and **Replies to:** your address; choosing another address changes both. Cancel sends nothing. Before any real email goes out as a person, send one test email to the maintainer and read its headers for SPF, DKIM and DMARC passes |
| GIS Day admin: which speakers get an email, together or a copy each ([#3104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3104)) | Not on dev: GIS Day has no dev site. After release, as an admin, open a hybrid session with two or more speakers under [Events](https://txgisday.org/admin/events), then Email these speakers, Session details; then Email these speakers, Profile email | Session details: **Who gets it** lists every speaker with an address, all ticked, with **One email to all of them together** chosen; the preview's **To:** has every address and the greeting names them all ("Howdy Ana and Ben,"), and the button says **Send 1 email**. **A copy each** shows the first ticked speaker and one email each; unticking a speaker leaves them out. A broadcast with no dial-in number has no "Dial-in number" line. Profile email: the same tick boxes, no together choice, and a line saying each speaker gets their own copy because it carries their own edit link. Cancel sends nothing |
| GIS Day admin: a session's Slides ([#3105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3105)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: Admin, Events, a session with slides | Each file in Slides has a Remove. It asks on the page, naming the file and who uploaded it, with Remove the file and Keep it; Keep it leaves the file. Remove the file takes it off the list, and the speaker no longer sees it on their edit link |
| GIS Day admin: Ask for slides, a session's third speaker email ([#3113](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3113)) | Not on dev: GIS Day has no dev site. After release, as an admin, open a session with two or more speakers under [Events](https://txgisday.org/admin/events), then Email these speakers, Ask for slides | The menu has three items: Profile email, Session details, Ask for slides. The window lists the speakers with tick boxes, offers no "together", and says each speaker gets their own copy because it carries their own link to upload their slides. The text names the session, its day and time in Central and its room, says what may be uploaded (PowerPoint or PDF, up to 100 MB each, up to 3 files for each session), and the preview shows "(their own edit link, added when it is sent)" where the link goes. Cancel sends nothing |
| GIS Day: emails from gisday.tamu.edu ([#3114](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3114)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on gisday.tamu.edu: open Send profile email, Send session details or a review decision, and send one to yourself | The window's preview shows the whole email in the Texas A&M GIS Day design: the maroon bar, GIS DAY(S) with this season's dates and days, the text, the session's details where there is one, and a sign-off from the address chosen in Send as. It arrives looking the same, with a plain-text version for mail apps that show no HTML, and no unsubscribe line. On txgisday.org the same emails stay plain |
| Admin, Users' search ([#3116](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3116)) | Not on dev: GIS Day has no dev site. After release, signed in as an admin, [Admin, Users](https://gisday.tamu.edu/admin/users) | Typing "zh" asks for 3 letters; "zhe" or "zhang" lists Zhe Zhang; the start of an email address finds its owner; a search never spins for ever |
| GIS Day admin: an opened dashboard row's people ([#3120](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3120)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on txgisday.org: Admin, Dashboards, VGI submissions, the 2025 season, open Unknown Art Piece; on gisday.tamu.edu, RSVPs and Check-ins for 2025, open the largest event | The people sit in a box no taller than the window, which scrolls up and down inside itself; with the row's name at the top of the window the whole box is in view, and on VGI its sideways scrollbar is at the bottom of the box, not 38,000 px down the page. A short list is only as tall as its people. At 1280 px an RSVP or check-in list has no sideways scrollbar, as before |
| GIS Day: people table headings stay in view ([#3125](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3125)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/vgi-submissions), open Admin, Dashboards, VGI submissions, choose season 2025, open **Unknown Art Piece**, and scroll down inside the box of people under it | The column headings (Name, Email, Position and the rest) stay at the top of the box as the people scroll under them, on a white band the rows do not show through. The same on RSVPs, Check-ins and Accounts with a row opened |
| GIS Day: Ask for slides from gisday.tamu.edu ([#3126](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3126)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with speakers, then Email these speakers, Ask for slides | The window's preview shows the whole email in the Texas A&M GIS Day design: the maroon bar, YOUR SESSION over GIS DAY(S) with this season's dates and days, the text, and the session's name, When and Where in a details box. When and Where are said once, in the box, not also in the text. On txgisday.org and the UCGIS site the same email stays plain, with When and Where in the text |
| GIS Day: dashboard tables at a resized width ([#3135](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3135)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/check-ins), open Admin, Dashboards, Check-ins (then RSVPs), choose season 2025, and with the window about 1280 px wide narrow it to about 1024 px | While the window changes width, a spinner shows over the By event table for a moment, then goes. At 1024 px a scrollbar is pinned under the table at the bottom of the window, and scrolling it to its end shows the last column, **Not given**, whole. Widened back to 1280 px, RSVPs has no scrollbar under its table |
| GIS Day: Who gets it in alphabetical order, with Select all ([#3142](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3142)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with several speakers, then Email these speakers, Session details (and Ask for slides) | Who gets it lists the speakers alphabetically by last name, with Select all above them, ticked. Select all unticks every speaker and itself; with one speaker ticked, Select all ticks everyone again. Close the window with Cancel: nothing is sent |
| GIS Day: maroon inline links and slide toggles on gisday.tamu.edu ([#3143](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3143)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events) and open a session that has slides, then Account, Student Competitions, New submission | On gisday.tamu.edu, a session's **Slides** file names are maroon beside **Remove**, not light blue, the selected option of the **Undergraduate / Graduate** and **Individual / Group** toggles is maroon with a dark maroon edge, and the chosen competition type's radio tick is maroon. On txgisday.org all of them are blue as before |
| GIS Day: Presentation files first on a submission ([#3144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3144)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in on [gisday.tamu.edu](https://gisday.tamu.edu/account/submissions) with an account that has a submission, and open it under Student Competitions | **Presentation files**, with its box, its deadline line and its Attach A File picker, is the first thing on the page, above Modify Student Competition Submission, without scrolling. New submission shows no Presentation files |
| GIS Day: No slides for this session ([#3147](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3147)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release (and its migration, AddEventNoSlides), as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with speakers that has no slides (a panel, a social) | Below the session's checkboxes, "No slides for this session", unticked on every session until someone ticks it. Tick it and save: Email these speakers offers Profile email and Session details, and no Ask for slides, and the Slides section says no slides are expected. On that session's speaker's presenter page (from their profile email's link), the session says "No slides are needed for this session." with no upload. Every other session still offers Ask for slides and the upload |
| GIS Day: the FAQ page's links ([#3148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3148)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, signed out, on [gisday.tamu.edu/faq](https://gisday.tamu.edu/faq): open a question and click a "Create an account" link, then a "logged into your account" link, then "Open the My Classes menu item" | Each sign-up and log-in link goes to the sign-in page, not to "We couldn't find that page" or an empty page, and after signing in comes back to the FAQ page. The My Classes link goes to sign in, then to Account, Classes |
| GIS Day: the FAQ's instructions match the site ([#3152](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3152)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, open [gisday.tamu.edu/faq](https://gisday.tamu.edu/faq) signed out and open each question | No answer says "TxGIS Day": they name Texas A&M GIS Day. Check-in asks for a complete Profile, then location in person or the session's QR code online, open until 15 minutes after the session ends. Certifying attendance points to the Classes page, the Zoom answer to Online Broadcast, and the competitions are open only to current Texas A&M students. On [txgisday.org/faq](https://txgisday.org/faq) the answers say TxGIS Day |
| GIS Day: already signed in at /signup or /login ([#3154](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3154)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in on [gisday.tamu.edu](https://gisday.tamu.edu/faq), open the FAQ's first question and follow "create an account" | A page saying **You're already signed in** and **You are signed in as** your name (or, without one, your email), with the tab saying **Already signed in** beside the site's name, and with **Continue to the site** (to the home page) and **Log out**, instead of the FAQ coming back. Signed out, the same link still goes to the sign-in page |
| GIS Day: Admin in the phone menu's Account tile ([#3162](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3162)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on a phone (or a window under 768 pixels wide), sign in on [gisday.tamu.edu](https://gisday.tamu.edu) with an admin, manager or organizer account, open the menu and tap Account | **Admin** is listed between Checkins and Logout, and tapping it opens the admin pages (Seasons). Signed in with an account that has none of those roles, Account lists Profile, Classes, Checkins and Logout, with no Admin |
| GIS Day: Who gets it says who was already sent the email ([#3167](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3167)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release (and its migration, AddSpeakerEmailSends), as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with several speakers, then Email these speakers, Session details (and Ask for slides) | Under each speaker in Who gets it: their address, then "Not sent yet" or "Sent once/N times, last <date, time>" (US Central). Above them, how many have not been sent it, "Tick only those not sent it yet" (unticks those who were) and "List those not sent it yet first". "Every email each was sent" opens a list of each speaker's emails with dates, including the profile email. Nothing was sent before the release, so every speaker starts as "Not sent yet". Close the window with Cancel: nothing is sent |
| GIS Day: masked emails on the VGI leaderboard ([#3168](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3168)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [the leaderboard](https://txgisday.org/app/leaderboard), then as a student | Each participant reads like `jsm****@tamu.edu`, the same for admins and students; your own row still says **You**; an admin clicking a row still opens that person's finds on the map |
| GIS Day: a leaderboard button on the competition page ([#3169](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3169)) | Not on dev: GIS Day has no dev site. After release, open [txgisday.org/competitions/monuments](https://txgisday.org/competitions/monuments) | A **View the leaderboard** button above the first paragraph, and another after **Open the submission form** at the bottom; each opens the leaderboard, asking to sign in first if you are not |
| GIS Day: a session's slides, and the submissions picked, as one zip ([#3174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3174)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, sign in on [gisday.tamu.edu](https://gisday.tamu.edu) as an admin. Open a session whose speakers have uploaded two or more slides files (Admin, Events), then Admin, Student Competition | Under the session's **Slides**, a **Download all N files** button saves one zip named for the session, with a folder for each speaker. On the submissions list, ticking rows changes the toolbar's **Download all files** to **Download files (N ticked)**, and its zip holds only those submissions' folders; with nothing ticked and a Classification or Type filter chosen, it reads **Download files (N shown)** and takes only the rows shown. With no filter and nothing ticked, it still downloads the whole season |
| GIS Day: speaker photos ([#3177](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3177)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/speakers), edit a speaker and choose a photo larger than 8,000 pixels on a side (a large scan or camera image under 5 MB) | Update saves, and the speaker's photo shows. Before, the same photo failed with "Error updating speaker: 413". A speaker choosing such a photo on their own edit link sends it too |
| GIS Day: judging the research competitions ([#3183](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3183)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition/rubrics), open Research Competitions, Rubrics, and choose Start from the standard rubric for posters; then on a poster session's page choose Judged competition and tick its judges, Update, and open Email these speakers, Ask to judge, without sending | The rubric shows seven criteria totalling 100 points. After Update the Judging section keeps the competition and the judges ticked. Ask to judge is in the menu only while a competition is chosen, and its window lists only the judges, a copy each. Research Competitions, Judging results lists the competition's accepted entries and each judge's progress |
| GIS Day: the email window's reason ([#3189](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3189)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin: tick a session's judges without saving, then choose Ask to judge | The window says "The email could not be loaded, so nothing was sent. This session has no judges. Tick its judges and save it first.", not "Please try again" |
| GIS Day: judging saves ([#3190](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3190)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on [gisday.tamu.edu](https://gisday.tamu.edu), open a judging link, score an entry and press Save; then edit a rubric under Admin → Research Competitions → Rubrics and save it | Both save: "Saved, N of 100 points." on the judging page, and the rubric keeps the change after a reload. Before, both failed, the judge's with "Your scores were not saved. Please try again." |
| GIS Day: the judging page's levels as boxes ([#3191](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3191)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on [gisday.tamu.edu](https://gisday.tamu.edu), open a judge's judging link (`/judging/<link>`, from an Ask to judge email to a judge) on a computer, then on a phone | Under each criterion's score box, its four levels (Excellent, Proficient, Developing, Needs Improvement) are shown as boxes, with no Levels toggle to open: four across on a computer, one per row on a phone, and nothing runs off the right edge of the phone's screen |
| GIS Day: each judge's scores on an entry ([#3193](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3193)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/research-competition/judging), open Research Competitions, Judging results, choose a competition with scores, click an entry's row, then click another, then choose Every score | Clicking a row opens a line per judge under it: their total, their comment and their score on each criterion, or Not scored yet for a judge who has not scored it; clicking another row closes the first, and clicking the open one closes it. Every score downloads a CSV with a row per judge per entry, the criteria, the total (or Not scored yet) and the comment, a comment with a comma or quotes kept whole in one cell when opened in Excel |
| GIS Day: a session's presenters by last name ([#3196](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3196)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, open a session with presenters from more than one organization under Sessions on [gisday.tamu.edu](https://gisday.tamu.edu) | Its Presenters are in order of last name, then first name, A to Z, read left to right and then down, whatever organization each is from. Before, the people from one organization sat together |
| GIS Day: the Check-in QR code at the top of a session's page ([#3197](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3197)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, signed in as an organizer on [gisday.tamu.edu](https://gisday.tamu.edu), open any session's page; then open it signed out | As an organizer, **Check-in QR Code** and its code (or, before the code has loaded, a **Show check-in QR code** button) are the first thing under the session's title, above its time and place. Signed out, or as an attendee, the page is as before, with no QR code |
| GIS Day: the phone menu's tiles are tappable as whole boxes ([#3198](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3198)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on [gisday.tamu.edu](https://gisday.tamu.edu) on a phone, open the menu (the three lines at the top) and tap a tile's icon, or the white space around its words, on Sessions, Presenters, Competitions and Login | Each tap goes where the tile says, as a tap on its words does, and the menu closes; Login signs in. Before, only a tap on the words did anything |
| GIS Day: a judge's competitions as tabs, entries collapsed ([#3200](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3200)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, open a judge's judging link (`/judging/<link>`) on [gisday.tamu.edu](https://gisday.tamu.edu), for a judge in both the undergraduate and the graduate competition | A tab for each competition, the first one open; clicking the other switches to it. In each, every entry shows only its title, authors and the judge's score (or Not scored yet), in order by the first author's last name; tapping one opens its rubric. A score typed in one tab is still there after switching away and back |
| A long value in a copy field fits its box ([#3205](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3205)) | GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)): after release, signed in as an organizer on [gisday.tamu.edu](https://gisday.tamu.edu) on a phone, open a session's page and show its check-in QR code. On dev, open any [AggieMap](https://dev.aggiemap.tamu.edu) building popup and look at its copy fields | On GIS Day, the page fits the phone, nothing cut off on the left, and the check-in link under the code ends in "…", with Copy copying the whole link. On AggieMap, the copy fields look as before; a value too long for its box ends in "…" |
| GIS Day: presenter cards on a phone ([#3208](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3208)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on a 360 px wide phone (or the browser's device view at 360 px): open a session with presenters; then, as an admin, edit a session's presenters | The session's page doesn't scroll sideways, and each presenter card fits the screen with its name beside the picture. On a wider screen the cards are a little narrower than before, as their padding is now inside their width. The session form's presenter cards fit too |
| GIS Day: each session's check-in window ([#3209](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3209)) | Not on dev: GIS Day has no dev site. After the migration `AddCheckInMinutes` and the new API, open a session in Admin → Events, then its public page on [txgisday.org](https://txgisday.org/sessions) | The edit form has **Check-in opens, minutes before the start** (5) and **Check-in closes, minutes after the end** (10) beside the times; the session's Check In button appears 5 minutes before it starts and goes 10 minutes after it ends; change either, save, and the button follows; the FAQ's check-in answer says 5 minutes before and 10 minutes after |
| GIS Day: QR code full screen on an iPad ([#3211](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3211)) | Not on dev: GIS Day has no dev site. After release, sign in as an organizer on an iPad, open a session's page on [txgisday.org](https://txgisday.org/sessions), show its check-in QR code and press **Full screen** | The code fills the screen, or on an iPad that has no full screen for a page, the whole window, white with its caption under it; **Exit full screen** brings the page back. Also try an iPhone and a laptop |
| GIS Day: compare seasons on the dashboards' charts ([#3215](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3215)) | Not on dev: GIS Day has no dev site. On production, Admin → Dashboards → RSVPs, Check-ins, VGI submissions and User accounts | Each chart opens with the selected season and the year before it, in two colours with a legend, and the axis counts days from the Monday of GIS Day week ("−14", "0", "+3"); a row of year buttons above the chart adds or removes each year; hovering gives each year's total with its own date; a year with no records, or with no GIS Day week days set, has its button greyed out, saying why |
| GIS Day: dashboard headings ([#3219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3219)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin at 1280 px and at 390 px: Admin, Dashboards, Check-ins, then the VGI dashboard | "Checked in" reads as two whole words, not "Checkec / in". No heading is cut inside a word; a long one breaks with a hyphen ("Un-verified", "classi-fication") |
| GIS Day: Edit session button on a session's page ([#3220](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3220)) | Not on dev: GIS Day has no dev site. On production, signed in as a GIS Day admin, manager or organizer, open any session from Sessions | An **Edit Session** button at the right of the session's title opens that session's edit form under Admin → Sessions; signed out, or signed in without one of those roles, there is no button |
| GIS Day: collapse each day on the Sessions page ([#3221](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3221)) | Not on dev: GIS Day has no dev site. On production, open Sessions during or after GIS Day week | A day before today (Central time) starts collapsed, its heading reading its date and "· N sessions"; today and later days start open; pressing a day's heading, or Enter or Space on it, opens and closes it; a search opens every day it finds something in; the Day 1, Day 2 links open the day they jump to; a past year's Sessions page (e.g. /2025/sessions) opens every day |
| GIS Day: search and a details panel on the judge's page ([#3230](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3230)) | Not on dev: GIS Day has no dev site. On production, a judge's page from a judging link (`/judging/<link>`), on a computer and on a phone | A search box above the list finds an entry by its title or an author, in every competition, naming the competition; choosing one opens it in a panel over the list, the whole screen on a phone, with the search box at its top; Previous and Next go to the entries beside it; Escape, Close or a click beside it closes the panel; changing a score and then leaving without Save asks first, Stay keeping the scores and Leave without saving putting back the saved ones |
| GIS Day: competition winners ([#3239](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3239)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release and the `season_winners` migration, as an admin on gisday.tamu.edu: Research Competitions, Winners; pick 1st, 2nd and 3rd of each competition and Save winners; then open the homepage | The Winners page lists each competition's accepted entries this season, by title with their people's names, and keeps what was saved when reopened. The homepage shows a "2026 Competition Winners" section with each competition's places in order, each with names and title. txgisday.org and UCGIS's homepages show no such section |
| GIS Day: trail challenge winners ([#3243](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3243)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on gisday.tamu.edu: Research Competitions, Winners; in Trail challenge, pick 1st, 2nd and 3rd and Save winners; then open the homepage | Trail challenge offers the season's submitters in the leaderboard's order, each with their name and points, and keeps what was saved. The homepage's winners section shows a Trail challenge block with each place and the winner's name |
| GIS Day admin: one repeat guard for every session email ([#3260](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3260)) | Not on dev: GIS Day has no dev site. After release, as an admin open a judged session with judges and send its Ask to judge email twice within ten minutes; then do the same with Ask for slides on a session with speakers | The second send emails no one, and each person is listed as "already asked ... in the last 10 minutes". Production runs two copies of the API, so try it several times: it must never send twice. Sending a speaker the session details just after asking them for slides still goes: each email has its own guard |
| GIS Day: the Winners page's entries, author first ([#3292](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3292)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production, as an admin: Admin, Research Competition, Winners | Each place's box lists an entry as "Main author - Title (with Others)"; an entry with a long title still shows whose it is, and one with a single person has no "with" |
| GIS Day: the Paper competition's dates ([#3321](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3321)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: Competitions, Papers | The deadline is the season's paper deadline, finalists hear on the date set in Admin, Research Competitions, Competition settings (no line when none is set), and the awards session is named with its day, time and room. No 2020 date is left |
| GIS Day admin: RSVP and submission types ([#3328](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3328)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: Admin, RSVP Types and Admin, Submission Types, then Add and one type's edit page | Each list has its title and an **Add** link in the toolbar, as the other admin lists do, in place of the bare View, Add and Edit links. Add says **Create**, and edit has **Update** with a **Delete** button beside it |
| GIS Day admin: one season picker ([#3329](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3329)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: Admin, Research Competitions, Rubrics, choose last year's season, then reload the page | The address gains `?season=`, and after the reload the page still shows last year's rubric with last year in the Season box. Tags and Dashboards, User accounts behave as before: they kept the season already |
| GIS Day: one name order ([#3331](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3331)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: Presenters, and in Admin the email composer's recipients and the judging results | Where two names differ by a number, the smaller number comes first ("Team 2" before "Team 10"), on screen and in emails alike. Other names keep their order |
| GIS Day admin: the forms' messages ([#3340](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3340)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: save a university or an organization without changing it | The message reads "University was successfully updated." or "Organization was successfully updated.", under the title "Update University" or "Update Organization". Deleting a tag says "Tag was successfully deleted." |
| GIS Day: hidden sessions by direct link ([#3354](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3354)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, on production: an admin copies the link to a session hidden from the schedule, then opens it in a private window, signed out | Signed out, the session's name, time and abstract are not shown. Signed in as an admin, the same link shows the session as before |
| GIS Day admin: the Speakers list on a phone ([#3370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3370)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on a phone: Admin, Speakers | The page no longer scrolls sideways: the table scrolls in its own box. The season select, Edits to review and Add speaker sit on one line under the heading, and the season can be read and changed. On a desktop the list looks as it did |
| GIS Day admin: the other forms' messages ([#3382](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3382)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, check on production as an admin: save a season without changing it | The message's title reads "Update Season", where it read "Update season". Deleting a session says "Delete Event" |
| GIS Day admin: an organization in use ([#3397](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3397)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release, as an admin on production: open an organization (Admin, then Organizations) that a broadcast names, and choose Delete Organization | The message says the organization is used by the broadcast, names it, and says to give it another organization first; the organization is not deleted. An organization no broadcast uses deletes as before |
| GIS Day: UCGIS signs in with Tradewing only ([#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [gisday.ucgis.org](https://gisday.ucgis.org), then **Login/Signup** | It opens "Log in with Tradewing" on www.ucgis.org, with no email, Google or sign-up choices; signing in with a UCGIS Tradewing account comes back signed in. On [txgisday.org](https://txgisday.org) and [gisday.tamu.edu](https://gisday.tamu.edu), Login/Signup still shows the page with email, Google and sign-up |
| GIS Day: the VGI competition map on a phone ([#2625](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2625)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in, on a phone: [txgisday.org/app/map](https://txgisday.org/app/map) | Your own submissions are solid maroon with a white edge, everyone else's grey, and a key at the bottom left says which is which. Where the site already has your location, a blue dot with a pale circle shows where you are and moves with you; the round button at the bottom right centres the map on it. Where it has not been allowed, nothing asks until you tap that button, and then only once. A ring from last year opens "Already found in 2025", its type, and how many times it was found ("Found 10 times in 2025."); one memorial no longer shows as a stack of rings |
| GIS Day: names on the VGI ArcGIS Online layer ([#2628](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2628)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: submit a Monument with a name, or press **Publish to ArcGIS** in Admin > Competitions > Submissions, then open its point on the layer | `memorial_name` shows the name that was typed, for a monument and a memorial marker as well as a plaque |
| GIS Day: a session's check-in at any time ([#2635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2635)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release and the `AddCheckInAnyTime` migration, as an admin: Admin, Events, a session that is not on now, tick "Check-in open at any time?" and save, then open the session at [txgisday.org/sessions](https://txgisday.org/sessions) | The session offers CHECKIN outside its time. For an in-person session with a zone it still asks for your location and refuses you outside the zone; a hybrid or virtual one still needs its QR code. Once checked in, the session's Check-ins list (organizer section) shows you, the time, and "Outside Session Time Check-In". A session without the box still says check-in is available at the start |
| GIS Day: a sponsor's logo size ([#2638](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2638)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: signed in as an admin, [Admin, then Sponsors](https://txgisday.org/admin/sponsors), then [the Sponsors page](https://txgisday.org/sponsors) | A sponsor's form has a Logo size select, Regular for every sponsor until it is changed. Set one sponsor to Extra large and save: on the Sponsors page its logo is about twice as wide as its neighbours', and every other logo is as it was |
| GIS Day: a stacked sponsor logo at Extra large ([#2646](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2646)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [the Sponsors page](https://gisday.tamu.edu/sponsors) | The Bush School's stacked logo, at Extra large, is about 650 × 300 px beside ConocoPhillips at the LiDAR level; every Regular logo is as it was, and on a phone the page does not scroll sideways |
| GIS Day: link previews ([#2649](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2649)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: `npx playwright test --config=playwright.smoke.config.ts -g "link preview"` with `SMOKE_BASE_URL` set to each of https://gisday.ucgis.org, https://gisday.tamu.edu and https://txgisday.org | Each passes. Pasting https://gisday.ucgis.org into a post (Tradewing, LinkedIn, Teams) shows "UCGIS GIS Day" and the UCGIS logo, and https://gisday.tamu.edu shows "Texas A&M GIS Day" and the block ATM; a service that saw the old preview may keep it for a while |
| GIS Day: searchable University and Organization ([#2656](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2656)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [Add a speaker](https://gisday.tamu.edu/admin/speakers/add) and [your profile](https://gisday.tamu.edu/account/details) | Clicking University or Organization (or, on the profile, Institution or Employer) opens the whole list; typing "texas" narrows it to names containing it; choosing one shows its name, and saving keeps it. An existing speaker's university and organization still show when the speaker is opened for editing |
| GIS Day: UCGIS's Login/Signup says first to use a UCGIS account ([#2662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2662)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [gisday.ucgis.org](https://gisday.ucgis.org) and [txgisday.org](https://txgisday.org) | On gisday.ucgis.org, Login/Signup opens a window with the UCGIS logo, "Sign in with your UCGIS account", and Cancel and Continue. Cancel stays on the page; Continue goes to "Log in with Tradewing". On txgisday.org, Login/Signup goes straight to its usual sign-in page with no window |
| GIS Day: presentation and poster competitions give the Friday, November 13 deadline ([#2663](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2663)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [/competitions/posters](https://txgisday.org/competitions/posters) and [/competitions/presentation](https://txgisday.org/competitions/presentation) | Both pages give the submission deadline as Friday November 13th, 2026 at 5:00PM Central and say finalists are notified on Saturday November 14th, 2026. Neither mentions November 9th or November 11th. The sessions are still Tuesday, November 17th |
| GIS Day: poster and presentation competition pages without the Center for Teaching Excellence credit ([#2676](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2676)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [/competitions/posters](https://txgisday.org/competitions/posters) and [/competitions/presentation](https://txgisday.org/competitions/presentation) | Under Prizes, neither page mentions the Center for Teaching Excellence, the Montague-CTE Scholar Award or Dr. Heng Cai. The prize amounts ($250, $150, $100) are still there |
| GIS Day: the VGI page credits the Office of the University Architect ([#2677](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2677)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [/competitions/vgi](https://txgisday.org/competitions/vgi) | Under "2026 Competition", after "The Who", the page says the prizes are provided by the Texas A&M Office of the University Architect |
| GIS Day notice ([#2678](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2678)) | [The main map on dev](https://dev.aggiemap.tamu.edu/map/d), from 9 November | A notice appears once per browser session: **GIS Day Map Available**, with a parking icon and a "don't show again" option. Clicking it opens [the GIS Day map](https://dev.aggiemap.tamu.edu/events/gis-day). It should appear from 9 November (a week before the event) through Friday 20 November, and not before or after. Before 9 November there is nothing to see, which is also what the fault looked like |
| GIS Day: signing in on UCGIS GIS Day comes back to GIS Day ([#2700](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2700)) | Not on dev, and not locally: Tradewing accepts sign-ins only from production's Auth0, so it can be checked only on [gisday.ucgis.org](https://gisday.ucgis.org) after release | In a private window: Login/Signup, Continue, then the Tradewing email and password. You land back on GIS Day, signed in. txgisday.org's sign-in is unchanged |
| GIS Day admin: a new event starts out accepting RSVPs ([#2706](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2706)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Events > Add | "Is accepting RSVPs?" is ticked on the empty form. Open an existing event that does not accept RSVPs: it is still unticked |
| GIS Day: each day on the Sessions page shows its weekday ([#2708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2708)) | Not on dev: GIS Day has no dev site. After release, [txgisday.org/sessions](https://txgisday.org/sessions), [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) and [gisday.ucgis.org/sessions](https://gisday.ucgis.org/sessions) | Each day reads like "Thursday, November 19", Monday 16 to Friday 20. The same dates on a computer set to Pacific time |
| GIS Day: session times are Central for every visitor ([#2710](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2710)) | Not on dev: GIS Day has no dev site. After release, [txgisday.org/sessions](https://txgisday.org/sessions), [gisday.tamu.edu/sessions](https://gisday.tamu.edu/sessions) and [gisday.ucgis.org/sessions](https://gisday.ucgis.org/sessions), on a computer set to Pacific or Eastern time | Each session shows the same time as on a computer set to Central (9:00 AM, not 7:00 AM or 10:00 AM), and a session's own page shows its real date. Check-in is unchanged |
| GIS Day: every UCGIS member institution is in the institution list ([#2721](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2721)) | Not on dev: GIS Day has no dev site, and this is a change to each database, made with `nx run gisday-nest:add-ucgis-members --apply`. After it has run, sign in on [gisday.ucgis.org](https://gisday.ucgis.org) and on [txgisday.org](https://txgisday.org) and open Account > My details | As a student and as Staff/Faculty, the institution list finds Yale, KU Leuven and Hunter College; an institution that was already there, such as Penn State, appears once |
| The competition maps draw the campus vector basemap ([#2792](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2792)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: [txgisday.org](https://txgisday.org), Competitions, then the Permanent Signage Challenge map (and Sidewalk, Stormwater, Light Pole) | The map draws campus with blue parking garages and pink-and-white buildings under construction, as AggieMap's campus basemap does, and credits Texas A&M University in its corner. Before, it drew the older raster basemap |
| GIS Day admin: the competition submissions list shows each submitter and when they submitted ([#2799](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2799)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Research Competitions | Each submission shows the date and time it was submitted, and under Submitted by the submitter's name, email and department. The list may take a few seconds longer to appear than before, while it looks up each submitter |
| GIS Day admin: tables fit the page ([#2806](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2806)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) on a desktop and open Admin > Research Competitions, then Users and Speakers | Each table spans the page beside the menu, every heading and value reads as whole words, and there is no sideways scroll bar |
| GIS Day admin: filter, count and sort the competition submissions ([#2807](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2807), [#2808](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2808)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Research Competitions | Choose Graduate and Poster: only graduate posters are listed, and "Showing N of M" counts them. Click a heading: the list sorts by it, with an arrow; click again and it reverses. A click on a row still opens it |
| GIS Day admin: the submissions filters offer only what the season has, and Department / major is a column ([#2817](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2817)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin on [txgisday.org](https://txgisday.org) and open Admin > Research Competitions | Type offers All, Presentation and Poster only (2026 has no papers or cartography). Department / major is a column; click its heading to sort by it |

---

| GIS Day Presenters: search, and last-name order ([#2859](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2859), [#2860](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2860)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) | The cards run A to Z by last name. Type part of a first name, a last name or an organization (for example "Esri") in the search box: only matching presenters stay, with "Showing N of M presenters" |
| GIS Day: presenter photos load as they come into view ([#2861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2861)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) with the browser's network panel open | The first cards' photos load at once; the rest load as you scroll down to them. Every photo still appears |
| Edit Speaker's university and organization lists stay closed until used ([#2867](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2867)) | GIS Day has no dev site; check on production after the rollout: [gisday.tamu.edu/admin/speakers](https://gisday.tamu.edu/admin/speakers), open any speaker with a university and an organization | Both fields show the saved name with no list open; clicking into University opens its list over the fields below, and typing narrows it |
| GIS Day: the Presenters search finds a university ([#2869](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2869)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters) and search for `TAMU`, then `Texas A&M University` | Both find the presenters from Texas A&M, including those whose organization is somewhere else |
| GIS Day: the presenter count under the list ([#2870](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2870)) | Not on dev: GIS Day has no dev site. After release, open [Presenters on gisday.tamu.edu](https://gisday.tamu.edu/presenters), scroll to the bottom, then type a search | Under the cards it says how many presenters there are; with a search, "Showing N of M presenters", matching the cards shown |
| GIS Day admin: the speaker search closes once a speaker is added ([#2871](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2871)) | Not on dev: GIS Day has no dev site. After release, open any event at [gisday.tamu.edu/admin/events](https://gisday.tamu.edu/admin/events), type part of a name under Speakers and click a speaker | The speaker is added under the search box, the search is cleared and the results close; clicking the box opens them again |
| GIS Day admin: Create Class adds several sections at once ([#2872](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2872)) | Not on dev: GIS Day has no dev site. After release, open [gisday.tamu.edu/admin/classes/add](https://gisday.tamu.edu/admin/classes/add), fill in a class and type sections such as `501, 502` | The form says how to list sections; Create adds one class per section, each in the class list. A section that already exists is named and left in the field |
| GIS Day admin: the RSVP dashboard ([#2878](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2878)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps), then open an event and export its CSV | Each event's RSVPs, counted by person type, with a total row that matches the summary line; a chart of the running total by day; an opened event lists its people under their types, adds its own line to the chart, and its CSV has one row per person. If it says the RSVPs could not be read, the admin role is missing the `read:rsvps` permission |
| GIS Day: the Account card in the phone menu ([#2884](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2884)) | Not on dev: GIS Day has no dev site. After release, on a phone (or a browser narrower than the menu), sign in on [gisday.tamu.edu](https://gisday.tamu.edu), then open the menu | An **Account** card after About, opening Profile, Classes, Checkins and Logout; Profile opens My Details. Signed out, the card is **Login** instead |
| GIS Day admin: the RSVP chart redrawn ([#2886](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2886)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps) on a wide screen | The chart about 320 px tall, with text the page's size; the scale ending just above the total; hovering a day shows its total and its new RSVPs; each day's new RSVPs as columns beneath; GIS Day week shaded; dragging across zooms in, and double-click shows it all; opening an event adds its line and a legend |
| GIS Day admin: sort the RSVP table ([#2891](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2891)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > RSVPs on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/rsvps) | Clicking a heading sorts the table by it and again reverses it, with an arrow on that heading; a count sorts highest first, Event A to Z, When earliest first; the All events row stays at the bottom; an opened event's people stay under its row |
| GIS Day admin: the User accounts dashboard ([#2892](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2892)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > User accounts on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/accounts) | The summary gives the accounts with a GIS Day profile made from the day after last year's GIS Day to the end of this one, and every account the sign-in service made then; the chart shows them over time; the table counts them by university or employer and person type, sorts by any heading, and a row opens to its people with a CSV. Needs the `read:users` permission |
| GIS Day admin: Speaker badges ([#2899](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2899)) | Not on dev: GIS Day has no dev site. After release, sign in as an admin and open [Dashboards > Speaker badges on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/speaker-badges) | Every presenter the Presenters page lists, with First name, Last name, Company / organization, Email and Former student year; a search narrows it on all but the year; any heading sorts it; Export as CSV downloads what is shown, in that order |
| GIS Day admin: printed badges ([#2908](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2908)) | Not on dev: GIS Day has no dev site. After release, and after the migration, sign in as an admin and open [Dashboards > Speaker badges on gisday.tamu.edu](https://gisday.tamu.edu/admin/dashboards/speaker-badges) | It opens on Not printed yet; Mark these N as printed asks first, then they leave the list; Show > Printed lists them with the date; a speaker changed since is flagged; Not printed puts one back |
## The pull requests

| Pull request | What it changed | Issue |
| --- | --- | --- |
| [PR 2626](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2626) | feat(gisday-competitions): The VGI map shows your own submissions, where you are, and one ring per 2025 find | [#2625](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2625) |
| [PR 2629](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2629) | fix(gisday-nest): Publish the name of every VGI find to ArcGIS Online, not only plaques' | [#2628](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2628) |
| [PR 2637](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2637) | feat(gisday): Open a session's check-in at any time, and mark check-ins outside its time | [#2635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2635) |
| [PR 2640](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2640) | feat(gisday-angular): Choose a logo size for each sponsor on the Sponsors page | [#2638](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2638) |
| [PR 2647](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2647) | fix(gisday-angular): Let a stacked sponsor logo grow at Large and Extra large | [#2646](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2646) |
| [PR 2652](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2652) | fix(gisday-angular): Give each GIS Day site's link preview its own name, description and image | [#2649](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2649) |
| [PR 2658](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2658) | feat(ui-kits-ngx-forms): A searchable option for the shared select, on for GIS Day's university and organization lists | [#2656](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2656) |
| [PR 2659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2659) | feat(gisday-angular): UCGIS's Sign in goes straight to Tradewing | [#2575](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2575) |
| [PR 2668](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2668) | chore(gisday-angular): Move the student presentation and poster competitions' deadline to Friday 13 November | [#2663](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2663) |
| [PR 2669](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2669) | feat(gisday-angular): Tell UCGIS's visitors to sign in with their UCGIS account before sending them to Tradewing | [#2662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2662) |
| [PR 2674](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2674) | fix(gisday-angular): Logout on UCGIS GIS Day signs the visitor out of Tradewing as well | [#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672) |
| [PR 2680](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2680) | fix(ts-events-ngx): GIS Day raises its event notice, which it never had | [#2678](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2678) |
| [PR 2683](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2683) | fix(gisday-angular): Every sign-in on UCGIS GIS Day asks Tradewing for the password | [#2672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2672) |
| [PR 2691](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2691) | chore(gisday-angular): Remove the Center for Teaching Excellence prize credit from the poster and presentation competition pages | [#2676](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2676) |
| [PR 2692](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2692) | feat(gisday-angular): Say on the VGI competition page that the Texas A&M Office of the University Architect provides its prizes | [#2677](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2677) |
| [PR 2694](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2694) | fix(gisday-platform-data-api): Keep contact details and speakers' emails to the admins who manage them | [#2693](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2693) |
| [PR 2704](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2704) | fix(gisday-angular): Signing in on UCGIS GIS Day comes back to GIS Day again | [#2700](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2700) |
| [PR 2709](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2709) | feat(gisday-angular): The Sessions page names each day's weekday, in Central time | [#2708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2708) |
| [PR 2711](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2711) | fix(gisday-platform-ngx-common): Session times are Central wherever the visitor is | [#2710](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2710) |
| [PR 2726](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2726) | feat(gisday-platform-data-api): Add every UCGIS member institution to the GIS Day institution lists | [#2721](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2721) |
| [PR 2735](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2735) | chore(gisday-platform-data-api): Point to where production GIS Day data is changed, and let that script ask for the UCGIS plan | [#2730](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2730) |
| [PR 2740](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2740) | fix(gisday-platform-ngx-common): A new event starts accepting RSVPs, as the database column does | [#2706](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2706) |
| [PR 2803](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2803) | feat(gisday-angular): The admin submissions list shows who submitted each, and when | [#2799](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2799) |
| [PR 2810](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2810) | feat(maps-mapbox): The GIS Day competition maps draw the campus vector basemap | [#2792](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2792) |
| [PR 2811](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2811) | fix(gisday-angular): Admin tables use the screen's width instead of scrolling sideways | [#2806](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2806) |
| [PR 2814](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2814) | feat(gisday-angular): Filter, count and sort the admin submissions list | [#2807](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2807), [#2808](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2808) |
| [PR 2818](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2818) | feat(gisday-angular): Submissions filters offer only the season's choices, and department has its own column | [#2817](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2817) |
| [PR 2862](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2862) | feat(gisday-angular): Search the Presenters page, and list presenters by last name | [#2859](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2859) |
| [PR 2863](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2863) | fix(gisday-angular): Presenter photos load as they come into view | [#2861](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2861) |
| [PR 2868](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2868) | fix(ui-kits-ngx-forms): Edit Speaker's university and organization lists stay closed until used | [#2867](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2867) |
| [PR 2873](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2873) | feat(gisday-angular): Presenters search finds a university by name or abbreviation, and the count shows under the list | [#2869](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2869) |
| [PR 2874](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2874) | fix(ui-kits-ngx-forms): The event form's speaker search closes once a speaker is added | [#2871](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2871) |
| [PR 2875](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2875) | feat(gisday-angular): Create Class adds one class per section from a list of sections | [#2872](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2872) |
| [PR 2880](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2880) | feat(gisday-angular): A Dashboards section in the admin, starting with RSVPs per event by person type, over time | [#2878](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2878) |
| [PR 2885](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2885) | fix(gisday-angular): Signed-in visitors get the Account card in the phone menu again | [#2884](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2884) |
| [PR 2888](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2888) | feat(gisday-angular): Draw the RSVP chart with amCharts, at a readable size, with each day's numbers on hover | [#2886](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2886) |
| [PR 2896](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2896) | feat(gisday-angular): Sort the RSVP dashboard's table by any column, on a shared dashboard table | [#2891](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2891) |
| [PR 2907](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2907) | feat(gisday-angular): A User accounts dashboard, by university or employer and person type | [#2892](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2892) |
| [PR 2900](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2900) | feat(gisday-angular): A Speaker badges dashboard, with a search, sortable columns and a CSV for printing name badges | [#2899](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2899) |
| [PR 2909](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2909) | feat(gisday-angular): Record which speaker badges are printed, and show only the ones that are not | [#2908](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2908) |