# Build times

How long things take here, recorded as they are run, so that a change meant to make the work faster
can be shown to have done it.

**The rule: every check, build, install or deploy records its elapsed time in this file**, whatever
its length (#1415). Recording everything is deliberate for now, and can be trimmed back if the table
becomes unwieldy. The scripts already print the elapsed time, so the measurement is free; what is
not free is remembering a number that was only ever on screen.

A single duration says very little. The same run measured before and after a change is what shows
whether the work paid off, so **record the "before" even when nothing is being optimised** - that is
the measurement that cannot be taken later.

## How to record one

Add a row. Keep the newest at the top of its section.

- **Date** - the day it ran.
- **Machine** - office or home. They differ: the home machine has 20 CPUs and 31 GB.
- **What ran** - the command or the step, specifically enough to repeat it.
- **Approach** - what makes this run different from another of the same thing: bind mount or Docker
  volume, cold or warm, webpack or esbuild, contended or quiet.
- **Elapsed** - wall clock. Say if the machine was doing something else at the time; a contended run
  is still worth recording, but it is not comparable.

Anything unusual goes in a note under the table rather than being squeezed into a cell.

## Checks and builds

| Date | Machine | What ran | Approach | Elapsed |
| --- | --- | --- | --- | ---: |
| 5 Oct 2026 | office | `check-in-volume.sh … aggiemap-ngx-common` (lint, test) | volume, warm, after a one-line change | **12 s** |
| 5 Oct 2026 | office | `check-in-volume.sh … aggiemap-ngx-common` (lint, test) | volume, cold: clone and `npm ci` included | 2 min 23 s |
| 5 Oct 2026 | office | `check-in-volume.sh … aggiemap-angular` (lint, test, build) | volume, warm | 2 min 06 s |
| 5 Oct 2026 | office | `aggiemap-angular` production build alone, inside the run above | esbuild `application` builder | 11.7 s |
| 5 Oct 2026 | office | `check-in-volume.sh … affected` on a docs-only branch | volume, cold; 0 projects affected | 2 min 02 s |
| 2 Oct 2026 | office | `nx affected -t lint,test,build`, 4 projects | bind-mounted Windows checkout | 12 min 08 s |

The 12-second row is the one that changed how the work feels: a real edit-to-verdict cycle on a
library, against a 12-minute affected run three days earlier. The two are not the same scope - 1
project against 4 - so the controlled comparison is the `npm ci` pair below, not these.

The docs-only row is worth keeping as a reminder that **exit 0 with "No tasks were run" is not a
pass**. That run was correct, because a branch touching only `docs/*.md` affects no projects, but the
same output appears when the graph fails to compute. Read the log, not the exit code.

## Installs

| Date | Machine | What ran | Approach | Elapsed |
| --- | --- | --- | --- | ---: |
| 5 Oct 2026 | office | `npm ci` | into the `tamu-js-dev-nm` Docker volume | **4 min 45 s** |
| 5 Oct 2026 | office | `npm ci` | into the bind-mounted Windows checkout | **13 min 56 s** |

Those two ran on the same machine, from the same lock file, within the same hour: **2.9 times
faster** in a volume, with everything else held constant. This is the cleanest before-and-after on
record for the volume work (#1402), because nothing but the destination differed.

## Dev servers

| Date | Machine | What ran | Approach | Elapsed |
| --- | --- | --- | --- | ---: |
| 5 Oct 2026 | office | `nx serve aggiemap-angular` to first answer on `:4200` | Angular 19, Vite dev server, volume `node_modules` | 5 min 02 s |

## Where the other records are

This file is for runs as they happen. Two existing records keep their own shape and are not folded
in here:

- [`docs/upgrades/angular.md`](upgrades/angular.md) - every Angular upgrade broken into eleven steps,
  with a duration for each, across Angular 16, 17, 18 and 19 (#1375). That per-step detail is what
  makes the forecast for Angular 20 to 22 possible, and a flat table would lose it.
- **CLAUDE.md**, under "Why checks run in a volume" - the per-task comparison that justified moving
  checks into a Docker volume (#1402, #1405).

A release's own timings - build, suite, deploy - belong in that release's notes under
`docs/releases/`, which is where someone looks when asking how long a release took.
