import { ESRI_RUNTIME_VERSION } from './esri-runtime';

import esri = __esri;

/**
 * Esri's widgets, Calcite and the campus basemap drawn light or dark to match the page.
 *
 * The page says which by `data-theme` on `<html>`, set by ThemeService (`libs/common/ngx/ui/theme`). This reads only
 * the attribute, so a map in an app that never sets it (GIS Day, the geoservices site) stays light as it always was,
 * and this library does not depend on the one that decides.
 */
export type PageTheme = 'light' | 'dark';

/** The id of the one `<link>` that carries Esri's widget stylesheet, whichever theme. */
export const ESRI_THEME_LINK_ID = 'esri-widget-theme';

export function esriThemeStylesheet(theme: PageTheme): string {
  return `https://js.arcgis.com/${ESRI_RUNTIME_VERSION}/@arcgis/core/assets/esri/themes/${theme}/main.css`;
}

export function pageTheme(document: Document): PageTheme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * The campus basemaps' ids. Only these are darkened at night: they are ours and light grey, so a filter turns them into
 * a dark map that still shows every building and label. Aerial imagery is a photograph and stays as it is, as does any
 * other basemap. The vector and raster campus basemaps share `aggie_basemap`; the dated ones on dev start with it.
 */
export function isCampusBasemap(basemap: esri.Basemap | null | undefined): boolean {
  return typeof basemap?.id === 'string' && basemap.id.startsWith('aggie_basemap');
}

/**
 * A campus layer that cannot be restyled at night - the raster campus basemap, the construction hatch drawn over the
 * vector one - is filtered instead: darker, much less colourful, and nudged cool to sit with the vector night style
 * (campus-night-style.ts). Only a fallback; a filter cannot make roads lighter than the ground or labels light, which is
 * why the vector basemap is repainted rather than filtered (11 November 2026).
 */
export const NIGHT_BASEMAP_EFFECT = 'brightness(45%) saturate(35%) sepia(20%) hue-rotate(180deg)';

/**
 * Paints a vector campus layer for night, style layer by style layer, and returns the day paint of each layer it
 * changed. The day paint is merged under the night one, so widths and opacities the night style does not name stay.
 */
function restyleForNight(
  layer: esri.VectorTileLayer,
  campusNightPaint: (styleLayerId: string) => Record<string, string | number> | undefined
): Map<string, object> {
  const day = new Map<string, object>();
  const styleLayers: Array<{ id: string }> = layer.currentStyleInfo?.style?.layers ?? [];

  for (const { id } of styleLayers) {
    const night = campusNightPaint(id);

    if (!night) {
      continue;
    }

    const paint = (layer.getPaintProperties(id) ?? {}) as object;

    day.set(id, paint);
    layer.setPaintProperties(id, { ...paint, ...night });
  }

  return day;
}

/**
 * Keeps `<link id="esri-widget-theme">` on the light or dark stylesheet as the page's theme changes, and Calcite's mode
 * on `elements` (Esri's map elements, whose shadow roots set a mode of their own). Returns `refresh`, for when
 * an element has been drawn since, and `stop`.
 */
export function followPageTheme(
  document: Document,
  elements: () => Array<Element | undefined>
): { refresh: () => void; stop: () => void } {
  const apply = () => {
    const theme = pageTheme(document);

    let link = document.getElementById(ESRI_THEME_LINK_ID) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.id = ESRI_THEME_LINK_ID;
      link.rel = 'stylesheet';
      document.head.prepend(link);
    }

    const href = esriThemeStylesheet(theme);

    if (link.getAttribute('href') !== href) {
      link.setAttribute('href', href);
    }

    for (const element of elements()) {
      element?.classList.toggle('calcite-mode-dark', theme === 'dark');
      element?.classList.toggle('calcite-mode-light', theme === 'light');
    }
  };

  apply();

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return { refresh: apply, stop: () => observer.disconnect() };
}

/**
 * Darkens the campus basemap while the page is dark, and undoes it when the page turns light or another basemap is
 * chosen. Nothing is swapped: whichever basemap the visitor picked stays the one they see. Returns what stops it.
 */
export function followPageThemeOnBasemap(
  document: Document,
  map: esri.Map,
  // Passed in rather than imported: this file is reached from the package index, and a static @arcgis/core import
  // there breaks every Jest spec that imports the package (EsriModuleProviderService loads it at run time instead).
  reactiveUtils: esri.reactiveUtils
): () => void {
  // What this changed, so only that is undone: a filter on a raster or feature layer, and each vector style layer's day
  // paint, kept to put back at sunrise.
  const filtered = new Set<esri.Layer & { effect: unknown }>();
  const dayPaint = new Map<esri.VectorTileLayer, Map<string, object>>();

  const apply = () => {
    const night = pageTheme(document) === 'dark' && isCampusBasemap(map.basemap);
    const layers = (map.basemap?.baseLayers?.toArray() ?? []) as Array<esri.Layer & { effect: unknown }>;

    for (const layer of filtered) {
      if (!night || !layers.includes(layer)) {
        layer.effect = null;
        filtered.delete(layer);
      }
    }

    for (const [layer, paints] of dayPaint) {
      if (!night || !layers.includes(layer)) {
        paints.forEach((paint, id) => layer.setPaintProperties(id, paint));
        dayPaint.delete(layer);
      }
    }

    if (!night) {
      return;
    }

    for (const layer of layers) {
      if (layer.type === 'vector-tile') {
        const vector = layer as unknown as esri.VectorTileLayer;

        if (!dayPaint.has(vector)) {
          // Restyled once its style, and the night paint, have loaded. The paint is its own chunk, fetched the first time
          // night comes, so the apps that share this package and never go dark do not carry it in their first load: in
          // the event maps' it was 5.9 kB over their 500 kB warning (11 November 2026). A basemap swapped, or a page
          // turned light, before then is caught by the check inside.
          Promise.all([vector.when(), import('./campus-night-style')]).then(([, { campusNightPaint }]) => {
            if (pageTheme(document) === 'dark' && isCampusBasemap(map.basemap) && !dayPaint.has(vector)) {
              dayPaint.set(vector, restyleForNight(vector, campusNightPaint));
            }
          });
        }
      } else if (!filtered.has(layer)) {
        layer.effect = NIGHT_BASEMAP_EFFECT;
        filtered.add(layer);
      }
    }
  };

  apply();

  const basemapWatch = reactiveUtils.watch(
    () => [map.basemap, map.basemap?.baseLayers?.length],
    () => apply()
  );

  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return () => {
    basemapWatch.remove();
    observer.disconnect();
  };
}

/**
 * A selection symbol as the page's theme wants it. By day, unchanged. At night a polygon's fill drops to a faint wash
 * and its outline is drawn solid and wider: on the dark campus map a half-opaque yellow fill buried the building's own
 * shape and label, where night maps mark a selection with a lit edge. Points and lines are left as they are.
 */
export function selectionSymbolForTheme<T>(symbol: T, theme: PageTheme): T {
  const fill = symbol as unknown as {
    type?: string;
    color?: number[];
    outline?: { color?: number[]; width?: string | number };
  };

  if (theme !== 'dark' || fill?.type !== 'simple-fill' || !Array.isArray(fill.color)) {
    return symbol;
  }

  const [r, g, b] = fill.color;
  const edge = Array.isArray(fill.outline?.color) ? fill.outline.color.slice(0, 3) : [r, g, b];

  return {
    ...fill,
    color: [r, g, b, 0.18],
    outline: { ...fill.outline, color: [...edge, 1], width: '3px' }
  } as unknown as T;
}
