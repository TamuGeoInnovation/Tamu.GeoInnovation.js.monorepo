import { DOOR_TRY_LIMIT, firstRoutableDoor, rankDoorsByDistance } from './trip-planner-door-choice';

/**
 * Choosing which door of a building a trip starts or ends at (#2843).
 *
 * The nearest door was taken unconditionally, and on 11 November 2026 that broke every trip from the north to the
 * Memorial Student Center: its nearest door, FID 111, locates onto a disconnected piece of the routing network
 * (#2845), so the trip failed in every travel mode - while five other doors on the same building routed, and a
 * route between the two buildings plainly existed. Measured against production's own services that morning.
 *
 * The doors below are the real ones: the MSC's six routable-class doors as the entrances service returned them,
 * and the Eller Oceanography & Meteorology Building's nearest door as the point they are measured against.
 */
const ELLER_DOOR = { latitude: 30.617520189541608, longitude: -96.33680467136645 };

/** FID 111 is the one the network cannot route from, and it is the nearest to Eller. */
const MSC_DOORS = [
  { fid: 111, latitude: 30.61313461809532, longitude: -96.34100266010634 },
  { fid: 201, latitude: 30.61279, longitude: -96.34147 },
  { fid: 202, latitude: 30.6125, longitude: -96.3418 },
  { fid: 203, latitude: 30.61222, longitude: -96.34211 },
  { fid: 204, latitude: 30.61201, longitude: -96.3424 },
  { fid: 205, latitude: 30.61188, longitude: -96.3427 }
];

const DEAD = 111;
const positionOf = (d: (typeof MSC_DOORS)[number]) => d;

describe('rankDoorsByDistance', () => {
  it('puts the nearest door to the other end of the trip first', () => {
    const ranked = rankDoorsByDistance(MSC_DOORS, positionOf, ELLER_DOOR);

    expect(ranked.map((d) => d.fid)).toEqual([111, 201, 202, 203, 204, 205]);
  });

  it('drops doors with no usable position rather than ordering them', () => {
    const doors = [...MSC_DOORS, { fid: 999, latitude: undefined, longitude: undefined }];

    const ranked = rankDoorsByDistance(doors, positionOf as never, ELLER_DOOR);

    expect(ranked.map((d) => d.fid)).not.toContain(999);
  });

  it('ranks nothing when the other end of the trip has no position yet', () => {
    expect(rankDoorsByDistance(MSC_DOORS, positionOf, undefined)).toEqual([]);
    expect(rankDoorsByDistance(MSC_DOORS, positionOf, { latitude: undefined, longitude: undefined })).toEqual([]);
  });
});

describe('firstRoutableDoor', () => {
  const ranked = rankDoorsByDistance(MSC_DOORS, positionOf, ELLER_DOOR);

  it('takes the nearest door when the network can route from it, and asks about no others', async () => {
    const asked: number[] = [];
    const canRoute = async (d: (typeof MSC_DOORS)[number]) => {
      asked.push(d.fid);

      return true;
    };

    const chosen = await firstRoutableDoor(ranked, canRoute);

    expect(chosen?.fid).toBe(111);
    expect(asked, 'the nearest door routed, so nothing else should have been asked about').toEqual([111]);
  });

  /** This is the one that fails against the old behaviour, which had no way to reject a door. */
  it('takes the next door when the nearest one cannot be routed from', async () => {
    const canRoute = async (d: (typeof MSC_DOORS)[number]) => d.fid !== DEAD;

    const chosen = await firstRoutableDoor(ranked, canRoute);

    expect(chosen?.fid, 'the dead nearest door was taken, so the trip fails as it did on 11 November').toBe(201);
  });

  it('gives up rather than guessing when no door can be routed from, so the stop keeps the building point', async () => {
    const chosen = await firstRoutableDoor(ranked, async () => false);

    expect(chosen).toBeUndefined();
  });

  it('stops after the try limit, so a building with many doors cannot hold a trip open', async () => {
    const asked: number[] = [];
    const canRoute = async (d: (typeof MSC_DOORS)[number]) => {
      asked.push(d.fid);

      return false;
    };

    await firstRoutableDoor(ranked, canRoute);

    expect(asked.length).toBe(DOOR_TRY_LIMIT);
  });

  it('treats a door it cannot ask about as unusable and moves on, rather than failing the trip', async () => {
    const canRoute = async (d: (typeof MSC_DOORS)[number]) => {
      if (d.fid === DEAD) {
        throw new Error('the network did not answer');
      }

      return true;
    };

    const chosen = await firstRoutableDoor(ranked, canRoute);

    expect(chosen?.fid).toBe(201);
  });
});
