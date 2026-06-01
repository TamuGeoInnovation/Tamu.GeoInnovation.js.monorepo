import { LayerSource } from '@tamu-gisc/common/types';

import { IComposedConnections } from '../connections';
import { IComposedIDefinitions } from '../definitions';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';
import { MainMapLayerSources } from '../definitions/main.definitions';

export { commonLayerProps } from '../definitions/main.definitions';

// Persistent layer definitions that will be processed by a factory and added to the map.
export function LayerSources(
  connections: IComposedConnections,
  definitions: IComposedIDefinitions,
  options?: IFactoryExcludeOptions<IComposedIDefinitions>
): Array<LayerSource> {
  return MainMapLayerSources(connections, definitions, options);
}

export const ThreeDLayers: Array<LayerSource> = [
  {
    type: 'scene',
    id: 'three-d-buildings-scene-layer',
    title: '3D Buildings',
    url: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/SketchupCampus_2082019/SceneServer',
    listMode: 'show',
    visible: true,
    // popupComponent: Popups.BasePopupComponent,
    native: {
      outFields: ['*'],
      definitionExpression: "WhereFrom = 'arch'",
      popupEnabled: false,
      elevationInfo: {
        mode: 'absolute-height',
        offset: -107,
        unit: 'meters'
      },
      renderer: {
        type: 'simple',
        symbol: {
          type: 'mesh-3d',
          symbolLayers: [
            {
              type: 'fill',
              material: {
                color: 'rgba(209, 210, 202, 1)',
                colorMixMode: 'replace'
              },
              edges: {
                type: 'solid',
                color: 'rgba(0, 0, 0, 0.75)',
                size: '1px'
              },
              castShadows: true
            }
          ]
        }
      }
    } as unknown as Record<string, unknown>
  }
];
