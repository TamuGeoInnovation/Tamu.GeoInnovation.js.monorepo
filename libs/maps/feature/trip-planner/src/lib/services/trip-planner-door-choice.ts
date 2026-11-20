import { distanceInMetres } from '@tamu-gisc/common/utils/geometry';

/**
 * A latitude and longitude in degrees, as a door and a trip stop hold them.
 */
export interface DoorPoint {
  latitude?: number;
  longitude?: number;
}

/**
 * How many doors are tried before giving up and leaving the stop where it was (#2843).
 *
 * Each try is a routing request, so this bounds what a trip to a building with many doors costs. Four covers every
 * building met so far: the Memorial Student Center, the worst case found, has six doors of a routable class and only
 * one of them cannot be routed from.
 */
export const DOOR_TRY_LIMIT = 4;

/**
 * Doors ordered by straight-line distance to a reference point, nearest first.
 *
 * Doors without a usable position are dropped rather than ordered: a door the network cannot be given is not a
 * candidate, and leaving it in would spend one of the tries above on nothing.
 *
 * @param doors The building's doors, in any order.
 * @param positionOf Where a door is.
 * @param relativeTo The other end of the trip, which is what "nearest" is measured against.
 */
export function rankDoorsByDistance<T>(
  doors: ReadonlyArray<T>,
  positionOf: (door: T) => DoorPoint | undefined,
  relativeTo: DoorPoint | undefined
): T[] {
  if (!relativeTo || !usable(relativeTo)) {
    return [];
  }

  return doors
    .map((door) => ({ door, at: positionOf(door) }))
    .filter((d): d is { door: T; at: DoorPoint } => usable(d.at))
    .map((d) => ({
      door: d.door,
      metres: distanceInMetres(d.at as Required<DoorPoint>, relativeTo as Required<DoorPoint>)
    }))
    .sort((a, b) => a.metres - b.metres)
    .map((d) => d.door);
}

/**
 * The first door the routing network can actually route from, trying them nearest first (#2843).
 *
 * The nearest door used to be taken unconditionally, and that is what broke trips to the Memorial Student Center: its
 * nearest door from the north locates onto a disconnected piece of the routing network
 * ([#2845](https://github.com/TamuGeoInnovation/Tamu.GeoInnovation.js.monorepo/issues/2845)), so the trip failed in
 * every travel mode while five other doors on the same building would have worked and a route plainly existed. A
 * visitor was told "No reasonable route was found! Please try again with different points", which could not help,
 * because every nearby start chose the same door.
 *
 * The application cannot tell a dead piece of network from a live one by looking, and never will, so the nearest door
 * is treated as a preference rather than a requirement. The data fault should still be fixed at source; this is what
 * makes the next one survivable.
 *
 * Resolves `undefined` when no door within the limit can be routed from, and the caller then leaves the stop where it
 * was - the building's own point, which routes.
 *
 * @param ranked Doors, nearest first, as `rankDoorsByDistance` returns them.
 * @param canRoute Asks the network whether a route exists from this door. Anything it throws counts as "no".
 * @param limit How many to try.
 */
export async function firstRoutableDoor<T>(
  ranked: ReadonlyArray<T>,
  canRoute: (door: T) => Promise<boolean>,
  limit: number = DOOR_TRY_LIMIT
): Promise<T | undefined> {
  for (const door of ranked.slice(0, Math.max(0, limit))) {
    try {
      if (await canRoute(door)) {
        return door;
      }
    } catch {
      // An error asking is not an answer, so try the next door rather than failing the trip.
    }
  }

  return undefined;
}

function usable(point: DoorPoint | undefined): point is DoorPoint {
  return (
    !!point &&
    typeof point.latitude === 'number' &&
    typeof point.longitude === 'number' &&
    isFinite(point.latitude) &&
    isFinite(point.longitude)
  );
}

/**
 * Runs a refinement of a trip's stops and then lets the trip go on, whatever the refinement did (#2851).
 *
 * Moving each end of a trip to its building's nearest door decides *where* a trip starts and ends. It must not be
 * able to decide *whether* it starts at all - but it was: `setStops` waited on the lookup with no `catch`, so a
 * rejection meant the stops were never set and nothing was ever drawn, with no error in the console, the panel or
 * the map. A visitor saw a trip planner that did nothing, and there was nothing for anybody to read afterwards.
 *
 * The lookup asks two services over the network, so rejecting is an ordinary thing for it to do on a bad day.
 *
 * Resolves either way. The error is handed to `report` rather than rethrown, because the caller's next step - set
 * the stops and draw them - has to happen in both cases.
 */
export async function refineStops(refinement: Promise<unknown>, report: (error: unknown) => void): Promise<void> {
  try {
    await refinement;
  } catch (error) {
    report(error);
  }
}
