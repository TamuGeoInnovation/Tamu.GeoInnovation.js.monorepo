# Unreleased

Since `36b962a04`, which production was promoted from on 22 October.

**The latest release notes are [21 October 2026](2026-10-21.md)**, for build 20261021.16 (Release-489).
That build was cleared on dev from `61161ce1b` and promoted to production from `36b962a04`, four
commits later; `prod-2026-10-22` records what reached production, and the notes explain why the two
differ and why no AggieMap code did
([#2098](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2098)). The release
before it is [19 October 2026](2026-10-19.md), from `8463ac6af`.

This file collects what merges from here until the next release. **A pull request with a user-visible
result adds its own file to [`unreleased/`](unreleased/README.md), in that pull request**, with its
before/after screenshots linked from `docs/screenshots/<slug>/` and its row for *What to test on dev*;
the files are collated here at release ([#2037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2037)). Nobody writes these later. See
[README.md](README.md#cutting-a-release).

---

## Summary

### GIS Day: the sponsorship levels match the 2026 prospectus

The sponsor page now says what the 2026 prospectus says. Each level's tile shows how many
representatives it includes (Point 1, Line 2, Polygon 3, Raster 4), and each level's benefits gain the
complimentary lunch reservations and sponsor ribbon. Polygon and Raster add the post-event attendee
list; Raster's speaking slot is 20 minutes, not 5, and it adds a dedicated email to registered
attendees. A note says extra representatives are welcome at no charge. The older one-line summaries
are gone, "complementary" is spelled "complimentary", and the site is named txgisday.org. On the
sponsors' logistics page, the parking passes are now for sponsors at the Line level and above, the
days carry 2026's dates, and the "Sponsor through Houston Area TxGIS Day" button is gone ([#1833](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1833)).

| Before | After |
| --- | --- |
| ![The four level tiles with prices only](../screenshots/gisday-tiers-2026/before-tiles.png) | ![The tiles with the representatives under each price](../screenshots/gisday-tiers-2026/after-tiles.png) |
| ![Raster's benefits before](../screenshots/gisday-tiers-2026/before-raster.png) | ![Raster's benefits after](../screenshots/gisday-tiers-2026/after-raster.png) |
| ![The sponsors page offering Texas A&M and Houston Area](../screenshots/gisday-tiers-2026/before-sponsor-options.png) | ![The sponsors page offering Texas A&M only](../screenshots/gisday-tiers-2026/after-sponsor-options.png) |
| ![The logistics section with 2025's dates](../screenshots/gisday-tiers-2026/before-logistics.png) | ![The logistics section with 2026's dates and sponsor parking](../screenshots/gisday-tiers-2026/after-logistics.png) |

### GIS Day: one code base for more than one organization's site, starting with UCGIS

The GIS Day site can now run for another organization from the same image. A deployment names its site
(`ANGULAR_SITE` for the website, `GISDAY_SITE` for the API), and each site, defined in
`libs/gisday/common/src/lib/sites.ts`, has its own name, logo, homepage image, tab icon, copyright line and
the features it leaves out. A feature that is off goes from the menus, the footer and the profile and Admin
sidebars, its pages go to the homepage, and the API does not serve its endpoints. With no site named, the
site is txgisday.org, which is unchanged ([#1835](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1835)).

The first other site is **UCGIS GIS Day**, for UCGIS member universities at gisday.ucgis.org, with its own
database and UCGIS's logos. It leaves out the competitions, FAQ, sponsors, classes, check-ins and past
years, and what
only Texas A&M has: the Organizing Committee, Student Opportunities and Resume Bank on the About page, the
High School Portal, the mentoring and TX GIS Hero links, the Texas wording, and the university's and
state's links in the footer ([#1837](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1837)). It is not deployed yet.

| The UCGIS homepage | Its About page | Its footer |
| --- | --- | --- |
| ![UCGIS GIS Day 2026 with the UCGIS logo, and no Sponsor, Competitions or FAQ menu](../screenshots/gisday-ucgis/ucgis-home.png) | ![About UCGIS GIS Day, with participating organizations and no committee or resume bank](../screenshots/gisday-ucgis/ucgis-about.png) | ![The footer with UCGIS's copyright line and no Texas A&M links](../screenshots/gisday-ucgis/ucgis-footer.png) |

### GIS Day: sponsors are told how to pay, instead of being sent to the giving site

The "Sponsor TxGIS Day at TAMU" button on the sponsor page went to the Texas A&M Foundation's giving
site, which issues a receipt saying the giver receives nothing in return. Sponsorships have fair market
values, so the Foundation asked for that link to go. The button now opens a new page,
`/sponsors/payment`, with the Foundation's wording: pay by check to the Texas A&M Foundation with
"2026-27 GIS Day #73982" on the memo line, sent to the address given, or arrange an ACH or wire
transfer with the Foundation. The same button now also sits beside "Send Us a Message" under the
additional sponsorships table. Nothing on the site links to the giving site any more
([#1829](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1829)).

| Before | After |
| --- | --- |
| ![The sponsor page's buttons; the sponsor button opened the giving site in a new tab](../screenshots/gisday-sponsor-payment/before-sponsor-buttons.png) | ![The new payment page](../screenshots/gisday-sponsor-payment/after-payment-page.png) |

### GIS Day: choose which organizations the Sessions page's filter lists

The Organizations filter on the Sessions page listed every organization of the season. The organization
form in Admin now has a fourth visibility setting, **Sessions Filter**, beside Header, Footer and About
Page, and the filter lists only the organizations that have it ticked. **Until organizations are
ticked, the filter is empty**, on this year's Sessions page and on past years' ([#1825](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1825)).

| Before | After, with four organizations ticked |
| --- | --- |
| ![Twelve organizations in the filter](../screenshots/gisday-sessions-org-filter/before-sessions-filter.png) | ![Four organizations in the filter](../screenshots/gisday-sessions-org-filter/after-sessions-filter.png) |

### GIS Day: buttons side by side are the same height

On the GIS Day site an outlined button, such as "Send Us a Message", stood 4 px taller than a filled
one beside it, so pairs of them did not line up. Every button now has the same border, invisible on the
filled ones, so they are the same size across the site ([#1831](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1831)).

| Before | After |
| --- | --- |
| ![Send Us a Message 46 px tall, Sponsor TxGIS Day at TAMU 42 px](../screenshots/gisday-button-heights/before-sponsor-buttons.png) | ![Both 46 px tall](../screenshots/gisday-button-heights/after-sponsor-buttons.png) |

### GIS Day: an event's time is chosen from a list again

Editing an event's start or end time on the GIS Day admin pages had stopped offering times to choose
from: the picker opened on a single typed field. The shared date and time picker lost its grid of hours
and minutes when the library behind it was replaced with the browser's own inputs for the Angular
upgrade ([#1220](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1220)), and the browser's time input only shows its list after another click on a
small icon, or not at all. It was checked in AggieMap; GIS Day could not be run at the time
([#1747](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1747)).

A time of day is now Angular Material's time picker, inside the same shared picker: the list of times
opens with it, in five-minute steps, with the current time highlighted, and an exact time can still be
typed. Choosing a time sets it and closes the picker. Dates, and the date-and-time picker AggieMap's
trip planner uses, are unchanged. `@angular/material` is a new dependency, at the same version as
Angular.

The images are the picker on a scratch page of the local GIS Day site, because the event form needs a
sign-in.

| Before | After |
| --- | --- |
| ![The picker open on a single typed time field](../screenshots/1747-time-picker-options/before-time-picker.png) | ![The picker open with a list of times, 3:45 PM highlighted](../screenshots/1747-time-picker-options/after-time-picker.png) |

### GIS Day: the admin speaker form shows the university banner, and follows the form

Editing a speaker on the admin pages showed the photograph without the university and class-year banner
the public Presenters page and presenter page draw on it ([#1703](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1703)). It is now on the photograph
in the form too, and it changes as the University and Graduation Year fields change, before saving, so an
administrator sees what the public pages will show. Clearing the university removes it
([#1757](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1757)).

The photograph in the form is now shown at the size of a presenter's card, so the banner is drawn exactly
as the card draws it. The banner's look, written out twice in the app's stylesheet, is now one shared
style used by the card, the presenter page and the form; the card and presenter page measure the same as
before.

The images are the form on a scratch page of the local site, with a sample photograph, because the admin
pages need a sign-in.

| Before | After | After changing the university and year |
| --- | --- | --- |
| ![The form's photograph with no banner](../screenshots/1757-admin-speaker-banner/before-admin-speaker-form.png) | ![The photograph with a maroon TAMU '24 banner](../screenshots/1757-admin-speaker-banner/after-admin-speaker-form.png) | ![The same photograph with a purple LSU '22 banner](../screenshots/1757-admin-speaker-banner/after-admin-speaker-form-changed.png) |

### GIS Day: competition submissions need a sign-in, and are recorded for whoever is signed in

The VGI competition's submissions could be read without signing in: one address answered every
submission of every year with the submitter's account id and where they were. And a submission was
recorded for whichever account the request named, so anyone could submit as anyone and add to their
score ([#1780](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1780)). Now every submission address needs a signed-in user, a participant sees only
their own submissions and photographs, organizers with the competition permission see everyone's, and a
submission is always recorded for the person signed in. Nothing looks different to a participant; the
public submissions map is unchanged.

### GIS Day: the competition app keeps looking for a location, and says why a submission was not sent

On the VGI competition's submission form, a phone that took more than 2.5 seconds to find a precise
location, common on a first fix or beside buildings, never got one while the form was open, and the
form said location services were disabled. Pressing Submit then showed only "Error!" and the submission
was lost; a failed upload showed the same ([#1784](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1784)).

Now the form keeps looking until it has a location, and says above the Submit button whether it is
finding it, has found it (with how accurate it is), or has been refused it. After a few failed
attempts it adds "Make sure Location is on in your phone's settings". Pressing Submit without a
location says why and sends nothing; pressing it after access was refused also asks for the location
again, so allowing it in the phone's settings and pressing Submit again works without reloading. The
install page's location check waits through a slow fix the same way, and stops watching once it has
one. A failed upload says why (no connection, signed out, or the
server's reason) and the button reads **Try Again**. Submissions also keep the accuracy the phone
reported, which was saved as 0, so reviewers can tell a precise fix from a rough one.

The images are a local copy at phone size, with the location set in the browser. "Signed out" in the
last one is because the copy was opened without signing in.

| Before | After |
| --- | --- |
| ![The form saying location services are disabled after a slow location fix](../screenshots/1784-vgi-submit-errors/before-timeout.jpg) | ![The form saying Finding your location, and Submit explaining it is still finding it](../screenshots/1784-vgi-submit-errors/after-finding.jpg) |
| ![Submit showing only Error!](../screenshots/1784-vgi-submit-errors/before-error.jpg) | ![Location found, accurate to about 9 m](../screenshots/1784-vgi-submit-errors/after-found.jpg) |
| | ![A failed upload: Submission Not Saved, You have been signed out, and a Try Again button](../screenshots/1784-vgi-submit-errors/after-upload-failed.jpg) |
| | ![Location access is blocked, with how to allow it](../screenshots/1784-vgi-submit-errors/after-blocked.jpg) |

### GIS Day: the competition app uploads smaller photographs, and tries again on a weak signal

The VGI competition app uploaded each photograph as the phone's camera took it, typically 2 to 8 MB,
over mobile data on campus ([#1786](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1786)). It now shrinks each photograph on the phone first, to at
most 1,600 px on its longest side: a 12.3 MB test photograph went up as 0.67 MB. The phone decodes it
straight to that size, so a large photograph does not have to fit in its memory at full size. Every
photograph is redrawn, even one that is already small, so none carries the camera's embedded data,
such as where it was taken. An upload that does not reach the server is sent again after 2, 5 and 10
seconds before the app shows Try Again, and a second tap on Submit while it is sending no longer
submits twice. Each submission carries an id the app makes once, the same on every retry and on Try
Again, so an upload that was saved but whose answer was lost on the way back is not saved a second
time. The server refuses a photograph over 15 MB with a message saying so. Nothing on the screen looks
different.

### GIS Day: the 2026 VGI competition, the Monument Trail Challenge

The VGI Competition pages still described 2025's Art Trail Challenge. This year's competition collects
monuments and memorial plaques only, not statues or other art: from Monday 9 November through GIS Day
week, one point for each complete submission, winners announced at lunch on Thursday 19 November, with
the Office of the University Architect as sponsor. It has its own page, the VGI Competition page links
to it, and 2025's competition moves to the list of prior ones ([#1665](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1665)).

| Before | After |
| --- | --- |
| ![The VGI Competition page describing the 2025 Art Trail Challenge](../screenshots/gisday-2026-vgi-competition/before-vgi.png) | ![The VGI Competition page describing the 2026 Monument Trail Challenge](../screenshots/gisday-2026-vgi-competition/after-vgi.png) |
| No such page | ![The new 2026 competition page](../screenshots/gisday-2026-vgi-competition/after-monuments.png) |

### GIS Day: the VGI competition scores 2 for a new find and 1 for one already submitted

The VGI leaderboard gave every submission 1 point, or the points of its type answer, so ten people
photographing one monument scored ten times what one did ([#1781](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1781)). Now the first submission
of a thing scores **2 points**, and every later submission of it, by anyone, the first submitter
included, scores **1 point**. A submission is of something already submitted when it is within 15 m
of an earlier new find with the same type; the distance, the same every season, allows for phone GPS
error. Only new finds are compared with, so submissions a few metres apart in a line do not chain
into one thing. Two submissions made in the same instant are always taken in the same order.
Discarded submissions do not count, so if the first one is discarded the next becomes the new find.
The type question's per-answer points are no longer used: the form designer no longer asks for them,
and the admin and participant submission lists no longer show a Points column that disagreed with the
leaderboard. The leaderboard for a past season, by its guid, is scored the same way. The 2026
competition page says how points work now.

| Before | After |
| --- | --- |
| ![How Competition Points Work: 1 point for every complete submission](../screenshots/1781-vgi-new-find-points/before-points.jpg) | ![2 points for a submission nobody has made yet, 1 point for one already submitted, and the 15 meter rule](../screenshots/1781-vgi-new-find-points/after-points.jpg) |

### GIS Day: poster and presentation competition dates for 2026

The Poster Competition and Presentation Competition pages showed 2025's dates. Each is now the same
day of the week in 2026, one day earlier in the month: submissions due Monday 9 November at 5:00 PM,
the undergraduate presentations and the posters on Tuesday 17 November, the graduate presentations
and the winners on Wednesday 18 November ([#1662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1662)).

| Before | After |
| --- | --- |
| ![The Poster Competition page with 2025 dates](../screenshots/gisday-2026-competition-dates/before-posters.png) | ![The Poster Competition page with 2026 dates](../screenshots/gisday-2026-competition-dates/after-posters.png) |
| ![The Presentation Competition page with 2025 dates](../screenshots/gisday-2026-competition-dates/before-presentation.png) | ![The Presentation Competition page with 2026 dates](../screenshots/gisday-2026-competition-dates/after-presentation.png) |

### GIS Day: no Aggie Map Design Competition in 2026

GIS Day is not running the Aggie Map Design Competition this year, so the site no longer lists it: it
is gone from the Competitions menu and the Competitions page, and its own page is removed
([#1661](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1661)). An old link to that page now lands on the home page.

| Before | After |
| --- | --- |
| ![The Competitions menu with four entries, the last being Aggie Map Design Competition](../screenshots/gisday-2026-no-aggie-map-competition/before-competitions-menu.png) | ![The Competitions menu with three entries](../screenshots/gisday-2026-no-aggie-map-competition/after-competitions-menu.png) |
| ![The Competitions page with four competitions](../screenshots/gisday-2026-no-aggie-map-competition/before-competitions-page.png) | ![The Competitions page with three competitions](../screenshots/gisday-2026-no-aggie-map-competition/after-competitions-page.png) |

### GIS Day: the competition pages match the 2026 schedule

Three competition pages disagreed with the schedule ([#1709](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1709)):

- **Presentation Competition.** The date under the title said Wednesday, November 18th; both sessions
  are on Tuesday, November 17th. The graduate session moves from Wednesday morning to Tuesday
  3:00 - 4:00 PM, and the undergraduate session is 2:00 - 3:00 PM so the two no longer overlap.
- **Poster Competition.** The poster session was headed "Presentation Competition Session", on the page
  and in its side menu; it says "Poster Competition Session". Its time is 4:15-5:15PM, not 4:00-5:00PM.
- **Monument Trail Challenge.** "Monuments and Memorial Markers" is gone from the list of what is being
  surveyed and from the examples, with the line about statues and sculptures, leaving plaques for trees
  and benches.

The "after" images were taken with the button fix ([#1708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1708)) also in place, which is why the
Submit button's label is centred in them.

| Before | After |
| --- | --- |
| ![The Presentation Competition page dated Wednesday, November 18th](../screenshots/1709-gisday-competition-pages/before-presentation-top.png) | ![The page dated Tuesday, November 17th](../screenshots/1709-gisday-competition-pages/after-presentation-top.png) |
| ![The graduate session on Wednesday morning](../screenshots/1709-gisday-competition-pages/before-presentation-session.png) | ![Both sessions on Tuesday, 2:00 - 3:00 and 3:00 - 4:00 PM](../screenshots/1709-gisday-competition-pages/after-presentation-session.png) |
| ![The poster session headed Presentation Competition Session, 4:00-5:00PM](../screenshots/1709-gisday-competition-pages/before-posters-session.png) | ![Headed Poster Competition Session, 4:15-5:15PM](../screenshots/1709-gisday-competition-pages/after-posters-session.png) |
| ![Two things to survey and a line about statues](../screenshots/1709-gisday-competition-pages/before-monuments-list.png) | ![Plaques for Trees and Benches only](../screenshots/1709-gisday-competition-pages/after-monuments-list.png) |
| ![Two example sections](../screenshots/1709-gisday-competition-pages/before-monuments-examples.png) | ![The Plaques for Trees and Benches examples only](../screenshots/1709-gisday-competition-pages/after-monuments-examples.png) |

### GIS Day: the sponsorship levels double for 2026

The sponsor page on the GIS Day site showed last year's amounts. Each level is now twice what it was:
Point $512, Line $1,024, Polygon $2,048, Raster $4,096. What each level includes is unchanged
([#1655](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1655)). This reaches
the public site with GIS Day's next deploy, not with an AggieMap release.

| Before | After |
| --- | --- |
| ![The four levels at $256, $512, $1,024 and $2,048](../screenshots/gisday-sponsor-prices-2026/before.png) | ![The four levels at $512, $1,024, $2,048 and $4,096](../screenshots/gisday-sponsor-prices-2026/after.png) |

### GIS Day: button labels are centred again

On the GIS Day site a link styled as a button showed its label at the left edge of the button:
"Submit Your Presentation", "Submit Your Poster", "Read Event Details" and the rest. The shared rule
that makes such a link a proper block (so its width and padding apply) left GIS Day's own button
definition centring with a property that only works on a flex box. The label is now centred in that
one definition, as the shared button does it, so every button on the site follows
([#1708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1708)). Buttons that were already centred, such as those on the sponsor page, are unchanged.

| Before | After |
| --- | --- |
| ![Read Event Details at the left edge of its button](../screenshots/1708-gisday-button-labels/before-vgi-button.png) | ![Read Event Details centred](../screenshots/1708-gisday-button-labels/after-vgi-button.png) |
| ![Submit Your Poster at the left edge of its button](../screenshots/1708-gisday-button-labels/before-posters-top.png) | ![Submit Your Poster centred](../screenshots/1708-gisday-button-labels/after-posters-top.png) |
| ![The sponsor page's buttons, already centred](../screenshots/1708-gisday-button-labels/before-sponsors-buttons.png) | ![The sponsor page's buttons, unchanged](../screenshots/1708-gisday-button-labels/after-sponsors-buttons.png) |

### GIS Day: ten more ways to sponsor, listed on the sponsor page

Besides the four levels, GIS Day offers sponsorships of a single event or award: coffee breaks, lunch,
the keynotes and their reception, the networking reception, the social event, the two student research
awards and the VGI competition, from $1,000 to $2,500. They were not on the site. The sponsor page now
lists each with its amount below the four levels, and says each can be sponsored on its own or added to
any level ([#1658](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1658)).

| Before | After |
| --- | --- |
| ![The sponsor page ending after the four levels](../screenshots/gisday-sponsor-addons/before.png) | ![The sponsor page with ten additional opportunities listed under the levels](../screenshots/gisday-sponsor-addons/after.png) |

### GIS Day: a presenter's university banner is on their own page too

On the Presenters page each card carries a corner banner with the university the presenter attended
and their class year, in that university's colour. Opening a presenter lost it: their own page showed
the same photograph with nothing on it. The banner is now on the photograph there as well, at desktop
and phone widths, and a presenter with no university recorded shows none on either page. The cards
themselves are unchanged ([#1703](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1703)).

The "before" images are the live site and the "after" images a local copy, which has no presenter
photographs, so the grey placeholder in the "after" column is the local copy and not part of the change.

| Before | After |
| --- | --- |
| ![A presenter's page with a photograph and no banner](../screenshots/1703-presenter-class-banner/before-presenter-gsu.png) | ![The same page with a blue GSU '91 banner across the corner of the photograph](../screenshots/1703-presenter-class-banner/after-presenter-gsu.png) |
| ![The same page at phone width, no banner](../screenshots/1703-presenter-class-banner/before-presenter-phone.png) | ![The page at phone width with the banner clipped to the photograph](../screenshots/1703-presenter-class-banner/after-presenter-phone.png) |
| ![The Presenters page, each card with its banner](../screenshots/1703-presenter-class-banner/before-presenters-list.png) | ![The Presenters page, the banners in the same place](../screenshots/1703-presenter-class-banner/after-presenters-list.png) |

### GIS Day: past years' sessions, presenters and sponsors

Every year's sessions, presenters and sponsors were still in the database, but the site only ever
showed the current year, so last year's programme could not be looked up: `/seasons/2025` on
production today is a blank page. `/seasons/2025` now opens
2025's Sessions, and from there its Presenters and Sponsors, drawn from that year's records exactly
as the current year's pages are ([#1758](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1758)).

On a past year the header says which year it is, a banner says so and links back to this year, and the
Sessions, Presenters and Sponsors links stay in that year. Registering for a session (on the list and
on a session's own page, where check-in goes too), the profile reminder, and the sponsor page's "become a sponsor" and logistics sections are left out, since they are
about this year. The footer lists every past year. A year with no TxGIS Day says so. The competitions,
FAQ, About and home pages are the current year's whichever year is being looked at.

| Before | After |
| --- | --- |
| ![A blank white page: production today sends /seasons/2025 to the home address and draws nothing](../screenshots/1758-past-seasons/before-production-seasons-2025.png) | ![2025's Sessions, headed TxGIS Day 2025, with the past-year banner](../screenshots/1758-past-seasons/after-sessions-2025.png) |
| No way to reach a past year | ![The footer with a Past Years list: 2025, 2024, 2023](../screenshots/1758-past-seasons/after-footer-past-years.png) |
| No such page | ![2024's Presenters](../screenshots/1758-past-seasons/after-presenters-2024.png) |
| No such page | ![2024's Sponsors, without the become-a-sponsor section](../screenshots/1758-past-seasons/after-sponsors-2024.png) |
| No such page | ![2025's Sessions at phone width](../screenshots/1758-past-seasons/after-sessions-2025-phone.png) |
| No such page | ![1999, which has no season, saying so](../screenshots/1758-past-seasons/after-no-such-year.png) |
| ![A 2025 session's page offering Registration and Checkin](../screenshots/1758-past-seasons/before-session-2025-details.png) | ![The same page going from the description to its presenters](../screenshots/1758-past-seasons/after-session-2025-details.png) |

### GIS Day: a session's presenters show their company and class year, grouped by company

A session's page listed its presenters by photograph and name only, in no particular order, so on the
career fair the people from one company were scattered across the list. Each presenter now has their
company or organization on a second line, and a Texas A&M former student has their class year after
their name, as in "Benjamin Lybrand '14" ([#1768](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1768)). The list is grouped by company, then by last and
first name, so everyone from one company sits together ([#1769](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1769)).

A graduate of another university shows no year after their name; their university is on the banner on
their photograph on the Presenters page, as before. A record holding two years shows both ('19, '21).
The banner on the photograph uses the same year logic now, so a two-digit year reads '22 rather than
' 22.

The "after" images are the local copy, which has no presenter photographs, so the broken-image
placeholders are the local copy and not part of the change.

| Before | After |
| --- | --- |
| ![The 2025 career fair's presenters, names only, in no order](../screenshots/1768-presenter-affiliation/before-career-fair-presenters.jpg) | ![The same list grouped by company, each with their company underneath and Aggies with their class year](../screenshots/1768-presenter-affiliation/after-career-fair-presenters.png) |
| | ![The list at phone width](../screenshots/1768-presenter-affiliation/after-career-fair-presenters-phone.png) |

### GIS Day: one event time that cannot be read no longer breaks the site

On 14 October an event's start time was saved as the text "Invalid Date". From then on the event
could not be opened in the admin pages to correct it, and the public Sessions page and the session's
own page failed on it ([#1772](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1772)). The data was repaired directly in the database the same afternoon.

Now a time that cannot be read is shown as "Time TBD" on the Sessions page and as no time on the
session's page, and the rest of each page draws as usual. The event form opens such an event with an
empty time to fill in, never saves a time that is not valid, and the time picker builds a newly picked
time on today's date when the stored one cannot be read, so choosing a time always fixes it.

The images are the local site, with one local event's start time set to "Invalid Date" as production's
was. Before, the page logged `Unable to convert "Invalid Date" into a date`; after, it logs nothing.

| Before | After |
| --- | --- |
| ![The Sessions page on the code production ran, failing on the event](../screenshots/1772-invalid-event-time/before-sessions.png) | ![The Sessions page drawing every session](../screenshots/1772-invalid-event-time/after-sessions.png) |
| ![The session's page failing](../screenshots/1772-invalid-event-time/before-session-page.png) | ![The session's page drawing](../screenshots/1772-invalid-event-time/after-session-page.png) |


### GIS Day: the admin event form refuses an incomplete event and says what is missing

The admin form for adding or editing an event saved whatever it was given, including an event with no
day, no name, or times left at the 12:00 AM default ([#1773](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1773)). It now refuses to save until the event has a
day, a start and an end time other than 12:00 AM with the end after the start, a name, an abstract, and
a mode, event type, presentation type and location chosen. When something is missing, a list above the
buttons says what, and nothing is sent.

The images are the form on a scratch page of the local site, because the admin pages need a sign-in.

| Before | After pressing Create on an empty event |
| --- | --- |
| ![The empty form, which was sent as it was](../screenshots/1773-event-form-required/before-submit.png) | ![The list of what is missing, above the Create button](../screenshots/1773-event-form-required/after-empty-event-refused.png) |

### GIS Day: the admin event list is one table per day, under its date

The admin Events page listed a season's events in one long table, about 45 rows over five days, and
only a Day column said where one day ended and the next began ([#1775](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1775)). Each day now has its own card and
table, headed by its date as on the public Sessions page, with the day's events in start-time order.
Events with no day yet come last, under "No day set". Each table's header checkbox selects that day's
events; Copy and Delete work as before.

The images are the list on a scratch page of the local site, because the admin pages need a sign-in.

| Before | After |
| --- | --- |
| ![One table of every event, with a Day column](../screenshots/1775-event-list-by-day/before-event-list.png) | ![The first day's card, November 16, with its own table](../screenshots/1775-event-list-by-day/after-event-list.png) |
| | ![Where one day ends and the next, November 17, begins](../screenshots/1775-event-list-by-day/after-event-list-day-break.png) |

### GIS Day: an admin adding a check-in checks in the attendee, not the admin

The admin page's Check-ins, Add asks for an attendee's account id and an event, but it checked in the
admin who pressed the button: it sent both to the endpoint attendees use to check themselves in, which
records whoever is signed in and ignores any account id it is sent ([#1767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1767)). A second
add for another attendee then failed with "Check-in already exists". The page now sends them to a
separate admin endpoint, which needs the `create:checkins` permission and checks in the account given.
It still refuses an event that does not exist or a check-in that is already recorded, and asks for no
location, so an organizer can check in someone whose phone could not. Attendees checking themselves in
are unchanged.

The page looks the same; what changes is whose name appears in the check-in list afterwards.

### GIS Day: check-in to an in-person session needs the attendee to be there

Anyone could check in to a session from anywhere, so a check-in proved nothing about attending. Now an
admin can give each venue a **check-in zone**: its corners, typed on the venue form one
`latitude, longitude` per line, as Google Maps copies them. For an **in-person** session at a venue with
a zone, pressing Check In asks the browser for the attendee's location, and the page says so beside the
button ("Check-in for this session uses your location: you need to be at TAMU Rudder Plaza.").

- **Inside the zone** the attendee checks in as before. A phone reports how accurate its location is;
  an attendee counts as inside when that circle reaches the zone, with the accuracy counted up to
  100 m, so someone at a window of a large building gets in and a vague position from across town
  does not.
- **Outside it**, check-in is refused, and the reason shows under the button: "You need to be inside
  the check-in zone at TAMU Rudder Plaza to check in to this event." The API makes the decision, so
  calling it directly does not get round it. There is no checking in anyway: an organizer adds an
  exception from Admin, Check-ins, Add ([#1767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1767)), which checks in the attendee named, asks for no
  location and is not held to the zone.
- **While the browser looks for the location** the page says "Finding your location…" and the button
  waits. If location access is blocked, the page asks for it; if finding the location takes too long,
  it says so and suggests trying near a window.
- **Hybrid and virtual sessions**, and venues with no zone (such as the bar for Mappy Hour), check in as
  before. Nothing about where an attendee was is saved.
- **A zone typed wrongly is refused**: fewer than three corners, a line that is not a latitude and
  longitude, or corners out of order so its sides cross.

A determined person can still make their browser report a made-up location; the server cannot tell.
This stops checking in from home, not deliberate spoofing.

It needs a database migration, `AddCheckInZones`, run on production before this release; the plan is on
[#1766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1766). Until a venue is given a zone, its sessions check in exactly as today. The 2026 zones
for the Memorial Student Center, Rudder Plaza and the OMB lobby are on the issue.

The images are a local copy, taken before the review changes: the pop-up offering to check in anyway
is gone, and new images of the refusal, waiting and timeout messages are still to be taken.

| Before | After |
| --- | --- |
| ![The check-in section with only the CHECKIN button](../screenshots/1766-gisday-checkin-zone/before-checkin-section.png) | ![The check-in section with a line saying check-in uses your location at TAMU Rudder Plaza](../screenshots/1766-gisday-checkin-zone/after-checkin-section.png) |
| | ![The check-in section after checking in: Your attendance has been registered](../screenshots/1766-gisday-checkin-zone/after-checked-in.jpg) |

### GIS Day: My VGI Submissions shows a participant's own submissions again

**Account, My VGI Submissions** showed "No data to display" for everyone ([#1791](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1791)). The page
looked up who was signed in through a setting that only the old standalone competitions app had, and
failed on the GIS Day site. It now asks the server for the signed-in participant's own submissions,
and nobody can list anyone else's.

The images are a local copy, with one test submission made by the account signed in.

| Before | After |
| --- | --- |
| ![My VGI Competition Submissions with No data to display](../screenshots/1791-vgi-my-submissions/before-my-submissions.jpg) | ![The same page listing the submission, a Statue or Monument, Unverified](../screenshots/1791-vgi-my-submissions/after-my-submissions.jpg) |

### GIS Day: the sponsorship levels are back at last year's prices

At the Texas A&M Foundation's request, because companies had been quoted different amounts, the four
sponsorship levels on the "Sponsor through Texas A&M" page are back at last year's prices: Point $256,
Line $512, Polygon $1,024 and Raster $2,048. They had been doubled on 11 October
([#1655](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1655)). The perks
and the additional sponsorship opportunities are unchanged ([#1821](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1821)).

| Before | After |
| --- | --- |
| ![The four levels at $512, $1,024, $2,048 and $4,096, on production](../screenshots/1821-sponsor-prices/before.png) | ![The four levels at $256, $512, $1,024 and $2,048](../screenshots/1821-sponsor-prices/after.png) |

### GIS Day: a sponsor can be switched off for a season and kept

Sponsors carry over from one season to the next, and until a company confirms it had to be deleted,
then added again with its logo once it did. Each sponsor now has an **Active** switch: on the admin
Sponsors list (it saves at once) and on the sponsor form. A sponsor switched off keeps its details and
logo in the admin pages but is not shown on the public Sponsors page or the home page. Every existing
sponsor starts switched on ([#1962](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1962)).

**This release changes the database**: it adds `sponsors.active` (and `event_location.checkInZone`,
from the check-in zones work, which production has not had yet). Both migrations run on production
before the new API is deployed; each only adds a column, so the site running then keeps working.

The admin image is the list on a scratch page of the local site, because the admin pages need a
sign-in. In it, one local sponsor (Esri) is switched off; the public page beside it leaves it out.

| Before | After |
| --- | --- |
| ![Production Sponsors page before: every sponsor shown, with no way to hide one](../screenshots/1962-sponsor-active/before-public-sponsors.png) | ![The admin Sponsors list with an Active column, Esri unticked](../screenshots/1962-sponsor-active/after-admin-sponsor-list.png) |
| | ![The public Sponsors page without the switched-off sponsor](../screenshots/1962-sponsor-active/after-public-sponsors.png) |

### GIS Day: a fifth sponsorship level, LiDAR

The 2026 prospectus adds a level above Raster, and the sponsor page (`/sponsors/tamu`) now shows it
([#1976](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1976)):
- **The card:** LiDAR, $4,096, with 6 representatives included and its own icon, redrawn as an SVG pair
  (plain and colour) from the prospectus's icon, like the other four.
- **Its benefits:** everything in Raster, plus a white-glove program, recruiting, hospitality, reception
  host recognition, premier conference recognition, conference opportunities, pre-conference and
  post-event items, and parking.
- **The other levels' prices** are unchanged: Point $256, Line $512, Polygon $1,024, Raster $2,048.

**At phone width** the five cards wrap two to a row and say "reps" for "representatives". Before,
four cards were squeezed into one row and their lines ran into each other. The phone width comes from
the shared `ResponsiveService`. The rest of the site at phone width is
[#1980](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1980).

**Recording a LiDAR sponsor:** it can be chosen as a level on the admin sponsor form. The public
Sponsors page gets a LiDAR group above Raster, shown only in a year that has a LiDAR sponsor.

| Before | After |
| --- | --- |
| ![Four level cards, Raster chosen](../screenshots/1976-lidar-level/before-sponsor-levels.png) | ![Five level cards with LiDAR chosen and its benefits](../screenshots/1976-lidar-level/after-lidar.png) |
| | ![Raster's benefits unchanged beside the new card](../screenshots/1976-lidar-level/after-raster.png) |
| | ![At phone width: two cards to a row, "reps"](../screenshots/1976-lidar-level/after-phone.png) |

### GIS Day: four pages fixed at phone width

Every public txgisday.org page was checked at 360 and 390 px wide ([#1980](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1980)). Four things were broken, and
are fixed:

- **The sponsor page's benefits** were squeezed into two narrow columns; they are now one column.
- **The Presentation competition page** kept its section links beside the text, leaving the text half
  the screen. It now stacks them, as the Posters page already did, with the shared `wrap` class.
- **The menu button** floated over the page text as it scrolled. It now has a white backdrop. That is a
  new option on the shared button in `libs/ui-kits`, which GIS Day turns on and geoservices does not, so
  geoservices looks as it did.
- **The 2019 Signage competition page** ran its six point graphics off the screen; they now wrap.

A new end-to-end check, `test/e2e/gisday/phone-width.spec.ts`, loads every public route and these
pages at 360 px. It failed on all four problems before the fixes, and on the level cards #1976 fixed.
The admin and signed-in pages still need checking (listed on the issue).

**The screenshots** of every page are kept the way AggieMap's are: `tools/visual-baselines` takes
GIS Day sets now (`--app gisday`), outside the repository. Its README and the GIS Day release steps
say how.

| Before (production, 390 px) | After |
| --- | --- |
| ![Benefits in two narrow columns](../screenshots/1980-phone-width/before-sponsor-benefits.png) | ![Benefits in one column](../screenshots/1980-phone-width/after-sponsor-benefits.png) |
| ![Presentation text squeezed beside its links](../screenshots/1980-phone-width/before-presentation.png) | ![Links above the text](../screenshots/1980-phone-width/after-presentation.png) |
| ![Menu button over a FAQ question](../screenshots/1980-phone-width/before-menu-button.png) | ![Menu button on a white backdrop](../screenshots/1980-phone-width/after-menu-button.png) |
| ![Signage graphics running off the screen](../screenshots/1980-phone-width/before-signage.png) | ![Signage graphics wrapped](../screenshots/1980-phone-width/after-signage.png) |

---

## What to test on dev

**The team tests these on dev before a release goes to production.** Dev is
[dev.aggiemap.tamu.edu](https://dev.aggiemap.tamu.edu). Each row is a change on dev and not yet on
production. A pull request with a visible result adds its own row; at release, the rows move into the
dated notes as what was tested, and this table empties.

**Currently on dev for testing:** build 20261020.40 (Release-487, `b78942631`), whose AggieMap rows moved into the [21 October notes](2026-10-21.md). The rows left are GIS Day's, which has no dev site.

| Change | Open this on dev | Look for |
| --- | --- | --- |
| GIS Day at phone width ([#1980](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1980)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, on a phone: `/sponsors/tamu`, `/competitions/presentation`, `/faq`, `/competitions/signage` | No page scrolls sideways; a sponsor level's benefits are one column; the Presentation page's links sit above its text; the menu button has a white backdrop as the page scrolls under it; the signage graphics wrap. On a desktop, nothing changes |
| GIS Day: the LiDAR sponsorship level ([#1976](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1976)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: `/sponsors/tamu` | Five cards, LiDAR last at $4,096 with 6 representatives; choosing it shows its benefits; the other four prices unchanged. On a phone: two cards to a row, "reps", no sideways scrolling. In Admin, Sponsors, the level list offers LiDAR |
| GIS Day: switch a sponsor off for a season ([#1962](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1962)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release (and after the migrations): Admin, Sponsors | Every sponsor shows Active ticked. Untick one: a notice says it is hidden, and it disappears from the public Sponsors page and the home page but stays in the list with its details. Tick it again and it comes back. The sponsor form's Active checkbox does the same |
| GIS Day: sponsorship levels match the prospectus ([#1833](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1833)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, `/sponsors/tamu` and `/sponsors` | Tiles show 1 to 4 representatives; each level's perks include lunches and a ribbon; Raster says 20-minute speaking slot; the extra-representatives note; on `/sponsors`, only "Sponsor through Texas A&M" under Interested in Becoming a Sponsor, parking passes for Line and above, and days dated 16 to 20 November |
| GIS Day: more than one organization's site, starting with UCGIS ([#1835](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1835), [#1837](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1837)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, [txgisday.org](https://txgisday.org); the UCGIS site once it is deployed | txgisday.org is unchanged: the same menus, footer, logo, tab title and icon, and the About page's committee and resume bank. On the UCGIS site: UCGIS GIS Day and its logo; no Sponsor, Competitions or FAQ menu; no Classes, Check-ins or Student Competitions on the profile; no check-in on an event page; and `/faq`, `/sponsors` and `/competitions` go to the homepage |
| GIS Day: payment page instead of the giving site ([#1829](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1829)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, `/sponsors/tamu` | "Sponsor TxGIS Day At TAMU" opens `/sponsors/payment` in the same tab: check payable to the Texas A&M Foundation with "2026-27 GIS Day #73982" on the memo line, the remit-to address, and the ACH or wire contact. No link anywhere goes to the giving site |
| GIS Day: choose the organizations in the Sessions filter ([#1825](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1825)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, Admin, Organizations, then `/sessions` | The organization form has a fourth checkbox, Sessions Filter. Tick it on two organizations and save: the Organizations filter on `/sessions` lists exactly those two, and their header and footer settings are unchanged |
| GIS Day: buttons the same height ([#1831](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1831)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, `/sponsors/tamu` | "Send Us a Message" and "Sponsor TxGIS Day At TAMU" are the same height; filled buttons elsewhere (Sessions, the competition pages) are 4 px taller than before and otherwise unchanged |
| GIS Day: sponsorship levels back at last year's prices ([#1821](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1821)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, [the sponsor page](https://txgisday.org/sponsors/tamu) | Point $256, Line $512, Polygon $1,024, Raster $2,048, each level's perks as before |
| GIS Day: event times chosen from a list ([#1747](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1747)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, signed in as an administrator: Admin, Events, edit any event, then click its start or end time | A list of times opens at once, in five-minute steps, with the event's current time highlighted and in view. Choosing one changes the time shown and closes the picker; the event's day does not change. Typing an exact time such as 4:07 PM also works. Save and reopen the event: the time is kept. A season day's date picker is unchanged |
| GIS Day: university banner in the admin speaker form ([#1757](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1757)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, signed in as an administrator: Admin, Speakers, edit a speaker who has a photograph | The university and class-year banner on the photograph, as on the Presenters page. Change the University or the Graduation Year: the banner changes at once, before saving. Choose no university: it goes. The public Presenters page and a presenter's page look as they did |
| GIS Day: competition submissions need a sign-in ([#1780](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1780)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, on a phone with the competition app installed, once the 2026 competition is taking submissions | Signed in, a submission uploads, the app says it was saved, it appears on the public submissions map, and the leaderboard counts it. (Not under Account, My VGI submissions: that page shows nothing for anyone, for an unrelated reason, [#1791](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1791).) As an organizer, Admin, VGI Competition, Submissions lists everyone's with their photographs. Opening the submissions address in a browser without signing in answers 401 |
| GIS Day: competition app location and submit errors ([#1784](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1784)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, on a phone with the competition app installed, once the 2026 competition is taking submissions | The form says Finding your location, then Location found with its accuracy, including indoors where the fix is slow. Press Submit before it is found: a message says to wait, and nothing is sent. With Location turned off in the phone's settings, after about half a minute the form says to make sure Location is on. Block location for the site: the form says it is blocked; allow it again in the phone's settings and press Submit: the location is found and the next Submit sends it. Turn off mobile data and press Submit: the message blames the connection and the button reads Try Again; turn data back on and press it: the submission is saved |
| GIS Day: smaller competition uploads, retried on a weak signal ([#1786](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1786)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, on a phone with the competition app installed, once the 2026 competition is taking submissions | A submission with a photograph from the camera uploads in a few seconds on mobile data. Organizers: the photograph in Admin, VGI Competition, Submissions is the right way up and about 1,600 px wide. Turn on airplane mode, press Submit, and turn it off within 15 seconds: the submission is saved without pressing Try Again, and appears once in Admin, VGI Competition, Submissions. Organizers: a downloaded photograph has no location in its details (EXIF) |
| GIS Day: 2026 VGI competition page ([#1665](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1665)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, `/competitions/vgi` and `/competitions/monuments` | The VGI page says "November 9-20, 2026" and "2026 Competition: Texas A&M University Monument Trail Challenge", with 2025's Art Trail Challenge first under Prior Competitions. "Read Event Details" opens the new page: two things to collect, one point each, winners Thursday November 19, University Architect logo, no broken images |
| GIS Day: VGI points for new finds ([#1781](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1781)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally or on production, `/competitions/monuments`, then the competition app's leaderboard once the 2026 competition is set up and taking submissions | The page says 2 points for something nobody has submitted yet and 1 for something already submitted, within 15 meters of an earlier 2-point submission. On the leaderboard, two people submitting the same monument score 2 and 1; the same person submitting it twice scores 3; a different monument scores 2 again. In the competition admin, the form designer's dropdown options have no Points column and the type question is called "Type Question"; the submission list and a submission's details have no Points |
| GIS Day: poster and presentation competition dates moved to 2026 ([#1662](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1662)) | Not on dev, for the same reason. Locally, `/competitions/posters` and `/competitions/presentation` | No 2025 date on either page. Posters: Tuesday November 17th, 2026, due Monday November 9th. Presentations: Tuesday November 17th and Wednesday November 18th, 2026 |
| GIS Day: Aggie Map Design Competition removed ([#1661](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1661)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, `/competitions` | The Competitions menu and page list VGI, Poster and Presentation only; `/competitions/aggie-map` goes to the home page |
| GIS Day: competition pages corrected for 2026 ([#1709](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1709)) | Not on dev, for the same reason. Locally, `/competitions/presentation`, `/competitions/posters` and `/competitions/monuments` | Presentation: Tuesday, November 17th, 2026 under the title; undergraduate 2:00 - 3:00 PM and graduate 3:00 - 4:00 PM, both Tuesday. Posters: the session is headed Poster Competition Session, on the page and in the side menu, at 4:15-5:15PM. Monuments: the list and the examples show Plaques for Trees and Benches only, and no line about statues |
| GIS Day sponsorship levels doubled ([#1655](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1655)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, `/sponsors/tamu` (see `docs/gisday-local.md`) | Point $512, Line $1,024, Polygon $2,048, Raster $4,096; each level's perks unchanged |
| GIS Day: button labels centred ([#1708](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1708)) | Not on dev, for the same reason. Locally, `/competitions/vgi`, `/competitions/posters`, `/competitions/presentation` and `/sponsors/tamu` | The label of every button is in the middle of the button, not at its left edge: Read Event Details, Submit Your Poster, Submit Your Presentation. The sponsor page's buttons look as they did |
| GIS Day additional sponsorship opportunities ([#1658](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1658)) | Not on dev, for the same reason. Locally, `/sponsors/tamu` | Under the four levels: "Additional Sponsorship Opportunities", ten rows from Daily Coffee Break Sponsor ($1,500 per day) to VGI Competition Sponsor ($1,000), and a "Send Us a Message" button |
| GIS Day: university banner on a presenter's own page ([#1703](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1703)) | Not on dev, for the same reason. Locally, `/presenters`, then open any presenter | The banner on the card (for example "TAMU '24") is also across the top-left corner of the photograph on the presenter's own page, same text and colour. A presenter whose card has no banner has none on their page. Narrow the window to phone width: the banner stays inside the photograph. The Presenters page itself looks as it did |
| GIS Day: past years ([#1758](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1758)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally, `/seasons/2025` | 2025's sessions under a "TxGIS Day 2025" header and a banner, with no register boxes. Presenters and Sponsors in the header and footer stay in 2025; Sponsors shows who sponsored, without "Interested in Becoming a Sponsor?". The footer's Past Years list opens each year, and moving from one year to another changes the sessions as well as the header. Opening one of 2025's sessions shows no Registration or Checkin, while a 2026 session still does. `/sessions` is unchanged, and `/seasons/1999` says there is no TxGIS Day 1999 |
| GIS Day: an unreadable event time no longer breaks the site ([#1772](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1772)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: Admin, Events, edit any event and change its start time | The time can be picked from the list and typed, and saving keeps it. Sessions and the session's page show the new time. No event on production has a bad time now, so the broken case is checked only locally |
| GIS Day: the event form refuses an incomplete event ([#1773](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1773)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: Admin, Events, Add event, then Create without filling anything in | A list above the buttons names each missing item and the event is not created. Filling everything in (with times other than 12:00 AM) creates it. Editing an existing complete event still saves |
| GIS Day: the admin event list grouped by day ([#1775](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1775)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release: Admin, Events | One card per day, headed by its date (November 16 to 20 for 2026), each with its own table in start-time order. A table's header checkbox selects that day's events, and Copy and Delete act on what is selected. Changing the season shows that season's days |
| GIS Day: presenters' company and class year, grouped by company ([#1768](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1768), [#1769](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1769)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). Locally or on production, any session's page, e.g. the career fair | Under each presenter's name is their company. Texas A&M former students have their class year after their name ('14). The people from one company are next to each other, companies in alphabetical order, and people without a company last |
| GIS Day: an admin's added check-in is the attendee's ([#1767](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1767)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in as an administrator whose account has `create:checkins`: Admin, Check-ins, Add, with another person's account id and an event they have not checked in to | Admin, Check-ins lists the new check-in under that person, not the admin. Adding the same person to the same event again is refused as already checked in. An attendee checking in from a session's page still checks in themselves |
| GIS Day: location-based check-in ([#1766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1766)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)), and the migration has not run anywhere but a local copy. Locally, after `scripts/gisday-local.sh migrate run`: as an administrator, Admin, Venues, give a venue corners; then, during an in-person session there, the session's page | The line "Check-in for this session uses your location" names the venue. Inside the zone, Check In works. Outside it (DevTools, Sensors, set a location elsewhere), the reason shows under the button and nothing is saved; there is no check-in anyway. While waiting, "Finding your location…". Block location access: the page asks for it. A hybrid session, or a venue with no corners, never asks. On the venue form, corners out of order (sides crossing) are refused. As an administrator, Admin, Check-ins, Add checks in another account to that in-person session with no location, from anywhere |
| GIS Day: My VGI Submissions lists your own ([#1791](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1791)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). On production after release, signed in with an account that has made a competition submission: Account, My VGI Submissions | Your own submissions are listed, with their date and status. Another account sees only its own. An account with none sees an empty list, not an error |

---

## Work in flight - 13 October

Nothing below has merged, so it is not part of a release yet. This section exists because
[`CLAUDE_SETUP.md`](../../CLAUDE_SETUP.md) sends a session on another machine here first, and an empty
file would say the work had stopped.

### AggieMap on 28 October: what another machine most needs to know

**The two baseball faults are fixed.** The GIS team republished production's `BaseballParking_view` on the
morning of 28 October, and it was verified on the live service at 11:40 AM Central:

| Fault | What was wrong | State |
| --- | --- | --- |
| [#2510](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2510) | `/2` declared `objectIdField: objectid_1`, a field it did not have, so **every query returned HTTP 500** | **Fixed.** The layer is `Closures`, its object ID field is `objectid`, and it answers `{"count":3}` |
| [#2522](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2522) | `/0` and `/3` carried `simple` renderers where development's are `uniqueValue`, so every lot drew the same pale blue; the portal item still had three stale overrides | **Fixed.** Both renderers are `uniqueValue` again and the portal item has **no overrides at all**, which is how development has always been configured |

Production was then photographed in both baseball modes: **lots in two colours, symbols drawing, all three
closures present, no console errors.** The five known-failure entries added while they were live were each
confirmed stale by running the specs, and removed in [PR 2547](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2547).

**Those were the only two of their kind.** Every layer of all eleven athletics services was checked for
both faults while they were live: three broken layers for #2500 and one for #2510, all baseball.

**Both checks that would have caught them are now in place** and are the durable result:
[#2511](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2511) asks every layer whether its `objectIdField` and `displayField` exist in its own fields and
whether it answers `where=1=1`; [PR 2504](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2504) makes the front end discard a portal renderer whose
fields its layer lacks, so the *next* republish that leaves a stale override behind degrades to the service
renderer instead of drawing nothing. Neither fault was visible to anything we ran, because the layer checks
skipped builder-gated maps ([#2467](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2467)) - which [PR 2542](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2542) has since fixed on production too.

**Three faults do still need the GIS team**, and none is fixable here:

- [#2520](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2520) - the NSC and Break parking services return their lots **with no geometry**, so neither
  map's popups can ever open;
- [#2529](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2529) - three restroom records carry building numbers that are not buildings;
- [#659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/659) - production's `Routing` folder publishes no services, and on dev routing fails with
  `The table was not found. [Stops]` as soon as directions are requested.

#### The athletics and campus maps moved on 27 October

- **All ten sports read one schema, the development one** ([#2468](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2468), [#2478](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2478),
  [#2489](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2489)), after the GIS team republished the production services to match. Layers the
  development views do not carry were removed from the definitions: accessible lots on baseball, and the
  visitor kiosk, safety-first and team bus layers across the others. **A smoke test outlived one of them**
  and was always red until [PR 2509](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2509).
- **Ten campus maps are listed, all on production** ([#2470](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2470), [#2475](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2475), [#2480](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2480)),
  the newest being HSC College of Dentistry. Only the north-western Dallas site is mapped; the Cooper
  Dental Clinic gets its own map from the same service when the GIS team is ready.

#### The construction symbology: fixed by drawing it ourselves, and sprites are gone

The published sprite is **an opaque tile, not a hatch** - 0 transparent pixels of 810, about half pure
white - so it paints out the ground beneath. That, rather than line spacing, is why it read as a solid
block ([#2459](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2459)).

Three attempts replaced the sprite and each shipped a map that sometimes drew nothing. **`setSpriteSource`
blanks the map when it lands while the view is still building**, measured even with the published sheet
handed back unmodified ([#2487](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2487)). So [PR 2508](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2508) hides the basemap's construction layers
and draws the buildings itself with a CIM hatch, and **deletes the sprite-override mechanism rather than
leaving it behind a flag**. Measured 0 blank loads in 60 across two sessions against a control that blanked
14 of 75.

Its outline is ours too: a vector tile basemap is one layer, so anything added draws entirely above it, and
the hatch broke the building edge until the symbol drew its own.

**Two campus maps still show the pink tile on production** - Fort Worth Law School and Houston Space
Institute ([#2506](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2506)). Their basemaps are not gated by `isTesting`, each names its construction layer
differently, and PR 2508 does not reach them. **"The construction symbology is fixed" is not true until
#2506 is done.**

#### No build tags for either of 27 October's production releases

`scripts/tag-build.sh` was not run, so the newest tags are `dev-2026-10-25` and `prod-2026-10-22`. **The
repository's record says production is on a 22 October commit and it is not.** The build banner cannot
settle it either: it still ships unsubstituted placeholders on both environments, because IIS serves these
and `tokenSubstitute.sh` never runs ([#1306](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306)). So the commit has to come from the maintainer
before the tags can be pushed.

#### Seven pull requests open and green, checked together

[2501](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2501) campus list sorted, [2502](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2502) a check that fails when the map does not draw,
[2503](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2503) the release note for the reverted hatch removed, [2504](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2504) portal renderers,
[2505](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2505) campus names on a phone, [2508](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2508) the construction hatch, [2509](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2509) the
Indoor Track test. 2504 and 2508 both edit `map.service.ts` and were only ever tested apart, so **all seven
were merged into one branch and checked together**: one release-note conflict, full affected check exit 0.

### Security and vulnerability work has one owner, 23 October

One Claude Code session, on one of the maintainer's machines, does all of the security and vulnerability
work here: dependency audits and security updates ([#2112](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2112)),
the daily package and image scan ([#2118](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2118)),
the security parts of the standing sweep ([#1146](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1146)),
Dependabot, CodeQL and secret-scanning alerts, and anything else whose main purpose is security. Any
other session, on any machine, that finds a security problem files the issue as usual and leaves the
fix to that session. One that needs to change `package.json` or `package-lock.json` for its own work
says so first, so two sessions are never editing the lock file at once. Ask the maintainer which
session it is.

### Visual baselines on the cluster, 25 October

Screenshot sets of every AggieMap map ([`tools/visual-baselines`](../../tools/visual-baselines/README.md)) are now taken on the
cluster, not on one workstation, and every machine sees them at `https://visual-baselines.geoservices.tamu.edu/`, from
Texas A&M networks ([#1533](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1533), closed). The cluster side is in the private cluster configuration
repository, folder `12. Visual Baselines`.

| What | State |
| --- | --- |
| Captures start by themselves ([#2355](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2355), [#2364](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2364)) | Done. A CronJob checks the newest `dev-*` and `prod-*` tags every 15 minutes; about an hour after a tag it captures that release and compares it with the previous set of its kind. Not between 2:30 and 8:30 AM Central (the nightly smoke run), one capture at a time. Any comparison missing, or made before its set finished, is made |
| What changed, as a third column ([#2357](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2357)) | Done: the after shot dimmed, changed pixels in pink |
| A front end for the sets ([#2345](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2345)) | Done: a home page of sets and comparisons, and a gallery per set |
| Maps photographed before they finished; a shot depending on the one before it ([#2346](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2346), [#2347](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2347)) | Fixed in [#2384](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2384), open. Proven red then green on production; the lab checks it on a whole set on 25 October at night (its batch 151) |
| A good capture shown as failed when only the page rebuild after it fails ([#2377](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2377)) | Fixed in the cluster configuration repository's pull request 82, open |
| The first sets | `dev-2026-10-25` (`eab737da7`): 846 of 846 shots, compared with `dev-2026-10-06-4` (838 pages, 822 changed: three weeks of releases, so a first look rather than a verdict). `prod-2026-10-22` was captured on the evening of 25 October, and compared with `prod-2026-10-20` automatically |

Which comparison answers which question: **dev against the previous dev**, before promoting a build; **production against
the previous production**, after a release. Dev against production is rarely useful: the same commit differed on 241 of
848 shots, because the two are built with different settings and use different GIS services.

### The smoke suite, 13 October

| What | State |
| --- | --- |
| Three tiers: quick, release, full ([#1717](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1717)) | Done, in the 13 October release. `run-local.sh development quick` clears a dev build; `release` clears production; `full` is the nightly run |
| Maps reported as "drew but never settled" ([#1716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1716), High) | Fixed in the 19 October release ([#1901](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1901)): the three map tests that contend for the machine run last, two at a time |
| Whether loading got heavier on 6 October ([#1719](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1719), Medium) | Not started |

### Found on 12 and 13 October, not started

| What | State |
| --- | --- |
| Outdoor Track and Cross Country zoom ([#1727](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1727), High) | Outdoor Track is confirmed fixed by [#1726](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1726). Cross Country has not been looked at |
| Blank pause coming back from 3D to 2D on dev's vector basemap ([#1732](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1732), High) | Measured: under a second on the raster basemap, about four on the vector one |

### Signals and OnPush ([#1455](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1455)), 12 October

The three migrations are in the 12 October release: 216 of 287 inputs, 40 of 44 outputs, 31 of 40 queries.

| Step | State |
| --- | --- |
| What the migrations left ([#1657](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1657)) | done: every decorator input, output and query left is a signal ([#1865](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1865)), in the 19 October release |
| OnPush, the safe libraries ([#1670](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1670)) | UI kits (12) and geoservices (58) are in the 12 October release. AggieMap's ten non-map pages ([#1864](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1864)) are in the 19 October release. GIS Day's wait for the work in flight there to merge |
| OnPush, fields set in subscriptions ([#1671](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1671)) | done: 114 components ([#1874](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1874)), in the 19 October release |
| Interaction tests in the smoke suite ([#1672](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1672)) | done ([#1866](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1866)), in the 19 October release |
| OnPush, the map ([#1673](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1673)) | done: every component AggieMap and UES Operations render, but the modal host ([#1908](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1908)), in the 19 October release. Zoneless followed for AggieMap and UES Operations ([#1948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1948)), in the same release |

The approach and the risks are written on [#1455](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1455#issuecomment-6118481532). A view that stops
updating fails no compile and no unit test, so every step is checked in a browser.

### A smaller first load ([#1454](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1454))

Done, and in the 12 October release: popups, the All Maps pages, lodash and colornames, the event
definitions loaded after startup, and the trip planner's components. The map page's JavaScript goes from
459 KB to about 330 KB gzipped. Still owed: paint timings for the lodash and trip planner changes, and one
measurement of all of it together, on a quiet machine. Parked until after signals: downloading an event
map's definition only when its map opens ([#1646](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1646)).

### GIS Day

- **Its production site is on an Angular 15 build**, so its next deploy carries every upgrade and refactor
  of 2026 at once. [#1611](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1611) (high) is the test pass on its dev site first.
- **The whole GIS Day stack runs locally** from `scripts/gisday-local.sh`, with sign-in, on a starting
  database kept in the repository that holds nobody's real data. [`docs/gisday-local.md`](../gisday-local.md)
  explains it and `CLAUDE_SETUP.md` Phase 6 is the step-by-step ([#1621](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1621), [#1522](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1522)).
- **A new developer is given nothing**: the API's local settings are a copy of
  `apps/gisday-nest/local.env.sample`, with no secrets, and the API runs without Auth0 management
  credentials, so locally the admin Users page and a user's own profile answer 503 (and with them
  event registration and check-in), while class rosters and competition results show placeholders
  for names and emails
  ([#1759](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1759)). A development tenant with test users, which would make those work too, waits on
  the maintainer creating it ([#1623](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1623), medium).
- **The first schema change since `InitialSchema` is waiting for production**: `AddCheckInZones`, for
  location-based check-in ([#1766](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1766)). It adds one nullable column, so it can run before the
  release that needs it; the step-by-step plan, for the maintainer, is a comment on the issue.
- **No development database exists outside a developer's machine.** [#1511](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1511) (medium) is open for
  that: one on the cluster, then a migration run and reverted there, following
  [`docs/gisday-migrations.md`](../gisday-migrations.md). It is the first step of the dev site
  ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525), high).

**What Angular's standalone migration gets wrong here, so check for it next time:**

- `--mode=standalone-bootstrap` drops `provideZoneChangeDetection()` (the app then runs zoneless), gives
  the `env` token only the `environment` export where the module used `import * as environment` (AggieMap
  then rendered nothing, and only the smoke suite noticed), and loses anything at the top of the deleted
  `app.module.ts`, such as `WebFont.load`. A module with a constructor is left in place with a TODO.
- `--mode=prune-ng-modules` must run over the whole workspace in one pass, and even then leaves imports of
  the modules it deleted in routing modules, unconverted code and specs.
- Every pass leaves relative imports across libraries and components not exported from their library's
  index; both show as lint or `TS2305` errors in the check.
- The production daily smoke run fails its campus and All Maps notification tests until the Ring Day fix
  ships: the hard-coded notice it removes shows on every page from 8 to 10 October.

### The Angular upgrade ([#1218](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1218)), in order

| Order | Step | State |
| --- | --- | --- |
| 1 | Remove `ngcc` ([#1220](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1220)) | done |
| 2 | ArcGIS runtime off 4.23 ([#1219](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1219)) | done: 4.27, in the 5 October release |
| 3 | Angular 15 to 16 ([#1343](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1343)) | done, in the 5 October release |
| 4 | NestJS 9 to 10 ([#1350](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1350)) | done: [#1363](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1363) |
| 5 | ArcGIS type definitions 4.23 to 4.27 ([#1322](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1322)) | done: [#1364](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1364) |
| 6 | Angular 16 to 17 ([#1365](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1365)) | done: [#1370](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1370) |
| 7 | Angular 17 to 18 ([#1371](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1371)) | done: [#1377](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1377) |
| 8 | Node 20.18 to 22.23.3 ([#1376](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1376)) | done: [#1401](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1401) |
| 9 | Angular 18 to 19 ([#1378](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1378)) | done: [#1406](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1406). Steps 2 to 9b are all in the 5 October release |
| 9b | esbuild-based `application` builder ([#1403](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1403)) | done: [#1408](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1408), in the 5 October release |
| 10 | Angular 19 to 22, one major per pull request | done and merged: 20 ([#1451](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1451)), 21 ([#1465](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1465), dev-tagged `dev-2026-10-06`), 22 ([#1471](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1471)), about 1 to 1.5 hours each ([`docs/upgrades/angular.md`](../upgrades/angular.md)). Angular 22 is on production, at 22.2.3 since the 19 October release ([#1925](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1925)) |
| 10b | Faster smoke suite ([#1426](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1426)) | merged ([#1477](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1477)): a release check runs one framing route per map, 6 workers, the ArcGIS library cached; 22 min 44 s on a workstation against about 1 h 50 min. Further cuts: [#1473](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1473) (bus test), [#1427](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1427) (maps) |
| 11 | `esri-loader` to `@arcgis/core` | done: `@arcgis/core` at 4.27 ([#1844](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1844)), stepped to 4.34 one release per commit ([#1845](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1845)), 5.0.19 ([#1859](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1859)) and 5.1.27 ([#1867](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1867)), with RNS Spaces at its service's own scale to get round 5.1's many-points updating; then the maps hosted in Esri's `<arcgis-map>` and `<arcgis-scene>` components in place of `view.ui` ([#1949](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1949), [#1950](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1950)). All on production since `prod-2026-10-20`, at `@arcgis/core` and `@arcgis/map-components` 5.1.27 |
| 12 | Nx 23.2.1 to 23.3.0 ([#1972](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1972)) | done: [#1984](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1984), in the 21 October release. No migrations; nx, every `@nx/*` plugin and the lock only |
| 13 | Vitest 4 to 5 ([#1973](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1973)) | to do |
| 14 | NestJS 10 to 11 ([#1974](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1974)) | done: [#1985](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1985), in the 21 October release, with Express 5, Passport 0.7 and the UES Operations sign-out fix ([#1978](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1978)). Includes GIS Day's servers, by the maintainer's decision; each API gets it with its own deploy |
| 14b | NestJS 11 to 12 ([#1974](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1974)) | to do |
| 15 | TypeScript 7, the native compiler ([#1918](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1918)) | waits on Angular supporting it |
| - | Dead projects ([#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226)) | VeoRide retired ([#1404](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1404)); the old Ring Day app is removed ([#1236](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1236)); CPA is retired ([#1458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1458); restore it from the tag `cpa-last` if it is ever needed); the unused projects are listed in the cloud's Batch B report on `cloud-mailbox`, and the Cypress `*-e2e` projects are deleted, with Cypress itself ([#1545](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1545), part of [#1457](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1457)) |
| - | After Angular 22 | standalone ([#1452](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1452)) and no NgModules ([#1569](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1569)): done, in the 12 October release. `inject()` ([#1453](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1453)): done, same release. `@defer` and a smaller first load ([#1454](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1454)): done, in the 12 October release. Signals and OnPush ([#1455](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1455)): mostly done, every decorator input, output and query left is a signal ([#1865](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1865)), in the 19 October release; OnPush as in the table above. Zoneless ([#1478](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1478)) and Vitest ([#1479](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1479)): done for AggieMap and UES Operations ([#1948](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/1948)), in the 19 October release; the other apps remain. Next: accessibility rules back on ([#1474](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1474)) |

**A local `nx affected` on a `package.json` change fails on projects that already fail on
`development`.** Every project counts as affected. Measured on 2 October: `cpa-angular` (since
retired, [#1458](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1458)), `ues-recycling-angular`, `signage-angular`, `ues-valves-angular` and `oidc-admin-angular` fail to build
on unchanged `development` (TypeORM and NestJS typings, signage typings, a missing `secrets` file);
NestJS builds fail on missing `ormconfig` files; three NestJS projects fail stale generator specs. CI
excludes all of them. Compare against this list, not the exit code. After any dependency change, prove
the lock file with a clean `npm ci` before pushing (CLAUDE.md, [#1347](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1347)).

### Also open

- **The standalone GIS Day competitions app and API are to be removed** ([#1609](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1609), low): the main GIS Day
  site and API serve everything they did, and nothing builds or deploys them.
- **`gisday-competitions-angular`'s page never answers when served locally** ([#1410](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1410), low);
  CI and Azure exclude the app.
- **Clicking a Ring Day popup throws in `TripPlannerConnectionService.connection`**, on production too
  ([#1411](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1411), medium). The popup still works.
- **The map probe should report popups**, so a test can see one carried between maps ([#1400](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1400),
  medium).
- **The shared flex mixins emit dead vendor prefixes** ([#1340](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1340), low priority), which makes
  reused CSS larger than hand-written.
- **Angular 16's parallel Sass compilation failed once on Azure** with "This file is already being
  loaded", on stylesheets that built cleanly before and since. If it recurs, it becomes its own issue.

### Also open from 1 and 2 October

- **Code Maroon needs an IIS proxy for its feed.** Dev reads a saved copy of the feed until then
  ([#1304](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1304), in the 2 October release). The fix is an IIS URL Rewrite and ARR rule
  with server-side caching, for dev only, to be arranged with the team that manages the server; the
  saved copy is removed once it is in place.
- **The browser console's build banner prints `___BUILD_DATE___` and the other placeholders** instead
  of the build's details ([#1306](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1306), low priority).
- **The old standalone Ring Day app's deployed copy at `/ringday/`** still needs deleting, or redirecting
  to `/events/ring-day`, on dev and production; its code is removed
  ([#1236](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1236)). The old Move-In app's deployed copy at `/movein/` still needs deleting
  ([#1235](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1235)).
- **Every map's starting center and zoom** to be checked against its data ([#1231](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1231)).
- **Signage does not build from its current source** ([#1226](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1226)).

### Waiting on someone else

**Everything waiting on the GIS teams is in one list: [#1745](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1745).** The basemap republished in Web
Mercator and with its tree cutoffs corrected, bus route data on a production server, routing, the
symbology review and the rest, each with its issue and the AggieMap work that follows it.

**Bus route stops are a data fix, not a code fix
([#1174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1174)).** Five
routes draw no stops - NW0104, NW0305, NW4041, 15R and 47/48 - and two draw the wrong number: 40 has
one extra, 47 two missing. The map matches each stop's `Route` field in the Bus Stops layer
(`TS/Bus_Routes/MapServer/0`) against the route code, and no stop carries those codes. The side panel
still lists their stops, because that comes from separate text fields.

**Megan maintains the bus data.** `bus.spec.ts` records the seven as known failures for dev, so the
nightly run shows each one going green as its data is corrected. Production deliberately has no
entries, so the test holds any bus release until the data is right.

### Read this first if you are picking up elsewhere

**726 screenshots exist only on the work machine.** They are in `test/visual/baselines/builder/`,
untracked and deliberately uncommitted - 363 builder destinations at two viewports, 325MB. They are
the output of a two-hour crawl against dev and can be regenerated with:

```bash
AGGIEMAP_SMOKE_BASE_URL=https://dev.aggiemap.tamu.edu BUILDER_INVENTORY_SHOTS=/some/dir \
  npx playwright test --config=tools/builder-inventory/playwright.config.ts
```

The capture resumes rather than restarts, so an interrupted run costs only what it had not reached.

They are uncommitted on purpose: at 325MB they would more than triple a 153MB repository,
permanently, since git keeps every version. Where they should live is
[#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107).

### A lesson from this release worth keeping

**A red smoke run is not automatically a code fault.** On the morning of 30 September the scheduled
run was red on both environments: 57 failures on production, one on dev. Every one of them was the
new tests running against builds that predated them - neither environment had been redeployed since
the 29 September release. Checking the deployed bundle settled it in minutes; debugging the
application would have wasted the morning.

Until a build can say which commit it came from
([#1148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1148)), the smoke
suite tests a URL and cannot know what it verified, so this can happen after any merge that is not
promptly deployed.

### The decision waiting to be made

**[#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107) - evaluate
Visual Regression Tracker on the cluster** as the home for baseline images, with
[#1119](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1119) to stand it
up. Phase 0 is five decisions that need no VPN: hostname, TLS issuer, image storage, PVC size, and who
can log in.

The contained test is in [#1107](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1107): stand VRT up, point the existing capture at `gameday-parking`'s 14
destinations, and find out whether its Playwright agent - about two years stale, while the server is
current - still works before migrating 726 images.

### Open, none started

| Issue | |
| --- | --- |
| [#1079](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1079) | Visual baselines are stale against dev, and there is one set for all environments |
| [#1082](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1082) | All Maps scrolls sideways on a phone: a copy field with an unbreakable URL widens its card |
| [#1089](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1089) | Full visual suite: a screenshot of every page, including builder paths |
| [#1090](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1090) | Nothing asserts development-only sections stay off production |
| [#1091](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1091) | Layer toggle round-trip: prove a layer returns the map to its original state |
| [#1097](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1097) | Two 2025 events still registered on dev |
| [#1099](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1099) | Ring Day naming: October holds the generic `/events/ring-day` id |
| [#1101](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1101) | Inventory every GIS service, with dev and prod URLs and which maps use them |
| [#1102](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1102) | Dev is hardcoded to the production transportation GIS host by a `TEMP` |
| [#1103](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1103) | No test that a past event shows the "this event has passed" warning |
| [#1104](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1104) | Define an emergency test tier for urgent deploys |
| [#1105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1105) | Map captures are not byte-reproducible; page captures are |
| [#1123](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1123) | Two unused football entries point at stopped services |
| [#1134](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1134) | Test production's builder-gated maps using the builder inventory |
| [#1137](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1137) | Run a frequent scheduled subset of map function checks and alert on failure |
| [#1140](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1140) | Field names differ between three maps in the latest service data |
| [#1144](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1144) | Release process: which of the remaining options to adopt |
| [#1146](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1146) | Professionalization sweep |
| [#1148](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1148) | A deployed build cannot say which commit it came from |
| [#1156](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1156) | Decide whether to turn Claude's auto memory off, as the C# repository did |
| [#1159](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1159) | Test that every map's side panel tabs open and close |
| [#1160](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1160) | Test that the items inside every map's side panel open and close |
| [#1161](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1161) | Test that an upcoming event's toast appears, opens its map, and stays dismissed |
| [#1169](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1169) | Drive directions' visitor parking query uses a column that no longer exists |
| [#1173](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1173) | Every popup offers a copy link that reopens that map and feature, through shared code |
| [#1174](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1174) | Five bus routes draw no stops (waiting on the data) |

### Worth knowing before touching the visual work

- **Page captures are byte-identical across runs; map captures are not.** Measured three times each.
  So hash comparison works for pages and cannot work for maps, which need pixel tolerance
  ([#1105](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1105)).
- **A local dev server must be reached at `http://localhost:4200`, not `127.0.0.1`.** `TestingService`
  keys on the host containing `dev` or `localhost`, so `127.0.0.1` renders the *production* variant.
  That is deliberate and useful - it is the `local-production` test environment, and the way to capture
  production behaviour before deploying - but it is not what you want for everyday work.
- **The builder inventory is environment-specific** and the smoke suite refuses one captured
  elsewhere. Production has no inventory yet, so its builder maps still skip
  ([#1134](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1134)).
