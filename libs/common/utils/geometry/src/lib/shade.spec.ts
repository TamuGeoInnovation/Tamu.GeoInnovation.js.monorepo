import {
  LonLat,
  buildingShadow,
  localProjection,
  ringsNearPath,
  shadeAlongPath,
  shadowOffset,
  treeShadow
} from './shade';

const origin: LonLat = [-96.341, 30.615];
const projection = localProjection(origin);

/** A position `x` metres east and `y` metres north of the origin. */
const at = (x: number, y: number): LonLat => projection.toLonLat(x, y);

/** A square building with its south-west corner at (x, y), `size` metres on a side, counter-clockwise. */
const square = (x: number, y: number, size: number): LonLat[] => [
  at(x, y),
  at(x + size, y),
  at(x + size, y + size),
  at(x, y + size)
];

describe('localProjection', () => {
  it('round-trips a position', () => {
    const [x, y] = projection.toMetres(at(120, -45));

    expect(x).toBeCloseTo(120, 6);
    expect(y).toBeCloseTo(-45, 6);
  });
});

describe('shadowOffset', () => {
  it('casts a shadow as long as the height when the sun is 45 degrees up', () => {
    const [dx, dy] = shadowOffset(10, { azimuth: 180, altitude: 45 });

    // The sun is due south, so the shadow falls due north.
    expect(dx).toBeCloseTo(0, 6);
    expect(dy).toBeCloseTo(10, 6);
  });

  it('casts the shadow away from the sun', () => {
    // An afternoon sun in the south-west throws shadows to the north-east.
    const [dx, dy] = shadowOffset(10, { azimuth: 225, altitude: 45 });

    expect(dx).toBeGreaterThan(0);
    expect(dy).toBeGreaterThan(0);
    expect(Math.hypot(dx, dy)).toBeCloseTo(10, 6);
  });

  it('has no shadow when the sun is down', () => {
    expect(shadowOffset(10, { azimuth: 270, altitude: -2 })).toBeUndefined();
  });

  it('caps a very low sun', () => {
    const [dx, dy] = shadowOffset(30, { azimuth: 90, altitude: 0.5 }, 200);

    expect(Math.hypot(dx, dy)).toBeCloseTo(200, 6);
  });
});

describe('buildingShadow', () => {
  const sunInSouth = { azimuth: 180, altitude: 45 };

  it('covers the ground north of a building to the length of its height', () => {
    const shadow = buildingShadow(square(0, 0, 20), 10, sunInSouth);

    const shade = (x: number, y: number) => shadeAlongPath([[at(x, y - 0.5), at(x, y + 0.5)]], shadow).share;

    // Beside the north wall, and 9 metres out: in shade. 11 metres out: in sun.
    expect(shade(10, 21)).toBe(1);
    expect(shade(10, 29)).toBe(1);
    expect(shade(10, 31.5)).toBe(0);
    // South of the building, facing the sun: in sun.
    expect(shade(10, -3)).toBe(0);
  });

  it('works whichever way the footprint is wound, and with the first corner repeated', () => {
    const ccw = square(0, 0, 20);
    const cw = [...ccw].reverse();
    const closed = [...cw, cw[0]];

    const shade = (rings: LonLat[][]) => shadeAlongPath([[at(10, 25), at(10, 26)]], rings).share;

    expect(shade(buildingShadow(ccw, 10, sunInSouth))).toBe(1);
    expect(shade(buildingShadow(closed, 10, sunInSouth))).toBe(1);
  });

  it('sweeps the walls that face away from the sun, so an L-shaped building shades its inside corner', () => {
    // An L: a 30 x 10 base along the south, and a 10 x 30 arm up the west side.
    const l: LonLat[] = [at(0, 0), at(30, 0), at(30, 10), at(10, 10), at(10, 30), at(0, 30)];
    // Sun in the west, low: shadows fall 20 metres east.
    const shadow = buildingShadow(l, 20, { azimuth: 270, altitude: 45 });

    // The inside corner of the L, east of the arm, is shaded by it.
    expect(shadeAlongPath([[at(20, 20), at(21, 20)]], shadow).share).toBe(1);
    // Further east than the shadow reaches, it is not.
    expect(shadeAlongPath([[at(33, 20), at(34, 20)]], shadow).share).toBe(0);
  });

  it('casts nothing at night', () => {
    expect(buildingShadow(square(0, 0, 20), 10, { azimuth: 0, altitude: -10 })).toEqual([]);
  });
});

describe('treeShadow', () => {
  it('centres a high sun shadow close under the crown', () => {
    // A 10 m tree with a 4 m crown radius, sun nearly overhead.
    const ring = treeShadow(at(0, 0), 10, 4, { azimuth: 180, altitude: 85 });

    expect(shadeAlongPath([[at(0, -0.5), at(0, 0.5)]], [ring]).share).toBe(1);
    expect(shadeAlongPath([[at(0, 8), at(0, 9)]], [ring]).share).toBe(0);
  });

  it('moves the shadow away from the sun and stretches it along the sun direction', () => {
    // Sun in the west at 45 degrees: the crown's middle (6 m up) lands 6 m east.
    const ring = treeShadow(at(0, 0), 10, 4, { azimuth: 270, altitude: 45 });
    const shade = (x: number, y: number) => shadeAlongPath([[at(x - 0.25, y), at(x + 0.25, y)]], [ring]).share;

    expect(shade(6, 0)).toBe(1);
    // The ellipse reaches about 4 / sin 45 = 5.7 m either side along the east-west axis, and 4 m across it.
    expect(shade(11, 0)).toBe(1);
    expect(shade(6, 3.5)).toBe(1);
    expect(shade(6, 4.5)).toBe(0);
    expect(shade(-1, 0)).toBe(0);
  });

  it('has no shadow at night or with no crown', () => {
    expect(treeShadow(at(0, 0), 10, 4, { azimuth: 0, altitude: -1 })).toBeUndefined();
    expect(treeShadow(at(0, 0), 10, 0, { azimuth: 180, altitude: 50 })).toBeUndefined();
  });
});

describe('shadeAlongPath', () => {
  const shadow = [square(0, 0, 10)];

  it('measures the length of a path and how much of it is shaded', () => {
    // 30 metres east along y = 5, of which 10 cross the square.
    const result = shadeAlongPath([[at(-10, 5), at(20, 5)]], shadow, 1);

    expect(result.total).toBeCloseTo(30, 3);
    expect(result.shaded).toBeCloseTo(10, 3);
    expect(result.share).toBeCloseTo(1 / 3, 3);
  });

  it('counts overlapping shadows once', () => {
    const result = shadeAlongPath([[at(-10, 5), at(20, 5)]], [...shadow, square(5, 0, 10)], 1);

    // The two squares together span x = 0 to 15.
    expect(result.shaded).toBeCloseTo(15, 3);
  });

  it('adds up several paths', () => {
    const result = shadeAlongPath([[at(-10, 5), at(0, 5)], [at(0, 5), at(10, 5)]], shadow, 1);

    expect(result.total).toBeCloseTo(20, 3);
    expect(result.shaded).toBeCloseTo(10, 3);
  });

  it('is zero for an empty walk and fully sunny with no shadows', () => {
    expect(shadeAlongPath([], shadow)).toEqual({ shaded: 0, total: 0, share: 0 });
    expect(shadeAlongPath([[at(0, 0), at(10, 0)]], []).share).toBe(0);
  });

  it('ignores missing and degenerate rings', () => {
    expect(shadeAlongPath([[at(-10, 5), at(20, 5)]], [undefined, [at(0, 0), at(1, 1)], ...shadow], 1).shaded).toBeCloseTo(
      10,
      3
    );
  });

});

describe('ringsNearPath', () => {
  const walk = [[at(0, 0), at(200, 0)]];

  it('keeps shadows beside the walk and drops those far from it', () => {
    const beside = square(50, 20, 10);
    const across = square(100, -15, 10);
    const far = square(100, 300, 10);
    const pastTheEnd = square(600, 0, 10);

    expect(ringsNearPath([beside, across, far, pastTheEnd], walk, 50)).toEqual([beside, across]);
  });

  it('drops missing and degenerate rings, and keeps nothing for an empty walk', () => {
    expect(ringsNearPath([undefined, [at(0, 0), at(1, 1)]], walk, 50)).toEqual([]);
    expect(ringsNearPath([square(0, 0, 10)], [], 50)).toEqual([]);
  });
});
