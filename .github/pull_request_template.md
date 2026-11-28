<!--
  Every pull request needs an issue behind it. Work on this project is reported to keep it funded,
  and that reporting is built from issues - a pull request with no issue does not appear in it.

  A CI check looks for one of `Closes #N`, `Fixes #N` or `Resolves #N` below. If there is genuinely
  no issue for this, open one first; it takes a minute and it is the whole point.
-->

Closes #

## What this changes

<!-- What a reader needs to know. Why, not only what. -->

## Screenshots

<!--
  Required for anything with a visible result - a page, a map, a layer, a legend, a popup. Before and
  after, not just after: a reviewer cannot tell what changed from one image.

  A CI check looks for an image below whenever a template, stylesheet, component or directive
  changes. If the change genuinely has no visible result, apply the `no-visible-change` label rather
  than deleting this section.

  This is not only documentation. The duplicated 150th Anniversary tile (#1055) was found because
  before/after images were being captured for release notes. It read as correct in the diff and was
  obvious in a picture.

  Drag images in here, or commit them and link the raw URL - this repository is public, so raw URLs
  render and do not rot.

  Delete this section if the change has no visible result.
-->

## Release notes

<!--
  Anything with a user-visible result adds ONE NEW FILE, docs/releases/unreleased/<issue>-<slug>.md, in
  this pull request, with the before/after images above linked from docs/screenshots/<slug>/ and its row
  for "What to test on dev" in the front matter. Nobody writes the notes later.

  A new file, not a line in unreleased.md: two pull requests editing that file at the same line conflicted
  every time, six in one day, and an entry resolved at speed is how one silently disappears (#2037). A GIS
  Day entry declares `app: gisday` in its front matter, so it is collated separately.

  docs/releases/unreleased/README.md has the format; docs/releases/README.md has the release sequence.
  Check it with `node scripts/collate-release-notes.mjs --check`, which CI runs on every entry.
-->

- [ ] Entry added as `docs/releases/unreleased/<issue>-<slug>.md`, with screenshots and its *What to test on dev* row
- [ ] Not user-visible (tests, CI, internal docs), so no entry needed

## How it was verified

<!--
  What you actually ran or looked at, and what it said. "Tests pass" is weaker than naming the check
  and its result. If something could not be verified, say so - that is more useful than silence.
-->
