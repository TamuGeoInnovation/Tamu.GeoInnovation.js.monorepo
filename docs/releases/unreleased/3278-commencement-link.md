---
issue: 3278
title: "Commencement: the ceremony details link reaches a page that exists"
testOnDev: |
  | Commencement schedule link ([#3278](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3278)) | On dev, open the [Fall Commencement builder](https://dev.aggiemap.tamu.edu/events/graduation-fall/builder/accommodations/date?ret=review) and follow **Click here for Fall Commencement Ceremony details**. Then the same link on the [spring](https://dev.aggiemap.tamu.edu/events/graduation-spring/builder/accommodations/date?ret=review) and [summer](https://dev.aggiemap.tamu.edu/events/graduation-summer/builder/accommodations/date?ret=review) maps | Each opens Texas A&M's **Ceremony Information** page at `graduation.tamu.edu`, with Schedule, Branch Campuses, Photos and Videos and the rest. None reaches Aggie One Stop's maroon "404 Page Not Found" page with Reveille on it |
---

### Commencement: the ceremony details link reaches a page that exists

The three commencement maps - fall, spring and summer - each showed **Click here for &lt;map&gt; Ceremony details** above
the day picker, and all three pointed at `aggie.tamu.edu/graduation`, which Aggie One Stop now answers with its own
"Page Not Found". Anyone following it to find out when their ceremony was got a 404. They now open
`graduation.tamu.edu/ceremony-information`, the page Transportation Services asked for, which carries the ceremony
schedule, the individual colleges' and branch campuses' ceremonies, photography rules and the program archives
([#3278](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3278)).

Only the fall map was reported, because it is the one in season. The same dead address was written out in all three
definitions, so spring's and summer's links were equally dead; all three move together rather than being found again
by whoever uses those maps next.

| At 1280 pixels | Before | After |
| --- | --- | --- |
| Where the link is, on production | ![The Fall Commencement builder, with "Click here for Fall Commencement Ceremony details" above the day picker](../screenshots/3278-commencement-link/before-link-on-production.png) | The page is unchanged; only where the link goes changes |
| Following it | ![Aggie One Stop's 404 Page Not Found, with Reveille](../screenshots/3278-commencement-link/before-destination-404.png) | ![Texas A&M's Ceremony Information page at graduation.tamu.edu](../screenshots/3278-commencement-link/after-destination.png) |
| The schedule, one step on | | ![The commencement ceremony schedule at graduation.tamu.edu](../screenshots/3278-commencement-link/after-schedule-page.png) |

The builder page itself looks exactly the same before and after - the words above the day picker do not change, only
the address behind them - so the "before" image is the page as production shows it today, and the pair that matters is
the destination.

Nothing here could have caught this on its own. A map's schedule link is configuration rather than a service, so the
map loads, draws and passes the smoke suite with a dead link in it; the only signal was a visitor following it. A unit
check now fails if any map points at that retired host, and
[#3285](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3285) adds the check that asks each
link whether it still answers.
