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
