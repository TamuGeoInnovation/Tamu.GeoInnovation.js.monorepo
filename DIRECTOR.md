# Who directs

**Directors: AggieMap - work, its AggieMap chat (taken back 4:45 PM Central, 25 October 2026: home never picked it up - it has made no AggieMap commit since the handover, and work had already flagged it silent on 23 October); GIS Day - home, its GIS Day chat (handed over by work at 5:00 PM Central, Sunday 25 October 2026; work directed GIS Day on 24 and 25 October because the maintainer was there; see Handover (gisday)); security and vulnerability work (#2112, #2118, #1146's security parts, Dependabot, CodeQL and secret-scanning alerts, committed secrets) - work, the chat titled "js.monorepo - Security - CSA 305 Desktop"** (maintainer, 23 October 2026). All three run on the work machine; each writes only its own batches and asks him only about its own, so a listener's batch heading (`gisday:`, `aggiemap:`, `security:`) says which chat wrote it and where its questions go. `package.json` and `package-lock.json` are shared: a chat says so before changing either, and security bumps are the security chat's.

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

## One listener per machine, and proof that it listens (23 October 2026, [#2250](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2250))

On 23 October `home` took no work all day although it was on and two chats were open on it. Its GIS Day chat said it was
a listener and never started a watcher; its AggieMap chat was watching, but skipped the GIS Day batches as the other
chat's and said so only in its own window; and a `Still there?` was up for one minute. The maintainer's decisions:

- **One listener per machine.** Whichever chat on a machine is listening takes **every** batch in that machine's
  `TASKS.md`, whatever its heading. The heading still says which director wrote it, so questions go back to that
  director. A chat never leaves a batch for another chat on its machine.
- **The watcher fires on a commit, not on a change of content.** It waits for any new commit touching its `TASKS.md`
  (the command is under [Every listener](#every-listener)), so a note added and removed between two polls is still seen.
- **A `## Still there?` stays up for its full 20 minutes.** The director removes it only once the listener has answered
  or the 20 minutes are up.
- **A handover ends with proof of listening.** A chat's last message before it becomes a listener names its running
  watcher (the background task's id) and says Remote Control is on for the chat. Saying "I am a listener" without both
  is the 23 October failure. Remote Control is what lets the maintainer look in from another machine.

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
| home | `home/` | Development: branches, agents, pull requests. It was **not** down on 23 October 2026: no chat on it was taking batches ([#2250](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2250)). One listener per machine since then | 18 October 2026 |
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
  | work-lab-leila | tried 23 October (on the CLI): the $20 was used up by 9:28 AM Central; back on the maintainer's account |

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
- **Any listener with Docker can host an Azure Pipelines build agent** (the maintainer, 23 October 2026, #2212). The procedure is
  `tools/build-agent/README.md` in the monorepo (on `development` once its PR merges): a Linux agent in a fresh container per job,
  no host folders, no Docker socket, capped memory and CPU, agent named `<machine>-1` in pool `Linux-Build`. **The maintainer
  always does the token steps himself**, at a hidden prompt; no session ever handles the token. A director may give a listener the
  non-token steps (building the image) as a batch.
- **Keeps CI within its three build machines** (the maintainer, 23 October 2026). Azure has three build agents, so at most three
  builds run usefully at once. Twelve at once (a Dependabot burst plus several directors pushing together) stalled every one of them.
  Before pushing a branch with an open pull request, a director counts the queued and running Azure builds and keeps the total at
  three or fewer, its own included. Pushes to branches with no pull request start no Azure build.
- **Keeps every listener at least two batches ahead** (the maintainer, 23 October 2026, after finding the lab idle twice while a
  director waited on his answers). When a batch needs a decision, the director writes it on its own recommendation and the listener builds
  it as a branch; nothing merges without the maintainer, so a different answer only sets that branch aside. The maintainer should never
  have to notice an idle listener.
- **Sends work to an idle listener whenever one can do it** (the maintainer's rule, 23 October 2026). Before running
  anything heavy itself - a build, a check, a capture, a test run, a real run of a script - it reads every listener's
  `STATUS.md` and, if one is idle and has what the work needs (its **What this is**), writes the work into that
  listener's batch instead. Try the lab first, because it is the largest; then `home`; `codex-home` takes small code
  jobs and reviews only. The director keeps only what needs it: asking the maintainer, the GitHub half (pull requests,
  fields, comments), and what only its machine can do (a sign-in, a credential, the `kubernetes-config` checkout).
  A director's machine that is running another chat's work counts as busy. Every reply to the maintainer says which
  machine got what, and why anything stayed on the director's. This applies to every director, the security chat
  included.
- **A full set of screenshots is taken on `work`, not on a listener** (the maintainer, 23 October 2026). Every
  baseline set lives in `C:\TAMU\visual-baselines` on the work machine - 38 sets as of today - so a set captured
  anywhere else is stranded from the ones it would be compared with. This is the "what only its machine can do"
  exception to sending heavy work to a listener, and it stays that way until the visual tests run on Kubernetes.
  A listener may still take single or targeted captures for a pull request; what it must not take is a **full
  set** keyed to a release.

## Every listener
- **A new batch in its `TASKS.md` is its instruction.** It starts it at once, without asking or waiting for the
  maintainer. "Wait for instructions" means: start nothing that is not in a batch. It never means waiting for him
  before running a batch.
- **Its branch watcher is always running in the background.** It starts the watcher again after every batch and
  after every reply to the maintainer, so a batch pushed while it was answering him is still picked up. If its
  Background tasks panel shows nothing running, it is not watching, and that is a fault.
- Watches the branch with **`tools/listen.sh <name>`** ([Checking in](#checking-in-who-is-up-and-can-take-work-25-october-2026)), one background command that also checks in every 30 minutes and exits on **any new commit** to its `TASKS.md` or this file
  (not on a change of content: a note added and removed between two polls must still wake it; [#2250](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2250)), for example
  `git fetch -q origin work-mailbox; old=$(git rev-parse origin/work-mailbox); until git fetch -q origin work-mailbox && [ -n "$(git log --format=%h $old..origin/work-mailbox -- <name>/TASKS.md DIRECTOR.md)" ]; do sleep 120; done`,
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

## Checking in: who is up and can take work (25 October 2026)

The maintainer asked that every machine, and every agent on it, check in regularly, so anyone can see at a glance
which are up and able to take work. Silence alone cannot say that (see [Saying when you will next be heard
from](#saying-when-you-will-next-be-heard-from)); a heartbeat that each one sets itself can.

- **Every listener runs `tools/listen.sh <name>` as its watcher**, in the background, in place of the hand-written
  `until` loop under [Every listener](#every-listener). It pushes `<name>/HEARTBEAT.md` at once and every 30 minutes
  while idle, and exits when a commit touches its `TASKS.md` or this file, as the old watcher did.
- **On starting a batch it runs `tools/heartbeat.sh <name> "running batch <n>" <minutes>`**, with the batch's expected
  time, and `tools/heartbeat.sh <name> idle` when it reports. Blocked on something it cannot clear (a prompt, a
  missing tool): `tools/heartbeat.sh <name> "blocked: <why>"`. Stopping: `tools/heartbeat.sh <name> stopped`.
- **The file is one participant's, written only by it**: its name, agent, machine (from its `STATUS.md`), state,
  whether it takes work, when it was seen and when it will next be (UTC; the roster shows Central). Commits are
  `<name>: heartbeat - <state>`, so a director's watcher can skip them.
- **Where each one runs, for RDP, is private.** `tools/heartbeat.sh` also writes the machine's host name and LAN addresses
  to `listeners/<name>.md` in the maintainer's **private** repository (the one that already holds his machine IP report),
  committed only when they change. **Never on this branch**: it is public, and CLAUDE.md keeps internal addresses out of it.
  A machine that cannot reach the private repository skips that part; its public heartbeat is unchanged.
- **Anyone runs `tools/roster.sh`** for the table: participant, agent, state, takes work, last seen (Central), and
  health - **up** (inside its own next time), **late** (past it, by how long), **gone** (two hours past), or **never
  checked in**. A director reads it before writing a batch, and gives work only to one that is **up** and takes work.
- **A heartbeat proves only that the session's background task is alive.** On 25 October the lab's ran every 30 minutes for
  three hours while the session sat in a wait that could never end, and read no note in that time. So the roster also shows
  **Last real push** (its `STATUS.md` or a report) and flags *stuck?* when a participant says it is running a batch and has
  pushed no work for 60 minutes. A listener in a long wait checks its `TASKS.md` for new notes at least every 30 minutes.
- **A participant that is late is chased as [When a listener stops](#when-a-listener-stops-or-goes-wrong) says.**
  The roster raises no alarm by itself; it makes the question a table to read.

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

Written by `work (aggiemap)` at 6:55 PM Central, 23 October 2026, as the maintainer left for home.
**`home` directs AggieMap for the weekend.** Nothing is running on any machine for AggieMap; nothing
is waiting on a build.

### The one live problem: the athletics maps on dev (#2209)

#2143 pointed the eleven athletics event maps at the republished development views. It merged
(`6a567ae8c`) and dev serves it. **8 of the 11 now list a layer that draws nothing**, because the new
dev views carry a different schema from the production services the definitions were written
against, so the column each definition filters on is not there. No error: the layer is in the legend
and comes back empty.

Two shapes:

- **The accessible layer lost `event` and `type`.** Production's has four fields (`objectid`, `id`,
  `type`, `event`); dev's has 34 and neither, and looks like a marker feed. Indoor track, outdoor
  track, soccer, softball, swimming, volleyball, women's basketball.
- **The lots layer lost the per-sport columns.** Production's carries 53 fields including one per
  sport; dev's carries 39 with none of them. Baseball (`baseball`), cross country (`trackxc`),
  women's basketball (`wbasketball`) - the three that filter their lots by sport.

16 columns, 9 maps. Tennis and both basketballs are healthy. **Production is healthy** - all 8
athletics routes pass `map-layers.spec.ts` there - which is why these views must not be promoted as
they are.

**Decided (the maintainer, 1A):** the GIS team adds the columns back, rather than the definitions
moving to the new schema. Rewriting the definitions would force production to republish the same
schema in the same window or break. The stale `development-only.ts` entry for
`TS/WomensBasketballParking/MapServer` is fixed in whichever pull request fixes the maps (his 2A).

The measurement is in the repository, merged, and is the thing to send the GIS team:

    https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/blob/development/docs/athletics-dev-views.md

It ends in five numbered questions for them. **Nothing moves until they answer**; there is no code
change to make on our side if the answer is that the columns are coming back.

**Do not capture #2143's "after" screenshots yet.** Its release note says they are still to be taken,
and dev currently draws the broken state - capturing now would put eight half-empty maps into the
notes. A full capture set can only be taken on `work` in any case; all 38 baselines live there.

### Also closed out today

- **UES Operations deploys again (#2214).** Its release required a build tag no build can carry, so
  every build was rejected and the release had no artifact. The filter is off, the stages are set
  (everything *Manual only* except the dev front end, production held by approval), and Release-514
  put build `20261023.40` on the dev site, confirmed by the bundle loading in the browser. Open: the
  UES IT team confirming that one host serving dev and prod on different ports is intended. Addresses
  and host names are on the maintainer's handoff page, not here - this branch is public.
- **#2210** - the documentation issue behind the file above. Merged as PR 2213.

### Open questions for the maintainer

None from AggieMap. Everything asked today was answered: #2209 High, #2210 Low, #2214 Medium, and the
decisions recorded above.

### What is waiting on whom

| Who | What |
| --- | --- |
| The GIS team | The five questions in `docs/athletics-dev-views.md`. Everything else waits on this |
| The maintainer | Sending them that link |
| Us | Nothing. No AggieMap release is pending |

### State

- **Production:** `36b962a04`, `prod-2026-10-22`, Release-490. Unchanged since Thursday.
- **`development`:** 49 commits past that tag, most of it GIS Day and the security chat's work.
- **Open AggieMap pull requests:** none. 2213 merged at 6:48 PM Central.
- **Everything else open** (2195, 2194, 2192, 2191, 2188, 2187) is the security chat's; 928, 691, 562
  and 381 are dormant community work. Leave the security ones alone.
- **The listeners:** `work-lab-leila` was on the security chat's batches this afternoon; its batch 52
  was the athletics check above. `codex-home` runs on the home machine.

### A note for whoever directs next

**Compare a service's fields per layer, never per service.** A definition filters one layer, so the
column has to exist on that layer. The first pass at #2209 unioned each service's fields across its
layers and reported two columns as missing on production that were present. The published table
checks each filter against its own layer, which is why it can be sent to the GIS team.

## Handover (gisday)

Written by `work` (GIS Day chat) at 5:00 PM Central, Sunday 25 October 2026, as the maintainer left for home. **The GIS Day
director is `home`** from when the maintainer speaks to it there; `work`'s GIS Day chat becomes a listener. (Home did not pick
up the 23 October handover; work directed GIS Day on 24 and 25 October because the maintainer worked from there.) Security and
vulnerability work is **not** GIS Day's: it belongs to the security chat on `work` ("js.monorepo - Security - CSA 305
Desktop"). File what you find, write "for the security chat", leave it unfixed. AggieMap has its own director. The lab
(`work-lab-leila`) takes any kind of batch; send work to it first.

### Production (both namespaces, `gisday` and `gisday-ucgis`)

- **Site `gisday-angular:sha-eab737d`, API `gisday-nest:sha-e9e416e`**, recorded in kubernetes-config #77 and #80 (merged).
  Rollback for the API: `sha-ee1a9e4`.
- 25 October: `sha-eab737d` (typeorm 1, Nx 24, the weekend's security work) went live at about 1:50 PM; **every session
  registration answered 500** (#2356, Urgent: typeorm 1 refuses a whole entity as a where value when a column is null). API
  rolled back to `sha-ee1a9e4` at about 2:40 PM (#78); the fix (PR 2360, lab batch 144, tests through typeorm itself) shipped as
  `sha-e9e416e` mid-afternoon (#80). The maintainer confirmed registration on production.
- **Do not promote `sha-e8ba974`** (auth0 7 and #2320, audited clear): the maintainer chose to promote **one** API image carrying
  PR 2375 (merged), #2205 and #2352 together.

### The next GIS Day release (the maintainer's decision, 25 October)

| What | State at 5:00 PM |
| --- | --- |
| PR 2375, bull's uuid (security chat) | merged |
| #2205, delete a sponsor that has a logo | **PR 2381 open**, waiting on the maintainer's merge (lab batches 59 and 147) |
| #2352, speaker photos resized on upload, decompression-bomb guard, script for existing photos | **PR 2382 open**, waiting on the maintainer's merge (lab batches 143 and 145; jimp, reviewed by the security chat) |
| auth0 7 (#2366) and Admin, Users lists everyone (#2320, PR 2370) | merged; in the same image |

When both PRs have merged and `gisday-nest` (and `gisday-angular`, built in the same run) are published for the merge commit:
1. Run `work/tools/gisday-release-check.cjs` and `gisday-release-check2.cjs` against the local stack on the **published API
   image** (a machine with `C:/TAMU/gisday-local/auth0-dev.local.env`: `work` or the lab; the dev test admin's profile is now
   complete, so registration is covered). Add a speaker photo upload and a crafted small file declaring huge dimensions
   (expect 413). Sponsor delete should now pass.
2. Send the image's sha to the security chat for its audit.
3. Give the maintainer the `set image` commands (API, and the site if it changed), `get deploy` in both namespaces, then check
   the four addresses and `GET /api/events/<session>/rsvps`, record it in kubernetes-config, and ask him to register on
   production.
4. **After it ships:** the maintainer runs `nx run gisday-nest:fit-speaker-photos` against production's uploads, dry run first,
   then `--apply` (originals are copied aside). Write him the exact commands for the uploads volume.

### Other open GIS Day work

- #2363 (Low): run the remaining provider specs on the query-checking data source, for a listener.
- #2196 closed (the local restore migrates). #2137 closed (fixed by #2180).
- The lab found that report 130's branch for #2352 is the one in PR 2382; batch 143's first jimp attempt (`sharp`) was discarded.

### Not in the repository (the maintainer's, on `work` only)

- Award nomination numbers: `C:\TAMU\gisday-local\gisday-award-numbers.md` and the reports and CSVs beside it (students,
  employers, industry guests and former students, prizes, sponsorship estimates, 2013-2026).
- The read-only production report scripts `gisday-impact-report*.ps1` in the same folder.

### Things not to relearn

- The production `gisday-angular` build overwrites a local `dist/apps/gisday-angular`; take signed-in local photos before it.
- Signed-in checks: Playwright on `--network container:gisday-dev` (or `container:gisday-site` for the Texas A&M site),
  `http://localhost:4201`, as the dev tenant's test admin. Navigate inside the app after signing in.
- typeorm 1: never pass a whole loaded entity as a where value or a delete criterion; use keys. The query-checking data source
  (`libs/gisday/platform/data-api/src/lib/_base/query-checking-data-source.ts`, with `recordWrites`) catches it in a unit test.
- Production strips nginx's `Server` header; check the nginx version on the image locally.
