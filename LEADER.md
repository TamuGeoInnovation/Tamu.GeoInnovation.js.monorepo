# Who leads

**Leader: home** (since 18 October 2026, 3:00 PM Central)

Both of the maintainer's machines run a Claude Code session on this branch. **At any time exactly one leads and
the other listens.** The maintainer talks to the leader. Read this file first, every time the branch changes.

## The leader
- Is the only session that asks the maintainer anything, and the only one that takes instructions from him.
- Writes the listener's task file, `<listener>/TASKS.md`, with each batch and a **Decided** list of his answers.
- Watches the branch and reads the listener's `STATUS.md` and reports as they land, so he relays nothing.
- Commits start with `<machine>:` of the machine it runs on (`home:` or `work:`), like every commit here.

## The listener
- Watches the branch (one background command that exits when it changes), and does each new batch in
  `<listener>/TASKS.md`: pushes `<machine>: started` to `<listener>/STATUS.md` before it starts, a report in
  `<listener>/reports/` and `<machine>: finished` when it ends, then watches again.
- **Never asks the maintainer anything, never offers or suggests work, and takes no decisions from him.** Each
  turn ends with a one-line status. Questions go in its report under **Questions for the leader**, with options
  and a recommendation.
- Files issues **without a priority**; its report suggests one, and the leader asks.
- If the maintainer does tell it something, it does only that, and records it at once in its `STATUS.md` under
  **Told directly**, so the leader never asks him again.

## The machines' jobs do not change with the lead
The home machine develops (branches, agents, pull requests); the work machine tests (smoke tiers, captures,
tags). A batch for home is development work; a batch for work is testing. Whichever leads writes the other's.

## Handing over
The maintainer tells the **current leader**: "hand over to work" (or "to home"). The leader then:
1. finishes or parks what it is doing, and writes **Handover** below: what is in flight, the open questions
   (numbered, with recommendations), what is waiting on whom, and what comes next;
2. changes the first line to the new leader, with the time, and pushes;
3. becomes the listener: watches `<itself>/TASKS.md`.

The listener is watching, so it sees the change within minutes and takes the lead: it reads **Handover**, tells
the maintainer it leads, and asks him the open questions. He does not need to paste anything; if the listener's
session was closed, the start line is the same for both machines:

    Pull TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, check out the work-mailbox branch, and do what LEADER.md says.

## Stopping
A `## Stop` heading in a listener's `TASKS.md` stops that listener: it writes `Stopped at <time>` in its
`STATUS.md`, pushes, and ends. The leader adds it when the maintainer says the day's work is done.

## Handover

(Written by the leader when it hands over. Empty while no handover is in progress.)
