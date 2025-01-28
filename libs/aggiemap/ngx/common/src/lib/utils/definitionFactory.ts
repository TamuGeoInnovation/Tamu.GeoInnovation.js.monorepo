import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import { Connections } from '../connections';
import { Definitions, IComposedIDefinitions } from '../definitions';
import { LayerSources, ThreeDLayers } from '../layer-sources';
import { LegendSources } from '../legend-sources';
import { SearchSources } from '../search-sources';

export function factory(environment: 'dev' | 'prod' = 'dev', options?: IFactoryOptions): Definitions {
  const gisHost = environment === 'dev' ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';

  const c = Connections(gisHost);
  const d = Definitions(c);
  const l = LayerSources(c, d, options?.layerSources);
  const s = SearchSources(c, d);

  return {
    Connections: c,
    Definitions: d,
    LayerSources: l,
    LegendSources: LegendSources,
    SearchSources: s,
    ThreeDLayers
  };
}

export interface IFactoryOptions {
  layerSources: {
    exclude: Array<keyof IComposedIDefinitions>;
  };
}

export interface Definitions {
  Connections: Record<string, string>;
  Definitions: IComposedIDefinitions;
  LayerSources: Array<LayerSource>;
  LegendSources: Array<LegendItem>;
  SearchSources: Array<SearchSource>;
  ThreeDLayers: Array<LayerSource>;
}
