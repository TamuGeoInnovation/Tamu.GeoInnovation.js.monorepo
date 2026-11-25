import * as fs from 'fs';
import * as path from 'path';

/**
 * Whether each layer shows the name its service publishes, or a title its definition declares on purpose (#2731).
 *
 * Read with `loaded`, always. A layer that never loaded has no name from its service, and an untitled one then shows
 * a name ArcGIS makes from the service's address - "Muster view" for `Muster_view`. On 8 November 2026 a local run
 * where Transportation's services could not be reached read exactly like that, was taken for a naming fault, and a
 * correct change was reverted on it (#2728). So a layer that did not load is reported as a load failure and its name
 * is not judged at all.
 */

/** One entry of `layer-title-overrides.json`, which the unit spec `layer-title-overrides.spec.ts` keeps complete. */
export interface TitleOverride {
  /** Where the title is declared: an event map's id, or `main` for the layers every map loads. */
  map: string;
  layer: string;
  title: string;
  reason: string;
}

export const TITLE_OVERRIDES: TitleOverride[] = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'layer-title-overrides.json'), 'utf8')
);

/** The probe's fields this needs. `serviceName` is absent on a build older than #2731. */
export interface TitledLayer {
  id: string;
  title: string;
  loaded: boolean;
  error: string | null;
  serviceName?: string | null;
  basemap?: boolean;
}

export type TitleVerdict =
  /** No override; the title is the service's name. */
  | 'service'
  /** A declared override, and the map shows it. */
  | 'declared'
  /** A declared override that is the service's name anyway, so it could come off. */
  | 'declared, same as service'
  /** A declared override the map does not show: the definition and the list have drifted apart. */
  | 'declared, not shown'
  /** No override, and the title is not the service's name. */
  | 'wrong'
  /** The layer did not load, so its name cannot be judged. */
  | 'did not load'
  /** Nothing behind the layer to name it: graphics, GeoJSON, a group. */
  | 'no service'
  /** Part of the basemap, declared with it rather than in a map's definition, so not judged here. */
  | 'basemap';

export interface JudgedTitle {
  id: string;
  title: string;
  verdict: TitleVerdict;
  serviceName: string | null;
  /** The declared title, where there is one. */
  declared?: string;
}

/** The map a page shows, as the override list names it: `main` for `/map`, otherwise the event map's id. */
export function mapIdOf(mapPath: string): string {
  const [section, id] = mapPath.split(/[?#]/)[0].split('/').filter((segment) => segment.length > 0);

  return section === 'map' || id === undefined ? 'main' : id;
}

/** A layer's declared title: its own map's first, then the main map's, which every map loads. */
function overrideFor(map: string, layer: string): TitleOverride | undefined {
  return (
    TITLE_OVERRIDES.find((entry) => entry.map === map && entry.layer === layer) ??
    TITLE_OVERRIDES.find((entry) => entry.map === 'main' && entry.layer === layer)
  );
}

export function judgeTitles(mapPath: string, layers: TitledLayer[]): JudgedTitle[] {
  const map = mapIdOf(mapPath);

  return layers.map((layer) => {
    const serviceName = layer.serviceName ?? null;
    const override = overrideFor(map, layer.id);
    const judged = { id: layer.id, title: layer.title, serviceName, declared: override?.title };

    if (layer.basemap) {
      return { ...judged, verdict: 'basemap' };
    }

    if (!layer.loaded || layer.error !== null) {
      return { ...judged, verdict: 'did not load' };
    }

    if (override) {
      if (layer.title !== override.title) {
        return { ...judged, verdict: 'declared, not shown' };
      }

      return { ...judged, verdict: serviceName === override.title ? 'declared, same as service' : 'declared' };
    }

    if (serviceName === null) {
      return { ...judged, verdict: 'no service' };
    }

    return { ...judged, verdict: layer.title === serviceName ? 'service' : 'wrong' };
  });
}

/** One line per layer, for the test's annotations: the baseline #1523 is worked through from. */
export function describeTitles(judged: JudgedTitle[]): string {
  return judged
    .map((layer) => {
      const service = layer.serviceName === null ? '' : ` | service: "${layer.serviceName}"`;
      const declared = layer.declared === undefined ? '' : ` | declared: "${layer.declared}"`;

      return `${layer.verdict}: ${layer.id} "${layer.title}"${service}${declared}`;
    })
    .join('\n');
}
