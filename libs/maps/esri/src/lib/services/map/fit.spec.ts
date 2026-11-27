import { coveredEdges, goToClearOf, Rect } from './fit';

import esri = __esri;

/**
 * A fit leaves clear what lies over the map (#2763): the side panel, which a long bus route's far end finished behind
 * because the fit used the whole view.
 */
describe('coveredEdges', () => {
  const map: Rect = { left: 0, right: 1280, top: 0, bottom: 900 };

  it("counts a panel over the map's right side as covering that much of it", () => {
    expect(coveredEdges(map, [{ left: 920, right: 1280, top: 0, bottom: 900 }])).toEqual({ left: 0, right: 360 });
  });

  it('counts a panel slid out of view, and so off the map, as covering none of it', () => {
    expect(coveredEdges(map, [{ left: 1280, right: 1640, top: 0, bottom: 900 }])).toEqual({ left: 0, right: 0 });
  });

  it('counts a panel on the left on the left', () => {
    expect(coveredEdges(map, [{ left: 0, right: 300, top: 0, bottom: 900 }])).toEqual({ left: 300, right: 0 });
  });

  it('counts nothing above or below the map', () => {
    expect(coveredEdges(map, [{ left: 920, right: 1280, top: 900, bottom: 1000 }])).toEqual({ left: 0, right: 0 });
  });

  it('covers nothing with nothing over the map', () => {
    expect(coveredEdges(map, [])).toEqual({ left: 0, right: 0 });
  });
});

describe('goToClearOf', () => {
  /** A view that records the padding each move was made with, and the point `toMap` was asked for. */
  function fakeView(fails = false) {
    const view = {
      width: 1280,
      height: 900,
      padding: {} as esri.ViewPadding,
      center: null as unknown,
      movedWith: [] as esri.ViewPadding[],
      askedFor: null as { x: number; y: number } | null,
      goTo: async () => {
        view.movedWith.push({ ...view.padding });

        if (fails) {
          throw new Error('interrupted');
        }
      },
      toMap: (point: { x: number; y: number }) => {
        view.askedFor = point;

        return { type: 'point', x: 7, y: 8 };
      }
    };

    return view;
  }

  it('moves with the covered part as padding, then puts the padding back and keeps the picture where it is', async () => {
    const view = fakeView();

    await goToClearOf(view as unknown as esri.MapView, { target: [] } as esri.GoToTarget2D, { left: 0, right: 360 });

    expect(view.movedWith).toEqual([{ left: 0, right: 360 }]);
    expect(view.padding).toEqual({});
    // The point in the middle of the screen becomes the center, so taking the padding off does not move the map.
    expect(view.askedFor).toEqual({ x: 640, y: 450 });
    expect(view.center).toEqual({ type: 'point', x: 7, y: 8 });
  });

  it('puts the padding back when the move is interrupted', async () => {
    const view = fakeView(true);

    await expect(
      goToClearOf(view as unknown as esri.MapView, { target: [] } as esri.GoToTarget2D, { left: 0, right: 360 })
    ).rejects.toThrow('interrupted');
    expect(view.padding).toEqual({});
  });

  it('moves as goTo would when nothing is covered, leaving padding and center alone', async () => {
    const view = fakeView();

    await goToClearOf(view as unknown as esri.MapView, { target: [] } as esri.GoToTarget2D, { left: 0, right: 0 });

    expect(view.movedWith).toEqual([{}]);
    expect(view.center).toBeNull();
  });
});
