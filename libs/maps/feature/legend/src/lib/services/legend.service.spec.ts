import { showsInLegend } from './legend.service';

describe('showsInLegend', () => {
  it('shows a listed layer', () => {
    expect(showsInLegend({ listMode: 'show' } as __esri.Layer)).toBe(true);
  });

  it('leaves out a layer hidden from the Layers list', () => {
    expect(showsInLegend({ listMode: 'hide' } as __esri.Layer)).toBe(false);
  });

  it('leaves out a listed layer whose legend is turned off', () => {
    // The Tailgating map's zone number circles can be toggled in the Layers list but have no legend
    // entry of their own.
    expect(showsInLegend({ listMode: 'show', legendEnabled: false } as unknown as __esri.Layer)).toBe(false);
  });
});
