---
issue: 3100
app: gisday
title: "GIS Day admin: choose who an email is sent as, your own address by default"
testOnDev: |
  | GIS Day admin: Send as in the email window ([#3100](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3100)) | Not on dev: GIS Day has no dev site. After release, as an admin signed in with a tamu.edu account, select one submission under [Research Competitions](https://txgisday.org/admin/research-competition) and choose Email, then Profile email | The window opens with a **Send as** box at the top, your own address chosen, then the site's address and any shared addresses in `MAILROOM_SENDERS`. The preview shows **From:** your name with the site's in brackets and your address, and **Replies to:** your address; choosing another address changes both. Cancel sends nothing. Before any real email goes out as a person, send one test email to the maintainer and read its headers for SPF, DKIM and DMARC passes |
---

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
