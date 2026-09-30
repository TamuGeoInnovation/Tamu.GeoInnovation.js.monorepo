import esri = __esri;

// Type-only: `map.service.ts` imports `registerMapProbe` from here, so a value import would create
// a runtime cycle between the two modules.
import type { MapServiceInstance } from './map.service';

/**
 * Read-only view of one layer's health, as reported to automated tests.
 *
 * `featureCount` is the signal that matters: a layer can be `loaded` with no `error` and still be
 * serving nothing, which is what happens when someone unpublishes a service or changes a
 * definition expression upstream. Counting features is the only way to tell that apart from a
 * healthy layer.
 */
export interface MapLayerProbe {
  id: string;
  title: string;
  type: string;
  visible: boolean;
  loaded: boolean;

  /** `loadError` message, or `null` when the layer loaded cleanly. */
  error: string | null;

  /**
   * Feature count for layers that can be queried, or `null` for layer types that have no such
   * concept (tile and image layers). `null` means "not applicable", never "zero" -- tests must not
   * conflate the two.
   */
  featureCount: number | null;

  /**
   * For a graphics layer, how many graphics it holds, by each graphic's `attributes.type` (`untyped`
   * when it has none); `null` for every other layer type. A graphics layer has no features to count,
   * so this is how a test sees what it has drawn: the bus routes layer, for one, tags its route lines
   * `route` and its stops `waypoints` (#1174).
   */
  graphicTypes: Record<string, number> | null;
}

export interface MapProbeSnapshot {
  /** Every layer has settled -- see `MapProbe.ready`. */
  ready: boolean;

  /**
   * The Esri view's own ready state, reported for diagnostics only.
   *
   * Deliberately not what `ready` means. A view only becomes ready once it is attached to a sized,
   * visible container, so it stays false in a hidden or zero-height pane even when every layer has
   * loaded perfectly -- an observed case, not a hypothetical. Gating tests on it would turn a
   * rendering concern into spurious layer failures.
   */
  viewReady: boolean;

  layers: MapLayerProbe[];
}

export interface MapProbe {
  /**
   * Whether the view is still drawing.
   *
   * `MapView.updating` is true while the view is fetching or painting. It is a different question
   * from `ready`, and a later one: measured against a local build, layers settle around six seconds
   * in and drawing finishes around twenty. Anything that captures the canvas - a screenshot, a pixel
   * assertion - has to wait for this, or it records a half-drawn map.
   *
   * Observed to flip exactly twice per load and settle, across repeated runs and different maps, so
   * it is safe to poll rather than something that thrashes.
   */
  readonly drawing: boolean;

  /**
   * Whether a map is registered and all of its layers have finished loading, successfully or not.
   *
   * This is the signal tests poll before taking a snapshot: it means "layer state is now worth
   * reading", which is exactly what the layer assertions need. Esri takes tens of seconds to get
   * here on a cold load.
   */
  readonly ready: boolean;

  /** Resolves layer health. Queries feature counts, so it performs network requests. */
  snapshot(): Promise<MapProbeSnapshot>;
}

/**
 * Global name the probe is installed under. Deliberately prefixed and awkward: it is a test seam,
 * not an API, and nothing in the applications should read it.
 */
export const MAP_PROBE_GLOBAL = '__tamuGiscMapProbe';

/**
 * The most recently registered map instance.
 *
 * Module-level rather than an Angular service on purpose. `EsriMapService` is `providedIn: 'root'`
 * but several map components override it with their own component-scoped instance (the events map
 * among them), so a root-injected probe service would attach to an instance the page is not using
 * and report an empty map forever. Registering from inside the service sidesteps injector scope
 * entirely.
 *
 * A page with two concurrent map views would report only the last one registered. No application
 * does that today; if one ever does, this needs to become a keyed collection.
 */
let current: MapServiceInstance | undefined;

/** The service instance that registered `current`, so only it can clear the registration. */
let currentOwner: unknown;

/**
 * Called by `EsriMapService` whenever its store emits, including with `undefined` on destroy.
 *
 * `owner` is the calling service instance. It matters because the store is a `BehaviorSubject`
 * seeded with `undefined`, so every new service instance emits `undefined` the moment it subscribes
 * -- and there can be several. A root instance constructed after the events map's component-scoped
 * one would otherwise wipe a live registration on construction, leaving the probe reporting
 * not-ready for the rest of the page's life. Only the owner of the current registration may clear
 * it.
 *
 * Installs the global on first call rather than at module load, so a bundle that never creates a
 * map never grows a global.
 */
export function registerMapProbe(instance: MapServiceInstance | undefined, owner: unknown): void {
  if (instance !== undefined) {
    if (instance !== current) {
      resetSettlingWindow();
    }

    current = instance;
    currentOwner = owner;
  } else if (owner === currentOwner) {
    current = undefined;
    currentOwner = undefined;
    resetSettlingWindow();
  }

  if (typeof window === 'undefined') {
    return;
  }

  const target = window as unknown as Record<string, MapProbe>;

  if (target[MAP_PROBE_GLOBAL] === undefined) {
    target[MAP_PROBE_GLOBAL] = {
      get ready(): boolean {
        return layersSettled();
      },
      get drawing(): boolean {
        // True only when a view exists and says it is updating. With no view there is nothing being
        // drawn, which is reported as "not drawing" rather than as unknown - a caller waiting for
        // drawing to finish should not wait forever on a page that has no map.
        return (current?.view as unknown as { updating?: boolean })?.updating === true;
      },
      snapshot: takeSnapshot
    };
  }
}

/**
 * `allLayers` rather than `layers`, so layers nested inside group layers are included. A group's
 * children are where most of the event maps' actual data lives.
 */
function registeredLayers(): esri.Layer[] {
  return current?.map ? current.map.allLayers.toArray() : [];
}

/**
 * How long the layer count must hold steady before the map counts as settled.
 *
 * Layers are added to the map in batches, not all at once: the basemap arrives first and the
 * operational layers follow. Without this wait, a caller that polls quickly sees a one-layer map
 * whose only layer has loaded, concludes the map is ready, and snapshots before the real layers
 * exist -- reporting a healthy map as empty.
 */
const LAYER_COUNT_STABLE_MS = 2_000;

let lastLayerCount = -1;
let lastLayerCountChangeAt = 0;

/** Discards the stability window, so a newly registered map is not judged on the previous one's. */
function resetSettlingWindow(): void {
  lastLayerCount = -1;
  lastLayerCountChangeAt = 0;
}

/**
 * A map is registered, its layer count has held steady, and every layer has stopped loading --
 * whether it succeeded or failed. A failed layer still counts as settled: the snapshot reports it as
 * an error, which is a result, not a reason to keep waiting.
 *
 * Depends on being called repeatedly, since the stability window is measured across calls. Callers
 * poll this, which is what makes that sound.
 */
function layersSettled(): boolean {
  const layers = registeredLayers();
  const now = Date.now();

  if (layers.length !== lastLayerCount) {
    lastLayerCount = layers.length;
    lastLayerCountChangeAt = now;

    return false;
  }

  if (layers.length === 0) {
    return false;
  }

  if (!layers.every((layer) => layer.loaded === true || readLoadError(layer) !== null)) {
    return false;
  }

  return now - lastLayerCountChangeAt >= LAYER_COUNT_STABLE_MS;
}

async function takeSnapshot(): Promise<MapProbeSnapshot> {
  const layers = registeredLayers();

  if (current === undefined || layers.length === 0) {
    return { ready: false, viewReady: false, layers: [] };
  }

  return {
    ready: layersSettled(),
    viewReady: current.view?.ready === true,
    layers: await Promise.all(layers.map(probeLayer))
  };
}

async function probeLayer(layer: esri.Layer): Promise<MapLayerProbe> {
  const base: MapLayerProbe = {
    id: layer.id,
    title: layer.title ?? '',
    type: layer.type,
    visible: layer.visible,
    loaded: layer.loaded === true,
    error: readLoadError(layer),
    featureCount: null,
    graphicTypes: countGraphicTypes(layer)
  };

  // A layer that failed to load cannot be queried, and asking would replace a useful load error
  // with a less useful query error.
  if (base.error !== null || !base.loaded) {
    return base;
  }

  return { ...base, featureCount: await countFeatures(layer) };
}

function countGraphicTypes(layer: esri.Layer): Record<string, number> | null {
  if (layer.type !== 'graphics') {
    return null;
  }

  const counts: Record<string, number> = {};

  for (const graphic of (layer as esri.GraphicsLayer).graphics?.toArray() ?? []) {
    const type = typeof graphic.attributes?.type === 'string' ? graphic.attributes.type : 'untyped';

    counts[type] = (counts[type] ?? 0) + 1;
  }

  return counts;
}

function readLoadError(layer: esri.Layer): string | null {
  const error = (layer as unknown as { loadError?: Error }).loadError;

  // `||` rather than `??`: an Error with an empty message would otherwise be reported as the empty
  // string, which reads as a failure with no explanation.
  return error ? error.message || String(error) : null;
}

/**
 * Counts features for layer types that support it.
 *
 * Deliberately queries the whole layer rather than the current extent. An extent-scoped count would
 * depend on viewport size and the camera position at the moment the snapshot was taken, which is
 * exactly the kind of incidental variation that makes a scheduled suite flaky.
 */
async function countFeatures(layer: esri.Layer): Promise<number | null> {
  const queryable = layer as unknown as { queryFeatureCount?: () => Promise<number> };

  if (typeof queryable.queryFeatureCount !== 'function') {
    return null;
  }

  try {
    return await queryable.queryFeatureCount();
  } catch {
    // Swallowed rather than surfaced as `error`, which is reserved for load failures. A count that
    // cannot be taken is reported as unknown, and the layer is still judged on `loaded`/`error`.
    return null;
  }
}
