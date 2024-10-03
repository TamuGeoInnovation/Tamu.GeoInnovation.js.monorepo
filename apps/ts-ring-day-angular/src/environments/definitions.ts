import { SearchSource, SearchSourceQueryParamsProperties } from '@tamu-gisc/ui-kits/ngx/search';
import { LayerSource, LegendItem } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';
import { EventDates, Popups as EventPopups } from '@tamu-gisc/ts/ringday/ngx';

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
  // eventUrl: 'https://services1.arcgis.com/oxXAea6csqnDZ6WT/ArcGIS/rest/services/Ring_Day_2_view/FeatureServer'
  eventUrl: 'https://services1.arcgis.com/oxXAea6csqnDZ6WT/ArcGIS/rest/services/Ring_Day_3_view/FeatureServer'
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
  RING_DAY_POIS: {
    id: 'ring-day-pois',
    layerId: 'ring-day-pois-layer',
    name: 'Ring Day Points of Interest',
    url: `${Connections.eventUrl}/0`
  },
  RING_DAY_ROUTES: {
    id: 'ring-day-routes',
    layerId: 'ring-day-routes-layer',
    name: 'Ring Day Routes',
    url: `${Connections.eventUrl}/1`
  },
  RING_DAY_AREAS: {
    id: 'ring-day-areas',
    layerId: 'ring-day-areas-layer',
    name: 'Ring Day Areas',
    url: `${Connections.eventUrl}/2`
  }
};

export const ColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: Definitions.RING_DAY_AREAS.layerId,
    title: Definitions.RING_DAY_AREAS.name,
    url: Definitions.RING_DAY_AREAS.url,
    popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
    listMode: 'show',
    visible: true,
    layerIndex: 2,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'Type',
        uniqueValueInfos: [
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [0, 112, 255, 0.75],
              outline: {
                color: [110, 110, 110, 255],
                width: 0
              }
            },
            value: 'ADA',
            label: 'ADA Route'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'backward-diagonal',
              color: [215, 158, 158, 0.75],
              outline: {
                style: 'solid',
                color: [90, 0, 0, 255],
                width: 2
              }
            },
            value: 'AFS',
            label: 'Clayton Williams Jr. Alumni Center'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [171, 205, 102, 0.75],
              outline: {
                style: 'esriSLSSolid',
                color: [90, 0, 0, 255],
                width: 2
              }
            },
            value: 'Gather',
            label: 'Gathering Area'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [255, 0, 0, 0.65],
              outline: {
                color: [110, 110, 110, 255],
                width: 0
              }
            },
            value: 'Lot Closed',
            label: 'Lot Closed'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [255, 0, 0, 0.65],
              outline: {
                color: [110, 110, 110, 255],
                width: 0
              }
            },
            value: 'Lot-Gate Closure',
            label: 'Lot-Gate Closure'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              // 009688 in rgba
              color: [0, 150, 136, 0.75],
              outline: {
                color: [110, 110, 110, 255],
                width: 0
              }
            },
            value: 'Sales',
            label: 'Aggie Ring Day Marketplace'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [223, 115, 255, 0.65],
              outline: {
                style: 'esriSLSSolid',
                color: [132, 0, 168, 255],
                width: 2
              }
            },
            value: 'Special Parking',
            label: 'Special Parking'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [255, 0, 0, 0.65],
              outline: {
                color: [110, 110, 110, 255],
                width: 0
              }
            },
            value: 'Street Closure',
            label: 'Street Closure'
          } as unknown,
          {
            symbol: {
              type: 'simple-fill',
              style: 'solid',
              color: [255, 255, 115, 0.75],
              outline: {
                color: [110, 110, 110, 255],
                width: 0
              }
            },
            value: 'Ticketed Area',
            label: 'Ticketed Area'
          }
        ]
      }
    }
  },
  {
    type: 'feature',
    id: Definitions.RING_DAY_ROUTES.layerId,
    title: Definitions.RING_DAY_ROUTES.name,
    url: Definitions.RING_DAY_ROUTES.url,
    popupComponent: EventPopups.RingDayMarkdownComponent,
    listMode: 'show',
    visible: true,
    layerIndex: 3,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'name',
        uniqueValueInfos: [
          {
            symbol: {
              type: 'simple-line',
              style: 'short-dash',
              color: [90, 0, 0, 255],
              width: 4
            },
            value: 'Aggie Ring Day Exit Path',
            label: 'Aggie Ring Day Exit Path'
          },
          {
            symbol: {
              type: 'simple-line',
              style: 'short-dash-dot-dot',
              color: [169, 0, 230, 255],
              width: 4
            },
            value: 'Aggie Ring Day Shuttle - Entry to Aggie Ring Day',
            label: 'Walking Path from Shuttle to Alumni Center'
          } as unknown,
          {
            symbol: {
              type: 'simple-line',
              style: 'solid',
              color: [223, 115, 255, 255],
              width: 4
            },
            value: 'Aggie Ring Day Shuttle Route',
            label: 'Aggie Ring Day Shuttle Route'
          } as unknown,
          {
            symbol: {
              type: 'simple-line',
              style: 'short-dot',
              color: [169, 0, 230, 255],
              width: 4
            },
            value: 'Walking Path to Aggie Ring Day (Via Pickard Pass Tunnel)',
            label: 'Walking Path to Aggie Ring Day (Via Pickard Pass Tunnel)'
          } as unknown
        ]
      }
    }
  },
  {
    type: 'feature',
    id: Definitions.RING_DAY_POIS.layerId,
    title: Definitions.RING_DAY_POIS.name,
    url: Definitions.RING_DAY_POIS.url,
    popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
    listMode: 'show',
    visible: true,
    native: {
      outFields: ['*'],
      renderer: {
        type: 'unique-value',
        field: 'name',
        defaultSymbol: {
          type: 'picture-marker',
          url: '/assets/icons/aggie/Ring Day.png',
          width: 20,
          height: 25,
          angle: 0,
          xoffset: 0,
          yoffset: 0
        } as unknown,
        uniqueValueInfos: [
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/shops-food/Dining.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'Creamery - Concessions',
            label: 'Concessions'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/shops-food/Dining.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'Concessions',
            label: 'Concessions'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/accessibility/Entrance.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'ENTER HERE',
            label: 'ENTER HERE'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/accessibility/Entrance.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'ENTER HERE (w/Accessibility)',
            label: 'ENTER HERE'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/personal-care/First Aid.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'Medical Station',
            label: 'First Aid'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/personal-care/Restrooms.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 10
            },
            value: 'Public Restrooms',
            label: 'Public Restrooms'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/transportation/Car.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'Rideshare drop-off & pick up for Aggie Ring Day',
            label: 'Rideshare drop-off & pick up'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/transportation/Bus.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'Shuttle Stop - Drop Off Only',
            label: 'Shuttle Stop - Drop Off Only; Shuttle Stop - Pick Up Only; Shuttle Stop - Pickup and Drop Off'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/transportation/Bus.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'Shuttle Stop - Pick Up Only',
            label: 'Shuttle Stop - Drop Off Only; Shuttle Stop - Pick Up Only; Shuttle Stop - Pickup and Drop Off'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/transportation/Bus.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'Shuttle Stop - Pickup and Drop Off',
            label: 'Shuttle Stop - Drop Off Only; Shuttle Stop - Pick Up Only; Shuttle Stop - Pickup and Drop Off'
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/aggie/Cannon.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: "Spirit of '02 Cannon - Parsons Mounted Cavalry",
            label: "Spirit of '02 Cannon - Parsons Mounted Cavalry"
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/fixtures/Photo Opportunity.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: "Spirit of '02 Cannon Photo Station",
            label: "Spirit of '02 Cannon Photo Station"
          } as unknown,
          {
            symbol: {
              type: 'picture-marker',
              url: '/assets/icons/fixtures/Theater.png',
              width: 20,
              height: 25,
              angle: 0,
              xoffset: 0,
              yoffset: 0
            },
            value: 'The Stage at Aggie Park - Musical Performances ',
            label: 'The Stage at Aggie Park - Musical Performances '
          }
        ],
        fieldDelimiter: ','
      }
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
  // {
  //   type: 'feature',
  //   id: 'ring-day-closures',
  //   title: 'Closures',
  //   url: Definitions.RING_DAY_AREAS.url,
  //   popupComponent: EventPopups.RingDayMarkdownComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "type = 'Lot Closed' OR type = 'Street Closure' OR type = 'Lot-Gate Closure'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-fill',
  //         style: 'solid',
  //         color: [255, 0, 0, 0.65],
  //         outline: {
  //           color: [255, 0, 0, 1],
  //           width: '1px'
  //         }
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-shuttle-route',
  //   title: 'Ring Day Shuttle Route',
  //   url: Definitions.RING_DAY_ROUTES.url,
  //   popupComponent: EventPopups.RingDayMarkdownComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name like '%Shuttle Route%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-line',
  //         color: [0, 197, 255, 1],
  //         width: '3px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-walking-path',
  //   title: 'Walking Path to Aggie Ring Day (Via Pickard Pass Tunnel)',
  //   url: Definitions.RING_DAY_ROUTES.url,
  //   popupComponent: EventPopups.RingDayMarkdownComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name like '%pickard pass%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-line',
  //         // B2FF59 in rgba
  //         color: [178, 255, 89, 1],
  //         width: '3px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-exit-path',
  //   title: 'Aggie Ring Day Exit Path',
  //   url: Definitions.RING_DAY_ROUTES.url,
  //   popupComponent: EventPopups.RingDayMarkdownComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name like '%exit path%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-line',
  //         color: [80, 0, 0, 1],
  //         width: '3px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-shuttle-entrance-path',
  //   title: 'Aggie Ring Day Shuttle - Entry to Aggie Ring Day',
  //   url: Definitions.RING_DAY_ROUTES.url,
  //   popupComponent: EventPopups.RingDayMarkdownComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "mrkid = '473899'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-line',
  //         color: [255, 183, 77, 1],
  //         width: '3px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-ada-paths',
  //   title: 'ADA Building Entrance',
  //   url: Definitions.RING_DAY_AREAS.url,
  //   popupComponent: EventPopups.RingDayMarkdownComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "type = 'ADA'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-fill',
  //         style: 'solid',
  //         // blue in rgba
  //         color: [0, 0, 255, 0.65],
  //         outline: {
  //           color: [0, 0, 255, 1],
  //           width: '1px'
  //         }
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-afs',
  //   title: 'Clayton Williams Jr. Alumni Center',
  //   url: Definitions.RING_DAY_AREAS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "type = 'AFS'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-fill',
  //         style: 'solid',
  //         color: [80, 0, 0, 0.65],
  //         outline: {
  //           color: [80, 0, 0, 1],
  //           width: '1px'
  //         }
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-ticketed-areas',
  //   title: 'Ticketed Area',
  //   url: Definitions.RING_DAY_AREAS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "type = 'Ticketed Area'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-fill',
  //         style: 'solid',
  //         color: [255, 255, 0, 0.65],
  //         outline: {
  //           color: [255, 255, 0, 1],
  //           width: '1px'
  //         }
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-gathering-area',
  //   title: 'Gathering Area',
  //   url: Definitions.RING_DAY_AREAS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "type = 'Gather'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-fill',
  //         style: 'solid',
  //         // light green in rgba
  //         color: [0, 255, 0, 0.65],
  //         outline: {
  //           // brown outline in rgba
  //           color: [139, 69, 19, 1],
  //           width: '1px'
  //         }
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-marketplace',
  //   title: 'Ring Day Marketplace',
  //   url: Definitions.RING_DAY_AREAS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "type = 'Sales'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-fill',
  //         style: 'solid',
  //         // dark green in rgba
  //         color: [0, 100, 0, 0.65],
  //         outline: {
  //           color: [0, 100, 0, 1],
  //           width: '1px'
  //         }
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-parking',
  //   title: 'Event Parking',
  //   url: Definitions.RING_DAY_AREAS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "type = 'Special Parking' AND name like '%parking%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'simple-fill',
  //         style: 'solid',
  //         // light blue in rgba
  //         color: [0, 255, 255, 0.65],
  //         outline: {
  //           color: [0, 255, 255, 1],
  //           width: '1px'
  //         }
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-medical-stations',
  //   title: 'First Aid',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name = 'Medical Station'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'picture-marker',
  //         url: '/assets/icons/medical-stations.png',
  //         width: '26px',
  //         height: '40px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-entrance',
  //   title: 'Entrance',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name LIKE '%ENTER HERE%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'picture-marker',
  //         url: '/assets/icons/entrance.png',
  //         width: '30px',
  //         height: '30px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-concessions',
  //   title: 'Concessions',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name LIKE '%concession%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'picture-marker',
  //         url: '/assets/icons/concessions.png',
  //         width: '26px',
  //         height: '40px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-ride-share-drop-off',
  //   title: 'Ride Share Drop Off',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name LIKE '%rideshare%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'picture-marker',
  //         url: '/assets/icons/rideshare.png',
  //         width: '30px',
  //         height: '30px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-restrooms',
  //   title: 'Restrooms',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name LIKE '%restroom%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'picture-marker',
  //         url: '/assets/icons/restrooms.png',
  //         width: '30px',
  //         height: '30px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-photo-op',
  //   title: 'Photo Stations',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "name LIKE '%photo%'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'simple',
  //       symbol: {
  //         type: 'picture-marker',
  //         url: '/assets/icons/photo-op.png',
  //         width: '26px',
  //         height: '40px'
  //       }
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-shuttle-stops-layer',
  //   title: 'Shuttle Stops',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     outFields: ['*'],
  //     definitionExpression: "name LIKE '%shuttle%'",
  //     renderer: {
  //       type: 'unique-value',
  //       field: 'name',
  //       uniqueValueInfos: [
  //         {
  //           value: 'Shuttle Stop - Drop Off Only',
  //           symbol: {
  //             type: 'picture-marker',
  //             url: '/assets/icons/shuttle-drop-off.png',
  //             width: '26px',
  //             height: '40px'
  //           } as unknown,
  //           label: 'Drop Off Only'
  //         },
  //         {
  //           value: 'Shuttle Stop - Pick Up Only',
  //           symbol: {
  //             type: 'picture-marker',
  //             url: '/assets/icons/shuttle-pick-up.png',
  //             width: '26px',
  //             height: '40px'
  //           } as unknown,
  //           label: 'Pick Up Only'
  //         },
  //         {
  //           value: 'Shuttle Stop - Pickup and Drop Off',
  //           symbol: {
  //             type: 'picture-marker',
  //             url: '/assets/icons/shuttle-pick-and-drop.png',
  //             width: '26px',
  //             height: '40px'
  //           } as unknown,
  //           label: 'Pick Up and Drop Off'
  //         }
  //       ]
  //     }
  //   }
  // },
  // {
  //   type: 'feature',
  //   id: 'ring-day-points-of-interest',
  //   title: 'Points of Interest',
  //   url: Definitions.RING_DAY_POIS.url,
  //   popupComponent: EventPopups.RingDayMarkdownWDirectionsComponent,
  //   listMode: 'show',
  //   visible: true,
  //   native: {
  //     definitionExpression: "mrkId = '467555' OR mrkId = '468345'",
  //     outFields: ['*'],
  //     renderer: {
  //       type: 'unique-value',
  //       field: 'mrkId',
  //       uniqueValueInfos: [
  //         {
  //           value: '467555',
  //           symbol: {
  //             type: 'picture-marker',
  //             url: '/assets/icons/musical.png',
  //             width: '26px',
  //             height: '40px'
  //           } as unknown,
  //           label: 'The Stage at Aggie Park - Musical Performances'
  //         },
  //         {
  //           value: '468345',
  //           symbol: {
  //             type: 'picture-marker',
  //             url: '/assets/icons/landmark.png',
  //             width: '26px',
  //             height: '40px'
  //           } as unknown,
  //           label: "Spirit of '02 Cannon - Parsons Mounted Cavalry"
  //         }
  //       ]
  //     }
  //   }
  // },

  {
    type: 'graphics',
    id: 'selection-layer',
    title: 'Selected Buildings',
    listMode: 'hide',
    visible: true,
    popupComponent: Definitions.BUILDINGS.popupComponent
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
    src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAFBJREFUOI1jYaAyYIExzq5Mb6DEIOPwmQ1wA8+uTG9gZPhfT4mBZ1emMxiHz2xgIayUNDBq4KiBowaOGkhHA43DZzacXZlOkUEoBSyyAKUAAGgHEnMWcHNYAAAAAElFTkSuQmCC'
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
    popupComponent: 'BasePopupComponent',
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
    url: `${Connections.basemapUrl}/9`,
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

export const Dates: EventDates = [
  {
    day: 10,
    month: 10
  },
  {
    day: 11,
    month: 10
  },
  {
    day: 12,
    month: 10
  }
];

export const SelectionSymbols = {
  polygon: {
    type: 'simple-fill',
    style: 'solid',
    color: [252, 227, 0, 0.655],
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
