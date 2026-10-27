import * as fs from 'fs';
import * as path from 'path';

import { MapManifest } from './global-setup';

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
 */
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

const INVENTORY_PATH = path.join(__dirname, '..', '..', '..', 'tools', 'builder-inventory', 'builder-inventory.generated.json');

/** By map route, the destinations to load for it, each with the choices that reach it; empty where none apply. */
export function loadBuilderTargets(manifest: MapManifest): Map<string, { target: string; label: string }[]> {
  const byRoute = new Map<string, { target: string; label: string }[]>();

  if (!fs.existsSync(INVENTORY_PATH)) {
    return byRoute;
  }

  const inventory: BuilderInventory = JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));

  // An inventory captured against a different environment describes a different site. Using one
  // anyway is how the committed file came to describe production while being read as dev's: it was
  // crawled at `127.0.0.1`, which `TestingService` treats as production because the host contains
  // neither `dev` nor `localhost`.
  if (inventory.baseUrl !== manifest.baseUrl) {
    console.warn(
      `[smoke] builder inventory was captured against ${inventory.baseUrl} but this run targets ` +
        `${manifest.baseUrl}; ignoring it, so builder-gated maps will be skipped. Re-run ` +
        `tools/builder-inventory against this environment.`
    );

    return byRoute;
  }

  for (const map of inventory.maps) {
    const seen = new Set<string>();
    const picked: { target: string; label: string }[] = [];

    for (const destination of map.destinations) {
      const signature = [...(destination.layers ?? [])].sort().join('|');

      if (seen.has(signature)) {
        continue;
      }

      seen.add(signature);
      picked.push({
        target: destination.shareTarget,
        label: (destination.stepsTaken ?? []).map((s) => s.chosenLabel).join(' / ') || 'default'
      });
    }

    if (picked.length > 0) {
      byRoute.set(map.route, picked);
    }
  }

  return byRoute;
}
