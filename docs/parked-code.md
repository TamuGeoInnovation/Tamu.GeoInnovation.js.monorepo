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
| `parked/initial-survey` | GIS Day's unfinished initial survey for signed-in visitors: the account page that drew one input per question type, its front-end service, the API serving the questions (controller, provider, module), and the survey and question entities with `user_info.hasCompletedInitialSurvey`. In `libs/gisday/platform/ngx/core/src/lib/pages/account/pages/initial-survey/`, `libs/gisday/platform/data-api/src/lib/initial-survey/` and `all.entity.ts`. | Never finished: answers could not be saved, nothing linked to the page, and its provider had four known defects ([#990](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/990)). Removed in [#3667](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3667), with a migration that drops its tables. | GIS Day decides to survey its participants, as [#464](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/464) asks for the 2027 competition. Saving answers still has to be built, and #990's defects fixed. | [#3713](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3713) |
| `parked/season-day-writes` | GIS Day's `POST season-days` and `PATCH season-days/:guid` in `libs/gisday/platform/data-api/src/lib/season-day/season-day.controller.ts`: guarded (`create:season-days`, `update:season-days`) but never implemented, answering 501. | Season days are created and changed through their season (`PATCH seasons/:guid`), nothing called these, and a route that can only fail is a trap (as [#3635](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3635) was). Removed on the maintainer's decision, [#3793](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3793) question 3. | A page needs to create or change a single season day outside its season's form. Only the shape and permissions are kept; there was no working code. | [#3796](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3796) |

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

1. **Open an issue**, labelled `parked`, naming the condition for bringing it back. That is what surfaces when the
   condition is met, which this page will not do by itself.
2. **Add the row here**, naming the tag and the issue, and let the pull request merge.
3. **Then tag, immediately**, annotated, with why the code went and how to read it. The commit you want is the merge
   commit's **first parent** — the last commit on `development` that still had the code:

   ```bash
   git tag -a parked/<name> "$(git rev-parse <the merge commit>^)" -F <file>
   git push origin parked/<name>
   ```

**Row first, then tag.** This was the other way round until
[#3717](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/3717), which said to tag before the
deletion merged, on the grounds that finding the commit afterwards meant reading a closed pull request's history. That
reason was wrong: `git rev-parse <merge>^` is the commit, and it takes a second. Tagging first, meanwhile, opened a
window the length of a whole pull-request cycle in which a `parked/*` tag existed with no row — and because **tags are
global and a row is not**, `check-parked-code.mjs` then failed on every branch anybody pushed, for a reason unconnected
to their change. It did, for 33 minutes, on the second entry ever added to this page.

Tagging straight after the merge makes that window as short as the next command. `check-parked-code.mjs` also tolerates
a disagreement younger than a day now — it warns and passes — so neither order can break the repository while somebody
is part-way through these three steps. Past a day it fails, because a park nobody recorded is the drift this page exists
to catch.
