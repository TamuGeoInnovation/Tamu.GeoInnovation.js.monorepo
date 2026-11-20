import { EARTH_RADIUS } from './common-utils-geometry';
import { SunPosition } from './sun';

/**
 * A position as `[longitude, latitude]` in degrees, the order Esri rings and GeoJSON use. Shadows are made by the
 * thousand for a single walk, so these work on plain pairs rather than `LatLon` objects.
 */
export type LonLat = [number, number];

/**
 * A shadow's ground outline, as one ring of positions. A building's shadow comes back as several rings that overlap;
 * a point in any of them is in the shadow.
 */
export type ShadowRing = Array<LonLat>;

/**
 * How long a shadow may be, in metres. A sun a few degrees above the horizon casts shadows hundreds of metres long,
 * across buildings and trees that would shade the ground anyway; capping them keeps the rings to the campus they are
 * on. At this length a 10 m building's shadow is capped once the sun is below about 3 degrees.
 */
export const MAX_SHADOW_LENGTH = 200;

const toRadians = Math.PI / 180;
const metresPerDegree = EARTH_RADIUS * toRadians;

/**
 * A flat projection in metres east (`x`) and north (`y`) of an origin. Accurate to well under a metre across a campus,
 * which is all a shadow needs; not for anything spanning many kilometres.
 */
export interface LocalProjection {
  toMetres(p: LonLat): [number, number];
  toLonLat(x: number, y: number): LonLat;
}

export function localProjection(origin: LonLat): LocalProjection {
  const metresPerDegreeLongitude = metresPerDegree * Math.cos(origin[1] * toRadians);

  return {
    toMetres: (p) => [(p[0] - origin[0]) * metresPerDegreeLongitude, (p[1] - origin[1]) * metresPerDegree],
    toLonLat: (x, y) => [origin[0] + x / metresPerDegreeLongitude, origin[1] + y / metresPerDegree]
  };
}

/**
 * Where the top of something `height` metres tall lands on flat ground, in metres east and north of its foot.
 * Shadows fall directly away from the sun. `undefined` when the sun is on or below the horizon, when everything is in
 * shade and there is no shadow to draw.
 */
export function shadowOffset(height: number, sun: SunPosition, maxLength = MAX_SHADOW_LENGTH): [number, number] {
  if (sun.altitude <= 0 || !(height > 0)) {
    return undefined;
  }

  const length = Math.min(maxLength, height / Math.tan(sun.altitude * toRadians));
  const away = (sun.azimuth + 180) * toRadians;

  return [length * Math.sin(away), length * Math.cos(away)];
}

/**
 * The ground shadow of a flat-roofed building: the area its footprint sweeps as it slides from the ground to where its
 * roof's shadow lands. Returned as overlapping rings, not one outline, so that no polygon union is needed to make or
 * test it: the footprint, the roof's shadow, and one quadrilateral for each wall that faces away from the sun. Join
 * them with a polygon union where one outline is wanted (to draw it, or to send it to a route solve).
 *
 * @param footprint The building's outline, in either winding, with or without the first position repeated at the end.
 * @param height Metres from the ground to the roof.
 */
export function buildingShadow(
  footprint: Array<LonLat>,
  height: number,
  sun: SunPosition,
  maxLength = MAX_SHADOW_LENGTH
): Array<ShadowRing> {
  const ring = openRing(footprint);
  const offset = shadowOffset(height, sun, maxLength);

  if (ring.length < 3 || !offset) {
    return [];
  }

  const projection = localProjection(ring[0]);
  const corners = ring.map((p) => projection.toMetres(p));
  const [dx, dy] = offset;
  const shifted = corners.map(([x, y]): [number, number] => [x + dx, y + dy]);

  // Positive for a counter-clockwise ring. A wall faces the shadow when its outward normal points the way the shadow
  // falls; for a counter-clockwise ring the outward normal of the side a -> b is (by - ay, -(bx - ax)).
  const winding = Math.sign(signedArea(corners)) || 1;
  const rings: Array<ShadowRing> = [ring, shifted.map(([x, y]) => projection.toLonLat(x, y))];

  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const outward = winding * ((b[1] - a[1]) * dx - (b[0] - a[0]) * dy);

    if (outward > 0) {
      rings.push(
        [a, b, [b[0] + dx, b[1] + dy] as [number, number], [a[0] + dx, a[1] + dy] as [number, number]].map(
          ([x, y]) => projection.toLonLat(x, y)
        )
      );
    }
  }

  return rings;
}

/**
 * The ground shadow of a tree, treating its crown as a ball: an ellipse as wide as the crown, stretched along the
 * sun's direction as the sun gets lower, centred where the middle of the crown's shadow lands.
 *
 * @param centre The trunk's position.
 * @param height Metres from the ground to the top of the crown.
 * @param crownRadius Half the crown's spread, in metres.
 * @param sides How many corners the ellipse is drawn with.
 */
export function treeShadow(
  centre: LonLat,
  height: number,
  crownRadius: number,
  sun: SunPosition,
  sides = 16,
  maxLength = MAX_SHADOW_LENGTH
): ShadowRing {
  if (sun.altitude <= 0 || !(crownRadius > 0)) {
    return undefined;
  }

  // The middle of the crown sits a radius below its top, but never below a radius off the ground.
  const crownHeight = Math.max(crownRadius, height - crownRadius);
  const [dx, dy] = shadowOffset(crownHeight, sun, maxLength);

  // A ball's shadow on flat ground is an ellipse whose long axis is the radius over the sine of the sun's altitude.
  // Capped at three radii, which the sun reaches at about 19 degrees; lower than that the crown's shadow lies among
  // other shadows anyway.
  const along = Math.min(3 * crownRadius, crownRadius / Math.sin(sun.altitude * toRadians));
  const away = (sun.azimuth + 180) * toRadians;
  const [ux, uy] = [Math.sin(away), Math.cos(away)];
  const projection = localProjection(centre);

  const ring: ShadowRing = [];

  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides;
    const a = along * Math.cos(angle);
    const c = crownRadius * Math.sin(angle);

    // `a` runs along the shadow's direction (ux, uy); `c` across it (uy, -ux).
    ring.push(projection.toLonLat(dx + a * ux + c * uy, dy + a * uy - c * ux));
  }

  return ring;
}

/**
 * How much of a walk is in shade: the metres of its path inside any shadow ring, out of its total length.
 *
 * Measured by stepping along the path and testing the middle of each step, so it is exact to within a step's length
 * at each shadow's edge.
 *
 * @param paths The walk's path, as one or more lines of positions (Esri `paths`).
 * @param shadows Rings from `buildingShadow` and `treeShadow`, in any number and overlapping.
 * @param step Metres between tests along the path.
 */
export function shadeAlongPath(
  paths: Array<Array<LonLat>>,
  shadows: Array<ShadowRing>,
  step = 2
): { shaded: number; total: number; share: number } {
  const first = paths.find((p) => p.length > 0)?.[0];

  if (!first) {
    return { shaded: 0, total: 0, share: 0 };
  }

  const projection = localProjection(first);
  const index = new ShadowIndex(
    shadows.filter((s) => s && s.length >= 3).map((s) => s.map((p) => projection.toMetres(p))),
    25
  );

  let shaded = 0;
  let total = 0;

  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      const [ax, ay] = projection.toMetres(path[i - 1]);
      const [bx, by] = projection.toMetres(path[i]);
      const length = Math.hypot(bx - ax, by - ay);

      if (length === 0) {
        continue;
      }

      const steps = Math.max(1, Math.ceil(length / step));
      const each = length / steps;

      for (let s = 0; s < steps; s++) {
        const t = (s + 0.5) / steps;

        if (index.contains(ax + t * (bx - ax), ay + t * (by - ay))) {
          shaded += each;
        }
      }

      total += length;
    }
  }

  return { shaded, total, share: total > 0 ? shaded / total : 0 };
}

/**
 * The rings that come within `metres` of a walk, by their bounding boxes: the shadows a route solve can use. A solve
 * given every shadow for a kilometre around takes minutes; the ones beside the walk are what can change it.
 *
 * @param paths The walk, as one or more lines of positions.
 * @param metres How far either side of the walk to keep shadows.
 */
export function ringsNearPath(
  rings: Array<ShadowRing>,
  paths: Array<Array<LonLat>>,
  metres: number
): Array<ShadowRing> {
  const first = paths.find((p) => p.length > 0)?.[0];

  if (!first) {
    return [];
  }

  const projection = localProjection(first);
  const walk = paths.map((path) => path.map((p) => projection.toMetres(p)));

  // Points every few metres along the walk, indexed by cell, so each ring tests only the points near it.
  const cell = Math.max(metres, 10);
  const near = new Set<string>();

  for (const path of walk) {
    for (let i = 0; i < path.length; i++) {
      const [ax, ay] = path[i];
      const [bx, by] = path[Math.min(i + 1, path.length - 1)];
      const steps = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / (cell / 2)));

      for (let s = 0; s <= steps; s++) {
        const x = ax + ((bx - ax) * s) / steps;
        const y = ay + ((by - ay) * s) / steps;

        near.add(`${Math.floor(x / cell)},${Math.floor(y / cell)}`);
      }
    }
  }

  return rings.filter((ring) => {
    if (!ring || ring.length < 3) {
      return false;
    }

    let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];

    for (const p of ring) {
      const [x, y] = projection.toMetres(p);

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    // A ring is near when its box, grown by a cell, covers a cell the walk passes through.
    for (let cx = Math.floor(minX / cell) - 1; cx <= Math.floor(maxX / cell) + 1; cx++) {
      for (let cy = Math.floor(minY / cell) - 1; cy <= Math.floor(maxY / cell) + 1; cy++) {
        if (near.has(`${cx},${cy}`)) {
          return true;
        }
      }
    }

    return false;
  });
}

/**
 * Rings in metres, bucketed by the grid cells their bounding boxes touch, so that a point is tested only against the
 * few rings near it rather than against every shadow on campus.
 */
class ShadowIndex {
  private readonly cells = new Map<string, number[]>();
  private readonly boxes: Array<[number, number, number, number]>;

  constructor(private readonly rings: Array<Array<[number, number]>>, private readonly cellSize: number) {
    this.boxes = rings.map((ring) => {
      let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];

      for (const [x, y] of ring) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }

      return [minX, minY, maxX, maxY];
    });

    this.boxes.forEach(([minX, minY, maxX, maxY], i) => {
      for (let cx = Math.floor(minX / cellSize); cx <= Math.floor(maxX / cellSize); cx++) {
        for (let cy = Math.floor(minY / cellSize); cy <= Math.floor(maxY / cellSize); cy++) {
          const key = `${cx},${cy}`;
          const bucket = this.cells.get(key);

          if (bucket) {
            bucket.push(i);
          } else {
            this.cells.set(key, [i]);
          }
        }
      }
    });
  }

  public contains(x: number, y: number): boolean {
    const bucket = this.cells.get(`${Math.floor(x / this.cellSize)},${Math.floor(y / this.cellSize)}`);

    return (
      bucket !== undefined &&
      bucket.some((i) => {
        const [minX, minY, maxX, maxY] = this.boxes[i];

        return x >= minX && x <= maxX && y >= minY && y <= maxY && pointInRing(x, y, this.rings[i]);
      })
    );
  }
}

/** Even-odd ray casting. */
function pointInRing(x: number, y: number, ring: Array<[number, number]>): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }

  return inside;
}

function signedArea(ring: Array<[number, number]>): number {
  let area = 0;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += (ring[j][0] - ring[i][0]) * (ring[j][1] + ring[i][1]);
  }

  return area / 2;
}

function openRing<T extends LonLat>(ring: Array<T>): Array<T> {
  const first = ring[0];
  const last = ring[ring.length - 1];

  return ring.length > 1 && first[0] === last[0] && first[1] === last[1] ? ring.slice(0, -1) : ring;
}
