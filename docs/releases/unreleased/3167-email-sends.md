---
issue: 3167
app: gisday
title: "GIS Day admin: every email sent to a speaker is recorded, and Who gets it says who was already sent it"
testOnDev: |
  | GIS Day: Who gets it says who was already sent the email ([#3167](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3167)) | Not on dev: GIS Day has no dev site yet ([#1525](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1525)). After release (and its migration, AddSpeakerEmailSends), as an admin on [gisday.tamu.edu](https://gisday.tamu.edu/admin/events), open a session with several speakers, then Email these speakers, Session details (and Ask for slides) | Under each speaker in Who gets it: their address, then "Not sent yet" or "Sent once/N times, last <date, time>" (US Central). Above them, how many have not been sent it, "Tick only those not sent it yet" (unticks those who were) and "List those not sent it yet first". "Every email each was sent" opens a list of each speaker's emails with dates, including the profile email. Nothing was sent before the release, so every speaker starts as "Not sent yet". Close the window with Cancel: nothing is sent |
---

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
