# Parked code: deleted, expected back

**Code that was deleted because the thing it talked to went away, and that we expect to want again.**

The code itself lives in git history, on a `parked/*` tag. This page is how anybody finds out that it exists at all,
because a commit inside a closed pull request is not findable by someone who does not already know it is there — which
is the whole problem this page solves.

## Why the code is not kept in the repository

Code that nothing calls cannot stay healthy. Compiled, every upgrade has to keep it building and every dead-code sweep
flags it again; not compiled, it rots silently. And the usual reason for parking something is that it calls a retired
service, which is a trap for the next person reading it — exactly what
[#3657](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3657) removed.

So the history keeps the code and this page keeps the knowledge.

## What restoring one actually involves

**A parked entry is not code to paste back.** It was written against the libraries of its day, and whatever replaces the
service it called will not have the same shapes. What a tag preserves is the **working out** — the decisions, the
derivations, the edge cases someone already solved. Expect to rewrite it and to be glad you did not have to re-derive
it.

## The register

Three ways to find anything here: this page, `git tag -l "parked/*"`, and the issue list filtered by the `parked` label.
`scripts/check-parked-code.mjs` fails when they disagree, so none of the three can quietly go stale.

| Tag | What it was | Why it went | What has to be true to bring it back | Issue |
| --- | --- | --- | --- | --- |
| `parked/bus-api` | The trip planner's bus timetable and live buses: route waypoints, stops, a timetable for a date, live bus positions, and the map annotation that drew them. About 774 lines in `libs/maps/feature/trip-planner/src/lib/services/transportation/bus/bus.service.ts` and the nine interfaces and three caches reachable only from it. | Its API, `nodes.geoservices.tamu.edu/api/route`, is retired and answers nothing. The code read as a working integration, so the next person to add a bus feature would have called it and got a failure with no visible cause. Removed in [#3657](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3657). | Access to Transportation Services' bus data again: something that answers route waypoints, stops, a timetable for a given date, and live bus positions. The old base URL will not come back under that name. | [#3704](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3704) |

## Reading a parked entry

```bash
git tag -l "parked/*"                                   # everything parked
git show parked/bus-api                                 # why it was parked, from the tag itself
git checkout parked/bus-api -- <path from the register>  # bring a file back to look at
```

`git show` works because every `parked/*` tag is annotated and carries its own explanation. That is deliberate: a clone
with no access to this repository's issues still tells you what you are looking at.

**`git checkout <tag> -- <path>` writes the file into your working tree.** It does not change the branch, and
`git checkout HEAD -- <path>` or `git restore <path>` puts it back.

## Adding an entry

In the **same pull request as the deletion**, so the record and the removal go in together — the lesson of
[#1132](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/1132), where notes written afterwards
went in without their images and had to be chased.

1. **Tag the last commit that still has the code**, annotated, with why it went and how to read it:
   `git tag -a parked/<name> <commit> -F <file>`, then `git push origin parked/<name>`. Tag **before** the deletion
   merges, while a commit containing the code is still on `development` — then `check-parked-code.mjs` passes on the
   pull request that adds the row.
2. **Open an issue**, labelled `parked`, naming the condition for bringing it back. That is what surfaces when the
   condition is met, which this page will not do by itself.
3. **Add the row here**, naming the tag and the issue.

What not to do: delete first and tag afterwards. Once the deletion is on `development`, finding the right commit means
reading a closed pull request's history — the situation this page exists to avoid.
