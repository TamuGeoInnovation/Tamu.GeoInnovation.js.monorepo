# Event dates

Do the maps' `eventDates` still match what the athletics site publishes?

```bash
node tools/event-dates/check.mjs            # every map with a 12thman schedule
node tools/event-dates/check.mjs --all      # and the maps whose dates come from elsewhere
node tools/event-dates/check.mjs --json     # the same as JSON, for a scheduled run
```

Exit code 1 if anything is stale or disagrees, 0 otherwise, so it can run unattended and only speak up
when there is something to do.

## Why this exists

On 20 October 2026, **eighteen live maps had every `eventDates` entry in the past**. Each one shows
visitors a "This event has passed" dialog over the map. It came to light because one of them — Women's
Basketball — happened to be looked at for an unrelated reason, thirteen days before that season started
([#2019][2019]). Nothing would have found the other seventeen, and nothing would have found this one
either if a different bug had not led someone to the same map.

The dates are rolled over by hand each season, so they go stale quietly and on their own schedule.

## What it does, and what it deliberately does not

**It reports. It changes nothing.** A wrong parse that rewrote a definition would put wrong dates on a
live map, which is worse than the problem it set out to fix. Someone reads the table and makes the
change.

**Home games only.** Each game carries its venue on the date element
(`schedule-event-date--venue-home|away|neutral`); only `home` is collected. Away games are counted and
discarded. **Neutral-site games are discarded too** — the Florida Gulf Classic in Naples, for instance.
That is a judgement rather than a fact: these are parking maps, and a game played elsewhere needs no
parking here. If that is ever wrong for a particular sport, it is `parseSchedule` that decides it.

**It reads the definitions as text, not by importing them.** Importing pulls the Angular dependency
graph into a plain Node process, which fails on the JIT compiler and then on bundler-only module
resolution — `test/smoke/aggiemap/global-setup.ts` hits the same wall and reads them the same way. The
consequence: a definition that *computes* its dates or its schedule URL is invisible. `tailgating` is
exactly that (`scheduleUrl: FootballParkingConfiguration.scheduleUrl`) and is reported as unreadable
rather than skipped quietly.

## Two things that will catch you out

**The site serves a different page without a user-agent.** A plain `curl` gets about 63 KB with no
schedule in it at all; with a user-agent the same URL returns about 650 KB containing the season. A
naive version of this tool would have reported "no home games" for every sport and looked completely
plausible doing it. `fetchSchedule` sends a user-agent, and **throws when a page contains no games of
any kind** rather than returning an empty list — "we could not read this" and "this team has no home
games" must not look the same.

**Three schedule pages are shared by two maps each**, because `scheduleUrl` means *where a visitor finds
the schedule*, not *these are my dates*:

| Page | Maps |
| --- | --- |
| `football/schedule` | `football-parking`, `maroon-white-game` |
| `softball/schedule` | `softball-parking`, `softball-regionals` |
| `track-and-field/schedule` | `indoor-track-parking`, `outdoor-track-parking` |

Which published dates belong to which map cannot be told from the page, so a difference there is
reported as *needs a person* and does not fail the run. Without that, the spring Maroon & White game
would be told to adopt all seven of the autumn football home dates.

## What it found on its first run, 21 October 2026

`football-parking` **matched 7 of 7** — the check that the comparison itself is sound. Everything else
disagreed:

- **`womens-basketball`**: 13 dates, all from last season, against 18 published for 2026-27.
- **`baseball-parking`**: 35 dates, all from the season that ended in May, against 34 published.
- **`mens-basketball`**: 19 against 19, but **four on the wrong day** — the definition has 2027-01-13,
  01-27, 02-03 and 02-24; the site publishes 01-12, 01-26, 02-02 and 02-23, and the definition's dates
  do not appear on the schedule at all. Checked by hand against the page before being believed, because
  four same-size one-day shifts look much more like a parser bug than like four rescheduled games.
- **`tennis-parking`** (2 against 12), **`swimming-parking`** (0 against 5), **`softball-parking`** and
  both **track** maps (0 dates recorded at all).

Also found: `womens-basketball.definitions.ts` contains `'2026-01-1'`, a date missing a digit, which has
been parsing by luck. The tool keeps such dates **as written** in its report rather than normalising
them, so they stay visible.

## When to run it

Before a season starts, and whenever a map is reported as saying an event has passed. It takes a few
seconds and makes one request per sport.

[2019]: https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2019
