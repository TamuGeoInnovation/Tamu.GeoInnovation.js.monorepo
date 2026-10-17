import esri = __esri;

/**
 * A view's `highlights` with Esri's default highlight drawn invisibly, for maps that draw their own selection
 * (the selection graphics layer in `EsriMapService`) and want nothing drawn over it.
 *
 * Replaces `highlightOptions: { haloOpacity: 0, fillOpacity: 0 }`, deprecated in 4.32. Setting `highlights`
 * replaces the view's whole collection, so Esri's other built-in entry, `temporary`, is listed as the view
 * has it by default; the old property changed only the `default` entry.
 */
export const HIDDEN_DEFAULT_HIGHLIGHT: Array<esri.HighlightOptionsProperties> = [
  { name: 'default', haloOpacity: 0, fillOpacity: 0 },
  { name: 'temporary', color: 'yellow' }
];
