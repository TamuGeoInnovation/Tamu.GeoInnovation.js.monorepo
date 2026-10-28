/**
 * Where a hosted layer's real symbology lives (#1497).
 *
 * A layer authored in ArcGIS Pro keeps its symbol on the **portal item**. The **service definition**
 * carries a flattened approximation, and that is what a layer loaded by its service URL draws - which
 * is every layer this application loads.
 *
 * Measured on 6 October 2026 across the 36 hosted feature services in `connections.ts`: of 128
 * layers, 128 publish CIM symbology on their item and 0 publish it on their service. Not one
 * exception. The Football micromobility routes are the worked example (#1496): authored as a
 * 1.95-point line with 15-point arrowheads, flattened by the service into a 15-point line with no
 * arrows, apparently by taking the arrowhead's size and using it as the line width.
 *
 * This is why symbols have had to be hard-coded one at a time (#1028).
 */

/** The part of a portal item's data this needs. Declared structurally; it is read as JSON. */
export interface PortalItemData {
  layers?: Array<{
    id?: number;
    layerDefinition?: {
      drawingInfo?: {
        renderer?: unknown;
      };
    };
  }>;
}

/**
 * The portal that publishes a service, derived from the service's own URL.
 *
 * ArcGIS Enterprise serves its portal alongside the server on the same host; ArcGIS Online items live
 * on arcgis.com whatever `services1.arcgis.com`-style host the service itself is on.
 */
export function portalItemDataUrl(serviceUrl: string, itemId: string): string | null {
  if (!itemId) {
    return null;
  }

  let hostname: string;

  try {
    hostname = new URL(serviceUrl).hostname;
  } catch {
    return null;
  }

  const base = /(^|\.)arcgis\.com$/i.test(hostname)
    ? 'https://www.arcgis.com/sharing/rest'
    : `https://${hostname}/portal/sharing/rest`;

  return `${base}/content/items/${itemId}/data?f=json`;
}

/**
 * The renderer a portal item publishes for one of its layers, or null when it publishes none.
 *
 * `layerId` is the sublayer number as the service numbers it, which is what the item's `layers` array
 * is keyed by - the two agree, and a layer missing from the item is normal rather than an error.
 */
export function rendererForLayer(data: PortalItemData | null | undefined, layerId: number | undefined): unknown | null {
  if (!data || layerId === undefined || layerId === null) {
    return null;
  }

  const entry = (data.layers ?? []).find((layer) => layer.id === layerId);

  return entry?.layerDefinition?.drawingInfo?.renderer ?? null;
}

/**
 * A renderer that draws every feature with the symbol and label of one class of a service's renderer,
 * found by its label, or null when the renderer has no such class.
 *
 * For a layer whose service renderer has gone stale against its data (#1992): its values name features
 * the layer no longer holds, so nothing it holds is drawn, while its symbol is still the owner's. The
 * layer's definition expression decides which features it draws; this keeps the owner's symbol and
 * drops only the stale test. `renderer` is renderer JSON, from a portal item or a service.
 */
export function serviceClassRenderer(renderer: unknown, label: string): object | null {
  const infos = (renderer as { uniqueValueInfos?: Array<{ label?: string; symbol?: unknown }> } | null | undefined)
    ?.uniqueValueInfos;
  const info = (infos ?? []).find((candidate) => candidate.label === label && candidate.symbol);

  return info ? { type: 'simple', label, symbol: info.symbol } : null;
}

/**
 * Whether every field a renderer keys on exists on the layer it would draw (#2500).
 *
 * A portal item is not republished when its service is. On 27 October 2026 the GIS team replaced the
 * baseball views' schema and the production item kept renderers keyed on `baseball`, `type` and `event`
 * for layers that no longer have those fields: no feature matches any class, so nothing draws.
 *
 * Only a `uniqueValue` (`field1` to `field3`) or `classBreaks` (`field`) renderer is judged, and one
 * with an Arcade `valueExpression` keys on no field. Anything else passes: this rejects one proven
 * fault, it does not vet renderers. Names are compared without regard to case, as ArcGIS compares them.
 */
export function rendererFieldsPresent(renderer: unknown, fieldNames: string[]): boolean {
  return missingRendererFields(renderer, fieldNames).length === 0;
}

/** The fields `renderer` keys on that are not in `fieldNames`, as the renderer names them; see `rendererFieldsPresent`. */
export function missingRendererFields(renderer: unknown, fieldNames: string[]): string[] {
  const present = new Set(fieldNames.map((name) => name.toLowerCase()));

  const keyed = (node: unknown): string[] => {
    const candidate = node as
      | {
          type?: string;
          valueExpression?: string;
          field?: unknown;
          field1?: unknown;
          field2?: unknown;
          field3?: unknown;
          uniqueValueInfos?: unknown[];
        }
      | null
      | undefined;

    if (!candidate || typeof candidate !== 'object' || candidate.valueExpression) {
      return [];
    }

    const names =
      candidate.type === 'uniqueValue'
        ? [candidate.field1, candidate.field2, candidate.field3]
        : candidate.type === 'classBreaks'
          ? [candidate.field]
          : [];

    const nested = Array.isArray(candidate.uniqueValueInfos)
      ? candidate.uniqueValueInfos.flatMap((info) => keyed((info as { renderer?: unknown } | null)?.renderer))
      : [];

    return [...names.filter((name): name is string => typeof name === 'string' && name.length > 0), ...nested];
  };

  return [...new Set(keyed(renderer))].filter((name) => !present.has(name.toLowerCase()));
}

/**
 * Whether a layer source has already decided how it draws.
 *
 * A map that sets its own renderer means it: the Construction layer deliberately replaces the
 * service's per-owner colours with one orange hatch. Those are left alone, so this only fills in
 * where nothing was chosen.
 */
export function declaresOwnRenderer(source: unknown): boolean {
  const native = (source as { native?: { renderer?: unknown } })?.native;

  return native?.renderer !== undefined && native?.renderer !== null;
}

/**
 * Where a layer's symbology came from, as the map service decided it (#1578).
 *
 * - `own`: its definition sets a renderer.
 * - `portal`: drawn with the renderer its portal item publishes (#1497).
 * - `service`: drawn with whatever its service publishes.
 * - `none`: a GeoJSON or CSV layer with no renderer of its own. Those formats carry no symbology, so
 *   ArcGIS draws its default marker - which is how Dining drew as plain dots (#1576).
 *
 * Kept beside the layer rather than on it, so nothing is added to an Esri object. The map probe reads it.
 */
export type SymbologySource = 'own' | 'portal' | 'service' | 'none';

const symbologySources = new WeakMap<object, SymbologySource>();

export function recordSymbologySource(layer: object, source: SymbologySource): void {
  symbologySources.set(layer, source);
}

export function symbologySourceOf(layer: object): SymbologySource | undefined {
  return symbologySources.get(layer);
}

/**
 * Whether a service publishes nothing worth drawing: no drawing info at all, or ArcGIS's own default -
 * a simple renderer with `RedSphere.png`, which is what a hosted layer gets when nobody chose a symbol.
 * AggiePrint's service is the worked example (#1576).
 */
export function publishesDefaultSymbology(sourceJSON: unknown): boolean {
  const renderer = (sourceJSON as { drawingInfo?: { renderer?: { type?: string; symbol?: { url?: string } } } })?.drawingInfo
    ?.renderer;

  if (!renderer) {
    return true;
  }

  return renderer.type === 'simple' && renderer.symbol?.url === 'RedSphere.png';
}
