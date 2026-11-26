import * as fs from 'fs';
import * as path from 'path';

import type { MapManifest } from './global-setup';

/**
 * Builder destinations, so the maps behind a builder are tested rather than skipped.
 *
 * Eleven maps cannot be reached by URL: `/events/:eventId` redirects into a builder and
 * `/events/:eventId/map` redirects back until a selection is made. `tools/builder-inventory` walks
 * those builders and records a share URL for every combination. Until now nothing read the file, so
 * those maps were skipped on every run and their layers were never checked. See #1088.
 *
 * **One representative per distinct layer set, not one per destination.** The inventory holds 360
 * destinations across 11 maps, and they collapse to 11 distinct layer sets - `/parking/move-in` alone
 * has 324 destinations that all land on the same page with the same layers, differing only in the
 * query string. Testing all of them would add hours to a nightly run to ask the same question 324
 * times. Grouping by layer signature rather than taking the first means a builder that ever does
 * produce a genuinely different layer set gets covered without anyone noticing it needs to be.
 *
 * The visual suites cannot use this shortcut: the choices change which features are drawn, so those
 * destinations are genuinely different pictures even when the layer set matches. See #1089.
 *
 * Shared by `maps.spec.ts` and `map-layers.spec.ts`, which load the same representatives (#2467).
 *
 * **Borrowed on another environment (#1134).** The inventory is crawled on dev. Its destinations are paths, and
 * right after a release production runs the same build, so they reach the same maps there: on 28 October every
 * one of dev's twelve did, and the baseball map went red on production for the two faults it then had (#2500,
 * #2510). Ignoring the inventory there skipped those maps instead, so the faults passed. So on an environment
 * other than the one it was crawled on the inventory is still read, each destination is marked with where it was
 * recorded, the log says which inventory is in use, and a destination that does not land is skipped with a note
 * rather than failed: between releases a builder choice can exist on one environment and not yet the other, and
 * a check that goes red for that is one people learn to read past (#2507).
 */
/** A destination to load, and `borrowedFrom`: the environment it was recorded on, where that is not this one. */
export interface BuilderTarget {
  target: string;
  label: string;
  borrowedFrom?: string;
}

interface InventoryDestination {
  shareTarget: string;
  landedAt: string;
  layers?: string[];
  stepsTaken?: { step: string; chosenLabel: string }[];
}

interface InventoryMap {
  route: string;
  destinations: InventoryDestination[];
}

interface BuilderInventory {
  baseUrl: string;
  capturedAt: string;
  maps: InventoryMap[];
}

const INVENTORY_PATH = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'tools',
  'builder-inventory',
  'builder-inventory.generated.json'
);

/** A recorded destination, as `BuilderTarget` gives it, with the layers it was recorded drawing. */
export interface BuilderDestination extends BuilderTarget {
  layers: string[];
}

/** The inventory as this run reads it: every map it recorded, by route, and where it was recorded if not here. */
export interface BuilderDestinations {
  /** Every map the inventory recorded, by route, with all its destinations in the order recorded; some have none. */
  byRoute: Map<string, BuilderDestination[]>;
  borrowedFrom?: string;
  capturedAt?: string;
}

/**
 * The one reader of `tools/builder-inventory` (#3474). The smoke suite used to read the file in two places with two
 * declarations of its shape, and only one of them knew a destination could be borrowed. Which destinations each use
 * loads is still its own choice: `loadBuilderTargets` takes one per layer set, and `servedRoutes` every one or the first
 * per map, since where a map opens can change with the builder choices even when its layers do not.
 */
export function readBuilderDestinations(manifest: MapManifest): BuilderDestinations {
  if (!fs.existsSync(INVENTORY_PATH)) {
    return { byRoute: new Map() };
  }

  const inventory: BuilderInventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));

  // An inventory captured against a different environment describes a different site, so it is never read
  // as this one's: that is how the committed file once came to describe production while being read as dev's
  // (it was crawled at `127.0.0.1`, which `TestingService` treats as production). It is borrowed instead,
  // and says so, so that a production failure found through dev's destinations is never mistaken for one
  // found through production's own (#1134).
  const borrowedFrom = inventory.baseUrl === manifest.baseUrl ? undefined : inventory.baseUrl;

  const byRoute = new Map(
    inventory.maps.map((map): [string, BuilderDestination[]] => [
      map.route,
      map.destinations.map((destination) => ({
        target: destination.shareTarget,
        label: (destination.stepsTaken ?? []).map((s) => s.chosenLabel).join(' / ') || 'default',
        ...(borrowedFrom === undefined ? {} : { borrowedFrom }),
        layers: destination.layers ?? []
      }))
    ])
  );

  return { byRoute, borrowedFrom, capturedAt: inventory.capturedAt };
}

/** By map route, the destinations to load for it, each with the choices that reach it; empty where none apply. */
export function loadBuilderTargets(manifest: MapManifest): Map<string, BuilderTarget[]> {
  const { byRoute, borrowedFrom, capturedAt } = readBuilderDestinations(manifest);

  if (borrowedFrom !== undefined) {
    console.warn(
      `[smoke] builder inventory was captured against ${borrowedFrom} (${capturedAt}); this run targets ` +
        `${manifest.baseUrl}, so its destinations are borrowed: one that does not reach its map here is skipped, ` +
        `not failed (#1134). Re-run tools/builder-inventory against this environment for destinations of its own.`
    );
  }

  const targets = new Map<string, BuilderTarget[]>();

  for (const [route, destinations] of byRoute) {
    const seen = new Set<string>();
    const picked: BuilderTarget[] = [];

    for (const { layers, ...target } of destinations) {
      const signature = [...layers].sort().join('|');

      if (seen.has(signature)) {
        continue;
      }

      seen.add(signature);
      picked.push(target);
    }

    if (picked.length > 0) {
      targets.set(route, picked);
    }
  }

  return targets;
}
