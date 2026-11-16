/**
 * A travel mode of a routing network, as its `NAServer/Route` layer lists it. Only what the planner reads is named;
 * the rest travels with it, because the whole object is what a solve is given.
 */
export interface TripPlannerNetworkTravelMode {
  id: string;
  name: string;
  type?: string;
  [attribute: string]: unknown;
}

/**
 * The network travel mode that solves each of the planner's modes, by name (#659).
 *
 * The planner's modes are numbers it chose (1 is walking, 7 is biking); a network numbers its own. They happened to
 * agree on the old network, so the planner sent its own number as the network's id. The network published for #659 has
 * five modes numbered from 1 in alphabetical order, so 1 is Bike there, and a walking trip would have been solved as a
 * bike ride without any error. Names are what a network is built around and what its authors keep.
 *
 * A planner mode with no name on the network is not offered (`offeredTravelMode`). The network has one Drive mode, so
 * driving with a parking pass and visitor driving both use it, and it has no accessible drive or accessible bus.
 */
export const NETWORK_TRAVEL_MODE_NAMES: Record<number, string> = {
  1: 'Walk',
  2: 'Walk_ADA',
  3: 'Drive',
  4: 'Drive_ADA',
  5: 'Bus',
  6: 'Bus_ADA',
  7: 'Bike',
  8: 'Drive'
};

const normalized = (name: string) => `${name}`.trim().toLowerCase();

/** The network's travel mode that solves a planner mode, or undefined when it has none. */
export function networkTravelModeFor<T extends { name: string }>(
  supported: T[] | null | undefined,
  mode: number
): T | undefined {
  const name = NETWORK_TRAVEL_MODE_NAMES[mode];

  if (!name || !supported) {
    return undefined;
  }

  return supported.find((candidate) => normalized(candidate.name) === normalized(name));
}

/**
 * Whether a planner mode should be offered. A network that has not yet said what it supports (`null`) offers all, so
 * the picker is not empty while it loads; one that lists none offers none.
 */
export function offeredTravelMode<T extends { name: string }>(supported: T[] | null | undefined, mode: number): boolean {
  return supported == null || networkTravelModeFor(supported, mode) !== undefined;
}
