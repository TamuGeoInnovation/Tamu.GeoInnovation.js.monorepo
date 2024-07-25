import { SearchSource } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { MoveDates, Popups as MoveInOutPopups } from '@tamu-gisc/ts/movein/ngx';

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
    popupComponent: MoveInOutPopups.MoveInOutBuildingPopupComponent
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
  },
  MOVE_IN_OUT_CHECKIN: {
    id: 'move-in-out-checkin',
    layerId: 'move-in-out-checkin-layer',
    url: `${Connections.moveInOutUrl}/2`
  },
  MOVE_IN_OUT_STREET_PARKING: {
    id: 'move-in-out-street-parking',
    layerId: 'move-in-out-street-parking-layer',
    url: `${Connections.moveInOutUrl}/5`
  }
};

export const ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: 'residence-layer',
    title: 'Residence Hall',
    listMode: 'show',
    visible: true,
    url: Definitions.BUILDINGS.url,
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
    id: 'move-in-parking-lots-layer',
    title: 'Move-In Parking Lots',
    url: `${Definitions.MOVE_IN_OUT.url}/6`,
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*'],
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
          },
          {
            value: 'SSG',
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
    popupComponent: MoveInOutPopups.MoveInOutParkingSpacePopupComponent,
    layerIndex: 3
  },
  {
    type: 'feature',
    id: 'move-in-parking-streets-layer',
    title: 'Move-In Street Parking',
    url: Definitions.MOVE_IN_OUT_STREET_PARKING.url,
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*'],
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
    popupComponent: MoveInOutPopups.MoveInOutStreetParkingPopupComponent,
    layerIndex: 4
  },
  {
    type: 'feature',
    id: 'accessible-parking-spaces-layer',
    title: 'Accessible Parking',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    visible: true,
    native: {
      definitionExpression: `Type = 'Disabled'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/wheelchair.svg',
          width: '20px',
          height: '20px'
        }
      },
      outFields: ['*']
    },
    popupComponent: MoveInOutPopups.MoveInOutAccessibleParkingPopupComponent
  },
  {
    type: 'feature',
    id: 'personal-engraving-layer',
    title: 'Free Personal Possessions Engraving',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    visible: true,
    native: {
      definitionExpression: `Type = 'Bike'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/engraving.png',
          width: '22.5px',
          height: '22.5px'
        }
      },
      outFields: ['*']
    },
    popupComponent: MoveInOutPopups.MoveInOutPersonalEngravingPopupComponent
  },
  {
    type: 'feature',
    id: `${Definitions.MOVE_IN_OUT_CHECKIN.layerId}`,
    title: 'Check-In Locations',
    url: `${Definitions.MOVE_IN_OUT_CHECKIN.url}`,
    listMode: 'show',
    visible: true,
    native: {
      definitionExpression: `Type = 'Keys'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/checkin.png',
          width: '22.5px',
          height: '22.5px'
        }
      },
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: 'move-in-bus-stops-layer',
    title: 'Move-In Shuttle Bus Stops',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    visible: true,
    native: {
      definitionExpression: `Type = 'BusStop'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/bus-stop.png',
          width: '22.5px',
          height: '22.5px'
        }
      },
      outFields: ['*']
    },
    popupComponent: MoveInOutPopups.MoveInOutBusStopPopupComponent
  },
  {
    type: 'feature',
    id: 'dining-areas-layer',
    title: 'Dining Areas',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    visible: true,
    native: {
      definitionExpression: `Type = 'Dining'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/dining.png',
          width: '22.5px',
          height: '22.5px'
        }
      },
      outFields: ['*']
    },
    popupComponent: MoveInOutPopups.MoveInOutDiningPopupComponent
  },
  {
    type: 'feature',
    id: 'move-in-info-layer',
    title: 'Info, Refreshments, Volunteers',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    visible: true,
    native: {
      definitionExpression: `Type = 'Info'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/information.png',
          width: '22.5px',
          height: '22.5px'
        }
      },
      outFields: ['*']
    },
    popupComponent: MoveInOutPopups.MoveInOutInformationPopupComponent
  },
  {
    type: 'feature',
    id: 'recycle-layer',
    title: 'Cardboard Recycling Locations',
    url: `${Definitions.MOVE_IN_OUT.url}/2`,
    listMode: 'show',
    visible: true,
    native: {
      definitionExpression: `Type = 'Recycle'`,
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: '/assets/icons/recycle.png',
          width: '22.5px',
          height: '22.5px'
        }
      },
      outFields: ['*']
    },
    popupComponent: MoveInOutPopups.MoveInOutRecyclePopupComponent
  },
  {
    type: 'feature',
    id: Definitions.SURFACE_LOTS.layerId,
    title: Definitions.SURFACE_LOTS.name,
    url: Definitions.SURFACE_LOTS.url,
    popupComponent: Definitions.SURFACE_LOTS.popupComponent,
    listMode: 'hide',
    visible: true,
    layerIndex: 1,
    native: {
      legendEnabled: false,
      outFields: ['*'],
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
    visible: true,
    native: {
      legendEnabled: false,
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
    visible: true,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.POINTS_OF_INTEREST.layerId,
    title: Definitions.POINTS_OF_INTEREST.name,
    url: Definitions.POINTS_OF_INTEREST.url,
    popupComponent: Definitions.POINTS_OF_INTEREST.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.RESTROOMS.layerId,
    title: Definitions.RESTROOMS.name,
    url: Definitions.RESTROOMS.url,
    popupComponent: Definitions.RESTROOMS.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.LACTATION_ROOMS.layerId,
    title: Definitions.LACTATION_ROOMS.name,
    url: Definitions.LACTATION_ROOMS.url,
    popupComponent: Definitions.LACTATION_ROOMS.popupComponent,
    listMode: 'show',
    visible: false,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.SURFACE_LOTS.layerId,
    title: Definitions.SURFACE_LOTS.name,
    url: Definitions.SURFACE_LOTS.url,
    popupComponent: Definitions.SURFACE_LOTS.popupComponent,
    listMode: 'hide',
    visible: true,
    layerIndex: 1,
    native: {
      legendEnabled: false,
      outFields: ['*'],
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
    visible: true,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: Definitions.ACESSIBLE_ENTRANCES.layerId,
    title: Definitions.ACESSIBLE_ENTRANCES.name,
    url: Definitions.ACESSIBLE_ENTRANCES.url,
    popupComponent: Definitions.ACESSIBLE_ENTRANCES.popupComponent,
    listMode: 'show',
    visible: false
  },
  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    visible: true,
    popupComponent: Definitions.BUILDINGS.popupComponent
  },
  {
    type: 'group',
    id: 'no-parking-areas-group-layer',
    title: 'No Parking Locations',
    listMode: 'show',
    sources: [
      {
        type: 'feature',
        id: 'no-parking-from-pos-layer',
        title: 'No Parking Locations',
        url: `${Definitions.MOVE_IN_OUT.url}/2`,
        listMode: 'show',
        visible: true,
        native: {
          outFields: ['*'],
          definitionExpression: `Type = 'NoParking'`,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'picture-marker',
              width: '22.5px',
              height: '22.5px',
              url: '/assets/icons/no-parking.png'
            }
          }
        },
        popupComponent: MoveInOutPopups.MoveInOutNoParkingPopupComponent
      },
      {
        type: 'feature',
        id: 'no-parking-from-pos-layer',
        title: 'No Parking Locations',
        url: `${Definitions.MOVE_IN_OUT.url}/1`,
        listMode: 'hide',
        visible: true,
        native: {
          outFields: ['*'],
          definitionExpression: `Type = 'NoParking'`,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'picture-marker',
              width: '22.5px',
              height: '22.5px',
              url: '/assets/icons/no-parking.png'
            }
          },
          legendEnabled: false
        },
        popupComponent: MoveInOutPopups.MoveInOutNoParkingPopupComponent
      }
    ],
    native: {
      listMode: 'hide-children'
    }
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
    url: `${Definitions.BUILDINGS.url}`,
    queryParams: {
      ...commonQueryParams,
      where: {
        keys: ['Number', 'BldgAbbr', 'BldgName'],
        operators: ['LIKE', 'LIKE', 'LIKE'],
        wildcards: ['includes', 'includes', 'includes'],
        transformations: ['UPPER', 'UPPER', 'UPPER']
      },
      scoringWhere: {
        keys: ['BldgName', 'BldgAbbr'],
        operators: ['LIKE', 'LIKE'],
        wildcards: ['startsWith', 'startsWith'],
        transformations: ['UPPER', 'UPPER']
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
    url: `${Definitions.BUILDINGS.url}`,
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
    popupComponent: Popups.BasePopupComponent,
    searchActive: false,
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

export const MoveInOutDates: MoveDates = {
  in: [
    {
      day: 15,
      month: 8
    },
    {
      day: 16,
      month: 8
    },
    {
      day: 17,
      month: 8
    },
    {
      day: 18,
      month: 8
    }
  ],
  out: []
};

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
