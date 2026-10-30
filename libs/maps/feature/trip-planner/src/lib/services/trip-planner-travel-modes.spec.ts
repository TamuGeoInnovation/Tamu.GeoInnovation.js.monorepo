import {
  HIDDEN_PLANNER_MODES,
  modeOrFallback,
  NETWORK_TRAVEL_MODE_NAMES,
  networkTravelModeFor,
  offeredTravelMode,
  travelTypeOffered,
  TripPlannerNetworkTravelMode
} from './trip-planner-travel-modes';

// What RoutingProPublish/Map answers at .../NAServer/Route (#659). Its ids are not the planner's: 1 is Bike here, Walk on
// the old network the planner was written for.
const PUBLISHED: TripPlannerNetworkTravelMode[] = [
  { id: '1', name: 'Bike', type: 'AUTOMOBILE' },
  { id: '2', name: 'Bus', type: 'AUTOMOBILE' },
  { id: '3', name: 'Drive', type: 'AUTOMOBILE' },
  { id: '4', name: 'Walk', type: 'WALK' },
  { id: '5', name: 'Walk_ADA', type: 'WALK' }
];

describe('travel modes of a routing network', () => {
  it('finds the network mode by name, never by id', () => {
    expect(networkTravelModeFor(PUBLISHED, 1)?.id).toBe('4'); // Walk
    expect(networkTravelModeFor(PUBLISHED, 2)?.name).toBe('Walk_ADA');
    expect(networkTravelModeFor(PUBLISHED, 5)?.name).toBe('Bus');
    expect(networkTravelModeFor(PUBLISHED, 7)?.name).toBe('Bike');
    expect(networkTravelModeFor(PUBLISHED, 8)?.name).toBe('Drive');
  });

  const planner = Object.keys(NETWORK_TRAVEL_MODE_NAMES).map(Number);

  it('finds on the network the modes it has, which is still drive and bus even though they are hidden', () => {
    // Accessible driving and the accessible bus have no mode on this network.
    expect(planner.filter((mode) => networkTravelModeFor(PUBLISHED, mode) !== undefined)).toEqual([1, 2, 3, 5, 7, 8]);
  });

  it('offers walking, accessible walking and biking, and hides driving and the bus (#2580)', () => {
    const offered = planner.filter((mode) => offeredTravelMode(PUBLISHED, mode));

    expect(offered).toEqual([1, 2, 7]);
    expect(HIDDEN_PLANNER_MODES).toEqual([3, 4, 5, 6, 8]);
  });

  it('hides them whether or not the network has said what it supports', () => {
    expect(planner.filter((mode) => offeredTravelMode(null, mode))).toEqual([1, 2, 7]);
  });

  it('offers a travel type only while one of its modes is offered', () => {
    expect(travelTypeOffered([1, 2])).toBe(true);
    expect(travelTypeOffered([7])).toBe(true);
    expect(travelTypeOffered([3, 4, 8])).toBe(false);
    expect(travelTypeOffered([5, 6])).toBe(false);
  });

  it('falls back from a hidden mode to walking, keeping an accessible one accessible', () => {
    expect(modeOrFallback(5)).toBe(1);
    expect(modeOrFallback(3)).toBe(1);
    expect(modeOrFallback(8)).toBe(1);
    expect(modeOrFallback(4)).toBe(2);
    expect(modeOrFallback(6)).toBe(2);
    expect(modeOrFallback(1)).toBe(1);
    expect(modeOrFallback(2)).toBe(2);
    expect(modeOrFallback(7)).toBe(7);
  });

  it('offers nothing when the network lists no modes', () => {
    expect(offeredTravelMode([], 1)).toBe(false);
  });

  it('is not tripped up by case or spacing in a published name', () => {
    expect(networkTravelModeFor([{ id: '9', name: ' walk_ada ', type: 'WALK' }], 2)?.id).toBe('9');
  });
});
