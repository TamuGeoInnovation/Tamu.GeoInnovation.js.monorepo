import { cornersFromRing, ringFromCorners } from './polygon-editor.component';

/**
 * A polygon's corners in and out of the map (#3078). The corners are what a person types, in order around the
 * polygon and without the first repeated; a ring is what Esri draws, closed on its first corner.
 */
describe('PolygonEditorComponent corners', () => {
  const corners = [
    { latitude: 30.612, longitude: -96.342 },
    { latitude: 30.613, longitude: -96.342 },
    { latitude: 30.613, longitude: -96.341 }
  ];

  it('closes the ring on its first corner, longitude first', () => {
    expect(ringFromCorners(corners)).toEqual([
      [-96.342, 30.612],
      [-96.342, 30.613],
      [-96.341, 30.613],
      [-96.342, 30.612]
    ]);
  });

  it('leaves a ring already closed as it is', () => {
    expect(ringFromCorners([...corners, corners[0]])).toHaveLength(4);
  });

  it('draws nothing for fewer than three corners', () => {
    expect(ringFromCorners(corners.slice(0, 2))).toBeUndefined();
    expect(ringFromCorners([])).toBeUndefined();
  });

  it('reads a closed ring back as the corners it was drawn from', () => {
    expect(cornersFromRing(ringFromCorners(corners))).toEqual(corners);
  });

  it('rounds a corner to a millionth of a degree, about 10 cm', () => {
    const drawn = [
      [-96.34212345678, 30.61298765432],
      [-96.342, 30.613],
      [-96.341, 30.613],
      [-96.34212345678, 30.61298765432]
    ];

    expect(cornersFromRing(drawn)[0]).toEqual({ latitude: 30.612988, longitude: -96.342123 });
  });

  it('reads a ring of fewer than three corners as no polygon', () => {
    expect(
      cornersFromRing([
        [-96.342, 30.612],
        [-96.342, 30.613]
      ])
    ).toEqual([]);
  });
});
