import {
  LonLat,
  ShadowRing,
  SunPosition,
  buildingShadow,
  ringsNearPath,
  shadeAlongPath,
  treeShadow
} from '@tamu-gisc/common/utils/geometry';

/** Feet to metres. The campus tree inventory records heights and crown spreads in feet. */
export const FEET = 0.3048;

/**
 * Metres per floor, for a building with a floor count and no 3D model. The 362 current campus buildings that have both
 * a 2019 SketchUp model and a floor count average 3.6 m of model height per floor (median, 10 November 2026).
 */
export const METRES_PER_FLOOR = 3.6;

/**
 * How much cheaper a shaded metre is than a sunny one when the route is solved. A walk in shade is solved as if it
 * took this share of its real time, so the network trades about two metres of extra walking for each metre it moves
 * into shade. 0.5 keeps detours short; lower values make the route chase shade harder.
 */
export const SHADE_COST_FACTOR = 0.5;

/**
 * How much cheaper a metre inside a building is than a sunny one, while buildings are likely open. Lower than shade,
 * because inside is air-conditioned as well as out of the sun; not much lower, because the network does not know
 * which doors are locked, and a route that weaves through several buildings to save a minute of sun is slower and
 * harder to follow than its time suggests.
 */
export const INDOOR_COST_FACTOR = 0.35;

/**
 * When campus buildings are taken to be open: weekdays from 7 AM to 9 PM Central. An assumption, not a schedule; the
 * hours of each building would come from Facilities.
 */
export const BUILDINGS_OPEN = { firstHour: 7, endHour: 21 };

const centralParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  weekday: 'short',
  hour: 'numeric',
  hourCycle: 'h23'
});

/** Whether campus buildings are likely open at a moment, by `BUILDINGS_OPEN`, in Central time wherever it is asked. */
export function buildingsLikelyOpen(when: Date): boolean {
  const parts = centralParts.formatToParts(when);
  const weekday = parts.find((p) => p.type === 'weekday')?.value;
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '', 10);

  return weekday !== 'Sat' && weekday !== 'Sun' && hour >= BUILDINGS_OPEN.firstHour && hour < BUILDINGS_OPEN.endHour;
}

/**
 * The factor for the second barrier, over building footprints, that sits on top of the shade barrier.
 *
 * The routing network multiplies the factors of overlapping scaled-cost barriers: shade at 0.5 with a building at 0.7
 * solved to the same time as the building alone at 0.35 (tested 10 November 2026). Footprints are already inside the
 * shade barrier, so this factor is the indoor cost over the shade cost: 0.7 while buildings are open, and 2 while they
 * are not, which cancels the shade discount and leaves a building no cheaper than open ground.
 */
export function indoorBarrierFactor(open: boolean): number {
  return (open ? INDOOR_COST_FACTOR : 1) / SHADE_COST_FACTOR;
}

/**
 * A building from the campus structures layer, with whatever height evidence there is for it.
 */
export interface BuildingCaster {
  number: string;
  /** The building's abbreviation (`EDCT`), for saying which buildings a walk cuts through. */
  abbreviation?: string;
  footprint: Array<LonLat>;
  /** Roof minus ground, in metres, from the 2019 SketchUp model of this building number, if there is one. */
  modelHeight?: number;
  /** The structures layer's floor count, if it has one. */
  floors?: number;
}

export interface TreeCaster {
  position: LonLat;
  /** Feet, as the inventory records it; missing for about 45% of trees. */
  heightFeet?: number;
  /** Feet across the crown. */
  spreadFeet?: number;
}

/** Where a building's height came from, so the directions can say how much of the shade rests on estimates. */
export type HeightSource = 'model' | 'floors' | 'default';

/**
 * A building's height in metres: its 3D model's where it has one, otherwise its floors at 3.6 m each, otherwise one
 * floor.
 *
 * The model's height is the median of its roof, so a tower on a low base (Rudder Tower on its theatre complex) comes
 * out at the base's height. One height per footprint cannot do better; the meshes have the real shape, and a solve
 * that needs it would have to read them.
 */
export function buildingHeight(building: BuildingCaster): { height: number; source: HeightSource } {
  if (building.modelHeight > 0) {
    return { height: building.modelHeight, source: 'model' };
  }

  if (building.floors > 0) {
    return { height: building.floors * METRES_PER_FLOOR, source: 'floors' };
  }

  return { height: METRES_PER_FLOOR, source: 'default' };
}

/**
 * A tree's height and crown radius in metres, or `undefined` for a tree with no crown spread. A tree with a spread and
 * no height is taken to be as tall as it is wide, which is about right for the live oaks that make up much of campus,
 * and at least 10 feet.
 */
export function treeSize(tree: TreeCaster): { height: number; crownRadius: number; estimated: boolean } {
  if (!(tree.spreadFeet > 0)) {
    return undefined;
  }

  const crownRadius = (tree.spreadFeet / 2) * FEET;

  if (tree.heightFeet > 0) {
    return { height: tree.heightFeet * FEET, crownRadius, estimated: false };
  }

  return { height: Math.max(10, tree.spreadFeet) * FEET, crownRadius, estimated: true };
}

/**
 * Every shadow cast at one moment by the buildings and trees around a walk, and a count of what each rests on.
 */
export interface ShadeScene {
  when: Date;
  sun: SunPosition;
  /** Overlapping rings; a point in any of them is in shade. Empty when the sun is down. */
  rings: Array<ShadowRing>;
  buildings: Record<HeightSource, number>;
  trees: { measured: number; estimated: number; skipped: number };
  /** The buildings' footprints, for measuring how much of a walk goes through them. */
  footprints: Array<{ abbreviation: string; ring: ShadowRing }>;
}

/**
 * Metres a walk spends inside each building it cuts through, longest first, leaving out anything under 3 m (a path
 * that grazes a corner or a door step).
 *
 * The routing network has paths through some buildings: the quickest walk from Rudder to Zachry spends 92 m indoors,
 * through EDCT, Zachry and HALB (10 November 2026). Inside is out of the sun, so a footprint is shade at any hour of
 * daylight: `buildingShadow` includes it, and the shaded solve prefers a cut-through as it prefers any other shade.
 */
export function throughBuildings(
  paths: Array<Array<LonLat>>,
  footprints: ShadeScene['footprints']
): Array<{ abbreviation: string; metres: number }> {
  const near = new Set(ringsNearPath(footprints.map((f) => f.ring), paths, 1));
  const metres = new Map<string, number>();

  for (const footprint of footprints.filter((f) => near.has(f.ring))) {
    const inside = shadeAlongPath(paths, [footprint.ring], 1).shaded;

    if (inside > 0) {
      metres.set(footprint.abbreviation, (metres.get(footprint.abbreviation) ?? 0) + inside);
    }
  }

  return Array.from(metres, ([abbreviation, m]) => ({ abbreviation, metres: m }))
    .filter((b) => b.metres >= 3)
    .sort((a, b) => b.metres - a.metres);
}

export function shadeScene(
  when: Date,
  sun: SunPosition,
  buildings: Array<BuildingCaster>,
  trees: Array<TreeCaster>
): ShadeScene {
  const scene: ShadeScene = {
    when,
    sun,
    rings: [],
    buildings: { model: 0, floors: 0, default: 0 },
    trees: { measured: 0, estimated: 0, skipped: 0 },
    footprints: []
  };

  for (const building of buildings) {
    const { height, source } = buildingHeight(building);

    scene.buildings[source]++;
    scene.rings.push(...buildingShadow(building.footprint, height, sun));
    scene.footprints.push({ abbreviation: building.abbreviation || building.number, ring: building.footprint });
  }

  for (const tree of trees) {
    const size = treeSize(tree);

    if (!size) {
      scene.trees.skipped++;
      continue;
    }

    scene.trees[size.estimated ? 'estimated' : 'measured']++;

    // Ten corners: enough for a crown's shadow, and few enough that thousands of them can go to a route solve.
    const ring = treeShadow(tree.position, size.height, size.crownRadius, sun, 10);

    if (ring) {
      scene.rings.push(ring);
    }
  }

  return scene;
}

/**
 * What the directions say about shade: how much of the chosen walk is shaded, and what the quickest walk would have
 * been, so a student can see what the detour buys.
 */
export interface ShadeSummary {
  when: Date;
  sun: SunPosition;
  /** The sun is on or below the horizon: the whole walk is out of the sun, and the quickest route is used. */
  sunDown: boolean;
  /** Share of the shaded route's length in shade, 0 to 1. */
  share: number;
  /** Real walking minutes of the shaded route, at the quickest route's pace. */
  minutes: number;
  quickest: { share: number; minutes: number };
  buildings: ShadeScene['buildings'];
  trees: ShadeScene['trees'];
  /** The buildings the shaded walk cuts through, with metres inside each; already counted in `share`. */
  indoors: Array<{ abbreviation: string; metres: number }>;
  /** Whether buildings were taken to be open at the trip's time, and so preferred over outdoor shade. */
  buildingsOpen: boolean;
}

export function summarizeShade(
  scene: ShadeScene,
  shadedPaths: Array<Array<LonLat>>,
  shadedMinutes: number,
  quickestPaths: Array<Array<LonLat>>,
  quickestMinutes: number
): ShadeSummary {
  const sunDown = scene.sun.altitude <= 0;

  return {
    when: scene.when,
    sun: scene.sun,
    sunDown,
    share: sunDown ? 1 : shadeAlongPath(shadedPaths, scene.rings).share,
    minutes: shadedMinutes,
    quickest: {
      share: sunDown ? 1 : shadeAlongPath(quickestPaths, scene.rings).share,
      minutes: quickestMinutes
    },
    buildings: scene.buildings,
    trees: scene.trees,
    indoors: sunDown ? [] : throughBuildings(shadedPaths, scene.footprints),
    buildingsOpen: buildingsLikelyOpen(scene.when)
  };
}
