import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import esri = __esri;

export const NotificationEvents = [];

export const Connections = {
  basemapUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/TAMU_BaseMap/MapServer',
  inforUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/MapInfo_20190529/MapServer',
  accessibleUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/ADA_120717/MapServer/0',
  constructionUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/Construction_2018/MapServer',
  departmentUrl: 'https://gis.tamu.edu/arcgis/rest/services/FCOR/DepartmentSearch/MapServer/1',
  tsMainUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Main/MapServer',
  bikeRacksUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/TS_Bicycles/MapServer/3',
  bikeLocationsUrl: 'https://veoride.geoservices.tamu.edu/api/vehicles/basic/geojson',
  moveInOutUrl: 'https://gis.tamu.edu/arcgis/rest/services/TS/MoveInMoveOut/MapServer',
  moveInOutDaysTable: 'https://services1.arcgis.com/qr14biwnHA6Vis6l/ArcGIS/rest/services/MoveInDays/FeatureServer/0'
};

export const Definitions = {
  BUILDINGS: {
    id: 'buildings',
    layerId: 'buildings-layer',
    name: 'Buildings',
    url: `${Connections.basemapUrl}/1`,
    popupComponent: Popups.BuildingPopupComponent
  },
  CONSTRUCTION: {
    id: 'construction_zone',
    layerId: 'construction_zone-layer',
    name: 'Construction Zone',
    url: `${Connections.constructionUrl}`,
    popupComponent: Popups.ConstructionPopupComponent
  },
  POINTS_OF_INTEREST: {
    id: 'poi',
    layerId: 'poi-layer',
    name: 'Points of Interest',
    url: `${Connections.inforUrl}/0`,
    popupComponent: Popups.PoiPopupComponent
  },
  RESTROOMS: {
    id: 'restrooms',
    layerId: 'restrooms-layer',
    name: 'Restrooms',
    url: `${Connections.inforUrl}/1`,
    popupComponent: Popups.RestroomPopupComponent
  },
  LACTATION_ROOMS: {
    id: 'lactation-rooms',
    layerId: 'lactation-rooms-layer',
    name: 'Lactation Rooms',
    url: `${Connections.inforUrl}/2`,
    popupComponent: Popups.LactationPopupComponent
  },
  SURFACE_LOTS: {
    id: 'surface-lots',
    layerId: 'surface-lots-layer',
    name: 'Surface Lots',
    url: `${Connections.basemapUrl}/9`,
    popupComponent: Popups.ParkingLotPopupComponent
  },
  VISITOR_PARKING: {
    id: 'visitor-parking',
    layerId: 'visitor-parking-layer',
    name: 'Visitor Parking',
    url: `${Connections.inforUrl}/3`,
    popupComponent: Popups.ParkingKioskPopupComponent
  },
  TRANSPORTATION_PARKING: {
    id: 'transportation-parking',
    layerId: 'transportation-parking-layer',
    name: 'Transportation Parking',
    url: `${Connections.tsMainUrl}/6`,
    popupComponent: Popups.ParkingKioskPopupComponent
  },
  ACESSIBLE_ENTRANCES: {
    id: 'accessible-entrances',
    layerId: 'accessible-entrances-layer',
    name: 'Accessible Entrances',
    url: `${Connections.accessibleUrl}`,
    popupComponent: Popups.AccessiblePopupComponent
  },
  BIKE_RACKS: {
    id: 'bike-racks',
    layerId: 'bike-racks-layer',
    name: 'Bike Racks',
    url: `${Connections.bikeRacksUrl}`
  },
  BIKE_LOCATIONS: {
    id: 'bike-locations',
    layerId: 'bike-locations-layer',
    name: 'VeoRide Bikes',
    url: `${Connections.bikeLocationsUrl}`
  },
  MOVE_IN_OUT: {
    id: 'move-in-out',
    layerId: 'move-in-out-layer',
    url: `${Connections.moveInOutUrl}`
  }
};

export const ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: 'residence-layer',
    title: 'Residence Hall',
    listMode: 'show',
    visible: true,
    url: `${Connections.basemapUrl}/1`,
    popupComponent: Definitions.BUILDINGS.popupComponent,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [24, 255, 255, 0.75],
          outline: {
            color: [24, 255, 255, 1],
            width: '3px'
          }
        }
      }
    }
  },
  {
    type: 'feature',
    id: 'move-in-parking-streets-layer',
    title: 'Movein Street Parking',
    url: `${Definitions.MOVE_IN_OUT.url}/5`,
    listMode: 'show',
    visible: true,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [76, 0, 115, 0.5],
          outline: {
            color: [76, 0, 115, 0.75],
            width: '1'
          }
        }
      }
    },
    popupComponent: 'MoveInStreetPopupComponent',
    layerIndex: 4
  },
  {
    type: 'feature',
    id: 'move-in-parking-lots-layer',
    title: 'Movein Parking Lots',
    url: `${Definitions.MOVE_IN_OUT.url}/6`,
    listMode: 'hide',
    visible: true,
    native: {
      renderer: {
        type: 'unique-value',
        field: 'type',
        defaultSymbol: {
          type: 'simple-fill',
          style: 'solid',
          color: [255, 0, 0, 0.5],
          outline: {
            color: [80, 0, 0, 0.5],
            width: '1'
          }
        } as unknown,
        uniqueValueInfos: [
          {
            value: 'Free',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [0, 204, 0, 0.5],
              outline: {
                color: [0, 150, 0, 0.75],
                width: '1'
              }
            } as unknown
          },
          {
            value: 'Disabled',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [0, 105, 230, 0.5],
              outline: {
                color: [0, 105, 200, 0.75],
                width: '1'
              }
            } as unknown
          },
          {
            value: '1HR DZ w P',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [245, 81, 166, 0.5],
              outline: {
                color: [236, 14, 129, 0.75],
                width: '1'
              }
            } as unknown
          },
          {
            value: '1HR Drop',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [168, 168, 255, 0.75],
              outline: {
                color: [117, 117, 255, 0.75],
                width: '1'
              }
            } as unknown
          },
          {
            value: 'Paid',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [153, 230, 0, 0.5],
              outline: {
                color: [104, 159, 56],
                width: '1'
              }
            } as unknown
          },
          {
            value: 'Free 6-9',
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [255, 165, 0, 0.5],
              outline: {
                color: [255, 165, 0],
                width: '1'
              }
            } as unknown
          }
        ]
      }
    },
    popupComponent: Popups.ParkingLotPopupComponent,
    layerIndex: 3
  }
];

// Persistent layer definitions that will be processed by a factory and added to the map.
export const LayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Definitions.BUILDINGS.layerId,
    title: Definitions.BUILDINGS.name,
    url: Definitions.BUILDINGS.url,
    popupComponent: Definitions.BUILDINGS.popupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    native: {
      outFields: ['*'],
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
    id: Definitions.CONSTRUCTION.layerId,
    title: Definitions.CONSTRUCTION.name,
    url: Definitions.CONSTRUCTION.url,
    popupComponent: Definitions.CONSTRUCTION.popupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    legendItems: [
      {
        id: 'construction-legend',
        title: 'Construction Area',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAENJREFUOI1jYaAyYKGZgf9DGf5TahjjagZGFnQBcg2DOYgFmyAlgLYupAYYYgaORsogNHA0Uig3kJIwhAUXC7oApQAAQ8kZ9+L+/N4AAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: Definitions.POINTS_OF_INTEREST.layerId,
    title: Definitions.POINTS_OF_INTEREST.name,
    url: Definitions.POINTS_OF_INTEREST.url,
    popupComponent: Definitions.POINTS_OF_INTEREST.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'points-of-interest-legend',
        title: 'Points of Interest',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAlNJREFUOI291FFIU1EYB/D/XXO36a4xJuhoLFheTCKmrAmZjkAvDEwkDCfYGIP7sIFOhg+CIEKEkQMvDUkW1hR8CNdLDBaxknCIjCkJobBYLqc2rFEJZQ3p2kNM3HZVDOn/dPi+c37nnIdzxDjhiP8raAeoc21trXKV6hohEhXzPL+yHok8uRMKzR8XFD3o7HR9nJvrSk1NFaSyez33WTZBUpTZxnEzR4IOQKJh2fDKyEhVplbn8UCp0cDHMACAtbExdUF5+euxvr5ednDQdShY4XA8i7vdVftrlxkGZWo1AvX1+BEKAQB2YjHindc7NOp0frBznE8QHOroqIu73cbcTR7b7aBUqj0sEz6ZxJdY7JEF8E8Av/LAM0ql61MOJm9qgq69HbqGBrgCAfDJZFb/q99PXbJYrJiYGM0DU9GoNvd0GoMBdS0tKKKo3NZeZArFTQD54LfZ2dO5kxd6e3G1tfVQELu7pZlhFiilaX47HD518ErhiKXSn4JgqV7/OR4Olx0XlMpkb4RBmvbFga7jYJKKCmxtbt4TBBe6u3vOWq3shtcrzdTKzGYUFhUBAC7abHg7MJAFam22Vyan870geBfYCRqNN7ZWV59/n54mAEBWUoKXk5MAALKwEARJYjed/rtBf39KDDTtN/JeCmMyvZjx+1sWafppwuORxDgu75oESeLK8HD0fHV1jba2Nn0oCACG5mZ/JBiUXzAYHq4tL1/fmJ8vTq+vEwq9/rdap0uoKytv1zQ2jgutPfD70jPMNoBbWcWlJWBc0Dka/NecOPgHyxW6W4CVlHsAAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: Definitions.RESTROOMS.layerId,
    title: Definitions.RESTROOMS.name,
    url: Definitions.RESTROOMS.url,
    popupComponent: Definitions.RESTROOMS.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'unisex-restroom-legend',
        title: 'Unisex Restrooms',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAkRJREFUOI29lF1IU2EYx3/bjhOn23T4gTPPURD8yJH2BWV4IYoURgTpReFFXVggdNVF5FUQZBFBRQlhtxZBCKGRQYFEF0p4YUZapqlhbalznp25ze2cbmS2dipx0v/qeZ/n//54ngfeVwB4MzT+2OtVGtAwsFUZDGputrVHAJj/5jvRfHV467B1Pb9S2yoAaMl09os0VJOgV+hud3G43sW1Oy+5/coNwNuuI4yMztLWNQZA3+UaKssLaL/0jP5Jf+yuLtBV7sSZ76CyNAfWgY6sdKwZqTFPRakTScylosT2d2CdmIbnh8y79zOkmgVSTQZCUS3Oc+t0GTNzi/jkVWr2iYxOLDMwHdAH3uioo3pXMQCVFSKCycipmyOxesfRQs6frY+dq1xFSIXZDLT1JQKldBOSmM2SV8aRZWXu6yJ7q4uADeCOfCtu9zJ5eZkAuN3L2G1p+iOfa5Lw+4OIhTkA2O0WLBYzOx0pcVMEQ2HdOAG4f7eIpm3sy26zMDProbVR+n0zf1QcsPPeEPevN8UZPn/x0N0/TcuxagDGJhYoFueRxFyUQJAVf5Dxj9/1gdPeMGZzCuG1CABr4Qi2jDQmV6Ixz91BD5GISmN9FR6PD0UJ0dI5rA+cXIlScLyHqUfNGI0GPk25abg4uOlxE4Dbof8DVAIholEVRQnFcqqqoq6/GM9SCFleZWFRxucL/BvoOvM0IVdy8kks7v0g09vwYPMdJiFVAHDm2V8/vLDnQDL/osGIlmm3vBAADh0sq92uFn8CQJrKeuGe9RUAAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: Definitions.LACTATION_ROOMS.layerId,
    title: Definitions.LACTATION_ROOMS.name,
    url: Definitions.LACTATION_ROOMS.url,
    popupComponent: Definitions.LACTATION_ROOMS.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'lactation-rooms-legend',
        title: 'Lactation Rooms',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAfJJREFUOI211L9rE2EYwPGvEifvIKS0zRVSNRpE01RMLiASpYiCk3QQLyR/gAEzZikBwcFm0NKhHdqhi9JwNwj+gCLUwSFLiXEwjZTEIGS4HjfclCVTHS45ERpyyeEzPcf7vh8ennvfx8d/Ct8gyQaiCazunBfsBKFWpqE7cDYQTZy1ep/gnOStzt5xhqhcpqHbFVvdOe8oANIZuglA943c2o+0VqL945Dqy11X+13BL5p7XIpE4MljzHyOgnTHOzyfTtloP2aCQebTKTpqxRvcUSuY6wYzwSAApmGMRF3BANrmFpcXFwiFw3x9/9HNkdHww80CF69GEP1+AJaWH5FYusvWg6eTw8lilsyz0wGxqvEqqUwGK/ncP9+mYfDr8CdXFq4Tk+Mki9mh128onNZKzg+rf/tOTI7z5d0HPudfA/DmpIWSz40PX7t5w8nrB1XqB1X801OA3SIAQRCGHR8Oz0r2C//dauGfnkJVVkgWs+T2t7l9/x4A7aPm+HD7qElMjnNeFAmFw+T2t9nbeYu4bN8O0zDQ1jbGh7W1DWbX7T4Pei1dCLHzfJV66pbT67HhjlqhoNozIa2VAFCVFWdtVLh6eQNwnPCBPfmhdwx4nck1AoKO1YfLNPQMUbk/pCePgKDvWo2aU/EAB3RPsPU3/QN/+Jj7cGHLggAAAABJRU5ErkJggg=='
      }
    ]
  },
  {
    type: 'feature',
    id: Definitions.SURFACE_LOTS.layerId,
    title: Definitions.SURFACE_LOTS.name,
    url: Definitions.SURFACE_LOTS.url,
    popupComponent: Definitions.SURFACE_LOTS.popupComponent,
    listMode: 'hide',
    loadOnInit: true,
    visible: true,
    layerIndex: 1,
    native: {
      opacity: 0.001,
      labelingInfo: [
        {
          symbol: {
            type: 'text',
            color: [0, 0, 0, 0.001]
          }
        }
      ]
    }
  },
  {
    type: 'feature',
    id: Definitions.VISITOR_PARKING.layerId,
    title: Definitions.VISITOR_PARKING.name,
    url: Definitions.VISITOR_PARKING.url,
    popupComponent: Definitions.VISITOR_PARKING.popupComponent,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    legendItems: [
      {
        id: 'visitor-parking-legend',
        title: 'Visitor Parking',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAXlJREFUOI1jYaAyYIExzp2/t+Dth6/2DAz/GUk1hJGR8Z+oEO8MfT2FLriBN26/iIvqPUuyYTBwoMc5k4GBAWHgv/+oLnOQ4WRgZUbVdOXVT4bn3/9hNfDf/3/MDAxIXkYHG+ZFMvDzcaGI/f37j+HWnWcMLf0HGJZd+IBVH04DsQFmZiYGTXUZhqmdgQwvUlcw7Hv0nXQD5y85xJA05RIDAwMDQ76zBENjuSeDAD83Q1GSIcO+hmOUuXDi3hcMbva3GLzcDBlkZYSxqiHJQAYGBgY5qEFfvv0kz0AHG3WGU5pSDAyMjAwSYvwMsjIiDP///2fYsfcGeQYqKogzKCqIw/n//v1jWL/5DEPzxkfkGXjtxmOGZy8gSeTLl58MW/fcYZhz4g1O9QQNPHnmPjyWiQEkR8rgMXD63AMMHBysDMfPvSDPQPRipnLlPZIMYvzP8B/FQBkZwUtzc/S0//8nvTxkYmT8z83NfgjFQHtrLX1SDcIGqB4pABDucZbUZNfrAAAAAElFTkSuQmCC'
      }
    ]
  },
  {
    type: 'feature',
    id: Definitions.ACESSIBLE_ENTRANCES.layerId,
    title: Definitions.ACESSIBLE_ENTRANCES.name,
    url: Definitions.ACESSIBLE_ENTRANCES.url,
    popupComponent: Definitions.ACESSIBLE_ENTRANCES.popupComponent,
    listMode: 'show',
    loadOnInit: true,
    visible: false,
    legendItems: [
      {
        id: 'assisted-open-entrance-legend',
        title: 'Assisted Open Entrance',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA3pJREFUSInNlVFoW2UUx3+9ye29TToVLzJat+EYCHsocyQPsVCCYbGrtAwELVuQjKHZw7RPfdiTSR722Je8LSK0SgZhDCmxhtA2oNW+zMIeBq0IDm23NNTbh7VNenNvbnxIe5fb29SKCJ63e7/v+//OOd93znHzH5v7fwEYuqb2ap34XNBDg16AXYPcQkZZ+leAgYjqEwUSmsAwDai3rIlu4qGoCpCWdJL5e8qzfwQIR9VEHeLnTwuE+0UCfolur4DXI7BTMVkvGzzfNhmfqMQ0kVg4qiZnp5TEsQChj9RcHYbHRiUuBbvwegTbutcjcO5sJwDzkzLT+R1SWS0eiqo9xSnl5pGAPc+HP491Eezvahegza4MeTlzysX4RCUWjqql1khsgIGI6qtDfGxUcogXF6ps7ZgABN+WeeVll239Yp9MZFAnU9DjAxHVegA2gCiQOH9a4FLQLv7nZp07X1atb1nqYPAdjyOSG1dPkClsIovcBfw2wNA1tVcTGA73i46cLz3SAFC6O1C3G0zP1wgHuxCEDgdkbFQildV8jhRpnfhoQMAv2Q6YZoNv5msAfBaRufNFlV/WTJ78oXPujU4HIOCXSGU1QtfVkeKkkrMALuipA91eu/dPftf59amJqwN8FyTeDejMLBosPqwdCjj5mtvSs0WwX6EH07P4sOl931mB8kad10821x/M1fhgxESW7fsP6jme6U7FtCDVXZMHe+l59JvJx/Eta9+WBo9Xavjfkh3nW80C7BrkRDfx9bJhFdHj5Rpbzfvl1ocSkti81O9+qLGyajL3oxOwXjYsPRtgIaMshaIqz7dfeDD/U9N7/5sC77/ntf67XLDy1S6zPxt8sllHefVFTayVmh2ru0HpsBSlxycqsfnJple3P32J2zjtcsjD5ZCzDsobBvfzGkB6v/nZAJJOUhOJTed3uDLkdQj8nc3MVVleNdEN0vv/bID8PeVZOKomU1ktfuaUi4t9slOljX2/WCVT0HFBstgyJxyvaHZKSYSias/4RCUWGdS5cfXEkcLlDYOZuaY4Jt/Ofm1v2Ye26+KUcjMcVUuZgh7PFDYZG5UI+CWriPbnwVqpzv28xvKqiQuSB8XbAvYjGYioOVnkbiqr+VJZrd3WtG6QLrYZn0eOzL2W6wcIXVdHDs7k7galdqPyWIBWK04quePubbW/AF6HYoeZu0A/AAAAAElFTkSuQmCC'
      },
      {
        id: 'Manual Open Entrance',
        title: 'Manual Open Entrance',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA05JREFUSInNlU+IE3cUxz+/38ykY1JRlFKyENYl0LqLkWazFSzYg8XDQmRP4rWnCKV4qB48SJP04Gn3sjcDglCkrCchLXQRyxaL0JYllJRdKt1WumqoLdLDbjZ/Zn6vhyRjZpPIllLoO8289+b7+b03j9+z+Y/N/l8A2u32mGVZGaVUXETGAJRSZaXU6r8CiEgGKADZnk8p1XvMiwgiUvJ9v+g4ztN/BDDGFID8dt3wcKPF8kqLx88M65uGyYRmesri8EHN3GwsZ9t2zhhT1FoX9gQQkTKQrVQb3LjdYH3ThOLrmybwLS41mb8UJZ1y88aYuNb6wksB3ZNnv36wwyelnVEFhuzyQp2L533mZmM5Y0ytv5IQoNvzfKXa4LMvmsx/FA1i33zf4s59jwMuXP0gSu9P/LDW5tMv2ywuNTl21CE5EcmLSDAAuysobNcNN243eO2AIn3cDQKWrbhz3+P0CZvpPv/WtgBtAHLFLe7dPARwHZgJAdrt9hiQfbjRYn3T8M6UFYh4nnAk4QBwfNIJfLYdTFRglWqDdMrNDLTIsqwMwPJKa+CjJzWP8YTDiTc1ySMOIi98u215pUU65WKMOau1LgcApVQc4PEzM/DRxqOO2LtvR4i/bvHnc5/6zmAewN1Vjyt9egFARMaUUgMjCVBZa3P61D5OnXTRWvHroxb79+uhgH69EKBnkwk9APm26tNoGF6NdUR//Mnj5ExkqPBkIgzub1EZyE9PWQMAzwi/PfF4IxnBGPjqu9GA6e5wdPVCgFUR4fDB4aX//EsH8PsfHrW/ZGgOQHK8I+l5Xi0EABCR0txsLLe41OTBms977z8PYgu3GizcagTvH17bBrZD4mcyNjNvvYKIlHqXXwjg+37Rtu3c/KUolxfqI085ys5lXWJRDVDq+UIAx3GeGmOK6ZSbv3jeZ3GpuWfxj3P7SE5EEJGi1jrYEwNTpLUuGGPic7Ox3LGjDrni1kuFz2RszmVdkhMRgM93X9lDr2ut9QVjTC05Ecnfu3mISrXB8kqLu6seQLAPkuOdnseiunfywm6tkQtHa13o7oXr6ZSbSadcrgzJE5ESUOpvy54A0BldureiMebs7p3seV5t1KrcE6DftNblveb2299DrV3F9KlErwAAAABJRU5ErkJggg=='
      }
    ]
  },
  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    loadOnInit: false,
    visible: true,
    popupComponent: Definitions.BUILDINGS.popupComponent
  },
  {
    type: 'feature',
    id: 'no-parking-layer',
    title: 'No Parking Locations',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      outFields: ['*'],
      definitionExpression: `Type = 'NoParking'`
    },
    popupComponent: Popups.BasePopupComponent
    // legendItems: [
    //   {
    //     id: 'No Parking',
    //     title: 'No Parking',
    //     src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA9lJREFUSInNl1FIU3scxz/bzKktw2txy3nrGhaxKMQHxUIfbDF2kXpIHRVC5ZCwaJOwBYIQdGGVsa1ovpSeMQhkhTTy+mQFkV17iaAeiggtqFdlunVknfXwtznzzC25o/t7OYf/+f1+n///nN/v+/+fPH6R5f0fwAVAI5CfC5Ber4/IsvwIUH4EtwKBXEABZFlGr9fvk2V5/EdwkcPhwGazodVq/zOgoiiEw2HcbjdA0ffxJd/YYrFQV1eXKRPMzkIsBoWFsHYt6HQrhsiy/B2ctCVgjUaTPvrtW3j8GAYGYGJicXzXLujogMZGca+SQy1v5qqemYGbN6GnB86ehYsXYcsWsdpoFD59grEx2L0bLlyAc+dgw4aMaVcGf/4Mp0+L+1evwGRaviKTCcxmOHkS+vqgpUW8lYqKVYIjEXA6YXgYzp+HbdtUX2PStm8HrxeuXgW7HYaGVlx5erAkiQLy+6GzE7Raot3dDN2/v8zVYDBQXl5OdXU1+u5umJwEjwcuXUo7WXXwhw/ie754AXv2QH4+2O3oYzHu+XyMpJmr1WrF7/fzp8sFO3fC0aOi4LIGP30Kx48LqFYLJ04AoLPbuQ20A039/ZSWlgIwPT2Nz+djdHSU3t5eAoEAmq4uePjwJ8HDw2CzCSgk4fOzs/zudHIbiJvNGCsrkyFVVVXU1NQQDAbxer38ZrGICu/szBIcj0MoBF1dS8e1WqJtbbxzOjEB8x4PXLsGBQUAFBcXJ10VRYHNm+H1a5ibyxL85Yu4LiRMtYRGw1/AP4DJ7ycWjfLu1CkiX78SCAiZr6+vp6SkRPQ/iALNClxYKK6RiGrAFCzCJYmNkoQLGF147na70el0QlxS82UE63TQ1gbv30NDQ1q4u7WV3qkpKicmCNbWMtbRwT6LBaPRKJw+foTaWjAYsgQDHDwI/f1w7BisWaPq8ndfH38YjTA4SKndTqvZDAtVTiIBIyNCzdLsdOrgvXuF9D15IsQ/naW0Gna7EIueHrGh+P3w5k3aUHVwWRncuiWk8sED2LQpe7iiwMuXQrV27PhJMMCRI/DsmWgrjyc7+NwcOBxw6BCcOZPef0VwURFcvgwuFzQ1wZUrlDQ0kEgklvvG4/D8udgYDh+G69dh/fpVgkEUy40bcOcO7N8PBw6IgquogHXrRI9OTsLdu0LtPB5RUClisjowiD5sbwerFcbHIRyGYHDxeUsLNDcL6NatGdOpghVFSe9ZViYAzc0wOChWW1AAeZnnrpY3NWo+FAoB5OSUuWCyGvieJElIkpSTAz0QkWX5XzXwDDCQI+gy+2X/Tt8A+qw6Z3UcdzYAAAAASUVORK5CYII='
    //   }
    // ]
  },
  {
    type: 'feature',
    id: 'personal-engraving-layer',
    title: 'Free Personal Possessions Engraving',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      definitionExpression: `Type = 'Bike'`
    },
    popupComponent: 'MoveInEngravingPopupComponent',
    legendItems: [
      {
        id: 'Free Personal Possessions Engraving',
        title: 'Free Personal Possessions Engraving',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAmCAYAAACh1knUAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAABQBJREFUWIXVmH9oVlUYxz9nvu/uxqbma6KXEW5MkSUznY1hmkjkstUW02ZWGBIiirQlGIqQgktFE90QAt0fYf7hdOgymek/MotlhStjLolN0srdLfGqRHs51evpj7P3x/31TnNUfuHynnuec+7zuec85zn3vCH+Jwr91wBxPSwgajKIayPjSj0PnAFx975ADEOVS8nHoD6PRNhs2+KrgHbPADEpxTk/eySiZto224AKUB+BehNE7B5BVIWUHAcMoNy2KQfVC6rDMPgFyJCSAhBPS0neUJ8fQX1mGPwECCnJMwxRZts8nnyueANUGNRyN4wPiKoCWoBMl2EKiClS+qMDBSAKUu3+bcWr2q96DcRfASBqMdAMhBPep0BDA+zfDydPBkJ4NHMm7N0LZ89Cfb3HXKN9qJo4jHtEVqRCTJsGJ07o34ULoasLLl/Wbzp6NBQVadCeHujuhhs3YMwYKCyEWbMgNxfmzIFQCLZs8cA8BiSmxwESifCebVMJMH06tLbC1KnalpkJs2fry60ZM/TlJ8OAjRshHIZNmxymLSCUL4hti69BdQHFLS1JiAdVZiasXw+dnXDsGAA/A5+mtvEEq2GoVilFcX+/HvqR0vXrCQhAfQIZjnzis2rEFwAHD8KCBSDEyICcOePw4ck5HhAp6Y2D7NwJEyc6zH8MDqJiMQx3PyEgOxtGjfJCxGLQ1JS8N01+sKxhQIBb8UJfnxOkr49wXh6BY2QYsHYtrF7tjK+bN3V8xGVZ/Oru6wExTfLitNGo0zZhAsKyoLkZ1q3Tdd3dekVYFuzaBXv26Nxx7pxeyn7PMU0mWBb9aUEsi6fi5fHjnbZwGCZNcr7t5MmQk6PrDAPa2uDiRbh2DYqLdZvcXI+PJ4GutCDAS6ATVX6+jzWNbt9OlrOykuVIBGpqoKUlXqMWAR+mAVHjgGcB1qzRbzicTp/WmfPqVdi6VdfV1TlfQgiork4FERWgskEkJs09Ii8ylOLnzh0eAqCjQwOHQhqkqEin9XDY2a601HGbC1QAicziHpFyhhZFYeG9gdTX6xgZTvn5erp7exO+qgJBDEOUxrfueMSPlEIhmDcvFUTMc9hTb6QkkTWiUb1H+OnOnWQ55vnW8pdSOo5SZAaCoJPZIwBXrkBJidM4MAAbNuisG9fSpbrd9u3pQfr7ob3d4ysQpBMoADh8WH/cZGQkjWPHEq2t5fdVq3g0tZM7MP106pSnqjP1xg1yBHgZYPdumD8fKiuTxqwssktKyB7erVMXLsDKlZ7qI+lAWoHvgCcAqqrg6FFYssQ5Mvej9nZYtMhZZxh8LyVH04CImGmq5ZZFBzAadAxs3gy1td6Un06Dg3DokN4AXfotJ4flUoo/04CAZYkuw1DPSUkbMA50ompqgh07oLwcTNPdK6mBATh/HhobPcEJcMsweMG2xTdug++5RkpxHlQZeqqma0BYsULb6+r0dJWV6SV+9y5cuqSncdu2QMZuoFpK0eNnTHPkFD2gSkHtArEGSHzyNDbqa9kyPVoHDujgDpAC1QRiHYjBoEbDnH1FFHgLVAOod/RJLblqmpv1FaA7oA6bpvjAsjK6AlvdG0gC6AqwGtQm4HXgFSBoW/wS2Ae0QkbU/Un4gCAJIHvIyb5IRM2ybd4FqoeMbZEI9UGH9REGScq2xbfAYlBvA2EQ79v2P33aiPxRIxoe/BkPzz9G/57+BtpFixyOkQfIAAAAAElFTkSuQmCC'
      }
    ]
  },
  {
    type: 'feature',
    id: 'move-in-bus-stops-layer',
    title: 'Move-In Shuttle Bus Stops',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      definitionExpression: `Type = 'BusStop'`
    },
    legendItems: [
      {
        id: 'Move-In Shuttle Bus Stops',
        title: 'Move-In Shuttle Bus Stops',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAA3xJREFUWIXV11toHFUcx/HvzOxM9tK9Jm5s4rUg3lCkNySCtJHaBs1DHyKIDZGCNoVKhBJEjcTSQqsPVVvpKih9sUjRIrSEJpUiTb1BmhpoFRRjCNHETdbcNt3dmdmZ8SULCUx2Zs2u1t/bzPzPmc/MGc454+Emiee/BhRyc0I2NH2w9Y19G/eGg74nFEWKVeKGmmZMz6WzFw+euPL+YE97vy3kQMfmPV3HB1qGUlolDIXEHozJLW+/vNl4qgd7SDTs31ZhBAA/TutEQv5tS88tg8iyu+HYcpuPxzfGuaM+hN+rIAiQyemM/THPN1eTfDmadexDlqXqFSHFsiGu0Nn2MI89eg91a2OIomBbZ1kWfyZn+X7gV945OcTlcdVV/64gnTvq6NrfRCjow7Isuo+cY2Y+Z1vrVSQOvtrMzuZNPNn4EEfe6+PQ2bHyQNrbGggFfQAIgkDHni1ommFbK0kiXq8CQCDg5YXWBg6dPV0eSH19NZNTcwwMDpM3TDdNkESRTevXUV9XzZ0BidEb9nDXkJ33B6lSZC5cvE7ruz+4QhSSeHGW9t2NND4Q4eTAX6uD3LcuDMD4ZLokBMDw6AwAd90egtVCbo2vAWBsYr5kyLVf5gBYWxtwrHWE1ET9APz8W+lvpG8kg2GY1MTKAIlF/Zim6WqSsksupxGLlgESjvgRRZFz3Q38PjFbEiIWCeD3VxEK+VYP8YgiAE83rS8JsTTSYh+rgvxbcQ3J5TQMwyQQ8Lqqz2RUBFHAtzjLlgVimiZtL51mOJnlq1OtBIPFxzyn6jQ//wlBv4fPPtpVPggI3BKrIqsaiJL9qrs0oigQjyqs8ck4V5cAEUWBY4dbAAvRxYenyB5OJZ4DhBW3C/8IUsDg+vlwBS4JMj2zQDI5S21tZPE4jarmi7aRZYma6hAAU6l5plLOs7IjZEfX12y/+yq9n+4GIPFxP12fjxRts29rnOOHnwHglQM9jiuvKwhAMp1H1/N4PBLjkzcc6yeSWUzTxDQtxlPulgZXkKGURsdrZwgHqzjRP+lYf+anNJ1vfoGmG/SNZEqH6LoxDdju5BOXp1x1WMjRCxNFr+u6sWy8lkHSC2rfIzXKs5X+t7k34iG9oPauCHn96LcfvrW/wVIUT5OiSNFKIDTNmFHVfG/3se8SK0IGz++9tP08lyoBcMr/b/WtdP4GZCYgC7hj9WMAAAAASUVORK5CYII='
      }
    ]
  },
  {
    type: 'feature',
    id: 'dining-areas-layer',
    title: 'Dining Areas',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    native: {
      definitionExpression: `Type = 'Dining'`
    },
    legendItems: [
      {
        id: 'Dining Areas',
        title: 'Dining Areas',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAc1JREFUSIljYaAzYBlQC2ctPijBwcLERy3Df/9l+J4cY/sYq4XHTt7c/OXLD58/f/9Ryz4GZiYmhmMnbx61Mle3wbDw+/dfXm5Vh6hmGQzs6XCw3rr7ooq3q/4dFAv//PnHhE3DhAR1Bk4OVgZTI3mGv3/+MVy5/pTh+48/DFmzrzEEa/EyzOgKZODm4WCYPvcAQ/HiWxj6/zP8Z2Bi+McF4xNMNFycrAxcnGwMfLycDH9+/2Xg5uZgYGL6xcDAwMAQ7KnGICICiXJPFy2sFqIDilIpCyszgs2CNYCoayE5gCgLFeWFGbi5OBj+/v3HIC8jyHDj9kvaWmhlrg5nS0sJ0dbC9x9/YBH7TjsLy5fdYVCUO8UQ4m/KwMjIyLB24ymGggU3aWchAwMDQ1jHKYa/fiYMjIyMDCHtp8i2jGgLqQmGloWnzj9mUFYQYTAyUKKPhT07nzMoywvSz0JywKiFI8jCi5cfMjAxMWKIHz71jMHX4x3D6bMPSLOQhZXpLwMDAzMuhUbpW7GKL7vwgWFZ0DKcFjAxMjL8Y/j/BcNCLk625TtabUN//vxDtWBmY2X+y8PNvtvZVPcehoWWZuqxDAwMsdSyDBege6IBALGVfle7nVsNAAAAAElFTkSuQmCC'
      }
    ]
  },
  {
    type: 'feature',
    id: 'move-in-info-layer',
    title: 'Info, Refreshments, Volunteers',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      definitionExpression: `Type = 'Info'`
    },
    popupComponent: 'MoveInInfoPopupComponent',
    legendItems: [
      {
        id: 'Info, Refreshments, Volunteers',
        title: 'Info, Refreshments, Volunteers',
        src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAkhJREFUSInFlj1II0EUx39zye0enoiHNlZaaREOUoidjYgWQeSiVrlGxEKDhdjFb1AUBSGciFYGsRKUAxELQTvF4kgRtLIxFgrmEBQkSwxzxRo3e/nY5DbxHizsf2be+zHDm/fGyTub8z8D5RdALWH8BIjfOYDy2/i49DY2CjfID6WgSYkWDstQMMgPEDINKD8CX+fnxXddiwxnlwsGB6GpCVQVHh/h9BSWlvJDt7eJAz+BaBoQh6pKRdMyQQChEPT0QGWleby7G4aHYXYWNjezA4WQn0AoKW2ZNEdH0N6ee76+HlZXQVFgY8MqmgVwfT0/LGUVFTA9rZ+EptkA9vaa9fU1bG3B3R14PNDRAc7XCHV1sLgIo6P/CBwagpoaQ9/f67u9utL12hrs7oLXa6xpbs4PywtsaDDrszMDlrK9PTOwutoGUFHM+ukpc01rq1k/P9sA7u9DLGboy0vz/MAA+HzmsUjEBvD4WP+yWX8/rKyY72UsBpOTNoC5rLNTh1VVGWPxOMzNwe1tGYALC+bkSCRgeRmCwcL8iwL6fOB2G1pKvbpMTRUeoyhgVxeItHIbDsPISDERigTW1pp1rqQqGfDhAW5uDP13ISg5sK8P/H5oaYGDA9jZKTNwZgYmJsDh0At7MqnX07IB29p0GOgtyeMpMzASMepnMgnn59Y+UiKzAV80TcStnP1+/e65XHByUliHj0bFBfDWll+B4gXkLyCgqvJzvgBjY8a/avGg1DShBQJcgHjL7bQjFYfAodUTwa69+8v7DyxOqi1ItRckAAAAAElFTkSuQmCC'
      }
    ]
  },
  {
    type: 'feature',
    id: 'recycle-layer',
    title: 'Cardboard Recycling Locations',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      definitionExpression: `Type = 'Recycle'`
    },
    popupComponent: 'MoveInRecyclePopupComponent'
    // legendItems: [
    //   {
    //     id: 'Cardboard Recycling Locations',
    //     title: 'Cardboard Recycling Locations',
    //     src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAABKxJREFUWIXVmF1IFGsYx3+zri221ZpZWBDbsTDUJYKivCljTcFqKynJIKyojOoiiIrYsqyotOjDPqgkCy8Kj1LEUSjoIg9Z0EXaTZDVTXWOGsSSouWa7ZyLh2Hd3dlPce38YWDmfead97fzPu//fXaM/OYyjjVAOOkCqmpKDriygcQ4cajAP0CrotAzPOADqKokAw3gyo8TmL+6VdVUoijuv7UGf8BqRWGs4ADSwP1AVflDUegFP0BFYe3YcPkoBcgFmiAwBydF8ySPB9raoLUV3r2Dnz/BbIa0NJg5E7KywGaDxOgz2aKdxLyKVRWeP4cXL6C+Hl6/1r9v1y6orIRJUf10r2IC/PULnjyBzk6YNw9KS6GpCXbuDLz3+nWYMAHOnIGEhDgBPn0KhYXe62XLoK4OTpyAo0cD7z93DpYuhVWr4gDY2wuHDvm2tbQI2OnTUFsLHz8G9isrk3ydOBH6+2HatFECbGyEV68C2+vqYOtWqK6GtTpe0NUF5eXQ1we3b0c+XlSAnz7B9u36sTlzZMWazeBwSE7669YtaG6GpKRRAqypCR67cAGmTJHz8nJ9wOxsyM2NZsQoAffuheRkOHDAt72oCAoKvNc2G+Tny0ofrooKWdGjBjh1KuzfD6tXw6VLYiEATieYTHLe0wMNDZCRIdcapNUq0ACDg+ByiaGPCFBVYWAAvn+Xo79fkjwjA65cgY0bxawXLPD2sVhgxw7v9dCQ9B0cFLNuaxPjHj9ectIY5hUFDXs84neHD8PLl76x+nrYsAGWLJEj5ABGAfv8GY4cESvSVFoKdnuMgAYD5OXJbuEPeOwYrFghnhZOQ0Nw9y5s2RIYq6iARYtC52XIF9zd7Ttdmjo6xJwdjvCARiN8/aofe/ZMbKekJEbA2lpwu/VjlZWwfHlknrZ5M5w/L2btrz175DmpqVECfvkiOaOnoiLYtk0qmby88ICpqXD1KqxbFxhzuUBRgvcNCvj+ffBOTicsXCirOpw8HsnnwkI5Hj3yjd+8KQtIM/mIAfv69NsPHvTaitkcGq69HWbPllWclCQ7jAZoMsGdO5CTA1VVcONGlIDJyfrtu3eLP6pqYMxg8J5/+wb79sG9e9460GaTmVEUAXz7FjZtkhwMpqCAmZmQkiI5oqmmRqZj1iz9PgMDMrDHI0be0gIzZgQfXNPJkzEAWixw9qy3erFaYc0afT/zl1YfRqL8fFi8OAZAgPXr4eJFePNGpqKzMzDJ/dXVpV/6B9OpU6FzOSSgxSKABQUwebLvdAfTjx/w4UNkcFVV4gahFLaasdvh8mXxvJUrww+ang737+t73nCVlcmCC+WBEQEmJIjbz50rye90+m74enI4pM+1a4ExqxWOH4fiYqlowimietBgkGnWAIuLfeOqKjGtdEpMlCqouRkePvT+Jx43TmpKrXaMRFEVrAaDJPT8+eHvnT5d6r309Nj/tEMgoAcw6N0Yi+x2ebMxaEg78QM0dYA7c0RUw2Qw+O4ukSulA8Qy/ADdFcCfI+Qaqf5SFFe7duH/+a1BVU294C4HsojrF1bTv6pKo6K4fTa+gEWiKO7HwOM4gQ2TfmX8//yI/jvpP9YOXIOgox6EAAAAAElFTkSuQmCC'
    //   }
    // ]
  },
  {
    type: 'feature',
    id: 'accessible-parking-spaces-layer',
    title: 'Wheelchair Accessible Parking',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    loadOnInit: false,
    visible: true,
    native: {
      definitionExpression: `Type = 'Disabled'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          color: [0, 105, 230],
          size: '10px',
          outline: {
            width: 0
          }
        }
      }
    },
    popupComponent: 'MoveInAccessiblePopupComponent'
  }
];

// Static legend items
export const LegendSources: LegendItem[] = [
  {
    id: 'university-building-legend',
    title: 'University Building',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAJBJREFUOI1jYaAyYIExAtnZGygxaP3Pnw1wAwPZ2RuE7azruYVFyDLsw/2HDCkvXhirKCvPgruQW1iEQUJJmWwXMv386cPAzOzDQlgpaWDUwFEDRw0cZgZ+uP+QbEO+vn3DwIts4PqfPxsCL1xg+HThAgMDAwODsISEMamGimtooLoQVuIyMDAwMDwkw7VQPQDNmyRazmV6EgAAAABJRU5ErkJggg=='
  },
  {
    id: 'non-university-building-legend',
    title: 'Non-University Building',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHFJREFUOI1jYaAyYIExmpqaGigxqK6urgFuYFNTU4OCBGe9EC8bWYY9ff2doampiaGurq4B7kIhXjYGZWk+sl348sMvBrgLqQlGDRw1cNTAYWbg09ffyTbk3edfqAbW1dU1NDU1wYsgcgBKAYssQCkAABa3ILBI1xApAAAAAElFTkSuQmCC'
  },
  {
    id: 'off-campus-building-legend',
    title: 'Off Campus Building',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGdJREFUOI3t1KENADEMA8CADhBc2H0802cnLxVUdYRHH7U0LXrVKAo4GbnI4ZTvIGk7EAALkKTVWh9VTWHuLiQFgEVDVZXWWrph712i4clc8IIX/Bno7mlkjLGCAIxkTFAmy8DOj9281XsgH/GbKEkAAAAASUVORK5CYII='
  },
  {
    id: 'garage-parking-legend',
    title: 'Garage Parking',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGtJREFUOI3t1LEOgCAMBNAOTMBgogNfezb3v4YQxdnJRldkMtzUdHi56Zx0jrsPkvoFAqAGktRlntYYfBO25SIkBYBawxi8pLQ0N9z3KtawZwY4wAH+DNxyaUaOer5BAErSJqglr4F9Pr7mAt2qILaQAOa8AAAAAElFTkSuQmCC'
  },
  {
    id: 'restricted-legend',
    title: 'Restricted 6am to 6pm',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABHNCSVQICAgIfAhkiAAAAFtJREFUOI1jYKAyYIQxHB0dGygxaP/+/Q0MDAwMLDDDQkMC6+OfviDLsFmiwnBDmWCC5BrGwMDAkPb6LZzNhEcdWWDUwFEDRw0cZgbCiiBywEJpCTib6gUs1QEATW0WjAt6JIYAAAAASUVORK5CYII='
  },
  {
    id: 'paved-surface-legend',
    title: 'Paved Surface',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAGVJREFUOI3t1CEOACEMBMAKdF+A4aN7zf62AsMLTl0DtqAurGoqJqu2yOGU7yBpOxAAC5Ck1VofVU1h7i4kBYBFQ1WV1lq6Ye9douHJXPCCF/wZ6O5pZIyxggCMZExQJsvAzo/dvKA4IK9bweSrAAAAAElFTkSuQmCC'
  },
  {
    id: 'sidewalk-legend',
    title: 'Sidewalk',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAEtJREFUOI1jYaAyYIExPr641UCJQfwSag1wA6GG1VNi4McXtxj4JdQaWAgrJQ2MGjhq4KiBowbS0UB+CbWGjy9uUWQQSgGLLEApAAAvoxCdulpoFwAAAABJRU5ErkJggg=='
  },
  {
    id: 'railroad-legend',
    title: 'Railroad',
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAHhJREFUOI3tkrENgDAMBL+I9EUmYA7WYCfCTLBG5qBz/x0VRUAkAtIg8q3t+7dlh8pyDfgnIMnwBiQpJEBJI8mpMDQAWEnGYkIA0Xs/m9llM8kkTQlYRQnQzEJuHUk9gG5PeqiFBEhyKbnnzE4Jc3e5ow89dgM+1gZwZSYCkyusZQAAAABJRU5ErkJggg=='
  }
];

const commonQueryParams: any = {
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
    url: `${Connections.basemapUrl}/2`,
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
    popupComponent: Definitions.BUILDINGS.popupComponent,
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
    popupComponent: Definitions.BUILDINGS.popupComponent,
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
    popupComponent: 'BasePopupComponent',
    searchActive: true,
    altLookup: {
      source: 'building-exact',
      reference: {
        keys: ['HOME1']
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
    source: 'all-parking',
    name: 'Parking',
    url: `${Definitions.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: false,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.AggieMap,
      GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.SpacePnt_Count.UB,
      GIS.TS.SpacePnt_Count.H_C,
      GIS.TS.SpacePnt_Count.Visitor_H_C,
      TS_GIS.dbo.LOTS.Night_Lot,
      TS_GIS.dbo.LOTS.Visitor_Lot,
      TS_GIS.dbo.LOTS.AVP_Lot,
      TS_GIS.dbo.LOTS.UB_Lot,
      TS_GIS.dbo.LOTS.Break_Lot,
      TS_GIS.dbo.LOTS.Summer_Lot,
      TS_GIS.dbo.LOTS.PrepaidSumm_Lot
      `,
      where: {
        keys: ['1'],
        operators: ['=']
      }
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
    searchActive: false
  },
  {
    source: 'one-parking',
    name: 'Parking',
    url: `${Definitions.TRANSPORTATION_PARKING.url}`,
    queryParams: {
      ...commonQueryParams,
      returnGeometry: true,
      resultRecordCount: '*',
      outFields: `GIS.TS.ParkingLots.AggieMap,
      GIS.TS.ParkingLots.FAC_CODE,
      GIS.TS.ParkingLots.LotName,
      GIS.TS.SpacePnt_Count.UB,
      GIS.TS.SpacePnt_Count.H_C,
      GIS.TS.SpacePnt_Count.Visitor_H_C,
      TS_GIS.dbo.LOTS.Night_Lot,
      TS_GIS.dbo.LOTS.Visitor_Lot,
      TS_GIS.dbo.LOTS.AVP_Lot,
      TS_GIS.dbo.LOTS.UB_Lot,
      TS_GIS.dbo.LOTS.Break_Lot,
      TS_GIS.dbo.LOTS.Summer_Lot,
      TS_GIS.dbo.LOTS.PrepaidSumm_Lot
      `
    },
    featuresLocation: 'features',
    displayTemplate: '{attributes.LotName}',
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
    popupComponent: Definitions.BUILDINGS.popupComponent,
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
    popupComponent: 'ParkingLotPopupComponent',
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
    popupComponent: 'PoiPopupComponent',
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

export const SelectionSymbols: any = {
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
