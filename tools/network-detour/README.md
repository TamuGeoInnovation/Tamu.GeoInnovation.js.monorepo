# Network detour: routes against the straight line

Nothing else checks whether the campus routing network is right. When the network has a missing
connection, a wrong one-way or a disconnected island, the trip planner still draws a route, and that
route is wrong. Until now the only way anyone found out was by noticing it
([#659](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/659),
[#2592](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2592)).

A network fault leaves a measurable signature. The route between two buildings comes out far longer than
the straight line between them, or there is no route at all. This tool asks the routing service for
routes between pairs of buildings and compares each route with the straight line. It then reports the
pairs that are too long and the pairs that cannot be routed
([#2655](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2655)).

**It tests development only.** The network (`developmentRoutingBaseUrl` in `connections.ts`) is
published on the development GIS server alone, and production has no routing service. The trip planner
is development-only for the same reason. Every run says this in its first line and in its run file, so a
run is never taken for a test of production.

```bash
MSYS_NO_PATHCONV=1 docker run --rm -v "C:/TAMU/<checkout>:/repo" -w /repo node:24.22.1 \
  node tools/network-detour/run.mjs quick
```

## The tiers

Use the smallest tier that answers the question, as with [the smoke suite](../../test/smoke/aggiemap/README.md#the-three-tiers).

| Tier                          | What it asks                                                                                                                                                     | How long                    | When                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------- |
| `quick`                       | The pairs in [`quick-pairs.json`](quick-pairs.json): a stratified spread across distance bands, every pair a run has flagged, and pairs a person would ask about | Under a minute              | After any network republish, and in a pull request that touches routing                  |
| `full`                        | Every building with coordinates to every other: 779 buildings, 303,031 pairs on foot                                                                             | About 2¼ hours at 8 workers | To find faults nobody has a reason to look for, and to compare one publish with the next |
| `one <building> [<building>]` | One building against every other, or one pair. A building is named by OBJECTID or abbreviation                                                                   | Seconds                     | To chase one report                                                                      |
| `sample`                      | Prints a fresh seeded, stratified sample in the shape of `quick-pairs.json`                                                                                      | Seconds                     | Only when rebuilding the quick set                                                       |

`full` is resumable. Each batch is appended to `runs/<id>/progress.jsonl` as soon as it finishes, and a
run started again with the same `--id` skips what is already there. A four-hour run that loses everything
to one timeout would never be run a second time.

| Flag                   | What it does                                                                                                                                                                                                                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--mode`               | `Walk` (default), `Bike`, `Bus`, `Drive` or `Walk_ADA`. `Drive` pairs are ordered, because the network has a `One Way` restriction and A to B is a different question from B to A. The other modes' pairs are unordered. A mode the service no longer publishes stops the run, since that is a finding (#2592) |
| `--network`            | Another `NAServer/Route` URL, so one network publish can be measured against the next                                                                                                                                                                                                                          |
| `--compare <run.json>` | After the run, lists the detours and unreachable pairs that are new or gone since that earlier run                                                                                                                                                                                                             |
| `--threshold`          | The ratio part of the detour allowance (default `1.8`)                                                                                                                                                                                                                                                         |
| `--slack`              | The fixed part of the detour allowance, in metres (default `250`)                                                                                                                                                                                                                                              |
| `--workers`            | Batches in flight at once (default `4`). `8` ran the full tier at about 38 pairs a second, 2¼ hours, on 6 November 2026                                                                                                                                                                                        |
| `--batch`              | Pairs per request (default `100`)                                                                                                                                                                                                                                                                              |
| `--id`                 | The run's folder under `runs/`. Defaults to `<date>-<tier>-<mode>`. Reuse it to resume                                                                                                                                                                                                                         |

Each run writes `runs/<id>/run.json`: the bands, the islands, the unreachable pairs, the impossible
results, the buildings most often in a detour and the detours worst first, with the network, the mode and
the threshold that produced them. Rows name buildings by `OBJECTID`, with each name given once under
`names`, one row to a line. That file is the record: commit it with the work it measures, so two runs
can be compared. A resumed run says how many pairs it found already measured (`resumedFrom`), because
its `elapsedSeconds` covers only the rest. `progress.jsonl` holds every pair and stays out of git.

## Reading a run

- **Impossible** results come first and are never good news. A route cannot be shorter than the straight
  line. If one is, the measurement or the coordinates are wrong. Pairs only a few dozen metres apart can
  show this when both buildings snap to the same stretch of path, so read the distances before
  concluding anything.
- **Buildings most often in a detour** come before the detours themselves. A building that is fenced,
  gated or reached by one long road shows up in hundreds of detours, and the detour list is then the same
  building over and over.
- **Detours** are routes longer than `threshold × straight + slack`. The allowance loosens for short
  lines on purpose. 50 m of detour is a ratio of 1.25 on a 200 m line and 1.025 on a 2 km one, so a flat
  ratio would fill the report with neighbours separated by a road and bury the real faults. Each detour is
  listed with its **excess metres** beside its ratio, worst excess first. On 5 November 2026 the issue's
  sample of the walking network put its worst pair at 2.59 on a 201 m line and none below 1.0. The full
  run of 6 November found 1,067 below 1.0: 753 of them on lines under 250 m, the snapping described
  above, and 314 longer, which are worth a look.
- **Islands**: buildings that reach only each other, or nothing at all. Every pair that routes joins its
  two buildings into one piece of network, and every piece but the largest is an island. That is a
  disconnected building or a cut-off stretch of network, a different fault from a pair that cannot be
  joined, so an island's failed pairs are not listed one by one. It takes two failed pairs to put a
  building on an island, so a `one` run of a single pair never does. This list is the one to send to the
  GIS team. The full run of 6 November 2026 found 11: one of five buildings, one of two, and nine alone.
- **Other pairs with no route** are listed with the server's own words, for example
  `No route for "1146-1143" from location "1146" to location "1143".  No solution found.`

## How it keeps from lying to itself

The service fails in ways that look like success, so the tool checks its own bookkeeping on every batch:

- **Routes are joined to pairs by `RouteName`, never by position.** A pair that cannot be routed is left
  out of the answer with no error. Zipping the answer against the input would hand every route after
  the first gap to the wrong pair. That would be a confident, wrong number, the same shape as #2631.
- **Every pair the fast pass dropped is asked again on its own** with `ignoreInvalidLocations=false`,
  which makes the server say why.
- **The counts must add up.** Pairs sent must equal routes back plus pairs explained. If they don't, the
  run stops and names the pairs nobody accounted for. A route with no name, a name that was not sent, or
  a pair answered twice stops it too.
- **Buildings are keyed by `OBJECTID`, not `Abbrev`.** Only 377 of the 779 have an abbreviation, so a
  tool keyed on it would cover half the campus while looking complete. Because a basemap republish can
  renumber `OBJECTID`s, each pair in `quick-pairs.json` keeps the abbreviation and name its buildings
  had. A pair that no longer matches stops the run rather than testing two different buildings.

`node --test tools/network-detour/*.test.mjs` covers this logic on fixture responses, and
`tools-tests.yml` runs it on every pull request.

## Growing the quick set

When `full` or `one` flags a pair, add it to `quick-pairs.json` with a `why`. That is how a found fault
stays found. The quick set is the regression test, and it is only as good as what has been put in it.

## When not to use it

- **To clear production.** There is nothing on production for it to test.
- **To judge one route's directions.** It measures length only. A route of the right length can still
  have bad directions, and #659-style turn-by-turn problems need the trip planner itself.
