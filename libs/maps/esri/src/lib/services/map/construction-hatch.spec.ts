import { CONSTRUCTION_HATCH_RENDERER } from './construction-hatch';

/** The construction hatch every campus draws (#2459, #2532): an orange grid, no fill, our own black outline. */
describe('CONSTRUCTION_HATCH_RENDERER', () => {
  const symbolLayers = CONSTRUCTION_HATCH_RENDERER.symbol.data.symbol.symbolLayers as Array<Record<string, unknown>>;

  it('draws its own black outline on top of the grid', () => {
    // CIM draws the first symbol layer on top.
    expect(symbolLayers[0]).toMatchObject({ type: 'CIMSolidStroke', color: [0, 0, 0, 255] });
  });

  it('draws an orange grid of two hatches at right angles, and no fill', () => {
    const hatches = symbolLayers.slice(1);

    expect(hatches.map((layer) => [layer['type'], layer['rotation']])).toEqual([
      ['CIMHatchFill', 0],
      ['CIMHatchFill', 90]
    ]);
    expect(symbolLayers.map((layer) => layer['type'])).not.toContain('CIMSolidFill');
  });

  it('draws the grid at 60% opacity, so a building number under it stays readable (#2573)', () => {
    const strokes = symbolLayers
      .slice(1)
      .map((hatch) => (hatch['lineSymbol'] as { symbolLayers: Array<{ color: number[] }> }).symbolLayers[0].color);

    expect(strokes).toEqual([
      [230, 152, 0, 153],
      [230, 152, 0, 153]
    ]);
  });
});
