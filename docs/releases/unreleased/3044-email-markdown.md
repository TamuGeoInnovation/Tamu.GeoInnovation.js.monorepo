---
issue: 3044
title: "GIS Day admin: The editable emails take Markdown, so they can be sent with bold text, links and lists"
testOnDev: |
  | GIS Day admin: Markdown in the editable emails ([#3044](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3044)) | Not on dev: GIS Day has no dev site. After release, as an admin: Research Competitions, select a test submission of your own, **Send profile email** (or Approve, or Send final reminder) | In the text, write `**bold**`, `*italic*`, `[a link](https://gisday.tamu.edu)` or a line starting with `- `. The preview below shows it formatted, as the email will arrive. Typed HTML such as `<b>` shows as written and is not obeyed. Send to yourself only: the email arrives with the same formatting, and a plain-text copy for clients that want one |
---

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
