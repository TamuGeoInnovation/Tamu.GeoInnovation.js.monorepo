import { LayerSource } from '@tamu-gisc/common/types';
import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';

import { Connections, IComposedConnections } from '../connections';
import { Definitions, IComposedIDefinitions } from '../definitions';
import { LayerSources, ThreeDLayers } from '../layer-sources/layer-sources';
import { ComposedSearchSourcesKeyMap, SearchSources } from '../search-sources/search-sources';

export function factory(options?: IFactoryOptions): Definitions {
  const gisHost =
    options?.environment === undefined || options?.environment === 'dev' ? 'gis-dev.it.tamu.edu' : 'gis.it.tamu.edu';

  const c = Connections(gisHost);
  const d = Definitions(c);
  const l = LayerSources(c, d, options?.layerSources);
  const s = SearchSources(c, d, options?.searchSources);

  return {
    Connections: c,
    Definitions: d,
    LayerSources: l,
    SearchSources: s,
    ThreeDLayers
  };
}

export interface IFactoryOptions {
  environment?: 'dev' | 'prod';

  layerSources?: IFactoryExcludeOptions<IComposedIDefinitions>;

  searchSources?: IFactoryExcludeOptions<ComposedSearchSourcesKeyMap>;
}

/**
 * Options that limit specific resource types from being included in the factory output.
 */
export interface IFactoryExcludeOptions<T> {
  exclude?: Array<keyof T>;
}

export interface Definitions {
  Connections: IComposedConnections;
  Definitions: IComposedIDefinitions;
  LayerSources: Array<LayerSource>;
  SearchSources: Array<SearchSource>;
  ThreeDLayers: Array<LayerSource>;
}
