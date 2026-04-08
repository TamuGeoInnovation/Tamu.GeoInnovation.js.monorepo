import { LayerSource } from '@tamu-gisc/common/types';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum SUSTAINABLE_TRANSPORTATION_LAYERS {
  EV_CHARGERS = 'sustainable-transportation-ev-chargers',
  HUB_CORRALS = 'sustainable-transportation-hub-corrals',
  SHARED_MOBILITY_RACKS = 'sustainable-transportation-shared-mobility-racks',
  BIKE_RACKS = 'sustainable-transportation-bike-racks',
  BIKE_FIX_STATIONS = 'sustainable-transportation-bike-fix-stations',
  BIKE_LANES = 'sustainable-transportation-bike-lanes',
  CITY_BIKE_LANES_ROUTES = 'sustainable-transportation-city-bike-lanes-routes',
  BIKE_DISMOUNT_ZONES = 'sustainable-transportation-bike-dismount-zones'
}

// Temporary bridge until the original TS server/editor workflow is restored.
// When that server is ready again, swap these URLs and the layer-id mapping in `SustainableTransportationDefinitions`
// back to the restored source services.
// These hosted view services mirror the secured Portal source layers while remaining queryable by the public app.
const evLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/EV_Charge_Stations_view/FeatureServer';
const fixStationLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Fix_Stations_view/FeatureServer';

// Temporary fix: BikeMap MapServer layer 0 renders all rack types at a consistent icon size,
// whereas the hosted Rack_Locations_view FeatureServer sub-layers have inconsistent icon sizes.
// When the FeatureServer icons are corrected upstream, revert the three rack layers back to:
//   HUB_CORRALS         → 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Rack_Locations_view/FeatureServer/0'
//   SHARED_MOBILITY_RACKS → 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Rack_Locations_view/FeatureServer/1'
//   BIKE_RACKS          → 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Rack_Locations_view/FeatureServer/2'
// Remove the definitionExpression and renderer overrides from their native configs below,
// and revert popup attribute keys back to lowercase (type, total_capacity, br_notes).
const bikeMapRackLayerUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/BikeMap/MapServer/0';

// Base64-encoded PNG symbols sourced from the BikeMap layer 0 renderer imageData.
// Original renderer symbol sizes: Hub Corral 27×27 px; Shared Mobility and Bike Rack 27×20 px.
// prettier-ignore
const HUB_CORRAL_SYMBOL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADK0lEQVRYheWXz0sVURTHPxfepsxFEGRC4DYiwSAqrVUJWhllkf2ACGpZEEbQwsjQRRD2P1hIGqULn/rCZa9ChAIr2haBtShcFAUSnDjOGbjcfPOGUWKwA8N7c+bec79zfn3PFMiZFMiZFMiZFFiLgAQm9NfB4VwAAnb/vyET2AJ8c7AY6DcArUAjUGO6W8AcMO3gR7Bez6p1sJAZkMBG4BPwQuCQHiLQAPQA54AvwKy3ZTtwAagTGAL6HHw08JNAs8BWB5+zeui7ggH2q0GBEeAOUARaHLwy4F/118Epu98JXAfeCtwATgP7gGfq7cwecvBbPQOUDJRenQ7GquxToGcEjgOjpi4TeXkxMyAVC9ND9ciSArplmRwJxcLU7amGq+1Jm9QNFqZO4Jq5viTQVukAgVpgyl5CPXMPuC9Q1JxaESDgJjCuYVLPWPhaDFS7i/IsBKNrmoHnRGvUy0WzdSkzIImMazXt1Xsz3B6A6gfW2fp2q8BmK4YlMGburgIUuJoUumoeagXmHbyOFeoRDRfw1A7Wco4l/q9g2nzvaaJL1CbU5lhWQI1Bn/FB9QVgfOkPQ2kyazbTAzKijLmpxu8zgaxPeJHHAr+W0au9DoErdj8TEnL+ucx5iAV6gW0OusJ1lsCVQnbSRWUf7nkEvHNwOzWgQOaA8xWqT6upkvQIlJfJo11ETZasgKaBeoGmuNKCPqPVpGX/xNafsF6jz6b85mn8Vmc2swFyUTUNGVGeNTqY8sAslbbAT1uvIMpBn4pBqY2havSRJqn7gDcCx4w6WrwO/Fdpe30qpg4FqdRxBNhR7bA05PrBRoi4d5SDDkwCqJJxn16X1daKAUkUJp1nYhlIw9pGMwPelNAlMLiikEn0fNLeUD0zDDwQGFdu8ikl2NdkOdOhntHZyBvyDibNRNU8VAvssUkvHmEnrJJeCswbHcQdfcRKu14TWHPGQj5oOaXPNik/ZgLkYEFgs46yOj2aTvPgorK2N+QftS3viUBNB8SqL3JAwbgEMGk8RKWvBDtQx9NRicKiut4EOxqmRDCpAP1rWS1AM7kC5Fbhm37Nh2zVJHeA/gB6+wK1LYH5oAAAAABJRU5ErkJggg==';

// prettier-ignore
const SHARED_MOBILITY_SYMBOL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAbCAYAAAAULC3gAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEuUlEQVRIidWXf2hVZRjHP+855+7+2HbdD7e51Jm6sjm1wlEU5EApMiojMIJEiqJCqkUlWCRC/RMUJNZ/BRX2R4hFBeUfWQSjWVS0ouksc9O5zemd8+7X3b3nnPvG894fujHvlSzSL7z33Pu+zz3P9zzP93ne9zhcZnC4zOBwRRDSHVXASkjPA1UCar4FjQplZQ0cG1WqIKDRMuGlwdfg+jBpwZRCRTQ6nV1zyXwXYw90P/h7Ua19xQnpjjst+CyK5c8j5IZQBLCcKHY4gq1swEKhgDQZOjlPMueaOW0s5HeCtBkxXAZIMWmsZcV5At21CtWcKkioHHsb6JJeWpiDHeZfxhk8PuQ0bfQsg5GbgfaChBR62d1UCplLdp6L2vmowuEp6nmBXs+FFUUJTaGrlhO5oBMfzXeMcTVBPDQBFAsJTrNZxi8cMYkCG8WT1PE2S/LrIsQqHHeI1LnJWQlprVw6SioKFN9XxFnPwfzvRQTpZfU0m8+5zlwnSLOW35ntAStwrCG8hsKEOBCSMFcWILSaUh6mlg84xWPU8Qi1fMoZOpkggkUUmygOfSR5gwG2sYAtzJuNUAB0fRFCVkCSUkg/NQR4j0Ym8HmXIfYxwipKqSNAEIthXPYybPRTjcPzXDXrfcqxLIWq1oUJJSwoIWmyfw5J0saJaGcIl0FSfM+YKf9GwnxBk7Ebw2cD3WymlhZKeZoeyvmBJsLsYjG3Ec3fM2CUpGfymUmoXIt7yX0OfSRZRxd/MmUEKiKeyq5vpJo9xPiIGHdRyR0cZAURE602eoyNxFrSuZ5D/Mb1LCFk5qUgQPlFCElHzUQkh60c4whTvEIDm5hLM53cTzVLCZmUraOC5+hlJ4MmQvdQyX10s4EqjpPkceoYJ81WetnFIDtZnMlFpq0WIaRaJh3d4XvovIh+ZtzoYDsLeJFj5kYnSHKQSUbw+Ilxcx0ixQFW8RaD1BLgHZaykcP0k+JVGnidftoZzbsalR3EbCOFI0QYa8yXIsiiEodW5piYfckIrUSZTwkxPLpJGOGWYfMgc7mJMg6TYDEhI/41RKmnhLN4Jnqnz/MfN1sfUxdByI4lSecJtRI1T307c/iVG/J2WzhquvB+mk0vykHK/mvivMmASbOkTSIlkZXIzSAUL0rIATcnWsEz1LOSTpropI16I9KPOcO3xHmUumlkBNJzhJDoagd9JjI5bKYm3+1H8aTMYkUJ+ehSEWEOCwmyj+WspYtns5VTis3LLGAHC2f+3Qh+N9fwEsdNhQqkP4kG5eEEp3BzHvqLEvLQwZNMOxFwC+Uc4ka6mDQpaaFMtMaFsIkaHqLGEBJRN2Y1lcPJTDFLHzpRlJCLTkiZS9pC5zmVzVTGxUL01UDQjJkQkWetjhYlNIq3u53R7XX8aCJzLWFzZJBqkqYooZYOIgexFNo0y7k4Jo1ymJP0iJ08jGzSsr8N45nWIGehP0jwPqdy7v4qSghCr9mkmiZI37ufuPqGuOeiQ7McbS4R6hPUrRdBSLVM+rIrZOHLh95jw6IK8MrAUuCnIe2Cn8hsN74DnhRgGKwIeBFQEUyDtVPgnQUnVykB8GKoNYP//K1DPSC8hrPjP8UV8hrE/4e/AQQPo7YUUL0rAAAAAElFTkSuQmCC';

// prettier-ignore
const BIKE_RACK_SYMBOL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAbCAYAAAAULC3gAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEx0lEQVRIidWXe2xURRTGf3P30d3tg754BUGkhKZSiBGCiAGMKIpRUUyjBmI0EjBE5aEYMCJEEwPRKAE1Chgx+IfRitiI/UNEsTESxQgYRQoiWiqFFvvebrv33jHnzq7bNrBLRCN8m9n7mjvzzTnfOWeun4sMfi4y+LkkCC3VhcA4XIagCKIYZsFoZWF5z138PotspQhoDShsV+NoTdzRRC1FTCki2sVFY7uKuPeW9n42FvUoKnlJ1WUmtFTfYsFHeVk4Q/KIhwIQ8OHPCxGOBFA+CywFSoHrgvBxNQgxuRd3UucK6Iqb1tQJf7RBtAfzkmYha/R41qietIRys1iBJnh8NQwIEeZfxp9ReGcfLP6QUlq5BqhJS0hB6W1jPTIXjKSleqMwAo9MhSeqsOMO5RkJxWwKrxxy7kkcF776FUYWgu167mR4ft8+pc/D0SbjSnHxw1PglbtTz8XlhWHipzoY1X/8foS0ijsE89M46tNamPVG6vryAjj+TN8+VfPNsbMHbngVzrbA/AjWqQ5GpCe0lJCYuSBybkITLoMHJsHb38L8yfDgJNjxA+yvh0gQ8kKm1TXDi5/Dihth0XVnIRQmAAxNT8gmgC+9fgbmwFv3mdVv2QvVh2D8UBicC1l+OBOFygNGP0XZ8Pj1Zx8nNwtLKYp0WkI+k2e67b6dum0ziWjnVDucbIO9vxktjC6GnQtMv/ZumL0F7p8IE4fDo9shdwWUDYYNc2BqL8WI9hIJIA2hLDTdZvVJ1LXAjNfgSKMRaMDyhO+h4ip4bz+8+z3cWgYzX4dysVaOF9ZmjZZxp+ju4JMwqijhDNej46Qn1EycSF8LLa8yEfPsLJg3AcaugznjoaTYuGzGGFi2A9bvMRa6fSzc+SbMLoffm2HBFOjoNuNs+BLW32XGlWSpMxLapKL+ZdqxXVGSwXd1RgerZsLKj81AJ1rgpwZojsK+OnMUV369BDbWwKAc2HwPVGyF+lZ4bha8sBtqjqWmaouZkpOeEBAO0O64/J1ZCiIwvcTklE8OmfNhA0wp+Pk0FEUgJwj3Xg2TRsDh03BFkRH/tBIYmgctXcZ6jR2peVpjnn5imQkFaeq2U4Sml5hV31QKB5an+i2qBFULuxaZXJSEhPxntfDyHuNmcZtYSiw7KLcXoS40itaMhPyKeFK0gsemwbh1ULYWFk8Dn4IPDsIXR+GhyX3JCCTnCCHR1epqY5kkJPqS2b4thoWmKSMhR5MtIkxieD5ULzQZd0kicrKD8PRMWH1z/7eN4LfNhad2mggVSH4SDcriBKc7jASA+oyEbIeshra+964dCYdWwo8NxiWSY8KSZ8+BeRNh7gRDSEQtuUo0lURDe+JEcSIjobhLl4S5uC3U66kUU2nnC6nyIwpM6w8ReQLHMhJqi7Gt5hirBq8ylhkz0GwZpAxIdhVTy8Ys7kKPbRJfcbZxo2zmxD3STxYjRVrq25lOkxpkL1TbCFu/SUxm80tGQkRZ68umrLOHO3YdRu0+4u1bpLr129lcMLazUZ0HoU0q6kBF8tKRvwrtYxD5hMjBQaFxMfvkLq/cdOAnjA9NGIcILhF8RND4cOlB00IQKRaysw540bVenfznXx3vK+F1JtH+U1win0H8f/gLDTWztGgTS7YAAAAASUVORK5CYII=';
const bikeLaneLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Bike_Lanes_view/FeatureServer';
const dismountZoneLayersUrl = 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Dismount_Zones_view/FeatureServer';

export const SustainableTransportationDefinitions = {
  EV_CHARGERS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.EV_CHARGERS,
    name: 'EV Charge Stations (Main + RELLIS)',
    url: evLayersUrl + '/0'
  },
  HUB_CORRALS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.HUB_CORRALS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.HUB_CORRALS,
    name: 'Hub Corral',
    url: bikeMapRackLayerUrl
  },
  SHARED_MOBILITY_RACKS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.SHARED_MOBILITY_RACKS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.SHARED_MOBILITY_RACKS,
    name: 'Shared Mobility Racks',
    url: bikeMapRackLayerUrl
  },
  BIKE_RACKS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_RACKS,
    name: 'Bike Racks',
    url: bikeMapRackLayerUrl
  },
  BIKE_FIX_STATIONS: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_FIX_STATIONS,
    name: 'Bike Fix Stations',
    url: `${fixStationLayersUrl}/0`
  },
  BIKE_LANES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_LANES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_LANES,
    name: 'Bike Lanes',
    url: `${bikeLaneLayersUrl}/2`
  },
  CITY_BIKE_LANES_ROUTES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.CITY_BIKE_LANES_ROUTES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.CITY_BIKE_LANES_ROUTES,
    name: 'City Bike Lanes and Routes',
    url: `${bikeLaneLayersUrl}/1`
  },
  BIKE_DISMOUNT_ZONES: {
    id: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_DISMOUNT_ZONES,
    layerId: SUSTAINABLE_TRANSPORTATION_LAYERS.BIKE_DISMOUNT_ZONES,
    name: 'Bike Dismount Zones',
    url: `${dismountZoneLayersUrl}/0`
  }
};

export const SustainableTransportationColdLayerSources: LayerSource[] = [
  // Keep this source list aligned with the temporary URL/layer mapping above until the original services are restored.
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.EV_CHARGERS.id,
    title: SustainableTransportationDefinitions.EV_CHARGERS.name,
    url: SustainableTransportationDefinitions.EV_CHARGERS.url,
    visible: true,
    listMode: 'show',
    layerIndex: 13,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: 'EV Charge Station',
      description:
        '<strong>Network</strong>: {attributes.ev_network}<br />' +
        '<strong>Charging Level</strong>: {attributes.ch_level}<br />' +
        '<strong>Garage Level</strong>: {attributes.garage_lvl}<br />' +
        '<strong>Notes</strong>: {attributes.evcs_notes}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.HUB_CORRALS.id,
    title: SustainableTransportationDefinitions.HUB_CORRALS.name,
    url: SustainableTransportationDefinitions.HUB_CORRALS.url,
    visible: true,
    listMode: 'show',
    layerIndex: 12,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description:
        '<strong>Total Capacity</strong>: {attributes.Total_Capacity}<br />' +
        '<strong>Notes</strong>: {attributes.BR_Notes}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Type = 'Shared Mobility (Hub Corral)'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: `data:image/png;base64,${HUB_CORRAL_SYMBOL_DATA}`,
          // Original renderer symbol size: 27×27 px
          width: 30,
          height: 30
        }
      }
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.SHARED_MOBILITY_RACKS.id,
    title: SustainableTransportationDefinitions.SHARED_MOBILITY_RACKS.name,
    url: SustainableTransportationDefinitions.SHARED_MOBILITY_RACKS.url,
    visible: true,
    listMode: 'show',
    layerIndex: 11,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description:
        '<strong>Total Capacity</strong>: {attributes.Total_Capacity}<br />' +
        '<strong>Notes</strong>: {attributes.BR_Notes}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Type = 'Shared Mobility HP'",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: `data:image/png;base64,${SHARED_MOBILITY_SYMBOL_DATA}`,
          // Original renderer symbol size: 27×20 px
          width: 30,
          height: 22.5
        }
      }
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_RACKS.id,
    title: SustainableTransportationDefinitions.BIKE_RACKS.name,
    url: SustainableTransportationDefinitions.BIKE_RACKS.url,
    visible: true,
    listMode: 'show',
    layerIndex: 10,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.Type}',
      description:
        '<strong>Total Capacity</strong>: {attributes.Total_Capacity}<br />' +
        '<strong>Notes</strong>: {attributes.BR_Notes}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: "Type NOT IN ('Shared Mobility (Hub Corral)', 'Shared Mobility HP')",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'picture-marker',
          url: `data:image/png;base64,${BIKE_RACK_SYMBOL_DATA}`,
          // Original renderer symbol size: 27×20 px
          width: 30,
          height: 22.5
        }
      }
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_FIX_STATIONS.id,
    title: SustainableTransportationDefinitions.BIKE_FIX_STATIONS.name,
    url: SustainableTransportationDefinitions.BIKE_FIX_STATIONS.url,
    visible: true,
    listMode: 'show',
    layerIndex: 9,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.bike_sta_name}',
      description: '<strong>Amenities</strong>: {attributes.bike_amenities}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_LANES.id,
    title: SustainableTransportationDefinitions.BIKE_LANES.name,
    url: SustainableTransportationDefinitions.BIKE_LANES.url,
    visible: true,
    listMode: 'show',
    layerIndex: 8,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.use_}',
      description:
        '<strong>Street Type</strong>: {attributes.street_use}<br />' + '<strong>Location</strong>: {attributes.location}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.CITY_BIKE_LANES_ROUTES.id,
    title: SustainableTransportationDefinitions.CITY_BIKE_LANES_ROUTES.name,
    url: SustainableTransportationDefinitions.CITY_BIKE_LANES_ROUTES.url,
    visible: true,
    listMode: 'show',
    layerIndex: 7,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.type}',
      description: '<strong>Location</strong>: {attributes.loc}'
    },
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: SustainableTransportationDefinitions.BIKE_DISMOUNT_ZONES.id,
    title: SustainableTransportationDefinitions.BIKE_DISMOUNT_ZONES.name,
    url: SustainableTransportationDefinitions.BIKE_DISMOUNT_ZONES.url,
    visible: true,
    listMode: 'show',
    layerIndex: 0,
    popupComponent: MarkdownPopupComponent,
    popupData: {
      name: '{attributes.name}',
      description: '<strong>Notes</strong>: {attributes.bike_notes}'
    },
    native: {
      outFields: ['*']
    }
  }
];

export const SustainableTransportationConfiguration: EventConfiguration = {
  id: 'sustainable-transportation',
  name: 'Sustainable Transportation',
  applicationName: 'Sustainable Transportation Map',
  shortApplicationName: 'Sustainable Transportation',
  introductionText: 'Explore bike amenities and EV charge stations across Main Campus and the RELLIS Campus in one map.',
  mapCenter: [-96.34643, 30.61313],
  eventDates: [],
  zoom: 15
};

export const SustainableTransportationOptions: SpecialEventOptions = [];

export const SustainableTransportationTs: AggiemapCustomMapConfiguration = {
  configuration: SustainableTransportationConfiguration,
  options: SustainableTransportationOptions,
  sources: SustainableTransportationColdLayerSources,
  references: SUSTAINABLE_TRANSPORTATION_LAYERS,
  type: 'general-map',
  discover: {
    id: SustainableTransportationConfiguration.id,
    name: SustainableTransportationConfiguration.name,
    description: 'Bike amenities and EV charging locations for Main Campus and the RELLIS Campus.',
    source: 'internal',
    type: 'parking',
    keywords: [
      'sustainable transportation',
      'bike',
      'hub corral',
      'shared mobility',
      'bike racks',
      'bike fix stations',
      'bike lanes',
      'dismount zones',
      'ev',
      'ev chargers',
      'electric vehicle',
      'rellis'
    ]
  }
};
