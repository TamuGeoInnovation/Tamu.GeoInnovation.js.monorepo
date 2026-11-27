# Who directs

**Directors: AggieMap - work, its AggieMap chat (the maintainer moved it back at 3:35 PM Central, 26 October 2026; `home (aggiemap)` held it from 25 October 5:25 PM and queued batch 152, so it should stop writing `work-lab-leila/TASKS.md` for AggieMap); GIS Day - work, its GIS Day chat (taken back at 9:58 AM Central, Monday 26 October 2026, at the maintainer's word; home is a listener; see Handover (gisday), save point 23 November); security and vulnerability work (#2112, #2118, #1146's security parts, Dependabot, CodeQL and secret-scanning alerts, committed secrets) - work, the chat titled "js.monorepo - Security - CSA 305 Desktop"** (maintainer, 23 October 2026). All three run on the work machine; each writes only its own batches and asks him only about its own, so a listener's batch heading (`gisday:`, `aggiemap:`, `security:`) says which chat wrote it and where its questions go. `package.json` and `package-lock.json` are shared: a chat says so before changing either, and security bumps are the security chat's.

Each of the maintainer's machines runs a Claude Code session on this branch. **Each application has exactly one director at a
time; every other session listens.** The maintainer talks to the directors; the two are kept apart so that each chat's context
is one application's. Every session reads this file first, every time the branch changes.

## Two directors (20 October 2026)

The maintainer's decisions 1A, 2A and 3A:

- **One queue per listener.** A listener keeps one `TASKS.md`. Both directors append batches to it; **neither edits or removes
  the other's**. Every batch heading names its director and application, for example
  `## Batch 6 (aggiemap: ...)` or `## Batch 7 (gisday: ...)`, and batch numbers were the listener's, in one sequence -
  **replaced on 23 November 2026 by [Batch ids carry their director's letter](#batch-ids-carry-their-directors-letter-23-november-2026)**,
  because three directors picking "the next unused number" out of one file picked the same one.
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

## Dead code is deleted, features are parked, and neither is asked about (26 November 2026, the maintainer)

The maintainer: "I do want to get rid of actual dead code, but I don't want to remove features that we probably want to
come back." And: stop asking him about either. So, in the pull request that finds it:

- **A feature that might come back is parked.** It gave someone a capability: a page, a route that worked, an
  integration with a service, or an unfinished feature someone meant to finish. It went away for a reason outside the
  code: a retired service, an ended season, or work left unfinished. Park it:
  - a row in `docs/parked-code.md`;
  - an issue labelled `parked`, saying when to bring it back;
  - the director pushes the annotated `parked/<name>` tag on the last `development` commit that still holds it;
  - then remove the code.

  Examples: the bus timetable (#3704), the initial survey and its question types (#3713).
- **Actual dead code is deleted, with no tag and no row:**
  - stubs that were never implemented (a route that only throws 501);
  - general helpers nothing uses (pipes, converters);
  - unreachable branches, unused members, empty generated specs;
  - duplicates of something shared.

  Record each in #1899's done list, and say so in one line in the report.
- **When it's unclear whether it's a feature, park it.** Parking is cheap, and losing a feature isn't.
- **Code whose use can't be determined** (a public API, something read by name, a dynamic import) is neither: leave it, and note it in the report.
- **Never put any of this to the maintainer as a question.** Batches that said "never delete dead code; list it as potentially parked" now mean this section.
- **The running list is [#1899](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1899), and it has been since October.** A find that is not being acted on now goes there as a row and nothing else. Check it before writing anything new: on 26 November a director filed #3838 as "the one place dead code is collected" without noticing #1899 already was, and closed it again the same evening.
- **Do not build process, checks or registers mid-flight.** If something seems to need a rule, note it and ask whether it is wanted before writing it. The maintainer, 26 November: *"I just want to go through the issues, not create new problems, methods, and infrastructure inside the repo that I need to deal with right now. I am trying to get the issues down to zero and you keep making new things at every turn."* That applies to directors most of all.

## Issues are sorted by what it takes to close them (26 November 2026, the maintainer)

To close as many issues as possible, a director sorts its project's open issues by **what closing each needs**, not by topic:
- **(a)** already done, or no longer true: close now, with the evidence;
- **(b)** bugs the machines can fix;
- **(c)** cleanup and tests the machines can finish;
- **(d)** needs a decision from the maintainer;
- **(e)** needs work outside this repository (production, Auth0, the cluster, other sites);
- **(f)** yearly or future.

Workspace-wide issues on both projects aren't counted twice.

**(a) to (c) are worked without the maintainer.** **(d) to (f) get the `needs-maintainer` label, and their project Status is cleared**, which moves them into the board's "No Status" column, so **Todo shows only what the machines can close**. Don't add a Status option to do this: rewriting a single-select field's options can reset every item. And don't bring (d) or (e) to the maintainer unless he asks. His words: "I just want to fix bugs and close issues right now, not think about design decisions and have to implement things on other websites."

## Sorting a backlog so Todo holds only what a machine can close (26 November 2026, the maintainer)

**There is no script and no tool. It is three label-and-field decisions per issue, applied with `gh`.** Written here
because two directors needed the same procedure within an hour, and a procedure relayed twice drifts.

**Bugs only, for now.** The maintainer, 26 November: *"only bugs for now. then do [the triage] after we clear the
bugs"*, and *"I just want to fix bugs and close issues right now, not think about design decisions and have to
implement things on other websites."* Leave enhancements alone until he says.

### The six buckets, and the one question that sorts them

Ask **"what does it take to close this?"** — never what it is about. Topic grouping does not work on this list: on
AggieMap, keyword grouping left 128 of 236 unmatched and 51 of 73 bugs had no project in their title.

| | Bucket | What happens |
| --- | --- | --- |
| a | Already done, or no longer true | **Close now**, with the evidence in the comment |
| b | A bug a machine can fix | Leave in **Todo**. This is the queue |
| c | Cleanup or tests a machine can finish | Leave in **Todo** |
| d | Needs a decision from the maintainer | `needs-maintainer`, **Status cleared** |
| e | Nobody here can close it | `external`, **Status cleared** |
| f | Yearly, or for a future season | `needs-maintainer`, **Status cleared** |

Workspace-wide issues sitting on both projects are left out of the count, so the two directors do not both claim them.

### `external` and `needs-maintainer` are different axes, and both are needed

- **`external`** — *"Not ours to close: waits on the GIS team, the data, a vendor or another team."* A service that
  returns no geometry, data with the wrong building number, a routing network that does not publish a field, a field
  empty on every record. **The maintainer cannot fix these either**, so `needs-maintainer` would point at the wrong
  person. He asked for this label by name: *"make a new tag for things that are external so we know what is not ours to
  do."*
- **`needs-maintainer`** — he decides it, or he runs it. A symbology override (`docs/map-layers.md` makes that a
  deliberate act), cluster work, anything whose body opens with "what to decide first".

An issue can be neither and still not be a bug a machine can fix — then it is (c), and it stays in Todo.

### Deciding (e) without guessing

**The test is who holds the thing that is wrong.** If the fault is in a published service, in the data, or in a system
nobody here deploys, it is (e) however much of our code touches it. If our code mishandles a correct service, it is
(b). The trap is the one `CLAUDE.md` names four times over: a rename that *looks* like a fix and changes nothing a
visitor sees. Query the service before deciding, and if a field is missing or empty, that is (e) and it is filed for
the GIS team.

### The commands

Clearing Status moves an item into the board's **No Status** column, out of Todo. **Never rewrite the Status field's
options** — that can reset every item on the board.

```bash
R=TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo
gh issue edit <n> -R $R --add-label external          # or needs-maintainer
item=$(gh project item-add <project> --owner TamuGeoInnovation --url <issue url> --format json --jq .id)
gh project item-edit --id "$item" --project-id <project node id> --field-id <status field id> --clear
```

Project 2 (Texas A&M Aggiemap): project id `PVT_kwDOAC0_c84ABSmH`, Status field `PVTSSF_lADOAC0_c84ABSmHzgAwPnk`.
Project 3 (GIS Day Angular + NestJS): project id `PVT_kwDOAC0_c84ABTG-`, Status field `PVTSSF_lADOAC0_c84ABTG-zgAwiwM`.
`gh project field-list <n> --owner TamuGeoInnovation --format json` prints them if they ever change.

### Then work the survivors by area, not by picking issues

Once Todo holds only (b) and (c), batch a listener on **one library** and let it close that cluster in sequence — each
still its own pull request, but without relearning the code every time. AggieMap's trip planner had six of ours in one
library (#1856, #1933, #2608, #2723, #2763, #2846). Staleness checking then comes free: the listener is already reading
those issues, so (a) is found without a separate pass.

### What this is not

**Do not add a Status option, build a script, or write a new register for this.** The labels and the board already
exist. The maintainer, the same evening: *"I am trying to get the issues down to zero and you keep making new things at
every turn."*

## Never wait for a fix to merge: stack on it (26 November 2026, the maintainer)

**When work depends on another open branch, merge that branch into yours (in your worktree) and carry on.** That covers
a check that fails only because of something another open branch fixes, and code that has to land after someone
else's change. Then run the check, push, and say in `.pr-body.md` which pull request yours depends on and must merge
after. Once that one merges, your diff shrinks back to your own change.

**Never park finished work waiting for a fix to merge,** and never hold a batch "until PR N merges" when stacking would do.
On 26 November, 20 finished branches sat unopened for three hours behind one green docs pull request (3797), because
the director waited for it to merge instead of merging its branch into theirs. The maintainer: "Can't we use worktrees
so that you continue making work on top of fixes?"

A real hold is only for work that can't be built at all until something else exists. Even then, say what it waits
for, and do something else meanwhile.

## Announce every step, before and after (26 November 2026, the maintainer's 1A)

On 26 November all three machines were working, and for most of the afternoon it was impossible to tell. Three things went wrong:
- **The laptop** re-cut ArcGIS and pushed at 3:02 PM, but its `STATUS.md` still said "started 2:27 PM" an hour later. It looked frozen.
- **Home** waited about 20 minutes for an answer that was sent only as a direct message, which never reached it.
- **The lab** started work that had already been withdrawn, because the withdrawal arrived after it had begun.

The rules already asked for a push when a batch starts and finishes. Everything in between was silent. So:

1. **Announce every step, before and after.** Push a one-line commit to this branch, with the time read from PowerShell, never estimated:
   - when a step starts: `laptop: s10 - starting the release-tier smoke run, 3:05 PM`;
   - when it ends: `laptop: s10 - smoke Exit 0, 3:38 PM`.
   A step is anything that takes more than about a minute, or that someone might be waiting on: a full check, a smoke run, an install, a push, waiting on a question. Update `STATUS.md`'s **Running now** in the same commit. These are cheap, and they are what makes silence mean something.
2. **The director treats 20 minutes of silence as a problem to chase now.** If a machine has a running batch and has pushed nothing for 20 minutes, the director's watcher raises it, and the director asks. Whatever the answer, the listener says what it is doing, or that it is blocked, as in the section below.
3. **Answers and changes go in your `TASKS.md`, always.** A direct message may also be sent as a nudge, but `TASKS.md` is the record, and it is the channel every listener watches. A listener acts only on what is in its `TASKS.md`.
4. **Reread your `TASKS.md` before starting each step**, not only each batch. A change, a withdrawal or an answer can arrive mid-batch, and it has to be seen before the next step starts, not after.
5. **Use the words `tools/queued.sh` reads.** A batch is finished by a commit `<name>: batch <id> done`, and withdrawn or moved by a `TASKS.md` heading that contains `Batch <id>` together with `withdrawn`, `cancelled` or `moved`. Anything else leaves it looking queued, and the listener's watcher exits at once on every restart.

## A listener blocked on a prompt says so (24 November 2026, [#3429](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3429))

`home` stopped reporting at 11:36 AM Central and its `STATUS.md` said *"Nothing. Idle, listening."* It was
running the whole time, stopped on a permission prompt for `scripts/tidy.sh --yes`, waiting for a click nobody
knew to make. The AggieMap director read the silence as "not started", queued the quick tier that a production
release was waiting on into a mailbox nobody was reading, and twice told the maintainer to go start a session
that was already running.

**Blocked and never-started look identical** from outside: no heartbeat, no commits, and a `STATUS.md` whose
"Idle, listening" was true when it was written and is not any more. The listener is the only one that can tell
them apart, so it has to be the one that says.

- **Before you wait on an approval, say you are waiting.** Write `blocked: waiting on approval - <what>` under
  **Running now** in your `STATUS.md`, push a heartbeat with the same text, *then* wait. `work-lab-leila`
  already publishes `blocked: paused by the maintainer`, and that reads correctly at a glance; this is the same
  sentence for a different cause.
- **Put the time on your state.** "Idle, listening" with no timestamp reads as current four hours later.
- **A director treats a stale heartbeat as unknown, not as dead.** Say "has not reported since 11:36 AM", not
  "is not running", and check the heartbeat's **time** rather than the prose in `STATUS.md` - that prose is the
  least reliable of the three signals, because it is the one that keeps asserting something after it stops
  being true.

The prompt itself is not the fault. `tidy.sh --yes` removes worktrees and volumes and is worth approving. Only
the silence is.

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

## `work-lab-leila` is unreliable from 9 November 2026 (the maintainer, about 3:00 PM Central)

**Again from 23 November 2026, about 4:50 PM Central: paused, no new batches until the maintainer says so.** A student is
using the machine. His words: "let the lab finish what it is doing, then no more work until I say so. It may already be
unavailable. If you have been waiting for it to respond longer than you anticipated, abort the work there and start it
over elsewhere." Its last batches (194 to 198) were all reported before this, so nothing was left on it. Its work goes
to `home` and `laptop` instead.

**Somebody is sitting at that machine and its processes may be killed without warning.** The maintainer's words:
"It will be unreliable."

So until he says otherwise:

- **Do not give it a batch**, and do not count it when deciding whether work is covered.
- **Do not give it anything whose loss would cost something** - above all a long measurement, or the only copy of a
  decision. Its #2778 branch was half-built and unreported when this happened, which is exactly the exposure.
- **Test runs move to the work machine**, which is where [`CLAUDE.md`](../blob/development/CLAUDE.md) says they belong
  anyway: the home machine develops, the work machine runs the tests.
- **A branch it pushed is still good.** It is the session that is unreliable, not its work.

**The general rule this is an instance of:** when a machine becomes unreliable, the first thing to rescue is whatever
exists only in that session - a handover, an unreported branch, a measurement nobody else has. Code already pushed is
safe; what one session knows and has not written down is not.

## A local check that fails only at `npm audit signatures` is a pass (23 November 2026, the maintainer's 1A)

From **about 4:55 PM Central on 23 November**, every `scripts/check-in-volume.sh` run on the home machine and on
`laptop` exits **1** at its last step, `npm audit signatures`, with
`FETCH_ERROR ... invalid json response body at
https://registry.npmjs.org/-/npm/v1/attestations/oxc-parser@0.156.0`.

**It is not the branch, and it is not this repository.** Asked directly from either machine, that endpoint answers
**HTTP 200, `Content-Type: text/plain`, a four-byte body `OK`**, where npm expects JSON. `nx@22.1.0`'s attestations
from the same machine, the same minute, answer proper `application/json`, 14 KB. So it is one package's object, not a
block on us. `oxc-parser` has been on `development`'s lock since `1c54711f9` (Angular 22.2.6) and no branch here
changes it.

**GitHub Actions does not see it.** CI's own `npm audit signatures` verified the same lock at 4:40 PM on PR 3282
(1695 signatures, 457 attestations), and **Lint / Affected passed again on PR 3294 at about 7:00 PM**, while the home
machine still got the four-byte `OK` at that moment. Two machines here see it; the runners do not. That reads as a
bad object cached at whichever CDN edge serves this network, not a registry-wide outage.

So, until it clears:

- **A check whose Nx targets all passed and whose only failure is `npm audit signatures` counts as a pass.** Say so in
  the report, naming the step - never report a bare `Exit 1`, and never report it as a pass without naming it.
- **This is exactly why the rule is to read the log's own step lines**, not the exit code alone
  (the rule in this file about reading a check's own step lines). The script's `Exit N` cannot tell you which step failed.
- **No issue was filed**, at the maintainer's word: CI passes, so there is nothing in this repository to fix. If CI
  ever fails the same way, that changes and an issue is filed then.
- **Do not work around it** - no `--no-audit`, no editing the script to skip the step, no touching `.npmrc`. It is a
  real supply-chain check (#2293) and it will come back by itself.

## The machines

Each machine has a folder at the top of this branch, named after it, holding its `TASKS.md` (written only by the
director), its `STATUS.md` and its `reports/` (written only by that machine).

| Machine | Folder | Its job | Since |
| --- | --- | --- | --- |
| home | `home/` | Development: branches, agents, pull requests. It was **not** down on 23 October 2026: no chat on it was taking batches ([#2250](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2250)). One listener per machine since then: **the chat "js.monorepo - Home - Work Listener" is the only listener on `home`** (maintainer, 26 October 2026). The AggieMap and GIS Day chats on it run no listener; they direct their applications when the maintainer is there. Remote Control is on for all three | 18 October 2026 |
| work | `work/` | Testing: smoke tiers, screenshot sets, `dev-*` tags | 18 October 2026 |
| codex-home | `codex-home/` | OpenAI's Codex CLI, **on the home machine**: reviews and small, well-defined code jobs (unit tests, dead code), each as a branch for the director to turn into a PR. **It runs only when `home` is running.** On 23 October 2026 `home` could not be started, and two batches were queued here before anyone connected the two - its last push was 07:05. **Before queueing for `codex-home`, check that `home` is up** | 19 October 2026 |
| work-lab-leila | `work-lab-leila/` | **Any kind of batch** (the maintainer, 23 October 2026, correcting a director who read this row as testing-only): smoke tiers, screenshot sets, code, docs, investigations - whatever is waiting when it is idle. It is the largest machine, so give it what wants a machine to itself. **Its tasks are prioritised for vulnerability work at the moment.** 64 GB and 24 CPUs, the largest here. **No `gh` CLI**, so it opens no pull requests, posts no comments and sets no fields: it pushes branches and reports, and the director does the GitHub half | 20 October 2026 |
| laptop | `laptop/` | Development, any project (the maintainer, 23 November 2026): branches for GIS Day, AggieMap or security, whichever director sends them. 14 CPUs and about 15.4 GB for Docker, so the full affected check's `-m 16g` is at its limit: give it bug-fix checks and code, not tiers. `gh` and the fork set up; no SSH key, so **no kubernetes-config work**. Signed-in GIS Day checks wait until its GIS Day local is set up | 23 November 2026 |

**Every participant is named for the agent and the machine it runs on.** A Claude Code session is named for its machine
alone (`home`, `work`); any other agent is `<agent>-<machine>` (`codex-home`, `codex-work`). Each has its own folder of
that name, and its commits start with that name (`codex-home: started`). Two copies of one agent on different
machines are two participants, never one: they have separate task files, so the director never gives the same batch to
both, and each one's status says which machine is busy. Non-Claude agents read `CLAUDE.md` as their project
instructions too.

**A machine says what it cannot do - and checks its own record before saying it.** On 9 November 2026 this file
still said `work-lab-leila` had no `gh` CLI. Asked to comment on an issue, it repeated that row and drafted the comment
for the director to post instead. **It had had `gh` on PATH and signed in since 23 October**, as its own `STATUS.md`
said; the maintainer added the `project` scope on 9 November. Two things follow. A listener that believes it cannot do
something says so rather than skipping the step quietly, which it did and which was right. And **the first place to
check is its own `STATUS.md`, not this file** - a stale row here outlived the fact by two and a half weeks, and the
director repeated it too. Opening pull requests is still the director's, for every machine. Read the **What this is** section of a listener's `STATUS.md` before writing its
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

## Visible change comes first, always (9 November 2026, the maintainer)

**"Prioritize the visible change work, always."** When a director orders a queue, anything a visitor can see goes
ahead of anything they cannot — ahead of tests, checks, documentation, cleanup and tooling, and ahead of a higher
Priority field on an invisible issue.

The reason is what a release is for. A release carries visible change; everything else can follow in the next one at
no cost to anybody outside the team. A test that lands a day later costs nothing a visitor notices; a fix that misses
the release waits weeks.

**It outranks the Priority field when the two disagree.** An Urgent test and a High visible fix means the visible fix
goes first, and the director says so in the batch rather than quietly reordering.

**It does not mean shipping a visible change without its check.** A change's own red-first proof, its release-notes
entry and its screenshots are part of that change, not separate work to be deferred. What is deferred is standing
checks, sweeps and records that are not about the change in hand.

**Do not interrupt a run to reorder.** Let what is measuring finish — a half-finished measurement is wasted and
usually has to start again — then take the visible work next.

## A pull request opens with its screenshots, so CI runs once (15 November 2026, the maintainer's 1A and 2A)

On 15 November most open pull requests were red for the same two reasons, and each cost a second CI run: a PR opened
before its screenshots existed fails "Has before/after images" until they are pushed, and a PR stacked on another
conflicts once the one below merges.

1. **The builder pushes the branch; the PR waits for its screenshots.** A change with a visible result is reported
   "branch ready" with its `.pr-body.md`, then the machine that can sign in (the lab) captures before/after on that
   branch and pushes them. **Only then** does the director update it with `development` and open the PR. One CI run,
   green the first time. A change with no visible result opens at once.
2. **Later (the maintainer's 1B):** the home machine gets a signed-in local site, once the maintainer is at it, so it
   takes its own screenshots before it pushes. Until then, 1 applies.
3. **Stack only when both are needed soon.** When the PR underneath merges, the director updates the one on top with
   `development` at once, before its screenshots are taken, so it rebuilds once, not twice.

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

## Nothing waits on a machine the maintainer cannot reach (23 November 2026, the maintainer)

**The maintainer cannot reach the home machine** (or any listener he is not sitting at), so no result may wait there for
him to push or merge, and no director gives him a command to run there. A listener pushes what it makes where the
director can reach it:

- **Monorepo branches:** to the fork, as before.
- **Anything it cannot push itself** (its permission check refused a kubernetes-config push, for one): it says so in its
  report and stops. It never sends the commits on for another session to push: that would get around the refusal. The
  director asks the maintainer, who decides where the work is redone (#3239's migration script, 23 November).
- **Kubernetes-config work goes to the work machine** (the maintainer's 2A, 23 November): the home machine cannot push there,
  and he cannot reach it, so a director never gives home a kubernetes-config script. Home does monorepo work.

## Every listener
- **A new batch in its `TASKS.md` is its instruction.** It starts it at once, without asking or waiting for the
  maintainer. "Wait for instructions" means: start nothing that is not in a batch. It never means waiting for him
  before running a batch.
- **A Claude chat listener also runs a 30-minute wake-up, as a backstop** (the maintainer, 25 October 2026, 8:25 PM). A
  background watcher only helps if its completion starts a turn; on 25 October `home`'s watcher exited at 9:16 AM and no turn ran
  for ten and a half hours. So a listening chat also schedules a recurring check in its own session (Claude Code's scheduled
  tasks or `/loop`, every 30 minutes) that pulls `work-mailbox`, does any new batch, and restarts `tools/listen.sh` if it is not
  running. A non-Claude listener gets the same from `tools/agent-runner.ps1`.
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
- **Never pauses to wait for an answer** (the maintainer, 15 November 2026). A question goes to the director, in the
  report or in a message to the director's session, and the listener carries straight on: with the same batch on its
  recommended option where that is safe and undoable, otherwise with the next part or the next batch. It never asks the
  maintainer in its own chat, even about something it won't do on a relayed instruction; it tells the director that,
  and the director takes it to him and acts on his answer. On 15 November `home` asked him directly about a CLAUDE.md
  change, and he restated the rule: workers send questions to the director, and he answers them there.
- Files issues **without a priority**; its report suggests one, and the director sets it from its own best estimate (below).
- Records ideas, possible work and things noticed under **Findings** in its `STATUS.md`. A finding is never a
  request and is never acted on until a batch asks for it; the director reads them and brings any worth doing
  to the maintainer. Batches not reached yet go under **Queued**, never mixed with findings.
- If the maintainer does tell it something, it does only that, and records it at once in its `STATUS.md` under
  **Told directly**, so the director never asks him again.

Every commit on this branch starts with the name of the machine that made it (`home:`, `work:`, ...), so each
session can tell its own pushes from the others'.

## Questions have ids, and an owner (24 November 2026, the maintainer's 1A on home's proposal)

On 24 November `home` carried 13 questions in its own chat, four of them already settled, because nothing said when a
question had been taken. So:

1. **Every question a worker raises has an id, `Q-<batch>-<n>`** (for example `Q-g107-1`), and is written in its report
   under **Questions for the director**, and only there.
2. **The director acknowledges by id.** Its next batch to that worker, or a one-line commit to the worker's `TASKS.md`,
   lists every id it has taken as `Asked` or `Decided: <answer>`. Once an id is acknowledged the worker drops it and
   never carries it again.
3. **A question unacknowledged after one batch is re-sent once**, by message, to the director that wrote the batch.
   The worker still never takes it to the maintainer.
4. **Its owner is the director whose batch raised it**, including a machine chore found during that batch (disk,
   long paths, old containers): AggieMap's for an `a` batch, GIS Day's for a `g` batch.
5. **A listener's chat shows the maintainer no questions.** His preference that a reply end with its open questions is
   for directors' chats, not listeners'.
6. **The one exception:** something the maintainer told a worker himself (for example "start nothing until I say
   Docker is back") is confirmed with him, in that worker's chat, because no director can answer it for him. It is
   recorded under **Told directly** as before.

## An issue is claimed when its batch is written (24 November 2026, [#3443](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3443))

On 24 November two directors queued #3337 to two machines one minute apart, with the same branch name. Batch letters stop two
directors picking the same batch number; nothing stopped them picking the same **issue**, because a batch is only visible in a
`TASKS.md`, and an issue's own fields said nothing about who had just queued it. So:

1. **Before writing a batch for an issue, read its project Status.** In Progress means someone has it: ask that director, by
   message, before taking it.
2. **When the batch is written, set the issue's project Status to In Progress at once**, in every project it is on, not when the
   branch is pushed. It is the same call directors already make, moved earlier.
3. **A batch for another director's application says so in its heading**, as a14 did ("written by `work (gisday)` under the
   AggieMap director's letter, at its request"), and is only written after asking that director. Its questions go to the owner.

## No pull request opens until `scripts/pre-pr-check.sh` exits 0 (25 November 2026, the maintainer's 1A, [#3508](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3508))

A listener's "branch ready" now means **`scripts/pre-pr-check.sh <branch> '<title>' .pr-body.md [projects]` exited 0**, docs-only
changes included, and its last line is in the report and in `.pr-body.md`. It runs the pull-request checks on the drafted title and body
(title format, a closing reference, a release-notes entry or `no-visible-change`, before/after images), the scripts' and tools' suites when
touched, and `scripts/check-in-volume.sh`. The director that opens the pull request runs it again after merging `development` in. On
24 November several pull requests opened red for things this catches: a docs change nobody checked, and a body with only `Refs #N`.

**A test that fails on a pull request that did not touch its project is flaky**, not that pull request's fault: file it and fix it that day,
proven by running it many times before and after (the maintainer's 2A, #3506). Re-running it and moving on is how one flaky test turns every
pull request red at random.

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

## The coordinator, and who directs what (25 October 2026, evening)

The maintainer decided: **one coordinator and project leads.** `PROJECTS.md` says who directs each project and who the coordinator is; it
is the single answer to "who is doing what where", and a handover is a one-line change there in the same commit as the handover notes.

- **The coordinator** owns what the projects share: the order of lab batches, the lock-file queue (one `package-lock.json` PR "next" at a
  time), which listener gets which work, and **every question to the maintainer**, asked once as one numbered list across all projects.
  It does no project work itself. Its start is `coordinator/START.md`.
- **Project leads** (AggieMap, GIS Day, security, visual testing) do their project's work, write their batches and pull requests, ask the
  coordinator for lab time and lock-queue slots, and send it their questions with options and a recommendation.
- **Batch headings name project, issue and director**, always: `` ## Batch <id> (<project>: #<issue> - <what>; <date, time> Central, from `<director>`) ``,
  where `<id>` is the project's letter and that project's own number for this listener - `a9`, `g7`, `s7`
  ([Batch ids carry their director's letter](#batch-ids-carry-their-directors-letter-23-november-2026)).
  `tools/board.sh` reads them, with the listeners' own commit subjects, into one board of who is doing what.

## No machine idle beside work (8 November 2026, the maintainer's 1A-4A)

Four ways machines sat idle, or work was done twice, in one week, and the rule for each:

| What happened | The rule now |
| --- | --- |
| A batch written while a listener was busy waited, because the watcher woke only on the next new commit | **`tools/listen.sh` exits at start, and whenever the list changes, if `tools/queued.sh <name>` lists anything.** A listener does every batch it names before going idle again |
| The lab was offline six days (31 October to 6 November) and Copilot failed every run for days, and nobody noticed | **Whichever director the maintainer next asks anything runs `bash tools/roster.sh` first** and deals with what it flags, before other work: `gone`, `stuck?`, **`IDLE WITH WORK WAITING`** (wake it: a one-line note in its `TASKS.md`), **`BLOCKED`** (tell the maintainer what the state says) |
| Copilot showed "idle, takes work" while it exited 1 at every start | **`tools/agent-runner.ps1` counts a non-zero exit as a failure.** After three, the heartbeat says `blocked: <agent> exits <code> at start; see the log <file>`, and the roster shows BLOCKED |
| Two finished batches were redone on other machines, and a director then waited two days on reports it had missed | **Before moving, re-queuing or chasing a batch, read `bash tools/queued.sh <name>` (or `tools/board.sh`), never the log by eye.** Moving a batch means marking it `WITHDRAWN, moved to <name> batch <n>` in the old file first, in the same commit as the new one |
| A batch was queued but told not to start until another pull request merged. `tools/queued.sh` called it `queued`, and `tools/listen.sh` exits the moment anything is queued, so every listener restart fired at once and spun on work it had been told to leave alone | **A gated batch carries a line of its own that opens `Held until PR <n> merges`.** `tools/queued.sh` then reports it `held`, checks that pull request on GitHub, and releases it to `queued` by itself the moment it merges - so the gate opens with nobody awake. `tools/listen.sh` never offers a held batch |
| Two directors each wrote a batch 7 into `laptop/TASKS.md`, the listener reported "finished batch 7", and `tools/queued.sh` dropped both - so security's #3265 waited, invisible, until the listener said so in a commit of its own | **Batch ids carry their director's letter** ([below](#batch-ids-carry-their-directors-letter-23-november-2026)), and `tools/queued.sh` judges a shared id only by the reports that name its director |

`tools/queued.sh <name> [days]` lists that listener's batches from the last 7 days that it hasn't reported done: `queued` if nothing
has named it, `unfinished` if it started, `held` if it is waiting on a pull request. A batch heading needs its date ("8 November 2026")
to be counted, as the batch-heading rule already asks.

**Gating a batch on another pull request: give it a line of its own.** Anywhere in the batch, a line that *opens* with
`Held until PR <n> merges` (or `Hold until`, or `Only once ... PR <n> ...`; a bullet and bold marks before it are fine) makes
`tools/queued.sh` report that batch `held` instead of `queued`, with the reason in brackets, and `tools/listen.sh` never offers it.
The pull request is looked up on GitHub each time the list is read, so **the gate opens by itself the moment it merges** - the
listener picks the batch up on its next check without anybody being awake to release it. The marker has to open the line so that an
ordinary mention cannot park a machine: "Do not touch PR 3591's branch" is not a hold. Saying it only in the heading's prose, as
`- **after g116, and only once #602's pull request has merged**` did on 25 November, is a note to a reader and nothing a tool can
act on. If GitHub cannot be asked, or the pull request was closed without merging, the batch stays held and says which - starting
work early is the harm this prevents, and a parked machine shows up in `tools/roster.sh` while a wrongly started one does not.

## Batch ids carry their director's letter (23 November 2026)

The maintainer's 2A: **prefix batch numbers by director.** Three directors write one `TASKS.md`, each reading it and taking the next
unused number, so they take the same one. On 23 November `laptop` held two batch 7s and `home` two 77s and two 78s. That is not a
tidiness problem: a listener reports `batch 7 done`, and the number cannot say which of two batches is finished.

- **An id is the project word's own first letter, then that project's own number for this listener**: `a9` for aggiemap's ninth
  batch to that machine, `g7` for GIS Day's seventh, `s7` for security's, `v`, `c` and `w` for visual testing, coordination and
  workspace. The letter is the first letter of the project word the heading already carries, so there is nothing extra to
  remember and nothing that can disagree with it.
- **A director counts only its own batches** for that listener. `a9` and `g9` are different batches and that is fine; nobody writes
  or says a bare number any more.
- **The listener reports the id as written**: `laptop: batch a9 done`, never `batch 9 done`.
- **Numbers already written stay as they are.** A bare number is still a valid id, because every batch before today has one; a
  director does not renumber a batch, its own or anyone else's, and never one a listener may already be running.
- **While both kinds are live, `tools/queued.sh` judges a shared id only by the reports that name its director** (`home: security
  batch 77 done`), lists both batches with their directors, and says `and no report says which` when nothing attributes it. So an
  unattributed report over-reports one batch rather than losing one. `bash tools/queued.test.sh` covers all of it;
  `tools/board.sh` reads the letters but does **not** judge per director, so `queued.sh` is what says what is outstanding.
- **A listener that is given two batches with one number says so** in a progress push, as `laptop` did
  (`security's batch 7 is still queued though queued.sh drops it`) - which is the only reason anyone noticed.

**`grep -i` together with `-F` aborts in Git Bash** (GNU grep 3.0, exit 134, "core dumped"), and inside a `-q` test or a
`|| true` it reads as "no match". Either flag alone is fine. The first fix for the above was written with `grep -iF` and
silently matched nothing, which looked exactly like the bug it was meant to fix. Use `grep -iE`. The test asserts no tool
uses the combination.

## Working unsupervised overnight (23 November 2026, the maintainer's question at about 9:20 PM Central)

The maintainer told all three directors - AggieMap, GIS Day and security - to keep working across `work`, `laptop` and
`home` while he slept, then asked whether that was a mistake and whether each machine should take one project instead.

**It is not a mistake, and one project per machine would be worse.** A listener already runs one batch at a time and one
heavy run at a time, so three directors writing to one `TASKS.md` costs nothing in contention: the listener serializes
them. Partitioning by project would instead strand work, because the projects are not the same size on any given night
and the machines are not interchangeable - on 23 November `laptop` held the signed-in GIS Day stack that two GIS Day
batches needed and `home` did not.

What actually breaks when nobody is watching is specific and short. These four rules are the whole of it.

1. **One lock file at a time, and it is security's.** No AggieMap or GIS Day batch touches `package.json` or
   `package-lock.json` overnight. This is the one interaction here that loses work *silently*: when the lock conflicts,
   `npm install --package-lock-only` rebuilds it from `package.json` and keeps whatever is already locked, so anything a
   branch updated only in the lock goes back to the other side's version **and every check still passes, because nothing
   is broken, only not updated**. On 23 October that quietly undid half of PR 2125 - `axios`, `jws`, `koa`, `node-forge`
   and the critical `websocket-driver` ([#2112](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2112)).
   Nobody notices that at 3 AM. CLAUDE.md already says security bumps are the security chat's; overnight it is absolute.
2. **One release or full smoke tier at a time, across all three machines.** The tier that clears a build takes a machine
   to itself, and two at once is what makes the paint check time out
   ([#1716](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1716)). A director says in the
   batch which machine is running one; everyone else uses `one <spec>` or `quick` instead.
3. **New work goes to the shortest LISTENER queue, read rather than assumed.** Before writing a batch, run
   `bash tools/queued.sh` for every listener, not only the one you had in mind. Each director keeping its own listener
   "two batches ahead" is what produced `laptop` eight deep and `home` with one outstanding on 23 November, with no
   single director doing anything wrong. Moving a batch still means marking the old one
   `WITHDRAWN, moved to <name> batch <id>` in the same commit as the new one.

   **`work` is not one of those queues.** It is where all three director chats run, it is not listening (see the listener
   table), and on any night one of us is likely running a tier or a check on it. An empty `work` queue is not spare
   capacity, and work moved there is work taken off a machine that could have started it now. The first reading of this
   rule on 23 November sent two listeners' batches to `work`, which then had to wait 45 minutes for a release tier to
   finish - the wording's fault, not the reader's. A director doing a job itself is still fine when the job needs this
   machine; what is not fine is treating `work` as the idle machine.

4. **Prove an old issue is still open before building anything for it, and say in the batch what you checked.** There are
   258 open AggieMap issues and 359 in all, many of them months old, and the board cannot tell you which have quietly been
   handled. On 23 November, in one evening: [#2838](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2838)
   (a batch id collision) was fixed by that evening's own work; [#3268](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3268)
   had been fixed at 12:58 PM the same day and left open; the `docs/2828-work-in-flight-10-november` branch was superseded
   in full by PR 2840, and the 19 lines it still had of its own were all *wrong*; and a director recorded a branch for
   #2758 that had never existed. Three open issues also carry a project status of **Done** (#2719, #2716, #2672).

   The check is a minute's work and it is specific. Before writing or taking a batch for an issue filed more than a few
   days ago:

   - **Read the issue's own thread to the end**, not only its body. The comment saying it was handled is usually there.
   - **Look for the change on `development`**: `git log origin/development --grep=<issue>`, and for mailbox tooling,
     `git log origin/work-mailbox -- tools/<file>`. Never `git log --all --grep` in a big checkout here - it segfaults.
   - **Check whether a sibling issue replaced it.** CLAUDE.md's own reuse section records #2581 making game-day refresh one
     switch and #2591 sweeping up the rest, which is the shape that leaves an older issue describing work nobody will do.
   - **Then look at the code or the service**, not the issue's description of it. "Ask the service before you change a
     definition" is the same rule: four faults in one week read as a field rename and none was.

   **If it is already done, close it with the commit that did it and say so in your report; do not build it again.** If it
   is partly done, say which part in the issue before starting. A batch that rebuilds finished work costs twice: the
   machine's night, and the reviewer's morning spent working out why a pull request changes nothing.

**What is safe and needs no rule:** every director opening pull requests. Azure's required `Monorepo` check does not run
on the lab - it passed at 6:42 PM Central on 23 November, nearly two hours after the lab was paused - so pull requests
opened overnight still get their required check and are mergeable in the morning. Two pull requests touching
`docs/releases/unreleased/` cannot conflict either: that directory exists so each change brings its own file
([#2037](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2037)).

**Two files still conflict if two of us edit them, so say so in the batch when you must:** `docs/testing.md`'s counts,
the Total line above all (#2002), and `test/smoke/aggiemap/environments.json`'s allowed-failure lists.

**The lab (`work-lab-leila`) stays paused** until the maintainer says otherwise - a student is using the machine. Do not
give it a batch and do not count it when deciding whether work is covered.

**Priority: set it from your best estimate, and never ask** (the maintainer, 25 November 2026: "please assign a priority
using your best estimate and don't ask me"; #3527). Urgent: production broken now. High: blocks other work, or a visible
fault. Medium: a real fault, or a step of planned work. Low: tidying, nice to have. The director that files the issue, or
that receives a listener's, sets it at once, says which value and why in its reply, and he corrects any he disagrees with.

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
- **A non-Claude listener (Copilot CLI, Codex CLI) is started by `tools/agent-runner.ps1`, not by itself** (the maintainer, 25 October 2026). A chat
  agent does nothing between messages, and a background watcher cannot wake it: copilot-home sat idle for 37 hours with batches waiting. The runner, started
  once in its own PowerShell window on the agent's machine, watches `work-mailbox`, starts the agent non-interactively for each new commit to its `TASKS.md`
  or this file (Copilot with `copilot -p … --allow-all-tools` and the deny list; Codex with `codex exec --full-auto`), re-runs it while batches are left,
  and checks in for it. Its logs are in `%LOCALAPPDATA%\tamu-agent-runner\logs\`. The machine must not sleep while plugged in.
- **Progress every 15 minutes while a batch runs, not just an estimate at the start** (the maintainer, 27 October
  2026). `tools/heartbeat.sh <name> "running batch <n>" <minutes>` takes the batch's *expected length*, so a long
  batch said "next update by 4:30 PM" an hour and a half ahead and meant only "I expect to finish by then". The
  maintainer read it as how often he would hear anything, and he wants to hear a great deal more often than that.

  So **while a batch is running, push a line to your own `STATUS.md` at least every 15 minutes**, saying what you
  are doing now and what has finished - not what you expect. A one-line push is enough:

  ```
  Progress (3:12 PM): check running since 3:04; red-first spec written and failing as intended.
  ```

  Keep the expected-finish estimate as well; it is useful. The two answer different questions, and only the
  progress line tells anyone whether a batch is moving. The roster's *stuck?* flag at 60 minutes is the backstop,
  not the target: by then four progress lines are already missing.

  **A listener driven by `tools/agent-runner.ps1`** (Copilot CLI, Codex CLI) runs non-interactively and cannot be
  woken mid-run, but it can still push as it goes: write the progress line whenever you finish a step, rather than
  gathering everything for the final report.

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

### Save point: Tuesday 24 November 2026, about 8:45 PM Central (the GIS Day release, paused until tomorrow)

- **Ready:** images `sha-41cabe7` for `gisday-angular` and `gisday-nest` (development at 41cabe78e: everything merged through PR 3447, the Papers page). kubernetes-config PRs 167 (`migrate-prod-3269.ps1`) and 168 (`migrate-prod-3019.ps1`) are merged; both scripts are copied to the maintainer's `C:\TAMU\gisday-local`.
- **Running on production, both namespaces:** `sha-35bcf80` for both deployments. That is the rollback target. The manifests in kubernetes-config still say `sha-80b4769`, so step 7 (record it) is overdue.
- **Stopped at:** the 3019 dry run. The maintainer's production admin account is locked out (`net use` gives system error 1909), so the database refused the sign-in; nothing was changed. The network and the script are fine (port 1433 answers). He chose to leave the release until tomorrow (1C).
- **Tomorrow:** the account unlocked, and whatever locked it found. Then the PROD window, the two dry runs (both namespaces each), the reports read, `-Apply` for 3019 then 3269, promote `gisday-nest` then `gisday-angular` to `sha-41cabe7` in both namespaces, the site check, and a kubernetes-config PR pinning `sha-41cabe7` with `sha-35bcf80` as the rollback target.

### Save point: Monday 23 November 2026, about 8:40 AM Central (the GIS Day director on `work`, before a reboot)

**Production, both namespaces:** site `gisday-angular:sha-fa3b8bc` (PR 3231, #3230, rolled out about 8:20 AM today), API
`gisday-nest:sha-f4fd0d1`. Site rollback target `sha-7a735e8`. PR 3242 (#3241) updates the production table.

**PRs open, all the maintainer's to merge once CI is green:**
- **PR 3240 (#3238, Medium):** the impact report. The counting and its definitions are in
  `libs/gisday/platform/data-api/src/lib/impact-report/`, and the script is `apps/gisday-nest/src/scripts/impact-report.ts`.
  Full check exit 0 on `fed682112`. Worktree `C:\TAMU\wt-3238`.
- **kubernetes-config PR 162:** `6. GIS Day/data/impact-report.ps1`, the read-only runner. Worktree `C:\TAMU\kc-3238`.
  The maintainer ran it twice today. The second run's output, counts only, is in
  `C:\TAMU\kc-3238\6. GIS Day\data\impact-report\` (untracked: the two JSON files and two CSVs). The comparison with
  2025's report is on #3238.
- **PR 3242 (#3241, Low):** the production table names `sha-fa3b8bc`. Check exit 0.

**In flight:**
- **#3208 (Medium, the director):** the presenter cards are 350 px wide, so a session's page is 11 px too wide on a
  360 px phone. Branch `fix/3208-presenter-card-width` (worktree `C:\TAMU\wt-vgi-counts`; the folder was first made for
  the VGI counts). It holds a WIP smoke test in `test/smoke/gisday/smoke.spec.ts`, which is **not yet red for the right
  reason**. The Sessions and Presenters pages open their entries by script, with no links, and waiting for the
  `events/by-day` answer timed out on production. Next, find the API call the Sessions page really makes. The fix
  itself is planned: `presenter-card.component.scss`, `:host { display: block; width: 25rem; max-width: 100%;
  min-width: 0 }` and `.presenter-item { width: 100%; box-sizing: border-box }`.
- **Home, batch 69:** #3239 (Medium), a Winners section on the homepage. The decisions are on the issue: an admin picker
  from the season's submissions, a new table, gisday.tamu.edu only, made-up names only.
- **Home, batch 68, done:** `fix/3189-email-preview-reason` (c76e51530) and `fix/3219-checked-in-heading` (f3bcdceee),
  both on the fork. The PRs open after the lab's images.
- **The lab:** batch 193 (#3189 and #3219 images), then 194 (#3208 before and after images).
- **#3227 (AggieMap bus stops on dev):** handed to the AggieMap chat.
- **Closed today:** #3237 (Escape on the full-screen QR code; it already worked).
- **Still open:** the VGI submission counts (Dan said 1B, 2A, 3A, 4A; the issue isn't filed yet). The VGI dashboard
  `/admin/dashboards/vgi` already shows a total and an "All types" row, so ask Dan whether that is enough before
  building.
- Dan's own items: clear his test score of 34; set up the real judges, rubrics and Ask to judge.

**26 October, 9:58 AM Central: the maintainer made `work` (its GIS Day chat) the GIS Day director again.** Home is a listener.
The handover below, written for home on 25 October, is what work picks up from.

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
   the four addresses and `GET /api/events/<session>/rsvps`, and record it in kubernetes-config. **Do not ask him to register
   on production after every release** (his decision, 26 October): the release check covers registration on the published
   image, and the public count covers the lookup on production. Ask only when a release changes the registration or
   sign-in code (`user-rsvp`, auth, Auth0 management, or the site's sign-in).
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
