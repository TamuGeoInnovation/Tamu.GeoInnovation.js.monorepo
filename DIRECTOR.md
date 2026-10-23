# Who directs

**Directors: GIS Day - work, its GIS Day chat; AggieMap - work, its AggieMap chat; security and vulnerability work (#2112, #2118, #1146's security parts, Dependabot, CodeQL and secret-scanning alerts, committed secrets) - work, the chat titled "js.monorepo - Security - CSA 305 Desktop"** (maintainer, 23 October 2026). All three run on the work machine; each writes only its own batches and asks him only about its own, so a listener's batch heading (`gisday:`, `aggiemap:`, `security:`) says which chat wrote it and where its questions go. `package.json` and `package-lock.json` are shared: a chat says so before changing either, and security bumps are the security chat's.

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
| home | `home/` | Development: branches, agents, pull requests. **Not available on 23 October 2026** - the maintainer cannot start it, so it takes no batches that day; both directors found this out separately before it was written down. Check for a `home:` push newer than 07:55 on 23 October before queueing anything for it | 18 October 2026 |
| work | `work/` | Testing: smoke tiers, screenshot sets, `dev-*` tags | 18 October 2026 |
| codex-home | `codex-home/` | OpenAI's Codex CLI, **on the home machine**: reviews and small, well-defined code jobs (unit tests, dead code), each as a branch for the director to turn into a PR. **It runs only when `home` is running.** On 23 October 2026 `home` could not be started, and two batches were queued here before anyone connected the two - its last push was 07:05. **Before queueing for `codex-home`, check that `home` is up** | 19 October 2026 |
| work-lab-leila | `work-lab-leila/` | **Any kind of batch** (the maintainer, 23 October 2026, correcting a director who read this row as testing-only): smoke tiers, screenshot sets, code, docs, investigations - whatever is waiting when it is idle. It is the largest machine, so give it what wants a machine to itself. **Its tasks are prioritised for vulnerability work at the moment.** 64 GB and 24 CPUs, the largest here. **No `gh` CLI**, so it opens no pull requests, posts no comments and sets no fields: it pushes branches and reports, and the director does the GitHub half | 20 October 2026 |

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

### The TAMU AI key (listeners only, from 23 October 2026)

The maintainer has a Texas A&M System allowance of **$20 a day** through TAMUS AI Chat, which Claude Code can use in
place of his own Claude account. He wants it spent first. Decided on 23 October:

- **Listeners only**, starting with `work-lab-leila` for one day to see how far $20 goes. Directors stay on his
  account: they decide and develop, and the key gives only `protected.Claude Sonnet 4.6`.
- **There is no automatic fallback.** When the day's allowance is used up, the gateway refuses requests and the
  session cannot continue. **A listener that starts getting refusals writes "TAMU AI allowance used up at <time,
  US Central>" at the top of its `STATUS.md`, with the batch and step it reached, and stops.** The director sees it
  and asks the maintainer to switch that machine back. Nothing is lost: the batch resumes from the step named.
- **Which machine is on it** is recorded here, so nobody has to guess why a listener is running Sonnet:

  | Machine | On the TAMU key since |
  | --- | --- |
  | work-lab-leila | not yet (after batch 18) |

**The key never goes in this branch, an issue, a report or a chat.** It lives only in that machine's own
`%USERPROFILE%\.claude\settings.json`, typed in by the maintainer at a hidden prompt.

**Turning it on** (the maintainer, on the listener, in Windows PowerShell, then restart the Claude app). It backs up
the settings file, then adds six values under `env`: TAMUS AI Chat's address, the key, and the model for every alias,
because Claude Code also makes small background calls to a Haiku model, which the gateway does not offer:

```powershell
cd "$env:USERPROFILE\.claude"; & { $f = "$env:USERPROFILE\.claude\settings.json"; if (Test-Path $f) { Copy-Item $f "$f.before-tamu-ai" -Force; $s = Get-Content -Raw $f | ConvertFrom-Json } else { $s = New-Object PSObject }; $k = Read-Host 'TAMU AI key (hidden)' -AsSecureString; $p = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($k)); $m = 'protected.Claude Sonnet 4.6'; if (-not $s.env) { $s | Add-Member -NotePropertyName env -NotePropertyValue (New-Object PSObject) }; $v = [ordered]@{ ANTHROPIC_BASE_URL = 'https://chat-api.tamu.ai/api'; ANTHROPIC_AUTH_TOKEN = $p; ANTHROPIC_MODEL = $m; ANTHROPIC_DEFAULT_OPUS_MODEL = $m; ANTHROPIC_DEFAULT_SONNET_MODEL = $m; ANTHROPIC_DEFAULT_HAIKU_MODEL = $m }; foreach ($n in $v.Keys) { $s.env | Add-Member -NotePropertyName $n -NotePropertyValue $v[$n] -Force }; [IO.File]::WriteAllText($f, ($s | ConvertTo-Json -Depth 20), (New-Object Text.UTF8Encoding $false)); 'TAMU AI key on: ' + (($v.Keys | Where-Object { $_ -ne 'ANTHROPIC_AUTH_TOKEN' }) -join ', ') }
```

**Turning it off** (the same way, then restart the app). It removes those six values and leaves everything else:

```powershell
cd "$env:USERPROFILE\.claude"; & { $f = "$env:USERPROFILE\.claude\settings.json"; $s = Get-Content -Raw $f | ConvertFrom-Json; foreach ($n in 'ANTHROPIC_BASE_URL','ANTHROPIC_AUTH_TOKEN','ANTHROPIC_MODEL','ANTHROPIC_DEFAULT_OPUS_MODEL','ANTHROPIC_DEFAULT_SONNET_MODEL','ANTHROPIC_DEFAULT_HAIKU_MODEL') { if ($s.env) { $s.env.PSObject.Properties.Remove($n) } }; [IO.File]::WriteAllText($f, ($s | ConvertTo-Json -Depth 20), (New-Object Text.UTF8Encoding $false)); 'TAMU AI key off' }
```

After turning it on, the listener's first reply shows the model it is running; anything but Sonnet 4.6 means the
desktop app did not pick the settings up, which is the first thing to check on a new machine (the TAMU instructions are
written for the terminal CLI). Spend for the day shows in TAMUS AI Chat's own usage page.

## The director
- Is the only session that asks the maintainer anything, and the only one that takes instructions from him.
- Writes each listener's `<folder>/TASKS.md`, with each batch and a **Decided** list of his answers.
- Watches the branch and reads every listener's `STATUS.md` and reports as they land, so he relays nothing.
- Before asking him anything or writing a batch, reads every listener's `STATUS.md`, including **Told directly**,
  and never queues what a listener is already running.
- Applies the same rule to itself: work a listener is better placed for goes into that listener's batch, never
  done by the director on the side.
- **Sends work to an idle listener whenever one can do it** (the maintainer's rule, 23 October 2026). Before running
  anything heavy itself - a build, a check, a capture, a test run, a real run of a script - it reads every listener's
  `STATUS.md` and, if one is idle and has what the work needs (its **What this is**), writes the work into that
  listener's batch instead. Try the lab first, because it is the largest; then `home`; `codex-home` takes small code
  jobs and reviews only. The director keeps only what needs it: asking the maintainer, the GitHub half (pull requests,
  fields, comments), and what only its machine can do (a sign-in, a credential, the `kubernetes-config` checkout).
  A director's machine that is running another chat's work counts as busy. Every reply to the maintainer says which
  machine got what, and why anything stayed on the director's. This applies to every director, the security chat
  included.

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

Written by `home (aggiemap)` at 7:40 AM Central, 21 October 2026, as the maintainer left for school.

### Decided this morning (the maintainer)

- **Release-487 is NOT promoted (his 3B).** Build 20261020.40, `b78942631`, tagged `dev-2026-10-20-2`, release tier clean
  (613/0/0/44). He checked it by hand on dev: everything passed except Indoor Track's Team Bus Parking, hidden under the
  building (#2059, not a regression). He wants one build carrying the athletics dates and #2059 instead.
- **Next: a new dev build today, once PR 2060 merges (his 4A)**, then its release tier, new release notes, his hand check, and
  production. Women's Basketball's season starts **2 November**; its dates (PR 2049) are merged but not built.
- **The blue parking garages on dev** are the development-only vector-tile campus basemap (#1229), not this release: settled
  (1A). #2063 asks for the garage styling to be agreed before that basemap reaches production (2A).
- Priorities set: #2059 Medium, #2061 Medium, plus every issue filed overnight (2040 High, 2042 Low, 2045 High, 2047 Medium,
  2050 High, 2051 Medium, 2054 Low, 2055 Medium; 2019 High, 2039 Medium, 2015 Medium, 2007 Low, 1969 High). **#2063 has none.**

### Waiting on the maintainer

| PR | What | State |
| --- | --- | --- |
| 2060 | #2059: Team Bus Parking drawn above the Indoor Track building | CI green except Azure `Monorepo`, running at 7:35 AM. Merge, then build |
| 2041 | Release notes for Release-487, his hand checks recorded (`058937566`) | **Do not merge as is**: Release-487 is not going out. Rewrite it for the new build (below) or close it |

Merged overnight and this morning: 2043 (Vitest 5), 2044 (NestJS 12, `@nx/nest` removed), 2046 and 2048 (accessibility rules,
AggieMap's half of #1474), 2049 (athletics 2026-27 dates), 2052 (a dismissed notice returns next season), 2053 (the dates tool reads
every athletics schedule, women's tennis included), 2056 (`tools/` tests in CI). `development` after 2043-2048 was checked in full:
`npm ci`, lint 113, build 14, tests all but the known flake #1898.

### What the next AggieMap director does, in order

1. When 2060 merges, ask the maintainer to queue a dev build from `development` and release it to dev.
2. Read Azure for the release and its commit (**on `home` only**: `C:\TAMU\logs\az-releases.py`, with `AZURE_DEVOPS_PAT` from home's Windows user environment - `work` and `work-lab-leila` have neither, so a listener asks `home` for this read); **a bundle name
   cannot identify a commit across environments** (each stage bakes its own analytics id in).
3. Give a listener the **release** tier on dev; tag `dev-*` only on a clean pass.
4. Release notes: rework PR 2041 (branch `docs/release-487-notes`, worktree `C:\TAMU\wt-notes-487`) for the new build - its range
   grows from `prod-2026-10-20..b78942631` to the new commit, and the overnight merges' entries are files in
   `docs/releases/unreleased/` for `node scripts/collate-release-notes.mjs --check` then `--write` to collate. The hand-check list
   for the maintainer is on #2040; add rows for the new changes (2049 dates, 2052 notices, 2053 tennis, 2060 team bus).
5. His hand check on dev, the notes merged, production approved, `prod-*` tagged, the production tier.

### Machines

- **`work`** - silent since 11:15 PM 20 October. Its batch 21 was withdrawn at 12:45 AM (moved to home); the GIS Day chat withdrew
  its batch 20. Probably its session closed when the maintainer left the office.
- **`work-lab-leila`** - silent since 12:05 AM, part way through **batch 6 (#1969, the lot-link race)**: it had red unit tests and had
  found "two lookups racing". No branch on the fork. Its batch 7 (#2019) was withdrawn and done on home. **Likely stuck on an approval
  prompt - someone needs to look at its screen.** Batch 6 is still its own.
- **`home (aggiemap)`** - a listener from now. Nothing running. Its worktrees hold no uncommitted work.
- **`home (gisday)`** - directs GIS Day; was finishing #1998 on home.
- **`codex-home`** - idle since 19 October.

### Open issues still needing the maintainer

- **#2063** (garage styling on the vector basemap): set to Low by the maintainer, 7:45 AM. Nothing else is owed.
- **#1474** stays open for the GIS Day half (21 projects still have the rules off); the GIS Day chat has been told.

### Things not to relearn

1. **Squash merges break stacked pull requests.** 2053 was built on 2049's branch; once 2049 squash-merged, 2053 conflicted on the
   lines both touched. Merge `development` into the stacked branch and keep its (newer) side.
2. **GitHub re-checks mergeability after every merge**, which is why each "Merge" button waits a minute or two. Nothing needs redoing.
3. **An event map's drawing order is its `references` enum order**, top first; `layerIndex` does not order an event map's own layers
   (#2059, PR 2060; 15 more definitions on #2061).
4. **A green check can mean nothing ran** - read the log for "No tasks were run"; for `test/smoke/aggiemap/` the real check is
   `tsc -p test/smoke/aggiemap --noEmit`.

## Handover (gisday)

Written by `home` (GIS Day chat) at 7:45 AM Central, 23 October 2026, as the maintainer left for the office. **The next GIS
Day director is `work`**, from when the maintainer speaks to it there. `home` becomes a listener (development work:
branches, the local GIS Day stack, Azure reads). This morning's work was workspace-wide security, not only GIS Day; the
GIS Day chat directed it because it was the one directing.

### Waiting on the maintainer: merges

Merge in this order; each pair shares files, so the second needs `development` merged in and a recheck after the first.

| PR | Issue | What | CI at 7:39 AM |
| --- | --- | --- | --- |
| [2123](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2123) | #2116 | patched `form-data` everywhere (override), `coveralls` and `request` removed | **merged** ~7:50 AM |
| [2125](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2125) | #2112 | in-range updates, `multer` 2, `postcss-url` 10.1.4, `bcrypt` 6 (drops `tar`); after 2123 (both lock files) | `development` merged in (lock regenerated), full check exit 0, pushed 7:55 AM, CI running |
| [2124](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2124) | #2121 | mailroom builds each message from an allowlist | **merged** ~7:50 AM |
| [2126](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/pull/2126) | #2120 | upload limits on every route; after 2124 (same mailroom controllers) | `development` merged in (spec combined, 17 tests pass), full check exit 0, pushed 7:55 AM, CI running |

### The security work, all of it ([#2111](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2111) tracks it)

| Issue | Priority | State |
| --- | --- | --- |
| #2107 Node 24.22.1 (Brotli RCE) | Urgent | **Done**: deployed (both GIS Day APIs and `gsvcs-nest` on `sha-35581d0`, confirmed), kubernetes-config #68 merged, closed |
| #2116, #2112, #2121, #2120 | High/Medium | PRs above |
| #2113 class-validator 0.15 + `forbidUnknownValues`/`whitelist` | High | `work-lab-leila` batch 14 task 2 |
| #2114 swiper 14, with screenshots | High | `work-lab-leila` batch 14 task 3 |
| #2119 `nginx-base` on Alpine 3.24 / nginx 1.30.6, front ends pinned | High | `work-lab-leila` batch 15 (local test; **nothing pushed to nginx-base: every push there publishes `:latest`**) |
| #2118 daily scan + `security-health` issue + publish gate | High | `work` batch 24, next update by 9:15 AM |
| #2115 nodemailer 10 | Medium | after #2124 merges |
| #2117 each API image installs only its own packages | Medium | after #2112 to #2114 |
| #2122 remove unused packages with knip | Medium | after #2112 to #2114 |
| #2109 where mailroom runs (not on the cluster) | High | the maintainer |
| #2110 ingress log retention and headers | Medium | cluster work |

**After the merges:** new images for the four APIs and the front ends, deployed with commands given to the maintainer one at
a time (he runs every cluster command). The API images on `sha-35581d0` are already clean at OS level; the front ends wait
for #2119.

### Branches pushed but with no PR yet

- `feat/2057-gisday-local-static` (`5d4585d`, #2057, `web --static`): tests pass; needs one real run on a machine with the
  GIS Day stack before its PR.
- `fix/1474-gisday-template-a11y` (`85df2be`, #1474, GIS Day's half of the accessibility rules): full check **exit 0**, 214 errors fixed in 8
  projects, no suppressions. Before the PR, capture the keyboard focus rings it adds (FAQ, admin action bars, season day tiles,
  header Login). Found: five GIS Day projects set `"force": true` on lint, so their lint errors never fail CI; worth an issue.

### Machines

- **work-lab-leila**: batch 14 (task 2 of 3), then batch 15. The maintainer wants the lab given work first.
- **work**: batch 24 (#2118). It was silent 6:49 to 7:28 AM, then took the batch inside its "Still there?" deadline.
- **codex-home**: idle; batch 3 (#2120) done. It runs on home and needs the maintainer to approve its prompts.
- **home**: a listener from 7:45 AM. Its local GIS Day stack is running (UCGIS on 4201, txgisday.org on 4202, static build).

### Things not to relearn

- `npm audit fix` alone left `multer`, `tar` and `postcss-url` vulnerable: a direct `multer ^1` in the root, `tar` held by
  `bcrypt` 5's `node-pre-gyp`, and an exact `postcss-url` pin. Check the audit after, not the command's exit code.
- A regression test that imports a new symbol "fails" on the unfixed code by not compiling. Add the symbol alone to prove it
  red for the right reason (#2120 did: 201 and 500 instead of 413).
- Agent worktrees under `.claude/worktrees` fail on Windows ("Filename too long"); make them at `C:\TAMU\wt-<n>`.
