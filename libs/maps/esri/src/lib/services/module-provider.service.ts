import { Injectable } from '@angular/core';
import { loadModules } from 'esri-loader';

@Injectable()
export class EsriModuleProviderService {
  /**
   * Module dictionary, allows to pass simple class names instead of the class path.
   *
   * @private
   * @memberof EsriModuleProviderService
   */
  private dictionary = [
    {
      class: 'esri/Map',
      name: 'Map'
    },
    {
      class: 'esri/views/MapView',
      name: 'MapView'
    },
    {
      class: 'esri/views/SceneView',
      name: 'SceneView'
    },
    {
      class: 'esri/layers/TileLayer',
      name: 'TileLayer'
    },
    {
      class: 'esri/layers/VectorTileLayer',
      name: 'VectorTileLayer'
    },
    {
      class: 'esri/Basemap',
      name: 'Basemap'
    },
    {
      class: 'esri/layers/GraphicsLayer',
      name: 'GraphicsLayer'
    },
    {
      class: 'esri/core/urlUtils',
      name: 'urlUtils'
    },
    {
      class: 'esri/geometry/support/webMercatorUtils',
      name: 'webMercatorUtils'
    },
    {
      class: 'esri/geometry/SpatialReference',
      name: 'SpatialReference'
    },
    {
      class: 'esri/tasks/RouteTask',
      name: 'RouteTask'
    },
    {
      class: 'esri/tasks/support/RouteParameters',
      name: 'RouteParameters'
    },
    {
      class: 'esri/tasks/support/FeatureSet',
      name: 'FeatureSet'
    },
    {
      class: 'esri/Graphic',
      name: 'Graphic'
    },
    {
      class: 'esri/geometry/Point',
      name: 'Point'
    },
    {
      class: 'esri/geometry/Polygon',
      name: 'Polygon'
    },
    {
      class: 'esri/geometry/Polyline',
      name: 'Polyline'
    },
    {
      class: 'esri/layers/FeatureLayer',
      name: 'FeatureLayer'
    },
    {
      class: 'esri/layers/SceneLayer',
      name: 'SceneLayer'
    },
    {
      class: 'esri/renderers/UniqueValueRenderer',
      name: 'UniqueValueRenderer'
    },
    {
      class: 'esri/views/layers/support/FeatureFilter',
      name: 'FeatureFilter'
    },
    {
      class: 'esri/widgets/Search',
      name: 'Search'
    },
    {
      class: 'esri/symbols/SimpleFillSymbol',
      name: 'SimpleFillSymbol'
    },
    {
      class: 'esri/symbols/SimpleLineSymbol',
      name: 'SimpleLineSymbol'
    },
    {
      class: 'esri/symbols/SimpleMarkerSymbol',
      name: 'SimpleMarkerSymbol'
    },
    {
      class: 'esri/symbols/PathSymbol3DLayer',
      name: 'PathSymbol3DLayer'
    },
    {
      class: 'esri/widgets/LayerList',
      name: 'LayerList'
    },
    {
      class: 'esri/widgets/Track',
      name: 'Track'
    },
    {
      class: 'esri/widgets/Compass',
      name: 'Compass'
    },
    {
      class: 'esri/PopupTemplate',
      name: 'PopupTemplate'
    },
    {
      class: 'esri/tasks/support/Query',
      name: 'Query'
    },
    {
      class: 'esri/tasks/QueryTask',
      name: 'QueryTask'
    },
    {
      class: 'esri/tasks/support/DataFile',
      name: 'DataFile'
    },
    {
      class: 'esri/geometry/Geometry',
      name: 'Geometry'
    },
    {
      class: 'esri/geometry/geometryEngine',
      name: 'GeometryEngine'
    },
    {
      class: 'esri/core/watchUtils',
      name: 'WatchUtils'
    },
    {
      class: 'esri/symbols/PictureMarkerSymbol',
      name: 'PictureMarkerSymbol'
    },
    {
      class: 'esri/layers/GeoJSONLayer',
      name: 'GeoJSONLayer'
    },
    {
      class: 'esri/layers/CSVLayer',
      name: 'CSVLayer'
    },
    {
      class: 'esri/widgets/Legend/LegendViewModel',
      name: 'LegendViewModel'
    },
    {
      class: 'esri/widgets/LayerList/LayerListViewModel',
      name: 'LayerListViewModel'
    },
    {
      class: 'esri/core/Handles',
      name: 'Handles'
    },
    {
      class: 'esri/widgets/Sketch/SketchViewModel',
      name: 'SketchViewModel'
    }
  ];

  constructor() {}

  /**
   * Resolves provided simple module names to class paths, and returns an array of esri class constructors.
   *
   * @param {string[]} modules Simple module names (e.g. Map, MapView, GraphicLayer)
   * @param {boolean} asObject Will return modules as named objects instead of an array of anonymous functions.
   * @returns
   * @memberof EsriModuleProviderService
   */
  public require(modules: string[]): Promise<object[]>;
  public require(modules: string[], asObject: true): Promise<object>;
  public require(modules: string[], asObject?: boolean): Promise<object[] | object> {
    // n is an alias for module name
    const classNames = modules.map((n) => {
      if (n === undefined || n === '') {
        console.warn(`Module provider could not resolve class for module named ${n}`);
        return '';
      }

      // di is an alias for dictionary item
      const find = this.dictionary.find((di) => {
        return di.name === n;
      });

      // If no class reference was matched, spit an error and default to an empty string.
      if (!find) {
        console.warn(`Module provider could not resolve class for module named ${n}`);
        return '';
      }

      return find.class;
    });

    return loadModules(classNames)
      .then((resolvedModules) => {
        if (asObject) {
          const obj = {};

          resolvedModules.forEach((module, index) => {
            obj[modules[index]] = module;
          });

          return obj;
        } else {
          return resolvedModules;
        }
      })
      .catch((err) => {
        throw new Error(
          `Could not resolve at least one module. Ensure specified class reference is declared in the dictionary.`
        );
      });
  }
}
