import * as fs from 'fs';
import * as path from 'path';

import { EventDefinitions } from './all.definitions';

/**
 * Every recorded builder destination still names a choice its event offers (#2823).
 *
 * Thirteen AggieMap maps cannot be reached by URL: `/events/:eventId` redirects to the builder, and `/events/:eventId/map`
 * redirects back until a selection is made. So `tools/builder-inventory` walks each builder and records the share URL
 * each combination lands on, and those recordings are the only targets the smoke suite and the framing baseline have
 * for those maps.
 *
 * **A recording is a fact about the definitions at the moment it was taken, kept in a different file.** Nothing
 * connected the two. On 8 November #2759 moved Fall Commencement from December 2025 to 11 and 12 December 2026 - the
 * right fix, and complete in itself - and the recordings went on naming `date=2025-12-17` and `date=2025-12-18`, dates
 * the builder no longer offers. A link naming a choice that no longer exists does not fail cleanly: the builder cannot
 * resolve it, so it asks again, and the spec that opened the link waits for a map on a page that is showing a chooser.
 * Three checks failed that way in the 9 November release run, 45 minutes apart, and each read as a different fault.
 *
 * **Why the check belongs here and not in the smoke suite.** The suite only runs against a deployed environment, so it
 * reports this hours after the merge that caused it, as a map failure rather than a stale recording. This runs in
 * `nx test ts-events-ngx`, and that project is affected by any change to a definition - so the pull request that moves
 * a date fails its own unit test, before review, naming the file to regenerate. The person changing the dates is the
 * person holding the context.
 *
 * **What it does not check.** That a recorded destination still *draws* what it drew - layers, framing, titles - is the
 * smoke suite's job and needs a browser. This checks only that the choices encoded in the link still exist, which is
 * the part knowable from the definitions alone.
 */
describe('Recorded builder destinations (#2823)', () => {
  const repoRoot = path.join(__dirname, '../../../../../../..');

  /** The generated inventory, read where it is kept rather than copied: comparing it with the definitions is the point. */
  const inventory = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'tools/builder-inventory/builder-inventory.generated.json'), 'utf8')
  ) as {
    maps: Array<{ route: string; destinations: Array<{ shareTarget: string }> }>;
  };

  /**
   * The smoke suite's recorded zoom and centre per path. The entries are under `routes`, beside `capturedAt` and
   * `viewport` - reading the top level instead finds no paths at all and passes while checking nothing.
   */
  const framingBaseline = JSON.parse(
    fs.readFileSync(path.join(repoRoot, 'test/smoke/aggiemap/framing-baseline.json'), 'utf8')
  ) as { routes: Record<string, unknown> };

  /**
   * `{ 'graduation-fall': { date: Set { '2026-12-11T06:00:00.000Z', ... } } }` - every choice each builder step offers.
   *
   * Keyed by `configuration.id`, which is the last segment of the route the inventory records. A builder lives under
   * `/events/` or under `/parking/`, so matching on `/events/` alone misses every parking builder - which is 326 of
   * the 364 recorded destinations.
   */
  const offeredByEvent = new Map<string, Map<string, Set<string>>>();

  for (const definition of EventDefinitions) {
    const id = definition.configuration?.id;

    if (!id || !definition.options) {
      continue;
    }

    offeredByEvent.set(
      id,
      new Map(
        definition.options.map((option) => [option.value, new Set(option.choices.map(({ value }) => String(value)))])
      )
    );
  }

  /** The id of the map a recorded route belongs to: `/parking/move-in` -> `move-in`. */
  function eventIdOf(route: string): string {
    const segments = route.split('/').filter(Boolean);

    return segments[segments.length - 1] ?? route;
  }

  it('name only choices their builder still offers', () => {
    const stale = inventory.maps.flatMap((map) => {
      const eventId = eventIdOf(map.route);
      const offered = offeredByEvent.get(eventId);

      if (!offered) {
        return [`${map.route}: recorded, but no event definition with id "${eventId}" declares any choices`];
      }

      // One line per map rather than per destination: move-in alone has 324, and a failure nobody can read through is
      // a failure nobody acts on. The count and one example are what identify the fault; the file to regenerate is the
      // same either way.
      const bad = map.destinations.flatMap((destination) => {
        const query = destination.shareTarget.includes('?')
          ? destination.shareTarget.slice(destination.shareTarget.indexOf('?') + 1)
          : '';

        return [...new URLSearchParams(query).entries()].flatMap(([name, value]) => {
          const choices = offered.get(name);

          if (!choices) {
            return [`step "${name}" no longer exists`];
          }

          if (!choices.has(value)) {
            return [`${name}=${value}, now offers ${[...choices].join(', ')}`];
          }

          return [];
        });
      });

      if (bad.length === 0) {
        return [];
      }

      return [
        `${map.route}: ${bad.length} of ${map.destinations.length} recorded destination(s) name a choice that is gone - e.g. ${bad[0]} - regenerate tools/builder-inventory`
      ];
    });

    expect(
      stale,
      'these recorded builder links name choices that no longer exist, so they open the builder instead of the map'
    ).toEqual([]);
  });

  it('cover every choice their builder offers', () => {
    // The other direction, and the one that is silent: a choice *added* since the walk leaves a destination nothing
    // opens. `november-ring-day` offered one day on 28 September and two by 10 November, so for six weeks the suite
    // tested one of its two destinations and no check could tell. Per step rather than per combination - move-in's
    // three steps make 324 of those, and a step's choices appearing somewhere is what says the walk was complete.
    const missing = inventory.maps.flatMap((map) => {
      const eventId = eventIdOf(map.route);
      const offered = offeredByEvent.get(eventId);

      if (!offered) {
        return [];
      }

      const recorded = new Map<string, Set<string>>();

      for (const destination of map.destinations) {
        const query = destination.shareTarget.includes('?')
          ? destination.shareTarget.slice(destination.shareTarget.indexOf('?') + 1)
          : '';

        for (const [name, value] of new URLSearchParams(query).entries()) {
          const values = recorded.get(name) ?? new Set<string>();

          values.add(value);
          recorded.set(name, values);
        }
      }

      return [...offered.entries()].flatMap(([step, choices]) => {
        const seen = recorded.get(step) ?? new Set<string>();
        const unrecorded = [...choices].filter((choice) => !seen.has(choice));

        if (unrecorded.length === 0) {
          return [];
        }

        return [
          `${map.route}: step "${step}" offers ${unrecorded.length} choice(s) no recorded destination uses - ${unrecorded.join(', ')} - regenerate tools/builder-inventory`
        ];
      });
    });

    expect(missing, 'these builder choices have no recorded destination, so nothing opens the map they lead to').toEqual(
      []
    );
  });

  it('are the paths the framing baseline measures', () => {
    // The two files are regenerated by different commands, so one can be updated and the other left. A framing entry
    // for a path no recording lands on is measuring something nothing opens.
    const recorded = new Set(
      inventory.maps.flatMap((map) => map.destinations.map((destination) => destination.shareTarget))
    );

    const orphaned = Object.keys(framingBaseline.routes).filter(
      (framedPath) => framedPath.includes('?') && !recorded.has(framedPath)
    );

    expect(
      orphaned.length === 0 ? [] : [`${orphaned.length} orphaned, e.g. ${orphaned.slice(0, 3).join(' | ')}`],
      'the framing baseline measures these builder paths, but no recorded destination lands on them'
    ).toEqual([]);
  });
});
