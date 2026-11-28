/**
 * How many readings, half a second apart, must all show the map finished before it is photographed: two seconds, as the
 * smoke suite's "finished drawing" is (#1897).
 */
export const STEADY_READINGS = 4;

/**
 * Whether the page shows its map drawn, from readings taken every half second, newest last (#1937).
 *
 * Each reading is the map probe's `ready` and `drawing` (both `null` on a page with no probe) and how many spinners the
 * page shows. Drawn means the last `STEADY_READINGS` readings all have the layers settled, nothing drawing and no
 * spinner. One reading of `drawing === false` was not enough: in production's 16 October set two pages were taken blank
 * with the layer list still spinning, on pages that open a notice, the class of fault #1519 was.
 *
 * @param {Array<{ ready: boolean | null, drawing: boolean | null, spinners: number }>} readings
 */
export function drawnFor(readings) {
  if (readings.length < STEADY_READINGS) {
    return false;
  }

  return readings
    .slice(-STEADY_READINGS)
    .every(({ ready, drawing, spinners }) => ready !== false && drawing !== true && spinners === 0);
}
