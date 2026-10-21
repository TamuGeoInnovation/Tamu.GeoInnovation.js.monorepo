# Unreleased entries, one file per change

A pull request with a user-visible result adds **one file here**, named `<issue>-<slug>.md`:

```
docs/releases/unreleased/1991-vendor-parking-lots.md
```

At release, `node scripts/collate-release-notes.mjs` gathers them into the dated notes and the
directory empties.

## Why one file each

Entries used to be added to the top of `docs/releases/unreleased.md`, and the *What to test on dev*
row to the top of its table. Two pull requests adding at the same line is a conflict every time, and
on 20 October 2026 **six pull requests in one day each had to be resolved by hand**, always the same
two places, always "keep both". With one machine that was rare; with four working in parallel it was
every single one.

A new file cannot conflict with another new file. That is the whole idea — the problem goes by
construction rather than being managed.

It is also safer. A release-notes conflict resolved at speed is how an entry silently disappears, and
nothing would catch it: the notes are the one document nobody runs.

## The format

Front matter, then the entry, then the row. Nothing else.

```markdown
---
issue: 1991
title: Vendor Parking's lots open their vendor notes again
testOnDev: |
  | Vendor Parking draws its lots ([#1991](<issue url>)) | [dev.aggiemap.tamu.edu/parking/vendor-parking](<dev url>) | Maroon surface lots and lavender garages; clicking a lot opens its vendor notes, not the campus lot popup |
---

### Vendor Parking's lots open their vendor notes again

The lots were drawn by a background image that could not be clicked, because the service's symbology
depends on a field it does not publish (as Business Parking's #1981). They are now two clickable
layers in the service's colours.
([#1991](<issue url>))

| Before | After |
| --- | --- |
| ![...](../screenshots/1991-vendor-parking-lots/before-production-wrong-popup.png) | ![...](../screenshots/1991-vendor-parking-lots/after-local-build-vendor-popup.png) |
```

- **`issue`** orders the collated notes and is checked against the file name.
- **`title`** is only for the collation summary; the `###` heading in the body is what readers see.
- **`testOnDev`** is the row, or rows, for *What to test on dev*. Omit it only when the change cannot
  be checked on dev, and say why in the entry.
- **Image paths are relative to `docs/releases/`**, not to this directory — `../screenshots/...` —
  because that is where the collated file ends up. `collate-release-notes.mjs --check` verifies every
  image path resolves, so a wrong one fails before release rather than rendering as a broken image in
  the notes everybody reads.

## What has not changed

- **The notes are written in the pull request that makes the change**, never afterwards (#1132).
- **Screenshots are committed to `docs/screenshots/<slug>/`** and linked from the entry.
- **`docs/testing.md` gets no row and no count change** unless a smoke spec is added (#2002).
- The existing `docs/releases/unreleased.md` is **still there** and still holds everything written
  before this directory existed. The collation reads both.
