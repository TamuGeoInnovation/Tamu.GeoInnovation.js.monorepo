# Release notes

One file per production release, named for the date it reached production: `YYYY-MM-DD.md`.
If a second release reaches production on the same day, add a suffix: `YYYY-MM-DD-2.md`,
then `-3`, and so on. The first file keeps its name, so links already shared still work.

A file is added when the release reaches production, not before. While a release is on dev
waiting for approval, its draft lives outside the repository (a shared review document works
well), because every file here reads as a record of something that shipped. When it is
deployed, the draft becomes the file here, named for that day, with its status line updated.

This repository is public, so every file here has a permanent URL that anyone can read
without an account. That is the point — release notes are for the people who asked for the
work and the people who test it, not only for the people who wrote it. Sharing a link should
never require the reader to sign in to anything.

## What belongs here

Notes written for the person who will _use_ or _check_ the change: what shipped, where to see
it, what behaves differently, and what still needs a decision. Narrative, not terse.

These are **release notes**, not a changelog. A changelog is a terse, developer-facing list of
what changed between versions. If this repository ever wants one, it belongs in a
`CHANGELOG.md` at the root and should stay separate — mixing the two audiences is what makes
both go stale.

There is also an in-app changelog at
`libs/aggiemap/ngx/core/src/lib/pages/changelog/changelog-events.ts`, shown to AggieMap's own
users. That is a third audience again. Its last entry is from 2019.

## Writing one

Start from the previous file. The shape that has worked:

- **A status line at the top** saying where the release actually is: shipped to production on
  a given date, or partially rolled out. Readers act on this first, and it is the line most
  likely to go stale between drafting and sending.
- **A short summary** of the whole release, before any detail. Most readers stop here.
- **Sections per area of change**, with links a reader can click to see the thing itself.
- **Decisions and open questions**, so the record says what was chosen and what was not.

Two things worth being careful about, both of which have caused real confusion:

- **Say which environment a link points at, and keep it true.** A link to `dev.aggiemap` in a
  note about a production release will send someone to the wrong place.
- **Do not describe intended behaviour as current behaviour.** "Will be reachable once
  deployed" and "is reachable" are different claims, and a reader checking the second one
  against a site that has not been deployed yet will report a bug that does not exist.

## Past files are a record

Do not go back and edit a file when a later release changes what it describes. If a map was
hidden in one release and made public in the next, the first file should still say it was
hidden: that was true on its date. The later file records the change. Fix a file only when
it was wrong about its own release, such as a broken link or a misstated fact.

## Sharing

Link to the file on GitHub. It renders tables and links properly, needs no account, and stays
put:

```
https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/releases/YYYY-MM-DD.md
```

If these ever move to tagged GitHub Releases, these files become the body of each release and
nothing here is wasted.
