# Work machine: status

Written only by the work machine (see `work/TASKS.md`, "Who does what"). Push it the moment anything starts or
finishes. Clock times are read from PowerShell, not estimated.

Last written **11:05 PM Central, 20 October 2026**. **This machine is a listener**; `home` directs from when the maintainer reaches home.

## Running now

**The release-notes change**, branch `chore/notes-one-file-per-change` — one file per change under
`docs/releases/unreleased/`, so pull requests stop conflicting. Started, unfinished: the directory exists and
nothing else. No issue filed yet. The maintainer called it urgent.


## Merged today

`8e505e2fd` #1981, `9ee3b97e8` #1987 and #1988, `aff56e810` #1986's `map-layers.spec.ts`, `cbacc6aa7` #2002's
`testing.md` rule, `418553c8c` #2009's dev-server settings. Plus PRs 1983, 1984, 1985, 1994 and 1999 merged by
the maintainer.

## Waiting on the maintainer

Nothing. Every field is set on every issue and pull request opened today.

## In flight

- **Three parking fixes**, branches on the fork with `development` merged and the combined check passed:
  `fix/1991-vendor-parking-lots` (`9979ff57d`, #1991), `fix/1992-accessible-parking-sports-maps` (`248ef407e`,
  #1992 and #1993), `fix/1992-legend-multi-value-class` (`e5a66b132`, #2004). `work-lab-leila` is taking the
  images and writing the notes; this machine opens the pull requests.
  **They will conflict with each other** in `unreleased.md` — each adds an entry and a *What to test* row at the
  same two insertion points. The maintainer merges one at a time and this machine fixes up the next. Agreed, not
  a surprise.
- **`home` batch 12**: #2008, tagging Maintenance and Service Parking `@heavy`.
- **Transportation Services note**: drafted and given to the maintainer, covering both unpublished-`LotType`
  services and the three stale portal renderers. Not sent; his to send.

## Findings

- **The lab machine is five to ten times faster than this one for test work.** Batches 1 and 2 took ten minutes
  each, against hours here: 24 CPUs and 64 GB against this machine's contention. `map-layers.spec.ts` ran in
  3.8 minutes there. Worth deciding deliberately whether tiers, captures and combined checks move there.
- **`fix/1991` was broken on its own**, not only merged — `declared-layers.generated.json` was missing
  `vendor-parking-vendor-plus-only-lots` since #1986 merged. `home` had the information and recorded it as a
  merge-order note; `work-lab-leila` read the file across all three branches and drew the right conclusion. Fixed
  on the branch (`9979ff57d`).
- **The 240-second settle limit measures spare CPU, not map speed** (#2008). Maintenance Parking: 41.5 s on 24
  CPUs, 134 s on a loaded machine. `home` is tagging it and Service Parking `@heavy`.
- **`prod-2026-10-20` baselines are complete**: 424 desktop, 424 phone, in `C:/TAMU/visual-baselines`.

## Told directly

- 7:40 AM: this machine directs; home is the worker.
- Through the day: the maintainer answered every decision put to him; nothing is outstanding.
