// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: true
};

import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';

import { Connections, Definitions as d } from './definitions';

import { Popups } from '@tamu-gisc/aggiemap';

import esri = __esri;

export * from './definitions';
export * from './notification-events';
export * from './polygons';

const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

// Persistent layer definitions that will be processed by a factory and added to the map.
export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: d.BUILDINGS.layerId,
    title: d.BUILDINGS.name,
    url: d.BUILDINGS.url,
    popupComponent: Popups.BuildingPopupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    layerIndex: 1,
    native: {
      ...commonLayerProps,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [0, 0, 0, 0.01],
          outline: {
            width: '0'
          }
        }
      }
    }
  },
  {
    type: 'feature',
    id: d.DOMESTIC_COLD_WATER.layerId,
    title: d.DOMESTIC_COLD_WATER.name,
    url: d.DOMESTIC_COLD_WATER.url,
    category: d.DOMESTIC_COLD_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.DOMESTIC_WATER_VALVE.layerId,
    title: d.DOMESTIC_WATER_VALVE.name,
    url: d.DOMESTIC_WATER_VALVE.url,
    category: d.DOMESTIC_COLD_WATER_METER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.DOMESTIC_COLD_WATER_METER.layerId,
    title: d.DOMESTIC_COLD_WATER_METER.name,
    url: d.DOMESTIC_COLD_WATER_METER.url,
    category: d.DOMESTIC_COLD_WATER_METER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.DOMESTIC_WATER_TRANSMISSION.layerId,
    title: d.DOMESTIC_WATER_TRANSMISSION.name,
    url: d.DOMESTIC_WATER_TRANSMISSION.url,
    category: d.DOMESTIC_WATER_TRANSMISSION.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.WELL_SITES.layerId,
    title: d.WELL_SITES.name,
    url: d.WELL_SITES.url,
    category: d.WELL_SITES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.FIRE_HYDRANTS.layerId,
    title: d.FIRE_HYDRANTS.name,
    url: d.FIRE_HYDRANTS.url,
    category: d.FIRE_HYDRANTS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.DOMESTIC_HOT_WATER.layerId,
    title: d.DOMESTIC_HOT_WATER.name,
    url: d.DOMESTIC_HOT_WATER.url,
    category: d.DOMESTIC_HOT_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.DOMESTIC_HOT_WATER_VALVE.layerId,
    title: d.DOMESTIC_HOT_WATER_VALVE.name,
    url: d.DOMESTIC_HOT_WATER_VALVE.url,
    category: d.DOMESTIC_HOT_WATER_VALVE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.CHILLED_WATER.layerId,
    title: d.CHILLED_WATER.name,
    url: d.CHILLED_WATER.url,
    category: d.CHILLED_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.CHILLED_WATER_VALVE.layerId,
    title: d.CHILLED_WATER_VALVE.name,
    url: d.CHILLED_WATER_VALVE.url,
    category: d.CHILLED_WATER_VALVE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.HEATING_HOT_WATER.layerId,
    title: d.HEATING_HOT_WATER.name,
    url: d.HEATING_HOT_WATER.url,
    category: d.HEATING_HOT_WATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.HEATING_HOT_WATER_VALVE.layerId,
    title: d.HEATING_HOT_WATER_VALVE.name,
    url: d.HEATING_HOT_WATER_VALVE.url,
    category: d.HEATING_HOT_WATER_VALVE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.SANITARY_SEWER.layerId,
    title: d.SANITARY_SEWER.name,
    url: d.SANITARY_SEWER.url,
    category: d.SANITARY_SEWER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.SANITARY_MANHOLES.layerId,
    title: d.SANITARY_MANHOLES.name,
    url: d.SANITARY_MANHOLES.url,
    category: d.SANITARY_MANHOLES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.SANITARY_CLEANOUTS.layerId,
    title: d.SANITARY_CLEANOUTS.name,
    url: d.SANITARY_CLEANOUTS.url,
    category: d.SANITARY_CLEANOUTS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.SANITARY_LIFT_STATION.layerId,
    title: d.SANITARY_LIFT_STATION.name,
    url: d.SANITARY_LIFT_STATION.url,
    category: d.SANITARY_LIFT_STATION.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.STOMRMWATER.layerId,
    title: d.STOMRMWATER.name,
    url: d.STOMRMWATER.url,
    category: d.STOMRMWATER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.STOMRMWATER_MANHOLE.layerId,
    title: d.STOMRMWATER_MANHOLE.name,
    url: d.STOMRMWATER_MANHOLE.url,
    category: d.STOMRMWATER_MANHOLE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.STORMWATER_CATCH_BASINS.layerId,
    title: d.STORMWATER_CATCH_BASINS.name,
    url: d.STORMWATER_CATCH_BASINS.url,
    category: d.STORMWATER_CATCH_BASINS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.STORMWATER_OUTFALL_LOCATIONS.layerId,
    title: d.STORMWATER_OUTFALL_LOCATIONS.name,
    url: d.STORMWATER_OUTFALL_LOCATIONS.url,
    category: d.STORMWATER_OUTFALL_LOCATIONS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.STORMWATER_DETENTION_BASIN.layerId,
    title: d.STORMWATER_DETENTION_BASIN.name,
    url: d.STORMWATER_DETENTION_BASIN.url,
    category: d.STORMWATER_DETENTION_BASIN.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.STEAM.layerId,
    title: d.STEAM.name,
    url: d.STEAM.url,
    category: d.STEAM.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.UES_NATURAL_GAS.layerId,
    title: d.UES_NATURAL_GAS.name,
    url: d.UES_NATURAL_GAS.url,
    category: d.UES_NATURAL_GAS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.UES_NATURAL_GAS_METERS.layerId,
    title: d.UES_NATURAL_GAS_METERS.name,
    url: d.UES_NATURAL_GAS_METERS.url,
    category: d.UES_NATURAL_GAS_METERS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.ELECTRICAL_SERVICE.layerId,
    title: d.ELECTRICAL_SERVICE.name,
    url: d.ELECTRICAL_SERVICE.url,
    category: d.ELECTRICAL_SERVICE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.ELECTRICAL_MANHOLES.layerId,
    title: d.ELECTRICAL_MANHOLES.name,
    url: d.ELECTRICAL_MANHOLES.url,
    category: d.ELECTRICAL_MANHOLES.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.ELECTRICAL_POLE.layerId,
    title: d.ELECTRICAL_POLE.name,
    url: d.ELECTRICAL_POLE.url,
    category: d.ELECTRICAL_POLE.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.TRANSFORMER.layerId,
    title: d.TRANSFORMER.name,
    url: d.TRANSFORMER.url,
    category: d.TRANSFORMER.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: d.GENERATORS.layerId,
    title: d.GENERATORS.name,
    url: d.GENERATORS.url,
    category: d.GENERATORS.category,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    native: {
      ...commonLayerProps
    }
  },
  {
    type: 'feature',
    id: 'construction-layer',
    title: 'Construction Zone',
    url: `${Connections.constructionUrl}`,
    category: 'Infrastructure',
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    legendItems: [
      {
        id: 'construction-legend',
        title: 'Construction Area',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAENJREFUOI1jYaAyYKGZgf9DGf5TahjjagZGFnQBcg2DOYgFmyAlgLYupAYYYgaORsogNHA0Uig3kJIwhAUXC7oApQAAQ8kZ9+L+/N4AAAAASUVORK5CYII='
      }
    ],
    popupComponent: Popups.ConstructionPopupComponent
  },
  {
    type: 'feature',
    id: 'accessible-entrances-layer',
    title: 'Accessible Entrances',
    url: `${Connections.accessibleUrl}`,
    category: 'Infrastructure',
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    legendItems: [
      {
        id: 'assisted-open-entrance-legend',
        title: 'Assisted Open Entrance',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA3pJREFUSInNlVFoW2UUx3+9ye29TToVLzJat+EYCHsocyQPsVCCYbGrtAwELVuQjKHZw7RPfdiTSR722Je8LSK0SgZhDCmxhtA2oNW+zMIeBq0IDm23NNTbh7VNenNvbnxIe5fb29SKCJ63e7/v+//OOd93znHzH5v7fwEYuqb2ap34XNBDg16AXYPcQkZZ+leAgYjqEwUSmsAwDai3rIlu4qGoCpCWdJL5e8qzfwQIR9VEHeLnTwuE+0UCfolur4DXI7BTMVkvGzzfNhmfqMQ0kVg4qiZnp5TEsQChj9RcHYbHRiUuBbvwegTbutcjcO5sJwDzkzLT+R1SWS0eiqo9xSnl5pGAPc+HP491Eezvahegza4MeTlzysX4RCUWjqql1khsgIGI6qtDfGxUcogXF6ps7ZgABN+WeeVll239Yp9MZFAnU9DjAxHVegA2gCiQOH9a4FLQLv7nZp07X1atb1nqYPAdjyOSG1dPkClsIovcBfw2wNA1tVcTGA73i46cLz3SAFC6O1C3G0zP1wgHuxCEDgdkbFQildV8jhRpnfhoQMAv2Q6YZoNv5msAfBaRufNFlV/WTJ78oXPujU4HIOCXSGU1QtfVkeKkkrMALuipA91eu/dPftf59amJqwN8FyTeDejMLBosPqwdCjj5mtvSs0WwX6EH07P4sOl931mB8kad10821x/M1fhgxESW7fsP6jme6U7FtCDVXZMHe+l59JvJx/Eta9+WBo9Xavjfkh3nW80C7BrkRDfx9bJhFdHj5Rpbzfvl1ocSkti81O9+qLGyajL3oxOwXjYsPRtgIaMshaIqz7dfeDD/U9N7/5sC77/ntf67XLDy1S6zPxt8sllHefVFTayVmh2ru0HpsBSlxycqsfnJple3P32J2zjtcsjD5ZCzDsobBvfzGkB6v/nZAJJOUhOJTed3uDLkdQj8nc3MVVleNdEN0vv/bID8PeVZOKomU1ktfuaUi4t9slOljX2/WCVT0HFBstgyJxyvaHZKSYSias/4RCUWGdS5cfXEkcLlDYOZuaY4Jt/Ofm1v2Ye26+KUcjMcVUuZgh7PFDYZG5UI+CWriPbnwVqpzv28xvKqiQuSB8XbAvYjGYioOVnkbiqr+VJZrd3WtG6QLrYZn0eOzL2W6wcIXVdHDs7k7galdqPyWIBWK04quePubbW/AF6HYoeZu0A/AAAAAElFTkSuQmCC'
      },
      {
        id: 'Manual Open Entrance',
        title: 'Manual Open Entrance',
        src:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA05JREFUSInNlU+IE3cUxz+/38ykY1JRlFKyENYl0LqLkWazFSzYg8XDQmRP4rWnCKV4qB48SJP04Gn3sjcDglCkrCchLXQRyxaL0JYllJRdKt1WumqoLdLDbjZ/Zn6vhyRjZpPIllLoO8289+b7+b03j9+z+Y/N/l8A2u32mGVZGaVUXETGAJRSZaXU6r8CiEgGKADZnk8p1XvMiwgiUvJ9v+g4ztN/BDDGFID8dt3wcKPF8kqLx88M65uGyYRmesri8EHN3GwsZ9t2zhhT1FoX9gQQkTKQrVQb3LjdYH3ThOLrmybwLS41mb8UJZ1y88aYuNb6wksB3ZNnv36wwyelnVEFhuzyQp2L533mZmM5Y0ytv5IQoNvzfKXa4LMvmsx/FA1i33zf4s59jwMuXP0gSu9P/LDW5tMv2ywuNTl21CE5EcmLSDAAuysobNcNN243eO2AIn3cDQKWrbhz3+P0CZvpPv/WtgBtAHLFLe7dPARwHZgJAdrt9hiQfbjRYn3T8M6UFYh4nnAk4QBwfNIJfLYdTFRglWqDdMrNDLTIsqwMwPJKa+CjJzWP8YTDiTc1ySMOIi98u215pUU65WKMOau1LgcApVQc4PEzM/DRxqOO2LtvR4i/bvHnc5/6zmAewN1Vjyt9egFARMaUUgMjCVBZa3P61D5OnXTRWvHroxb79+uhgH69EKBnkwk9APm26tNoGF6NdUR//Mnj5ExkqPBkIgzub1EZyE9PWQMAzwi/PfF4IxnBGPjqu9GA6e5wdPVCgFUR4fDB4aX//EsH8PsfHrW/ZGgOQHK8I+l5Xi0EABCR0txsLLe41OTBms977z8PYgu3GizcagTvH17bBrZD4mcyNjNvvYKIlHqXXwjg+37Rtu3c/KUolxfqI085ys5lXWJRDVDq+UIAx3GeGmOK6ZSbv3jeZ3GpuWfxj3P7SE5EEJGi1jrYEwNTpLUuGGPic7Ox3LGjDrni1kuFz2RszmVdkhMRgM93X9lDr2ut9QVjTC05Ecnfu3mISrXB8kqLu6seQLAPkuOdnseiunfywm6tkQtHa13o7oXr6ZSbSadcrgzJE5ESUOpvy54A0BldureiMebs7p3seV5t1KrcE6DftNblveb2299DrV3F9KlErwAAAABJRU5ErkJggg=='
      }
    ],
    popupComponent: Popups.AccessiblePopupComponent
  },
  {
    type: 'graphic',
    id: 'selection-layer',
    title: 'Selected Buildings',
    category: 'Infrastructure',
    listMode: 'hide',
    loadOnInit: false,
    visible: true,
    popupComponent: Popups.GeneralDirectionsPopupComponent
  }
];

// Static legend items
export const LegendSources: LegendItem[] = [
  {
    id: 'university-building-legend',
    title: 'University Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAJBJREFUOI1jYaAyYIExAtnZGygxaP3Pnw1wAwPZ2RuE7azruYVFyDLsw/2HDCkvXhirKCvPgruQW1iEQUJJmWwXMv386cPAzOzDQlgpaWDUwFEDRw0cZgZ+uP+QbEO+vn3DwIts4PqfPxsCL1xg+HThAgMDAwODsISEMamGimtooLoQVuIyMDAwMDwkw7VQPQDNmyRazmV6EgAAAABJRU5ErkJggg=='
  },
  {
    id: 'non-university-building-legend',
    title: 'Non-University Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHFJREFUOI1jYaAyYIExmpqaGigxqK6urgFuYFNTU4OCBGe9EC8bWYY9ff2doampiaGurq4B7kIhXjYGZWk+sl348sMvBrgLqQlGDRw1cNTAYWbg09ffyTbk3edfqAbW1dU1NDU1wYsgcgBKAYssQCkAABa3ILBI1xApAAAAAElFTkSuQmCC'
  },
  {
    id: 'off-campus-building-legend',
    title: 'Off Campus Building',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGdJREFUOI3t1KENADEMA8CADhBc2H0802cnLxVUdYRHH7U0LXrVKAo4GbnI4ZTvIGk7EAALkKTVWh9VTWHuLiQFgEVDVZXWWrph712i4clc8IIX/Bno7mlkjLGCAIxkTFAmy8DOj9281XsgH/GbKEkAAAAASUVORK5CYII='
  },
  {
    id: 'garage-parking-legend',
    title: 'Garage Parking',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGtJREFUOI3t1LEOgCAMBNAOTMBgogNfezb3v4YQxdnJRldkMtzUdHi56Zx0jrsPkvoFAqAGktRlntYYfBO25SIkBYBawxi8pLQ0N9z3KtawZwY4wAH+DNxyaUaOer5BAErSJqglr4F9Pr7mAt2qILaQAOa8AAAAAElFTkSuQmCC'
  },
  {
    id: 'restricted-legend',
    title: 'Restricted 6am to 6pm',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAFtJREFUOI1jYKAyYIQxHB0dGygxaP/+/Q0MDAwMLDDDQkMC6+OfviDLsFmiwnBDmWCC5BrGwMDAkPb6LZzNhEcdWWDUwFEDRw0cZgbCiiBywEJpCTib6gUs1QEATW0WjAt6JIYAAAAASUVORK5CYII='
  },
  {
    id: 'paved-surface-legend',
    title: 'Paved Surface',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGVJREFUOI3t1CEOACEMBMAKdF+A4aN7zf62AsMLTl0DtqAurGoqJqu2yOGU7yBpOxAAC5Ck1VofVU1h7i4kBYBFQ1WV1lq6Ye9douHJXPCCF/wZ6O5pZIyxggCMZExQJsvAzo/dvKA4IK9bweSrAAAAAElFTkSuQmCC'
  },
  {
    id: 'sidewalk-legend',
    title: 'Sidewalk',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAEtJREFUOI1jYaAyYIExPr641UCJQfwSag1wA6GG1VNi4McXtxj4JdQaWAgrJQ2MGjhq4KiBowbS0UB+CbWGjy9uUWQQSgGLLEApAAAvoxCdulpoFwAAAABJRU5ErkJggg=='
  },
  {
    id: 'railroad-legend',
    title: 'Railroad',
    src:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHhJREFUOI3tkrENgDAMBL+I9EUmYA7WYCfCTLBG5qBz/x0VRUAkAtIg8q3t+7dlh8pyDfgnIMnwBiQpJEBJI8mpMDQAWEnGYkIA0Xs/m9llM8kkTQlYRQnQzEJuHUk9gG5PeqiFBEhyKbnnzE4Jc3e5ow89dgM+1gZwZSYCkyusZQAAAABJRU5ErkJggg=='
  }
];

const commonQueryParams: Partial<SearchSourceQueryParamsProperties> = {
  f: 'json',
  resultRecordCount: 5,
  outFields: '*',
  outSR: 4326,
  returnGeometry: true,
  spatialRel: 'esriSpatialRelIntersects'
};

// Search sources used for querying features.
export const SearchSources: SearchSource[] = [
  {
    source: 'building',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number', 'BldgAbbr', 'BldgName'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['BldgName'],
        operators: ['LIKE'],
        wildcards: ['startsWith'],
        transformations: ['UPPER']
      }
    },
    scoringKeys: ['attributes.BldgAbbr', 'attributes.Number', 'attributes.BldgName'],
    featuresLocation: 'features',
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: true
  },
  {
    source: 'building-exact',
    name: 'Building',
    url: `${Connections.basemapUrl}/1`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.BldgName} ({attributes.Number})',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: false
  },
  {
    source: 'university-departments',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['DeptName', 'CollegeName', 'DeptAbbre'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.DeptName}',
    popupComponent: Popups.GeneralDirectionsPopupComponent,
    searchActive: true,
    altLookup: {
      source: 'building-exact',
      reference: {
        keys: ['attributes.HOME1']
      }
    }
  },
  {
    source: 'university-departments-exact',
    name: 'University Departments',
    url: `${Connections.departmentUrl}`,
    queryParams: {
      ...commonQueryParams,
      resultRecordCount: 100,
      where: {
        keys: ['HOME1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.DeptName}',
    searchActive: false
  },
  {
    source: 'parking-garage',
    name: 'Parking Garage',
    url: `${Connections.basemapUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName', 'Name'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['includes', 'includes'],
        transformations: ['UPPER', 'UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    popupComponent: Popups.BuildingPopupComponent,
    searchActive: true
  },
  {
    source: 'parking-lot',
    name: 'Parking Lot',
    url: `${Connections.basemapUrl}/12`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['LotName'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    popupComponent: Popups.ParkingLotPopupComponent,
    searchActive: true
  },
  {
    source: 'points-of-interest',
    name: 'Points of Interest',
    url: `${Connections.inforUrl}/0`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Name'],
        operators: ['LIKE'],
        wildcards: ['includes'],
        transformations: ['UPPER']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.Name}',
    popupComponent: Popups.PoiPopupComponent,
    searchActive: true
  },
  {
    source: 'bike-racks',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`,
    queryParams: {
      ...commonQueryParams,
      resultRecordCount: 9999,
      where: {
        keys: ['1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.Type}',
    searchActive: false
  }
];

export const SelectionSymbols = {
  polygon: {
    type: 'simple-fill',
    style: 'solid',
    color: [252, 227, 0, 0.55],
    outline: {
      color: [252, 227, 0, 0.8],
      width: '2px'
    }
  },
  point: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  },
  multipoint: {
    type: 'simple-marker',
    style: 'circle',
    size: 8,
    outline: {
      width: 2
    }
  }
};
