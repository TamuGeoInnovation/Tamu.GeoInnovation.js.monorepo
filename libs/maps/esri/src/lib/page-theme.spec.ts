import { CAMPUS_NIGHT_PAINT, NIGHT, campusNightPaint } from './campus-night-style';
import { esriThemeStylesheet, isCampusBasemap, pageTheme, selectionSymbolForTheme } from './page-theme';
import { ESRI_RUNTIME_VERSION } from './esri-runtime';

import esri = __esri;

describe('campusNightPaint', () => {
  it('finds an exact style layer', () => {
    expect(campusNightPaint('Campus Structures/University Building')).toEqual({
      'fill-color': NIGHT.building,
      'fill-outline-color': NIGHT.buildingEdge
    });
  });

  it('finds a layer by its prefix, every tree size and every building label size', () => {
    expect(campusNightPaint('Trees/73 - 140')).toEqual({ 'icon-opacity': 0.2 });
    expect(campusNightPaint('Campus Structures/label/UniBldg-3000-9000')?.['text-color']).toBe(NIGHT.buildingLabel);
  });

  it('prefers the longest prefix: road labels are not painted as roads', () => {
    expect(campusNightPaint('Road Names/label/Major Street')).toHaveProperty('text-color');
    expect(campusNightPaint('Road Names/Major Street')).toEqual({ 'line-color': NIGHT.road });
  });

  it('leaves a layer it does not name alone', () => {
    expect(campusNightPaint('Something added next year')).toBeUndefined();
  });

  it('draws no label in black, and every label on a halo', () => {
    const labels = Object.values(CAMPUS_NIGHT_PAINT).filter((paint) => 'text-color' in paint);

    expect(labels.length).toBeGreaterThan(5);

    for (const paint of labels) {
      expect(paint['text-color']).not.toMatch(/^#0{3,6}$/);
      expect(paint['text-halo-color']).toBeTruthy();
    }
  });
});

describe('selectionSymbolForTheme', () => {
  const polygon = {
    type: 'simple-fill',
    style: 'solid',
    color: [252, 227, 0, 0.55],
    outline: { color: [252, 227, 0, 0.8], width: '2px' }
  };

  it('is unchanged by day', () => {
    expect(selectionSymbolForTheme(polygon, 'light')).toBe(polygon);
  });

  it('is a faint fill with a solid, wider edge at night', () => {
    expect(selectionSymbolForTheme(polygon, 'dark')).toEqual({
      type: 'simple-fill',
      style: 'solid',
      color: [252, 227, 0, 0.18],
      outline: { color: [252, 227, 0, 1], width: '3px' }
    });
  });

  it('leaves points alone at night', () => {
    const point = { type: 'simple-marker', style: 'circle', size: 8 };

    expect(selectionSymbolForTheme(point, 'dark')).toBe(point);
  });
});

describe('page theme', () => {
  afterEach(() => document.documentElement.removeAttribute('data-theme'));

  it('is light on a page that never says otherwise, as in GIS Day', () => {
    expect(pageTheme(document)).toBe('light');
  });

  it('is dark when <html> says so', () => {
    document.documentElement.setAttribute('data-theme', 'dark');

    expect(pageTheme(document)).toBe('dark');
  });

  it('loads Esri’s stylesheet from the pinned release, light or dark', () => {
    expect(esriThemeStylesheet('dark')).toBe(
      `https://js.arcgis.com/${ESRI_RUNTIME_VERSION}/@arcgis/core/assets/esri/themes/dark/main.css`
    );
  });

  it('counts only the campus basemaps, the dated ones on dev included, as campus', () => {
    const basemap = (id: string) => ({ id }) as esri.Basemap;

    expect(isCampusBasemap(basemap('aggie_basemap'))).toBe(true);
    expect(isCampusBasemap(basemap('aggie_basemap_raster_2026_10'))).toBe(true);
    expect(isCampusBasemap(basemap('nearmap_cs_basemap'))).toBe(false);
    expect(isCampusBasemap(undefined)).toBe(false);
  });
});
