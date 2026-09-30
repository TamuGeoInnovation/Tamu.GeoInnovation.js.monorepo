# Release notes

One file per production release, named for the date it reached production: `YYYY-MM-DD.md`.
If a second release reaches production on the same day, add a suffix: `YYYY-MM-DD-2.md`,
then `-3`, and so on. The first file keeps its name, so links already shared still work.

A **dated** file lands on `development` when the release reaches production, not before, because a
file named for a date reads as a record of something that shipped. It is *written* before, though -
see [Cutting a release](#cutting-a-release).

Work in progress lives in [`unreleased.md`](unreleased.md), which collects what has merged since
the last production release. It is not assembled from memory at the end — one release was
reconstructed afterwards and four changes were nearly missed, including a data-correctness fix that
mattered more than the features around it.

**Each pull request with a user-visible result adds its own entry to `unreleased.md`, in that pull
request**, with the before/after screenshots it already has. When it merges, the notes are already
complete; nobody writes them later or goes back for images. Link the images where the pull request
committed them, relative to this folder:

```html
<img src="../screenshots/1125-live-at-the-station/before-prod-desktop.png" width="340" alt="..." />
```

One capture then serves the issue, the pull request and the notes, and nothing has to be named for a
release date that is not known yet. The link keeps working when the file is renamed, since both
names are in this folder. A "before" from production and an "after" from localhost or dev is fine:
label each with where it was taken. The "after" is the build that goes to production, so there is
nothing to re-capture at release time.

A pull request with no user-visible result, such as tests, CI or internal docs, adds a line under
*Behind the scenes* if it is worth recording, or nothing.

**Link every issue and pull request you mention, and list them all at the end.** Two separate things:

Inline, write the full URL rather than a bare `#1122`:

```markdown
Reported in [#1122](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1122).
```

GitHub only turns `#1122` into a link inside issue and pull request comments. In a file in this
folder it is inert text, so a bare number is a dead end for exactly the reader these notes exist
for - someone outside the team, opening a shared link, who was not in the room.

Then end the file with **What went into this release**, a table of every issue and pull request it
carried:

```markdown
## What went into this release

| | |
| --- | --- |
| [#1098](https://github.com/.../issues/1098) | `visible:false` meant both "not announced" and "finished" |
| [#1136](https://github.com/.../pull/1136) | Retire finished events |
```

The prose answers "what changed and why". The table answers "what went into this", which is a
different question and the one asked months later, when someone is tracing when a behaviour arrived
or reporting what the work produced. Neither substitutes for the other.

On the day it ships, `unreleased.md` is renamed to `YYYY-MM-DD.md` for that date and its
"Unreleased" heading becomes the status line. A fresh `unreleased.md` starts empty.

That rename is the whole mechanism. It keeps one place to look for what is coming, and keeps the
dated files meaning exactly what they have always meant.

**Keep `unreleased.md` honest about environments.** It describes things that have not reached
users, so it is the file most likely to make a claim a reader cannot verify. If something is on
dev, say so; if it has not been built anywhere yet, say that too.

This repository is public, so every file here has a permanent URL that anyone can read
without an account. That is the point — release notes are for the people who asked for the
work and the people who test it, not only for the people who wrote it. Sharing a link should
never require the reader to sign in to anything.

## Cutting a release

One sequence, in order. Each step either proves something or records it, and the note under each says
which.

**The notes merge before production, not after.** They describe what a release contains and what
cleared it; they do not assert that it is deployed. A tag records that (step 6), which is a fact
rather than a claim someone has to remember to make true. Writing the notes after the deploy made
them the first job of every release night and left the file most likely to be shared outside the team
wrong until someone got to it (#1094, #1132, #1144).

### 1. Build and deploy to dev

Create the release **after** its build has finished. A release created against a build still in
progress is asking for the artifact it wants before it exists.

### 2. Run the full suite against dev

```bash
test/smoke/aggiemap/run-local.sh development
```

This is the gate. Nothing below happens if it fails.

Record what it says - passed, failed, skipped, duration. Those numbers go in the notes at step 4, and
they are what cleared the release.

### 3. Tag the dev build

```bash
bash scripts/tag-build.sh dev
git push origin dev-2026-09-29
```

**Only after the suite passes.** `dev-*` means "deployed to dev and verified there", which is the
claim the production tag depends on. Tagging before the run makes it mean "deployed", and the check
at step 6 then guarantees nothing.

If the suite failed and a tag was already pushed, delete it: `git push origin :dev-2026-09-29`.

### 4. Merge the release notes

Open one pull request that:

1. **Renames** `unreleased.md` to `YYYY-MM-DD.md` for the day it will ship. If the deploy slips, rename
   before merging.
2. **Records the dev run from step 2** - the numbers that cleared it.
3. **Points the *What to test* links at production**, since that is where anyone following them will
   look once it is out. Anything deliberately not on production keeps its dev link and says why.
4. **Ends with the "What went into this release" table** - every pull request and the issue behind it
   (#1139).
5. **Leaves a pointer in a fresh `unreleased.md`**, because links to it get shared while people are
   testing on dev and the rename alone leaves them on an empty page. Carry forward anything not part
   of this release, such as a work-in-flight section.

Then **merge it**. Nothing about the notes happens after this point.

Check the commit message for stray closing keywords: writing `Closes #1234` in prose, even to say an
issue is *not* closed, will close it. That has happened twice.

### 5. Deploy to production

Promote the build that was tested. Not a new one.

### 6. Tag the production build

```bash
bash scripts/tag-build.sh prod
git push origin prod-2026-09-29
```

**This refuses a commit carrying no `dev-*` tag.** That refusal is the point: it is what makes "we
shipped what we tested" a fact rather than an assumption. `--force` overrides it and should be rare
enough to explain.

Both tags land on the same commit, which reads correctly: verified on dev on this date, shipped on
that one.

### 7. Check production

Open the thing the release is about. If it is wrong, the notes are already merged - so say what did
not ship, in a follow-up, rather than quietly editing the record.

Production numbers are not recorded by hand. The
[smoke workflow](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/actions/workflows/aggiemap-smoke.yml)
checks production daily and opens a health issue when something breaks.

### What the tags are for

A build is identified by an Azure DevOps build number, which nobody outside the pipeline can resolve.
Tags make three things answerable from the repository alone: which commit production is running,
which build was verified on dev on a given day, and whether the one promoted is the one that passed.

`azure-pipelines.yml` runs the build template twice in one run, publishing `js-monorepo-development`
and `js-monorepo-production` from the same commit, so one build serves both environments and the same
commit carries both tags.

Tags go to `origin`, not to a fork - the one place the never-push-to-origin rule does not apply.

Not called release candidates: that implies a gate these do not have. `dev-<date>` says what it is.

A second build the same day is suffixed (`dev-2026-09-29-2`). Re-running for an already-tagged commit
does nothing.

### Doing this by hand will not last

Steps 3 and 6 are manual, which is fine for proving the sequence and will not survive a normal week.
Automating them needs the build to say which commit it came from (#1148); until then the smoke suite
tests a URL and cannot know what it verified.

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
