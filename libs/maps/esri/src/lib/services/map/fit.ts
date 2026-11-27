import esri = __esri;

/**
 * How far elements laid over a map reach into it from its left and right, in pixels: what a fit leaves clear (#2763).
 *
 * An element counts on the side its middle is nearer, and only where it overlaps the map; a side panel slid out of
 * view lies outside the map and counts for nothing, so a closed panel leaves the whole map to fit into.
 */
export function coveredEdges(map: Rect, covers: Rect[]): { left: number; right: number } {
  const middle = (map.left + map.right) / 2;
  let left = 0;
  let right = 0;

  for (const cover of covers) {
    if (cover.bottom <= map.top || cover.top >= map.bottom) {
      continue;
    }

    if ((cover.left + cover.right) / 2 > middle) {
      right = Math.max(right, map.right - Math.max(cover.left, map.left));
    } else {
      left = Math.max(left, Math.min(cover.right, map.right) - map.left);
    }
  }

  return { left: Math.max(0, left), right: Math.max(0, right) };
}

/**
 * Goes to a target in the part of the view that `covered` leaves clear, and leaves the view's padding as it was (#2763).
 *
 * Esri's `goTo` fits a target to the whole view, or to the part `view.padding` leaves, and has no padding of its own. So
 * the padding is set for the move and put back after it, and the view's center is set at once to the point that was
 * in the middle of the screen, since a view keeps its center when its padding changes and would otherwise move. The
 * picture does not move; only what the center means does. Setting `view.padding` for good would center every map's
 * first framing beside the panel as well, which is not this fix.
 *
 * A move that is interrupted, by the visitor dragging the map say, still puts the padding back.
 */
export async function goToClearOf(
  view: esri.MapView | esri.SceneView,
  target: esri.GoToTarget2D,
  covered: { left: number; right: number },
  options?: esri.GoToOptions2D
): Promise<void> {
  // The 2D signature stands for both: what is fitted here, graphics and geometries, is a target in a scene as well.
  const go = (to: esri.GoToTarget2D) => (view as esri.MapView).goTo(to, options);

  if (covered.left <= 0 && covered.right <= 0) {
    return go(target);
  }

  const own = fitting.get(view) ?? { ...view.padding };
  const moves = (moving.get(view) ?? 0) + 1;

  fitting.set(view, own);
  moving.set(view, moves);
  view.padding = { ...own, left: (own.left ?? 0) + covered.left, right: (own.right ?? 0) + covered.right };

  try {
    await go(target);
  } finally {
    // Only the last of overlapping moves puts the padding back, so an earlier one cannot take it from a later one.
    if (moving.get(view) === moves) {
      const middle = view.toMap({
        x: ((own.left ?? 0) + view.width - (own.right ?? 0)) / 2,
        y: ((own.top ?? 0) + view.height - (own.bottom ?? 0)) / 2
      });

      view.padding = own;
      fitting.delete(view);
      moving.delete(view);

      if (middle) {
        view.center = middle;
      }
    }
  }
}

/** A box on the page, as `getBoundingClientRect` gives it. */
export interface Rect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** Each view's own padding while a fit has changed it, and how many fits have started since it was changed. */
const fitting = new WeakMap<esri.MapView | esri.SceneView, esri.ViewPadding>();
const moving = new WeakMap<esri.MapView | esri.SceneView, number>();
