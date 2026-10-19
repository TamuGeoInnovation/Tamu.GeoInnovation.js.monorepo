# Who directs

**Director: work** (handed over by home at 7:47 AM Central, 19 October 2026; the maintainer starts work as director when he arrives)

Each of the maintainer's machines runs a Claude Code session on this branch. **At any time exactly one machine
directs; every other machine listens.** The maintainer talks to the director. Every session reads this file first,
every time the branch changes. Which machine directs moves with the maintainer: home when he is at home, work when
he is at work.

## The machines

Each machine has a folder at the top of this branch, named after it, holding its `TASKS.md` (written only by the
director), its `STATUS.md` and its `reports/` (written only by that machine).

| Machine | Folder | Its job | Since |
| --- | --- | --- | --- |
| home | `home/` | Development: branches, agents, pull requests | 18 October 2026 |
| work | `work/` | Testing: smoke tiers, screenshot sets, `dev-*` tags | 18 October 2026 |
| codex-home | `codex-home/` | OpenAI's Codex CLI, on the home machine: reviews and small, well-defined code jobs (unit tests, dead code), each as a branch for the director to turn into a PR | 19 October 2026 |

**Every participant is named for the agent and the machine it runs on.** A Claude Code session is named for its machine
alone (`home`, `work`); any other agent is `<agent>-<machine>` (`codex-home`, `codex-work`). Each has its own folder of
that name, and its commits start with that name (`codex-home: started`). Two copies of one agent on different
machines are two participants, never one: they have separate task files, so the director never gives the same batch to
both, and each one's status says which machine is busy. Non-Claude agents read `CLAUDE.md` as their project
instructions too.

A machine's job does not change when the director does: a batch for a development machine is development work, a
batch for a testing machine is testing. The director, whichever machine it is, writes every listener's batches,
and does its own job itself.

## The director
- Is the only session that asks the maintainer anything, and the only one that takes instructions from him.
- Writes each listener's `<folder>/TASKS.md`, with each batch and a **Decided** list of his answers.
- Watches the branch and reads every listener's `STATUS.md` and reports as they land, so he relays nothing.
- Before asking him anything or writing a batch, reads every listener's `STATUS.md`, including **Told directly**,
  and never queues what a listener is already running.
- Applies the same rule to itself: work a listener is better placed for goes into that listener's batch, never
  done by the director on the side.

## Every listener
- **A new batch in its `TASKS.md` is its instruction.** It starts it at once, without asking or waiting for the
  maintainer. "Wait for instructions" means: start nothing that is not in a batch. It never means waiting for him
  before running a batch.
- **Its branch watcher is always running in the background.** It starts the watcher again after every batch and
  after every reply to the maintainer, so a batch pushed while it was answering him is still picked up. If its
  Background tasks panel shows nothing running, it is not watching, and that is a fault.
- Watches the branch with one background command that exits when it changes, for example
  `old=$(git ls-remote origin refs/heads/work-mailbox | cut -f1); until [ "$(git ls-remote origin refs/heads/work-mailbox | cut -f1)" != "$old" ]; do sleep 120; done`,
  then pulls and reads this file and its own `TASKS.md`.
- Does each new batch in its `TASKS.md`: pushes `<machine>: started` to its `STATUS.md` before anything runs, writes
  its report in `<folder>/reports/<yyyy-mm-dd>-<n>.md` and pushes `<machine>: finished` when it ends, records
  `Last batch done: N`, then watches again.
- **Never asks the maintainer anything, never offers or suggests work, and takes no decisions from him.** Each turn
  ends with a one-line status. Questions go in its report under **Questions for the director**, with options and a
  recommendation.
- Files issues **without a priority**; its report suggests one, and the director asks.
- Records ideas, possible work and things noticed under **Findings** in its `STATUS.md`. A finding is never a
  request and is never acted on until a batch asks for it; the director reads them and brings any worth doing
  to the maintainer. Batches not reached yet go under **Queued**, never mixed with findings.
- If the maintainer does tell it something, it does only that, and records it at once in its `STATUS.md` under
  **Told directly**, so the director never asks him again.

Every commit on this branch starts with the name of the machine that made it (`home:`, `work:`, ...), so each
session can tell its own pushes from the others'.

## Adding a machine
The maintainer pastes the start line on the new machine with its name and job added, for example:

    Pull TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, check out the work-mailbox branch, and do what DIRECTOR.md says. This machine is "lab", and its job is testing.

A second agent on a machine joins the same way with its full name, for example `You are "codex-work", a listener; your
folder is codex-work/.`

The new machine creates its folder (`lab/TASKS.md` saying "No batch yet", `lab/STATUS.md`, `lab/reports/`),
pushes them with `lab: joined`, and listens. The director adds its row to the table above when it sees that
commit, and from then on writes its batches. A machine is a listener unless the first line of this file names it.

## Handing over
The maintainer tells the **current director**: "hand over to work" (or any machine's name). The director:
1. finishes or parks what it is doing, and writes **Handover** below: what is in flight on every machine, the open
   questions (numbered, with recommendations), what is waiting on whom, and what comes next;
2. changes the first line to the new director, with the time (US Central), and pushes;
3. becomes a listener: watches its own `TASKS.md`.

The named machine is listening, so it sees the change within minutes and takes over: it reads **Handover**, tells
the maintainer it now directs, and asks him the open questions. He pastes nothing. If its session was closed, the
start line is the same for every machine:

    Pull TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, check out the work-mailbox branch, and do what DIRECTOR.md says.

## Stopping
A `## Stop` heading in a listener's `TASKS.md` stops that listener: it writes `Stopped at <time>` in its
`STATUS.md`, pushes, and ends. The director adds it when the maintainer says the day's work is done.

## Handover

Written by **home** at 7:47 AM Central, 19 October 2026, handing the director role to **work**.

### Today's release (the priority)
- **Release-484** (build 20261019.5, `8951a6364`) is on dev: everything for today's release (wave 1 #1940-#1944, #1948 =
  Vitest + zoneless + Node 24 + TypeScript 6.0 deprecations, plus yesterday's work back to `prod-2026-10-16`).
- **work's batch 9** (the final test) is running on it: the full tier, then the `--as production` capture, then the
  comparison against `prod-2026-10-16-corrected`.
- **One test fails hard, so no tag:** `directions.spec.ts:72`, the event map feature popup offering "Directions To Here"
  on `/parking/avp-parking/map?feature=AVP-parking-lots:26135` (its four siblings pass).
- **home is fixing it** (branch `fix/event-popup-directions`, an agent; cause first, then a fix with a red-first test).
  It needs an issue (Bug, AggieMap) and a priority from the maintainer; home will report the cause and the branch in
  `home/STATUS.md`. Then: the director pushes the branch and opens the PR, the maintainer merges, builds, releases to
  dev, and work re-runs the full tier (~45 min) and only the comparison.
- **Release notes:** drafted on home, worktree `C:\TAMU\wt-notes`, branch `docs/release-2026-10-18` (file
  `docs/releases/2026-10-19.md`, issue #1935, Medium). Not pushed. TBDs: release/build, `dev-*` tag, full tier and
  comparison results, who checked each row. The final commit will change with the directions fix.
- **Check by hand** from the list on #1849 (comment 6258036088).
- Production stays on `264eebb42` (ArcGIS 4.27) until the notes merge and the maintainer promotes.

### In flight on home (a listener from now)
- **#1949 (High): AggieMap on Esri's map components** (`<arcgis-map>`/`<arcgis-scene>` in place of `view.ui`); branch
  `feat/arcgis-map-component`, worktree `C:\TAMU\wt-arcgismap`; plan in `C:\TAMU\logsrcgismap-plan.md`. Next round.
- **The directions fix** above.
- **codex-home** (OpenAI Codex on home): batch 2 (corrected survey + three first specs, branch `codex-home/tests-1`) is
  paused: it asks for approval on every commit. Decided: move it into WSL so it runs without prompts inside its sandbox;
  the maintainer does that later.

### Open questions for the maintainer
1. Priority for the directions fix's issue (Bug, AggieMap): recommend **Urgent** (it blocks today's release).
2. When the directions fix is in, re-run the whole comparison or only the tier: recommend **the tier, and the comparison
   only for the event and parking maps** (the rest of the set did not change).

### Rules learned today (all in this file and CLAUDE.md)
- One asker; listeners never ask, offer, or take decisions; a new batch is the listener's instruction; listeners keep a
  branch watcher running; started/finished pushes; plain PR numbers (no links) in tables for the maintainer; every reply
  to him ends with all open questions, numbered from 1.
