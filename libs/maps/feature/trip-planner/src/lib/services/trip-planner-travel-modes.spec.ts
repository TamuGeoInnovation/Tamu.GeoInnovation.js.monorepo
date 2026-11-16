import {
  NETWORK_TRAVEL_MODE_NAMES,
  networkTravelModeFor,
  offeredTravelMode,
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

  it('offers only the modes the network has', () => {
    const offered = Object.keys(NETWORK_TRAVEL_MODE_NAMES)
      .map(Number)
      .filter((mode) => offeredTravelMode(PUBLISHED, mode));

    // Walking, accessible walking, driving with a pass, bus, bike, and visitor driving. Accessible driving and the
    // accessible bus have no mode on this network.
    expect(offered).toEqual([1, 2, 3, 5, 7, 8]);
    expect(offeredTravelMode(PUBLISHED, 4)).toBe(false);
    expect(offeredTravelMode(PUBLISHED, 6)).toBe(false);
  });

  it('offers everything while the network has not yet said what it supports', () => {
    expect(offeredTravelMode(null, 6)).toBe(true);
  });

  it('offers nothing when the network lists no modes', () => {
    expect(offeredTravelMode([], 1)).toBe(false);
  });

  it('is not tripped up by case or spacing in a published name', () => {
    expect(networkTravelModeFor([{ id: '9', name: ' walk_ada ', type: 'WALK' }], 2)?.id).toBe('9');
  });
});
