import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import { EventConfiguration, ISpecialEventRoot, SpecialEventOptions } from '../interfaces/special-event.interface';

export enum MAINTENANCE_PARKING_LAYERS {
  CONSTRUCTION = 'construction',
  MAINTENANCE_SPACES = 'maintenance-parking-spaces',
  LINE_PAINT = 'line-paint',
  MAINTENANCE_LOTS = 'maintenance-parking-lots',
  RNS_SPACES = 'rns-spaces'
}

const eventUrl = 'https://gis.tamu.edu/arcgis/rest/services/TS/ServiceMaintenanceContractor/MapServer';

export const MaintenanceParkingDefinitions = {
  CONSTRUCTION: {
    id: MAINTENANCE_PARKING_LAYERS.CONSTRUCTION,
    layerId: MAINTENANCE_PARKING_LAYERS.CONSTRUCTION,
    name: 'Construction',
    url: `${eventUrl}/0`
  },
  MAINTENANCE_SPACES: {
    id: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_SPACES,
    layerId: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_SPACES,
    name: 'Maintenance Parking Spaces',
    url: `${eventUrl}/1`
  },
  LINE_PAINT: {
    id: MAINTENANCE_PARKING_LAYERS.LINE_PAINT,
    layerId: MAINTENANCE_PARKING_LAYERS.LINE_PAINT,
    name: 'Line Paint',
    url: `${eventUrl}/3`
  },
  MAINTENANCE_LOTS: {
    id: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_LOTS,
    layerId: MAINTENANCE_PARKING_LAYERS.MAINTENANCE_LOTS,
    name: 'Maintenance Parking Lots',
    url: `${eventUrl}/4`
  },
  RNS_SPACES: {
    id: MAINTENANCE_PARKING_LAYERS.RNS_SPACES,
    layerId: MAINTENANCE_PARKING_LAYERS.RNS_SPACES,
    name: 'RNS Spaces',
    url: `${eventUrl}/6`
  }
};

export const MaintenanceParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.CONSTRUCTION.id,
    title: MaintenanceParkingDefinitions.CONSTRUCTION.name,
    url: MaintenanceParkingDefinitions.CONSTRUCTION.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'Name',
        collapsed: true
      },
      description: {
        field: 'Description',
        collapsed: true
      },
      notes: {
        field: 'Notes',
        collapsed: true
      },
      status: {
        field: 'Status',
        collapsed: true
      },
      startDate: {
        field: 'StartDate',
        collapsed: true
      },
      endDate: {
        field: 'EndDate',
        collapsed: true
      },
      link: {
        field: 'Link',
        collapsed: true
      },
      contactName: {
        field: 'ContactName',
        collapsed: true
      },
      contactInfo: {
        field: 'ContactInfo',
        collapsed: true
      },
      lastUpdate: {
        field: 'LastUpdate',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.id,
    title: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.name,
    url: MaintenanceParkingDefinitions.MAINTENANCE_SPACES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'LotName',
        collapsed: true
      },
      spaceType: {
        field: 'Spc_Type',
        collapsed: true
      },
      spaceType2: {
        field: 'Spc_Type2',
        collapsed: true
      },
      spaceId: {
        field: 'Spc_ID_Num',
        collapsed: true
      },
      garageLevel: {
        field: 'Garage_Lvl',
        collapsed: true
      },
      rnsNumber: {
        field: 'RNS_Num',
        collapsed: true
      },
      notes: {
        field: 'Anno_Type',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.id,
    title: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.name,
    url: MaintenanceParkingDefinitions.MAINTENANCE_LOTS.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      // From REST: Display Field is GIS.TS.ParkingLots.Name
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      description: {
        // From REST fields list: MainteN exists for maintenance notes
        field: 'GIS.TS.Lot_Notes.MainteN',
        collapsed: true
      },
      lotType: {
        field: 'GIS.TS.ParkingLots.LotType',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.LINE_PAINT.id,
    title: MaintenanceParkingDefinitions.LINE_PAINT.name,
    url: MaintenanceParkingDefinitions.LINE_PAINT.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: {
        field: 'Use_',
        collapsed: true
      },
      description: {
        field: 'Location',
        collapsed: true
      },
      parkingUse: {
        field: 'PKG_Use',
        collapsed: true
      },
      streetUse: {
        field: 'Street_Use',
        collapsed: true
      },
      width: {
        field: 'Width',
        collapsed: true
      },
      color: {
        field: 'Color',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: MaintenanceParkingDefinitions.RNS_SPACES.id,
    title: MaintenanceParkingDefinitions.RNS_SPACES.name,
    url: MaintenanceParkingDefinitions.RNS_SPACES.url,
    visible: true,
    listMode: 'show',
    popupComponent: MarkdownPopupComponent,
    popupData: {
      // If layer 6 doesn't include ParkingLots join, swap to its actual name/display field.
      name: {
        field: 'GIS.TS.ParkingLots.Name',
        collapsed: true
      },
      // Best maintenance-adjacent notes field available from your REST dump
      description: {
        field: 'GIS.TS.Lot_Notes.MainteN',
        collapsed: true
      }
    },
    native: {
      outFields: ['*']
    }
  }
];

export const MaintenanceParkingConfiguration: EventConfiguration = {
  id: 'maintenance-parking',
  name: 'Maintenance Parking',
  applicationName: 'Maintenance Parking Map',
  shortApplicationName: 'Maintenance Parking',
  mapCenter: [-96.34046, 30.60798],
  eventDates: [],
  zoom: 16
};

export const MaintenanceParkingOptions: SpecialEventOptions = [];

export const MaintenanceParkingTs: ISpecialEventRoot = {
  configuration: MaintenanceParkingConfiguration,
  options: MaintenanceParkingOptions,
  sources: MaintenanceParkingColdLayerSources,
  references: MAINTENANCE_PARKING_LAYERS,
  discover: {
    id: MaintenanceParkingConfiguration.id,
    name: MaintenanceParkingConfiguration.name,
    description: 'Maintenance parking lots and spaces, including construction, line paint, and RNS overlays.',
    source: 'internal',
    type: 'event',
    keywords: ['maintenance', 'parking']
  }
};
