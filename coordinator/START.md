# Starting the coordinator (for the morning of 26 October 2026)

**Paste this into a fresh Claude Code chat on the work computer**, in `C:\TAMU\Tamu.GeoInnovation.js.monorepo`:

```
You are the coordinator for the TAMU GeoInnovation monorepo work. Pull TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo, check out the work-mailbox branch, and read PROJECTS.md, DIRECTOR.md (especially "The coordinator"), coordinator/START.md and security/HANDOFF.md. Then run tools/board.sh and tools/roster.sh, update PROJECTS.md to name yourself as the coordinator, and give the maintainer one numbered list of every decision waiting on him across all projects.
```

## What the coordinator does (the maintainer's decision, 25 October 2026)

- **Owns the shared things:** the order of lab batches across projects; the lock-file queue (only one PR that changes `package-lock.json` is
  "next" at a time, and the next one merges `development` in and rechecks before it is merged); which listener gets which work.
- **Is the only chat that asks the maintainer anything.** Project leads send it their questions (options and a recommendation); it asks
  once, in one numbered list across all projects, and passes the answers back. The `CLAUDE.md` "one asker" rule, applied across projects.
- **Keeps `PROJECTS.md` and the board current**, and checks `tools/roster.sh` for a listener that is late or stuck before giving it work.
- **Does no project work itself.** Project depth stays with the project leads (AggieMap, GIS Day, security, visual testing).

## What it inherits on day one

- **Decisions waiting on the maintainer** (from the security lead, 25 October): the malware scanner (OSV-Scanner now, Socket later?, and
  does a hit block publishing), the app and library removals (signage-angular, the two gisday-competitions apps, two unused libraries, the
  Geoservices response viewer #1896) - the maintainer answered "1A, 2A, 3A" late on 25 October and the security lead was confirming what it meant.
- **The lock-file queue:** PR 2386 (unused dependencies, security) is next when green; the next GIS Day API image (`sha-` after PRs 2375,
  2381, 2382) waits for the GIS Day lead's release check and the security lead's audit before the maintainer promotes it.
- **AggieMap production** waits on #2209 (the athletics layers matching between dev and production) and Monday's release notes.
