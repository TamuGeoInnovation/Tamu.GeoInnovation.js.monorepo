/**
 * The timeline under the Aerial Imagery date slider (#1541): where each Nearmap capture sits, kept
 * apart from the logic of the slider itself so it can be tested on its own.
 */

/** The slider's range. Large enough that a step is finer than a pixel. */
export const SLIDER_LENGTH = 1000;

/** The closest two ticks may be, as a share of the slider: about 17 pixels at its usual width. */
export const MIN_GAP = SLIDER_LENGTH * 0.045;

/** Whole days since 1970 for a `YYYY-MM-DD` date. */
export function dayOf(date: string): number {
  return Math.round(Date.parse(date) / 86400000);
}

/**
 * Spreads sorted days over `0` to `SLIDER_LENGTH` in proportion to the time between them, widening any
 * gap shorter than `MIN_GAP` to it and narrowing the rest to make room.
 */
export function spreadPositions(days: number[]): number[] {
  if (days.length < 2) {
    return days.map(() => SLIDER_LENGTH);
  }

  const gaps = days.slice(1).map((day, i) => day - days[i]);
  const minimum = Math.min(MIN_GAP, SLIDER_LENGTH / gaps.length);
  let widened = new Set<number>();

  // Each pass scales the remaining gaps into the room left; a gap that scales below the minimum is
  // widened to it, which leaves less room for the rest. Settles in a pass or two.
  for (let pass = 0; pass < gaps.length; pass++) {
    const rest = gaps.reduce((sum, gap, i) => (widened.has(i) ? sum : sum + gap), 0);
    const scale = rest > 0 ? (SLIDER_LENGTH - widened.size * minimum) / rest : 0;
    const next = new Set(gaps.map((gap, i) => i).filter((i) => widened.has(i) || gaps[i] * scale < minimum));

    if (next.size === widened.size) {
      const positions = [0];

      gaps.forEach((gap, i) => positions.push(positions[i] + (widened.has(i) ? minimum : gap * scale)));

      return positions;
    }

    widened = next;
  }

  return days.map((_, i) => (i * SLIDER_LENGTH) / (days.length - 1));
}

/** Where a day falls on the slider, between the positions of the captures either side of it. */
export function positionOfDay(day: number, days: number[], positions: number[]): number {
  const after = days.findIndex((d) => d >= day);

  if (after <= 0) {
    return after === 0 ? positions[0] : positions[positions.length - 1];
  }

  const share = (day - days[after - 1]) / (days[after] - days[after - 1]);

  return positions[after - 1] + share * (positions[after] - positions[after - 1]);
}