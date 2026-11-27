import { centroidFromPolygonGeometry } from '@tamu-gisc/common/utils/geometry/esri';
import { findNearestIndex } from '@tamu-gisc/common/utils/geometry/generic';

import esri = __esri;

/**
 * Whether the visitor has chosen a parking permit, so a drive with a parking pass can look for a lot it allows (#3875).
 *
 * The permit starts as `undefined`, not `''`, and nothing in the app sets it, so a test for `!== ''` let a link with
 * `mode=3` look for lots with no permit: the lots were asked for `FAC_CODE = undefined`, and the trip never finished.
 */
export function permitChosen(permit: string | undefined | null): boolean {
  return typeof permit === 'string' && permit.trim() !== '';
}

/**
 * The lot nearest a point, and the centre it is reached at, or `undefined` when there is none (#3875).
 *
 * The lots are the search service's JSON rather than Polygon instances, with rings and no centroid of their own, so the
 * centre comes from the shared helper that reads both (#1854, #1856). With no lots the planner read `.geometry` of
 * nothing and threw, so the trip never finished; it now goes on without a lot.
 */
export function nearestLot<T extends { geometry: unknown }>(
  lots: T[] | null | undefined,
  to: { latitude: number; longitude: number }
): { lot: T; centre: { latitude: number; longitude: number } } | undefined {
  if (!lots || lots.length === 0) {
    return undefined;
  }

  const centres = lots.map((lot) => ({ geometry: centroidFromPolygonGeometry(lot.geometry as esri.Polygon) }));
  const nearest = findNearestIndex(to, centres);

  return nearest < 0 ? undefined : { lot: lots[nearest], centre: centres[nearest].geometry };
}
