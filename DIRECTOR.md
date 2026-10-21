# Who directs

**Directors: `home` (AggieMap chat) for AggieMap, and `home` (GIS Day chat) for GIS Day** - two Claude Code chats on the
home machine, decided by the maintainer at 11:50 PM Central, 20 October 2026. AggieMap's director was handed over by `work` at
11:05 PM. When the maintainer is at work, each application's director moves to `work` separately, by the handover below.

Each of the maintainer's machines runs a Claude Code session on this branch. **Each application has exactly one director at a
time; every other session listens.** The maintainer talks to the directors; the two are kept apart so that each chat's context
is one application's. Every session reads this file first, every time the branch changes.

## Two directors (20 October 2026)

The maintainer's decisions 1A, 2A and 3A:

- **One queue per listener.** A listener keeps one `TASKS.md`. Both directors append batches to it; **neither edits or removes
  the other's**. Every batch heading names its director and application, for example
  `## Batch 6 (aggiemap: ...)` or `## Batch 7 (gisday: ...)`, and batch numbers are the listener's, in one sequence.
- **The listener runs batches in the order they arrive**, one heavy run at a time ([Nothing heavy beside a run](#nothing-heavy-beside-a-run)),
  and its `STATUS.md` says which director's batch is running.
- **Questions go back to the director that wrote the batch.** A listener's report puts them under
  **Questions for the director (aggiemap)** or **(gisday)**, and that director asks the maintainer, in its own chat.
- **A director checks the listener's `STATUS.md` and the queue before adding a batch**, as before, and writes the
  expected duration so the other director can see when the machine frees up.
- **Commits** start with the writer's name as before; a director's commits say which: `home (aggiemap):` or `home (gisday):`.
  Older `home:` commits are the AggieMap chat's.

## Read this first: are you in the table below?

**If this session's machine is not a row in [The machines](#the-machines), you are new. Announce yourself
before doing anything else, and before reading the rest of this file.** Do not look for a `TASKS.md`, do not
conclude you have no work, and do not stop: a machine nobody can see is the same as a machine that never
started, and that is the one failure this branch cannot detect.

1. **Work out your name.** The maintainer may have given it in the line he pasted ("This machine is `lab`").
   If he did not, **ask him for it and for your job**, and say you are new. A Claude Code session is named for
   its machine alone (`home`, `work`, `lab`); any other agent is `<agent>-<machine>` (`codex-work`). Do not
   invent a name and do not reuse one already in the table - two sessions sharing a folder overwrite each
   other's status.
2. **Create your folder and push it, on this branch, straight away:**

   ```
   <name>/TASKS.md     # "No batch yet."
   <name>/STATUS.md    # the headings below, with Running now: None
   <name>/reports/     # empty
   ```

   Commit as `<name>: joined` and push to `work-mailbox`. **Push before you do anything else**, even if you
   were given work in the same breath - the push is what makes you addressable.
3. **Say what you are** in your `STATUS.md`: your machine, the agent, whether you have Docker, whether you
   have a `fork` remote you can push branches to, and anything you cannot do. The director picks your batches
   on that, and will otherwise assume you are like `home`.
4. **Then listen**: watch `<name>/TASKS.md` and this file. The director adds your row to the table when it
   sees your commit, and writes your first batch.

**You are a listener, not the director**, unless the first line of this file names you. Listeners never ask the
maintainer anything - questions go in your report, with options and a recommendation.

**If you cannot push to this branch**, say so to the maintainer immediately and stop. Everything here works by
pushing; a session that cannot push cannot be given work, and silently failing to push looks exactly like
having nothing to say.

## The machines

Each machine has a folder at the top of this branch, named after it, holding its `TASKS.md` (written only by the
director), its `STATUS.md` and its `reports/` (written only by that machine).

| Machine | Folder | Its job | Since |
| --- | --- | --- | --- |
| home | `home/` | Development: branches, agents, pull requests | 18 October 2026 |
| work | `work/` | Testing: smoke tiers, screenshot sets, `dev-*` tags | 18 October 2026 |
| codex-home | `codex-home/` | OpenAI's Codex CLI, on the home machine: reviews and small, well-defined code jobs (unit tests, dead code), each as a branch for the director to turn into a PR | 19 October 2026 |
| work-lab-leila | `work-lab-leila/` | Testing, on the lab workstation: smoke tiers, screenshot sets and anything that wants the machine to itself. 64 GB and 24 CPUs, the largest here. **No `gh` CLI**, so it opens no pull requests, posts no comments and sets no fields: it pushes branches and reports, and the director does the GitHub half | 20 October 2026 |

**Every participant is named for the agent and the machine it runs on.** A Claude Code session is named for its machine
alone (`home`, `work`); any other agent is `<agent>-<machine>` (`codex-home`, `codex-work`). Each has its own folder of
that name, and its commits start with that name (`codex-home: started`). Two copies of one agent on different
machines are two participants, never one: they have separate task files, so the director never gives the same batch to
both, and each one's status says which machine is busy. Non-Claude agents read `CLAUDE.md` as their project
instructions too.

**A machine says what it cannot do, and the director believes it.** `work-lab-leila` has no `gh` CLI, so a
batch that ends in "open the pull request" is a batch it cannot finish; its branches come back to the director
like the cloud session's. Read the **What this is** section of a listener's `STATUS.md` before writing its
first batch, and do not assume a new machine is like `home`.

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

The new machine then does what [Read this first](#read-this-first-are-you-in-the-table-below) says: creates its
folder (`lab/TASKS.md` saying "No batch yet", `lab/STATUS.md`, `lab/reports/`), pushes them with `lab: joined`,
and listens. The director adds its row to the table above when it sees that commit, and from then on writes its
batches. A machine is a listener unless the first line of this file names it.

**The name and job in the start line are a convenience, not a requirement.** A machine pasted the plain start
line still announces itself - it asks the maintainer for its name first. That is deliberate: on 20 October a new
machine was set up and never appeared on this branch, and the join procedure being written here, two thirds of
the way down under a heading that reads like somebody else's business, is the most likely reason. Anything a new
session must do belongs at the top of the file, addressed to it.

**The director checks for a machine that should have arrived and has not.** There is no signal for it: a session
that never pushes is indistinguishable from one that was never started, so nobody notices without being told a
machine was expected. If the maintainer says he has set one up, look for its folder, and if it is not there say
so plainly rather than assuming it is quietly working.

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

## Nothing heavy beside a run

**While a tier, a check or a capture is running on a machine, nothing else heavy runs on that machine.** Not an
investigation, not a browser, not a second tier. A question that needs a browser or a long query loop waits for the
run to finish, or goes to a machine that is idle.

This cost two runs on 19 October. The work machine started a tier twice by accident and had to throw both away;
then, with a tier running, it ran an eight-load browser loop and several query matrices to answer the maintainer's
questions, and nine maps failed or went flaky inside that window - one of them three times - in a run that was
deciding a production release. Contention does not look like contention in a report: it looks like a map that
"loads and serves its layers" failing for two minutes.

The listener running the long job owns its machine until it finishes. The director plans around that rather than
asking for something in the middle of it.

## Saying when you will next be heard from

**A machine that is stuck cannot tell anyone it is stuck.** Blocked on a permission prompt, waiting on a
dialog, crashed, or simply never started — from outside, every one of those looks the same as working
quietly on a long build: no commits. On 20 October the lab machine sat on approval popups and nothing
elsewhere could tell.

Polling does not solve this, and it was tried. A branch watcher that flagged a folder going quiet raised
**three false alarms in two days and caught nothing real**: a push from the director, a listener idle by
design, and a listener that had already finished. Each time somebody had to go and look anyway, which is
what the watcher was supposed to avoid.

So the deadline is set by the machine **before** it can get stuck:

- **Every batch says roughly how long it should take.** The director writes it. A guess is fine; being
  wrong by half is fine. Having no number is not, because then nothing can be late.
- **A listener writes `Next update by HH:MM Central` in its `STATUS.md` when it starts**, and pushes that
  before it begins the work. It moves the line on when it pushes progress, and removes it when the batch is
  reported.
- **A missed deadline is a fact, not a judgement.** Either the line is there and still in the future, or it
  has passed. Nobody has to infer anything from silence.
- **The director checks the deadlines** before asking the maintainer anything or writing a new batch, which
  it is already reading `STATUS.md` for. A passed deadline is chased the way
  [When a listener stops, or goes wrong](#when-a-listener-stops-or-goes-wrong) says: record it, ask once,
  withdraw the batch, move the work, tell the maintainer.
- **Running late is not a failure, and saying so costs nothing.** A listener that needs longer pushes a new
  deadline and a line saying why. That is a normal thing to do and the director would far rather have it
  than a missed one.

This makes "is anything stuck?" a line to read rather than a judgement to make. It does not raise an alarm
by itself; nothing here does, and a machine that cannot speak cannot be made to.

## When a listener stops, or goes wrong

Agents fail. One may stop mid-batch, never pick a batch up, or do something its batch never asked for. The director
notices and acts; a listener that has stopped cannot tell anyone it has.

**What the director expects of a live listener**

| Signal | Expected |
| --- | --- |
| It has taken the batch | a `<name>: started` push to its `STATUS.md` within **20 minutes** of the batch landing |
| It is still working | some push - status, report, or a branch - at least every **60 minutes** while a batch is open |
| It has finished | a `<name>: finished` push, and `Last batch done: N` |

**The ladder, when one of those is missed**

1. **Record it.** The director writes what was missed and when in its own `STATUS.md`. A quiet listener is not
   assumed dead on one missed signal.
2. **Ask once, in its `TASKS.md`:** a `## Still there?` heading asking for a one-line status push. A live listener
   answers within its next watch cycle.
3. **Withdraw the batch.** After a second missed cycle, the director replaces the batch body with
   `## Withdrawn - presumed stopped at <time>`, so a listener that wakes up later stops instead of doing work that
   has moved. **This is the step that prevents the same work being done twice**, which matters more than recovering
   the listener.
4. **Move the work.** The director gives it to another listener, or does it itself, and says in the new batch where
   it came from.
5. **Tell the maintainer** when he is next in the conversation: what stopped, what was withdrawn, and where the work
   went. Never silently.

**When a listener does something it was not asked to do** - pushes outside its own folder, pushes to another branch,
opens a pull request, merges anything, or commits without its name prefix - the director reverts it on the mailbox
branch, records it, and says so to the maintainer. Its work is still checked on its merits: a branch from a listener
is built and tested by the testing machine before any pull request, whoever wrote it.

**Work is given out with failure in mind.** Anything on the critical path for a release goes to a listener whose
reliability is known, or is done by the director. A listener being tried for the first time gets work that can be
abandoned without costing anything - unit tests, dead code, a survey - never the thing a release is waiting on.

## Stopping
A `## Stop` heading in a listener's `TASKS.md` stops that listener: it writes `Stopped at <time>` in its
`STATUS.md`, pushes, and ends. The director adds it when the maintainer says the day's work is done.

## Handover

Written by `work` at 11:05 PM Central, 20 October 2026, replacing the 10:25 PM one.

### Waiting on the maintainer

| | |
| --- | --- |
| [PR 2031](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2031) | #1991, Vendor Parking's lots. MERGEABLE, CI running |
| [PR 2036](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2036) | #2035, the event-dates tool. MERGEABLE, **all checks green** |

**Five issues have no Priority** and he answers those, never us: **#2019, #2015, #2007, #2034, #2035.**

### The urgent one: release notes conflict on every pull request

**He called this a serious holdup and asked for it fixed tonight.** Six resolutions today, all on the same
two insertion points in `docs/releases/unreleased.md` — the top of `## Summary` and the top of *What to
test on dev*. Every change adds at the same line of a 1,008-line file, so git cannot merge two of them.
With one machine it was rare; with three it is every time, and it gets worse as machines are added.

**He chose: one file per change.** Each pull request adds `docs/releases/unreleased/<issue>-<slug>.md`
holding its entry and its test row. A new file cannot conflict with another new file, so the problem goes
by construction rather than being managed. At release a script collates them in order into the dated notes
and empties the directory — the changeset pattern, which exists because this problem is universal.

Also decided: **this machine does it**, as one focused change; and **the existing `unreleased.md` is left
alone** — new entries go in the new directory and the next release collates both. Migrating 55 entries is
churn for no benefit.

**Started, not finished:** branch `chore/notes-one-file-per-change` off `development`, with the directory
created and nothing else. No issue filed yet. It needs the collation script, a README for the directory,
and the rule in `CLAUDE.md` and `docs/releases/README.md` changed to point at it.

Worth knowing: this is the **second** file today whose hand-maintenance caused conflicts, after
`docs/testing.md`'s Total (#2002). Same shape, same direction of fix — stop having many writers edit one
line.

### `work-lab-leila` found the cause of #1969, and how to make it fail every time

Its report `work-lab-leila/reports/2026-10-20-4.md` is worth reading in full. In short:

- **It reproduces with load, not worker count**: 0% on one worker, 5% at six on a quiet machine, 12.5% at
  six on a saturated one, 13.8% at twenty-four. Both affected maps at the same rate.
- **The mechanism**: the main map's lot popup opens **first on nearly every load** and is then quietly
  replaced when the event map's own layer answers. The map reports `ready` without waiting for that answer,
  so when the event service is slow the spec — and a person — sees the main map's lot. The issue's
  hypothesis was right and understated: this is not an occasional fall-through, it is the normal path, and
  the right answer arriving quickly is what usually hides it.
- **A deterministic red-first test**: delay the event map's own service by 4 seconds with Playwright's
  `page.route` and it fails 4 of 4; with no delay, 0 of 4.

Nothing was fixed or committed — that was the batch. **The issue has not been updated with any of this**,
and it should be, because the finding is worth more than the issue currently says.

### What each machine is doing

- **`work-lab-leila`** — idle, batch 4 done. It opened [PR 2030](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2030) itself (merged) and now
  has `gh`, **but no `project` scope**, so it cannot add anything to a project board; the director does
  that part. It has been asked to correct its `STATUS.md` *Cannot* list and may not have yet.
- **`home`** — idle since batch 13.
- **`work`** — becomes a listener on handover. The notes change above is its unfinished work.
- **`codex-home`** — idle since 19 October.

### Still unfiled, both agreed with the maintainer

1. **#2019 renamed** to cover all eighteen stale-date maps rather than reading as one map.
2. **One issue for the twelve campus events** whose dates are stale and are not on the athletics site —
   Muster, Big Event, MS150, Aggieland Saturday, Fish Camp, T-Camp, 4-H Roundup, Fire School, Games of
   Texas, Beef Cattle, HS Graduation, Physics & Engineering Festival. Plus a decision on the three 150th
   maps, whose anniversary is over and which are probably retire candidates.

The tool in PR 2036 covers the fourteen athletics maps and found, among others, that **four men's
basketball home games are recorded on the wrong day**.

### Three things not to relearn

1. **A pull request showing one lonely `ACTION_REQUIRED` check and nothing else has a stale base.** Merge
   current `development` in first; that is what fixed three pull requests tonight after four event types
   and a full recreate had not.
2. **A green check can mean nothing ran.** `check-in-volume.sh` returns exit 0 with `No tasks were run` for
   a branch touching only `test/smoke/aggiemap/`. For the suite, `tsc -p test/smoke/aggiemap --noEmit`.
3. **A deny rule written from a guess can break the protocol** — `.claude/settings.json` shipped denying
   the push every machine uses to write here (#2028, fixed). The lab machine's batch-4 report was written
   on time and could not be pushed because of it.

