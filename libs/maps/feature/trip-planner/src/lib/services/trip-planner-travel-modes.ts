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

/**
 * The planner modes the picker does not offer, and the planner does not solve, for now (#2580): driving with a pass,
 * accessible driving, the bus, the accessible bus, and visitor driving.
 *
 * THIS IS HIDING, NOT A LIMIT OF THE NETWORK. The network has Drive and Bus modes and solves them (Drive 7 minutes and
 * Bus 30 minutes with directions on dev), and every rule above still lists them. They are hidden because the answers
 * mislead: the Bike, Bus and Drive travel modes all use the impedance `Length`, and nothing in the network knows a bus
 * schedule, so "Bus 30 min" is a road-distance estimate along bus-permitted roads, not a transit time, and a drive time
 * is a distance too. A confident wrong answer is worse than none. The walking modes use `Time` and mean what they say.
 *
 * To bring them back, empty or shorten this one list when the network has a time impedance for driving or a schedule
 * for buses. Nothing else needs to change.
 */
export const HIDDEN_PLANNER_MODES: number[] = [3, 4, 5, 6, 8];

/** Whether a travel type (a picker button) has a planner mode left to offer, so a button with none is not drawn. */
export const travelTypeOffered = (modes: number[]) => modes.some((mode) => !HIDDEN_PLANNER_MODES.includes(mode));

/**
 * The planner mode a link's `mode` becomes. A hidden mode is solved as walking, or as accessible walking when it was an
 * accessible mode, rather than leaving the panel empty or spinning on a mode that is not offered.
 */
export const modeOrFallback = (mode: number) =>
  HIDDEN_PLANNER_MODES.includes(mode) ? (mode === 4 || mode === 6 ? 2 : 1) : mode;

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
 * Whether a planner mode should be offered: not hidden (`HIDDEN_PLANNER_MODES`), and on the network. A network that has
 * not yet said what it supports (`null`) offers every mode not hidden, so the picker is not empty while it loads; one
 * that lists none offers none.
 */
export function offeredTravelMode<T extends { name: string }>(supported: T[] | null | undefined, mode: number): boolean {
  if (HIDDEN_PLANNER_MODES.includes(mode)) {
    return false;
  }

  return supported == null || networkTravelModeFor(supported, mode) !== undefined;
}
