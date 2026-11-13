import { localProjection, LonLat } from '@tamu-gisc/common/utils/geometry';

import {
  FEET,
  METRES_PER_FLOOR,
  INDOOR_COST_FACTOR,
  SHADE_COST_FACTOR,
  buildingHeight,
  buildingsLikelyOpen,
  indoorBarrierFactor,
  shadeScene,
  summarizeShade,
  throughBuildings,
  treeSize
} from './shade-casters';

const projection = localProjection([-96.341, 30.615]);
const at = (x: number, y: number): LonLat => projection.toLonLat(x, y);
const square = (x: number, y: number, size: number): LonLat[] => [
  at(x, y),
  at(x + size, y),
  at(x + size, y + size),
  at(x, y + size)
];

describe('buildingHeight', () => {
  it('prefers the 3D model, then floors, then one floor', () => {
    expect(buildingHeight({ number: '1', footprint: [], modelHeight: 17.4, floors: 5 })).toEqual({
      height: 17.4,
      source: 'model'
    });
    expect(buildingHeight({ number: '1', footprint: [], floors: 5 })).toEqual({
      height: 5 * METRES_PER_FLOOR,
      source: 'floors'
    });
    expect(buildingHeight({ number: '1', footprint: [] })).toEqual({ height: METRES_PER_FLOOR, source: 'default' });
  });
});

describe('treeSize', () => {
  it('converts feet to metres and halves the spread', () => {
    expect(treeSize({ position: at(0, 0), heightFeet: 30, spreadFeet: 20 })).toEqual({
      height: 30 * FEET,
      crownRadius: 10 * FEET,
      estimated: false
    });
  });

  it('takes a tree with no height to be as tall as it is wide, at least 10 feet', () => {
    expect(treeSize({ position: at(0, 0), spreadFeet: 24 })).toMatchObject({ height: 24 * FEET, estimated: true });
    expect(treeSize({ position: at(0, 0), spreadFeet: 4 })).toMatchObject({ height: 10 * FEET, estimated: true });
  });

  it('skips a tree with no spread', () => {
    expect(treeSize({ position: at(0, 0), heightFeet: 30 })).toBeUndefined();
  });
});

describe('shadeScene and summarizeShade', () => {
  const afternoon = { azimuth: 225, altitude: 45 };
  const buildings = [{ number: '0001', footprint: square(0, 0, 20), floors: 3 }];
  const trees = [
    { position: at(100, 100), heightFeet: 30, spreadFeet: 30 },
    { position: at(200, 200) },
    { position: at(300, 300), spreadFeet: 20 }
  ];

  it('counts what the shadows rest on', () => {
    const scene = shadeScene(new Date(), afternoon, buildings, trees);

    expect(scene.buildings).toEqual({ model: 0, floors: 1, default: 0 });
    expect(scene.trees).toEqual({ measured: 1, estimated: 1, skipped: 1 });
    expect(scene.rings.length).toBeGreaterThan(3);
  });

  it('compares the shade on the chosen walk with the quickest one', () => {
    const scene = shadeScene(new Date(), afternoon, buildings, []);
    // Shadows fall north-east; a walk along the north-east of the building is shaded, one to its south-west is not.
    const shaded = [[at(21, 5), at(21, 15)]];
    const sunny = [[at(-5, -5), at(-5, 15)]];

    const summary = summarizeShade(scene, shaded, 6, sunny, 5);

    expect(summary.share).toBe(1);
    expect(summary.quickest.share).toBe(0);
    expect(summary.minutes).toBe(6);
    expect(summary.quickest.minutes).toBe(5);
    expect(summary.sunDown).toBe(false);
  });

  it('calls the whole walk shaded after sunset', () => {
    const scene = shadeScene(new Date(), { azimuth: 290, altitude: -3 }, buildings, trees);

    expect(scene.rings).toEqual([]);

    const summary = summarizeShade(scene, [[at(-5, -5), at(-5, 15)]], 5, [[at(-5, -5), at(-5, 15)]], 5);

    expect(summary.sunDown).toBe(true);
    expect(summary.share).toBe(1);
  });
});

describe('throughBuildings', () => {
  // Two buildings the walk along y = 10 crosses: A from x = 0 to 20, B from x = 40 to 50 (y = 5 to 15).
  const footprints = [
    { abbreviation: 'A', ring: square(0, 0, 20) },
    { abbreviation: 'B', ring: square(40, 5, 10) },
    { abbreviation: 'C', ring: square(0, 100, 10) }
  ];

  it('measures the metres a walk spends inside each building it cuts through, longest first', () => {
    const result = throughBuildings([[at(-10, 10), at(60, 10)]], footprints);

    expect(result.map((b) => b.abbreviation)).toEqual(['A', 'B']);
    expect(result[0].metres).toBeCloseTo(20, 0);
    expect(result[1].metres).toBeCloseTo(10, 0);
  });

  it('leaves out a walk that only grazes a corner', () => {
    // Clips 2 m of A's south-east corner.
    expect(throughBuildings([[at(18, -1), at(21, 2)]], footprints)).toEqual([]);
  });

  it('counts a cut-through as shade, and names it in the summary', () => {
    const scene = shadeScene(
      new Date(),
      { azimuth: 225, altitude: 45 },
      [{ number: '0001', abbreviation: 'A', footprint: square(0, 0, 20), floors: 3 }],
      []
    );
    // Straight through A, west to east, on a line its own shadow (to the north-east) does not cover outside it.
    const summary = summarizeShade(scene, [[at(-20, 2), at(40, 2)]], 5, [[at(-20, -10), at(40, -10)]], 4);

    expect(summary.indoors).toEqual([{ abbreviation: 'A', metres: expect.closeTo(20, 0) }]);
    expect(summary.share).toBeGreaterThanOrEqual(20 / 60 - 0.02);
    expect(summary.quickest.share).toBe(0);
  });
});

describe('buildingsLikelyOpen', () => {
  it('is open on a weekday from 7 AM to 9 PM Central', () => {
    // 15 September 2026 is a Tuesday.
    expect(buildingsLikelyOpen(new Date('2026-09-15T07:00:00-05:00'))).toBe(true);
    expect(buildingsLikelyOpen(new Date('2026-09-15T15:00:00-05:00'))).toBe(true);
    expect(buildingsLikelyOpen(new Date('2026-09-15T20:59:00-05:00'))).toBe(true);
  });

  it('is closed early, late and at weekends', () => {
    expect(buildingsLikelyOpen(new Date('2026-09-15T06:59:00-05:00'))).toBe(false);
    expect(buildingsLikelyOpen(new Date('2026-09-15T21:00:00-05:00'))).toBe(false);
    expect(buildingsLikelyOpen(new Date('2026-09-19T12:00:00-05:00'))).toBe(false);
    expect(buildingsLikelyOpen(new Date('2026-09-20T12:00:00-05:00'))).toBe(false);
  });

  it('reads the day and hour in Central, not UTC', () => {
    // Monday 14 September at 01:00 UTC is still Sunday 8 PM in College Station.
    expect(buildingsLikelyOpen(new Date('2026-09-14T01:00:00Z'))).toBe(false);
    // Tuesday 15 September at 01:00 UTC is Monday 8 PM: open.
    expect(buildingsLikelyOpen(new Date('2026-09-15T01:00:00Z'))).toBe(true);
  });
});

describe('indoorBarrierFactor', () => {
  it('brings a building to the indoor cost while open, on top of the shade barrier', () => {
    expect(SHADE_COST_FACTOR * indoorBarrierFactor(true)).toBeCloseTo(INDOOR_COST_FACTOR, 9);
  });

  it('cancels the shade discount while closed, so a building is no cheaper than open ground', () => {
    expect(SHADE_COST_FACTOR * indoorBarrierFactor(false)).toBeCloseTo(1, 9);
  });

  it('says in the summary whether buildings were preferred', () => {
    const scene = shadeScene(new Date('2026-09-19T12:00:00-05:00'), { azimuth: 180, altitude: 70 }, [], []);

    expect(summarizeShade(scene, [[at(0, 0), at(10, 0)]], 1, [[at(0, 0), at(10, 0)]], 1).buildingsOpen).toBe(false);
  });
});
