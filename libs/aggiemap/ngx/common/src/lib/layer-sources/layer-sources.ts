import { LayerSource } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import { IComposedIDefinitions } from '../definitions';
import { IComposedConnections } from '../connections';
import { IFactoryExcludeOptions } from '../utils/definitionFactory';

import esri = __esri;

// Temporary fix: BikeMap MapServer layer 0 renders all rack types at a consistent icon size,
// whereas the hosted Rack_Locations_view FeatureServer sub-layers have inconsistent icon sizes.
// The rack symbol imageData below is copied from the BikeMap layer 0 renderer so the temporary
// layers use the original source icons instead of the legend swatches. When the FeatureServer
// icons are corrected upstream, revert the three rack layers back to:
//   bike-racks-map-layer    → 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Rack_Locations_view/FeatureServer/2'
//   shared-mobility-racks-layer → 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Rack_Locations_view/FeatureServer/1'
//   hub-corrals-layer       → 'https://arc.ts.tamu.edu/arcgis/rest/services/Hosted/Rack_Locations_view/FeatureServer/0'
// Remove definitionExpression, layerIndex, and renderer overrides from the native configs below,
// and revert popup attribute keys back to lowercase (type, total_capacity, br_notes).
// prettier-ignore
const HUB_CORRAL_SYMBOL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADK0lEQVRYheWXz0sVURTHPxfepsxFEGRC4DYiwSAqrVUJWhllkf2ACGpZEEbQwsjQRRD2P1hIGqULn/rCZa9ChAIr2haBtShcFAUSnDjOGbjcfPOGUWKwA8N7c+bec79zfn3PFMiZFMiZFMiZFFiLgAQm9NfB4VwAAnb/vyET2AJ8c7AY6DcArUAjUGO6W8AcMO3gR7Bez6p1sJAZkMBG4BPwQuCQHiLQAPQA54AvwKy3ZTtwAagTGAL6HHw08JNAs8BWB5+zeui7ggH2q0GBEeAOUARaHLwy4F/118Epu98JXAfeCtwATgP7gGfq7cwecvBbPQOUDJRenQ7GquxToGcEjgOjpi4TeXkxMyAVC9ND9ciSArplmRwJxcLU7amGq+1Jm9QNFqZO4Jq5viTQVukAgVpgyl5CPXMPuC9Q1JxaESDgJjCuYVLPWPhaDFS7i/IsBKNrmoHnRGvUy0WzdSkzIImMazXt1Xsz3B6A6gfW2fp2q8BmK4YlMGburgIUuJoUumoeagXmHbyOFeoRDRfw1A7Wco4l/q9g2nzvaaJL1CbU5lhWQI1Bn/FB9QVgfOkPQ2kyazbTAzKijLmpxu8zgaxPeJHHAr+W0au9DoErdj8TEnL+ucx5iAV6gW0OusJ1lsCVQnbSRWUf7nkEvHNwOzWgQOaA8xWqT6upkvQIlJfJo11ETZasgKaBeoGmuNKCPqPVpGX/xNafsF6jz6b85mn8Vmc2swFyUTUNGVGeNTqY8sAslbbAT1uvIMpBn4pBqY2havSRJqn7gDcCx4w6WrwO/Fdpe30qpg4FqdRxBNhR7bA05PrBRoi4d5SDDkwCqJJxn16X1daKAUkUJp1nYhlIw9pGMwPelNAlMLiikEn0fNLeUD0zDDwQGFdu8ikl2NdkOdOhntHZyBvyDibNRNU8VAvssUkvHmEnrJJeCswbHcQdfcRKu14TWHPGQj5oOaXPNik/ZgLkYEFgs46yOj2aTvPgorK2N+QftS3viUBNB8SqL3JAwbgEMGk8RKWvBDtQx9NRicKiut4EOxqmRDCpAP1rWS1AM7kC5Fbhm37Nh2zVJHeA/gB6+wK1LYH5oAAAAABJRU5ErkJggg==';

// prettier-ignore
const SHARED_MOBILITY_SYMBOL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAbCAYAAAAULC3gAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEuUlEQVRIidWXf2hVZRjHP+855+7+2HbdD7e51Jm6sjm1wlEU5EApMiojMIJEiqJCqkUlWCRC/RMUJNZ/BRX2R4hFBeUfWQSjWVS0ouksc9O5zemd8+7X3b3nnPvG894fujHvlSzSL7z33Pu+zz3P9zzP93ne9zhcZnC4zOBwRRDSHVXASkjPA1UCar4FjQplZQ0cG1WqIKDRMuGlwdfg+jBpwZRCRTQ6nV1zyXwXYw90P/h7Ua19xQnpjjst+CyK5c8j5IZQBLCcKHY4gq1swEKhgDQZOjlPMueaOW0s5HeCtBkxXAZIMWmsZcV5At21CtWcKkioHHsb6JJeWpiDHeZfxhk8PuQ0bfQsg5GbgfaChBR62d1UCplLdp6L2vmowuEp6nmBXs+FFUUJTaGrlhO5oBMfzXeMcTVBPDQBFAsJTrNZxi8cMYkCG8WT1PE2S/LrIsQqHHeI1LnJWQlprVw6SioKFN9XxFnPwfzvRQTpZfU0m8+5zlwnSLOW35ntAStwrCG8hsKEOBCSMFcWILSaUh6mlg84xWPU8Qi1fMoZOpkggkUUmygOfSR5gwG2sYAtzJuNUAB0fRFCVkCSUkg/NQR4j0Ym8HmXIfYxwipKqSNAEIthXPYybPRTjcPzXDXrfcqxLIWq1oUJJSwoIWmyfw5J0saJaGcIl0FSfM+YKf9GwnxBk7Ebw2cD3WymlhZKeZoeyvmBJsLsYjG3Ec3fM2CUpGfymUmoXIt7yX0OfSRZRxd/MmUEKiKeyq5vpJo9xPiIGHdRyR0cZAURE602eoyNxFrSuZ5D/Mb1LCFk5qUgQPlFCElHzUQkh60c4whTvEIDm5hLM53cTzVLCZmUraOC5+hlJ4MmQvdQyX10s4EqjpPkceoYJ81WetnFIDtZnMlFpq0WIaRaJh3d4XvovIh+ZtzoYDsLeJFj5kYnSHKQSUbw+Ilxcx0ixQFW8RaD1BLgHZaykcP0k+JVGnidftoZzbsalR3EbCOFI0QYa8yXIsiiEodW5piYfckIrUSZTwkxPLpJGOGWYfMgc7mJMg6TYDEhI/41RKmnhLN4Jnqnz/MfN1sfUxdByI4lSecJtRI1T307c/iVG/J2WzhquvB+mk0vykHK/mvivMmASbOkTSIlkZXIzSAUL0rIATcnWsEz1LOSTpropI16I9KPOcO3xHmUumlkBNJzhJDoagd9JjI5bKYm3+1H8aTMYkUJ+ehSEWEOCwmyj+WspYtns5VTis3LLGAHC2f+3Qh+N9fwEsdNhQqkP4kG5eEEp3BzHvqLEvLQwZNMOxFwC+Uc4ka6mDQpaaFMtMaFsIkaHqLGEBJRN2Y1lcPJTDFLHzpRlJCLTkiZS9pC5zmVzVTGxUL01UDQjJkQkWetjhYlNIq3u53R7XX8aCJzLWFzZJBqkqYooZYOIgexFNo0y7k4Jo1ymJP0iJ08jGzSsr8N45nWIGehP0jwPqdy7v4qSghCr9mkmiZI37ufuPqGuOeiQ7McbS4R6hPUrRdBSLVM+rIrZOHLh95jw6IK8MrAUuCnIe2Cn8hsN74DnhRgGKwIeBFQEUyDtVPgnQUnVykB8GKoNYP//K1DPSC8hrPjP8UV8hrE/4e/AQQPo7YUUL0rAAAAAElFTkSuQmCC';

// prettier-ignore
const BIKE_RACK_SYMBOL_DATA = 'iVBORw0KGgoAAAANSUhEUgAAACQAAAAbCAYAAAAULC3gAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEx0lEQVRIidWXe2xURRTGf3P30d3tg754BUGkhKZSiBGCiAGMKIpRUUyjBmI0EjBE5aEYMCJEEwPRKAE1Chgx+IfRitiI/UNEsTESxQgYRQoiWiqFFvvebrv33jHnzq7bNrBLRCN8m9n7mjvzzTnfOWeun4sMfi4y+LkkCC3VhcA4XIagCKIYZsFoZWF5z138PotspQhoDShsV+NoTdzRRC1FTCki2sVFY7uKuPeW9n42FvUoKnlJ1WUmtFTfYsFHeVk4Q/KIhwIQ8OHPCxGOBFA+CywFSoHrgvBxNQgxuRd3UucK6Iqb1tQJf7RBtAfzkmYha/R41qietIRys1iBJnh8NQwIEeZfxp9ReGcfLP6QUlq5BqhJS0hB6W1jPTIXjKSleqMwAo9MhSeqsOMO5RkJxWwKrxxy7kkcF776FUYWgu167mR4ft8+pc/D0SbjSnHxw1PglbtTz8XlhWHipzoY1X/8foS0ijsE89M46tNamPVG6vryAjj+TN8+VfPNsbMHbngVzrbA/AjWqQ5GpCe0lJCYuSBybkITLoMHJsHb38L8yfDgJNjxA+yvh0gQ8kKm1TXDi5/Dihth0XVnIRQmAAxNT8gmgC+9fgbmwFv3mdVv2QvVh2D8UBicC1l+OBOFygNGP0XZ8Pj1Zx8nNwtLKYp0WkI+k2e67b6dum0ziWjnVDucbIO9vxktjC6GnQtMv/ZumL0F7p8IE4fDo9shdwWUDYYNc2BqL8WI9hIJIA2hLDTdZvVJ1LXAjNfgSKMRaMDyhO+h4ip4bz+8+z3cWgYzX4dysVaOF9ZmjZZxp+ju4JMwqijhDNej46Qn1EycSF8LLa8yEfPsLJg3AcaugznjoaTYuGzGGFi2A9bvMRa6fSzc+SbMLoffm2HBFOjoNuNs+BLW32XGlWSpMxLapKL+ZdqxXVGSwXd1RgerZsLKj81AJ1rgpwZojsK+OnMUV369BDbWwKAc2HwPVGyF+lZ4bha8sBtqjqWmaouZkpOeEBAO0O64/J1ZCiIwvcTklE8OmfNhA0wp+Pk0FEUgJwj3Xg2TRsDh03BFkRH/tBIYmgctXcZ6jR2peVpjnn5imQkFaeq2U4Sml5hV31QKB5an+i2qBFULuxaZXJSEhPxntfDyHuNmcZtYSiw7KLcXoS40itaMhPyKeFK0gsemwbh1ULYWFk8Dn4IPDsIXR+GhyX3JCCTnCCHR1epqY5kkJPqS2b4thoWmKSMhR5MtIkxieD5ULzQZd0kicrKD8PRMWH1z/7eN4LfNhad2mggVSH4SDcriBKc7jASA+oyEbIeshra+964dCYdWwo8NxiWSY8KSZ8+BeRNh7gRDSEQtuUo0lURDe+JEcSIjobhLl4S5uC3U66kUU2nnC6nyIwpM6w8ReQLHMhJqi7Gt5hirBq8ylhkz0GwZpAxIdhVTy8Ys7kKPbRJfcbZxo2zmxD3STxYjRVrq25lOkxpkL1TbCFu/SUxm80tGQkRZ68umrLOHO3YdRu0+4u1bpLr129lcMLazUZ0HoU0q6kBF8tKRvwrtYxD5hMjBQaFxMfvkLq/cdOAnjA9NGIcILhF8RND4cOlB00IQKRaysw540bVenfznXx3vK+F1JtH+U1win0H8f/gLDTWztGgTS7YAAAAASUVORK5CYII=';

export const commonLayerProps = {
  outFields: ['*'],
  minScale: 100000,
  maxScale: 0,
  elevationInfo: { mode: 'relative-to-ground', offset: 1 } as esri.FeatureLayerElevationInfo,
  popupEnabled: false
};

// Persistent layer definitions that will be processed by a factory and added to the map.
export function LayerSources(
  connections: IComposedConnections,
  definitions: IComposedIDefinitions,
  options?: IFactoryExcludeOptions<IComposedIDefinitions>
): Array<LayerSource> {
  const bikeMapUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/BikeMap/MapServer';
  const evChargeStationsUrl = 'https://gis.it.tamu.edu/arcgis/rest/services/TS/EVChargeStations/MapServer';
  const all: Array<LayerSource> = [
    {
      type: 'feature',
      id: definitions.BUILDINGS.layerId,
      title: definitions.BUILDINGS.name,
      url: definitions.BUILDINGS.url,
      popupComponent: definitions.BUILDINGS.popupComponent,
      listMode: 'hide',
      visible: true,
      essential: true,
      layerIndex: 1,
      native: {
        ...commonLayerProps,
        legendEnabled: false,
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
      id: definitions.CONSTRUCTION.layerId,
      title: definitions.CONSTRUCTION.name,
      url: definitions.CONSTRUCTION.url,
      popupComponent: definitions.CONSTRUCTION.popupComponent,
      listMode: 'show',
      visible: false,
      essential: false,
      layerIndex: 2,
      native: {
        ...commonLayerProps,
        definitionExpression: `EndDate > CAST('${new Date().toISOString()}' AS DATE ) AND Status = 'Active'`
      }
    },
    {
      type: 'feature',
      id: definitions.POINTS_OF_INTEREST.layerId,
      title: definitions.POINTS_OF_INTEREST.name,
      url: definitions.POINTS_OF_INTEREST.url,
      popupComponent: definitions.POINTS_OF_INTEREST.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps,
        renderer: {
          type: 'simple',
          symbol: {
            type: 'picture-marker',
            url: '/assets/images/markers/statue-icon.png',
            width: '20px',
            height: '30.2px'
          }
        }
      }
    },
    {
      type: 'feature',
      id: definitions.BONFIRE.layerId,
      title: definitions.BONFIRE.name,
      url: definitions.BONFIRE.url,
      popupComponent: definitions.BONFIRE.popupComponent,
      listMode: 'hide',
      visible: true,
      native: {
        ...commonLayerProps,
        labelingInfo: [],
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-fill',
            color: [0, 0, 0, 0.0],
            outline: {
              width: 0
            }
          }
        }
      }
    },
    {
      type: 'feature',
      id: definitions.LACTATION_ROOMS.layerId,
      title: definitions.LACTATION_ROOMS.name,
      url: definitions.LACTATION_ROOMS.url,
      popupComponent: definitions.LACTATION_ROOMS.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.SURFACE_LOTS.layerId,
      title: definitions.SURFACE_LOTS.name,
      url: definitions.SURFACE_LOTS.url,
      popupComponent: definitions.SURFACE_LOTS.popupComponent,
      listMode: 'hide',
      visible: true,
      layerIndex: 1,
      native: {
        ...commonLayerProps,
        legendEnabled: false,
        opacity: 0.0,
        labelingInfo: [
          {
            symbol: {
              type: 'text',
              color: [0, 0, 0, 0]
            }
          }
        ]
      }
    },
    {
      type: 'feature',
      id: definitions.VISITOR_PARKING.layerId,
      title: definitions.VISITOR_PARKING.name,
      url: definitions.VISITOR_PARKING.url,
      popupComponent: definitions.VISITOR_PARKING.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.ACESSIBLE_ENTRANCES.layerId,
      title: definitions.ACESSIBLE_ENTRANCES.name,
      url: definitions.ACESSIBLE_ENTRANCES.url,
      popupComponent: definitions.ACESSIBLE_ENTRANCES.popupComponent,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'feature',
      id: definitions.EMERGENCY_PHONES.layerId,
      title: definitions.EMERGENCY_PHONES.name,
      url: definitions.EMERGENCY_PHONES.url,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'graphics',
      id: 'selection-layer',
      title: 'Selected Buildings',
      listMode: 'hide',
      visible: true,
      essential: true,
      popupComponent: definitions.BUILDINGS.popupComponent,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'graphics',
      id: 'bus-route-layer',
      title: 'Bus Routes',
      listMode: 'hide',
      visible: true,
      native: {
        ...commonLayerProps
      }
    },
    {
      type: 'geojson',
      id: definitions.BIKE_LOCATIONS.layerId,
      title: definitions.BIKE_LOCATIONS.name,
      url: definitions.BIKE_LOCATIONS.url,
      listMode: 'show',
      visible: false,
      native: {
        ...commonLayerProps,
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            size: 8,
            color: '#03C4A6'
          }
        }
      }
    },
    {
      type: 'group',
      id: 'sustainable-transportation-group-layer',
      title: 'Sustainable Transportation',
      listMode: 'show',
      visible: false,
      sources: [
        // GroupLayer drawing follows child source order, so keep this array bottom-to-top
        // while preserving layerIndex values for the desired legend order.
        {
          type: 'feature',
          id: 'bike-dismount-zones-layer',
          title: 'Bike Dismount Zones',
          url: `${bikeMapUrl}/4`,
          listMode: 'show',
          visible: true,
          popupComponent: Popups.MarkdownPopupComponent,
          popupData: {
            name: '{attributes.Name}',
            description: '<strong>Notes</strong>: {attributes.Bike_Notes}'
          },
          native: {
            ...commonLayerProps
          }
        },
        {
          type: 'feature',
          id: 'city-bike-lanes-routes-layer',
          title: 'City Bike Lanes and Routes',
          url: `${bikeMapUrl}/3`,
          listMode: 'show',
          visible: true,
          layerIndex: 0,
          popupComponent: Popups.MarkdownPopupComponent,
          popupData: {
            name: '{attributes.Type}',
            description: '<strong>Location</strong>: {attributes.Loc}'
          },
          native: {
            ...commonLayerProps
          }
        },
        {
          type: 'group',
          id: 'bike-lanes-group-layer',
          title: 'Bike Lanes',
          listMode: 'show',
          visible: true,
          layerIndex: 8,
          sources: [
            {
              type: 'feature',
              id: 'city-bike-lanes-routes-layer',
              title: 'City Bike Lanes and Routes',
              url: `${bikeMapUrl}/3`,
              listMode: 'show',
              visible: true,
              layerIndex: 7,
              popupComponent: Popups.MarkdownPopupComponent,
              popupData: {
                name: '{attributes.Use_}',
                description: '<strong>Location</strong>: {attributes.Location}'
              },
              native: {
                ...commonLayerProps
              }
            },
            {
              type: 'feature',
              id: 'bike-lanes-layer',
              title: 'Campus Bike Lanes',
              url: `${bikeMapUrl}/2`,
              listMode: 'show',
              visible: true,
              layerIndex: 8,
              popupComponent: Popups.MarkdownPopupComponent,
              popupData: {
                name: '{attributes.Use_}',
                description: '<strong>Location</strong>: {attributes.Location}'
              },
              native: {
                ...commonLayerProps
              }
            }
          ],
          native: {
            listMode: 'hide-children'
          }
        },
        {
          type: 'feature',
          id: 'bike-fix-stations-layer',
          title: 'Bike Fix Stations',
          url: `${bikeMapUrl}/1`,
          listMode: 'show',
          visible: true,
          layerIndex: 9,
          popupComponent: Popups.MarkdownPopupComponent,
          popupData: {
            name: '{attributes.Bike_Sta_Name}',
            description: '<strong>Amenities</strong>: {attributes.Bike_Amenities}'
          },
          native: {
            ...commonLayerProps
          }
        },
        {
          type: 'feature',
          id: 'bike-racks-map-layer',
          title: 'Bike Racks',
          url: `${bikeMapUrl}/0`,
          listMode: 'show',
          visible: true,
          layerIndex: 10,
          popupComponent: Popups.MarkdownPopupComponent,
          popupData: {
            name: '{attributes.Type}',
            description:
              '<strong>Total Capacity</strong>: {attributes.Total_Capacity}\n' +
              '<strong>Notes</strong>: {attributes.BR_Notes}'
          },
          native: {
            ...commonLayerProps,
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
          id: 'shared-mobility-racks-layer',
          title: 'Shared Mobility Racks',
          url: `${bikeMapUrl}/0`,
          listMode: 'show',
          visible: true,
          layerIndex: 11,
          popupComponent: Popups.MarkdownPopupComponent,
          popupData: {
            name: '{attributes.Type}',
            description:
              '<strong>Total Capacity</strong>: {attributes.Total_Capacity}\n' +
              '<strong>Notes</strong>: {attributes.BR_Notes}'
          },
          native: {
            ...commonLayerProps,
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
          id: 'hub-corrals-layer',
          title: 'Hub Corral',
          url: `${bikeMapUrl}/0`,
          listMode: 'show',
          visible: true,
          layerIndex: 12,
          popupComponent: Popups.MarkdownPopupComponent,
          popupData: {
            name: 'Hub Corral',
            description:
              '<strong>Total Capacity</strong>: {attributes.Total_Capacity}\n' +
              '<strong>Notes</strong>: {attributes.BR_Notes}'
          },
          native: {
            ...commonLayerProps,
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
          id: 'ev-charge-stations-layer',
          title: 'EV Charge Stations (Main + RELLIS)',
          url: `${evChargeStationsUrl}/0`,
          listMode: 'show',
          visible: true,
          layerIndex: 13,
          popupComponent: Popups.MarkdownPopupComponent,
          popupData: {
            name: '{attributes.EV_ID}',
            description:
              '<strong>Network</strong>: {attributes.EV_Network}\n' +
              '<strong>Charging Level</strong>: {attributes.Ch_Level}\n' +
              '<strong>Garage Level</strong>: {attributes.Garage_Lvl}\n' +
              '<strong>Notes</strong>: {attributes.EVCS_Notes}'
          },
          native: {
            ...commonLayerProps
          }
        }
      ],
      native: {
        listMode: 'hide-children'
      }
    },
    {
      type: 'geojson',
      id: definitions.DINING_LOCATIONS.layerId,
      title: definitions.DINING_LOCATIONS.name,
      url: definitions.DINING_LOCATIONS.url,
      listMode: 'show',
      visible: false,
      popupComponent: definitions.DINING_LOCATIONS.popupComponent,
      native: {
        ...commonLayerProps,
        renderer: {
          type: 'unique-value',
          field: 'label',
          field2: 'type',
          fieldDelimiter: ',',
          uniqueValueInfos: [
            {
              value: 'open,food-truck',
              label: 'Food Truck - Open',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/FoodTruck_open.png',
                width: '24px',
                height: '32px'
              }
            },
            {
              value: 'closed,food-truck',
              label: 'Food Truck - Closed',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/FoodTruck_closed.png',
                width: '24px',
                height: '32px'
              }
            },
            {
              value: 'open,fixed',
              label: 'Dining - Open',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/Dining_open.png',
                width: '24px',
                height: '32px'
              }
            },
            {
              value: 'closed,fixed',
              label: 'Dining - Closed',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/Dining_closed.png',
                width: '24px',
                height: '32px'
              }
            }
          ]
        } as unknown as esri.UniqueValueRenderer
      }
    },
    {
      type: 'feature',
      id: definitions.AGGIEPRINT_LOCATIONS.layerId,
      title: definitions.AGGIEPRINT_LOCATIONS.name,
      url: definitions.AGGIEPRINT_LOCATIONS.url,
      listMode: 'show',
      visible: false,
      popupComponent: definitions.AGGIEPRINT_LOCATIONS.popupComponent,
      popupData: {
        description: `<strong>Access</strong>: {attributes.Access}\n<strong>Building</strong>: {attributes.BuildingName} ({attributes.BuildingNumber})\n<strong>Printer Type</strong>: {attributes.PrinterType}\n<strong>Details</strong>: {attributes.PrinterDetails}`
      },
      native: {
        ...commonLayerProps,
        renderer: {
          type: 'unique-value',
          valueExpression: `When($feature.Access == 'Campus Member Accessible', 'all',  'restricted')`,
          uniqueValueInfos: [
            {
              value: 'all',
              label: 'Campus Member Accessible',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/services/printer-all-access.png',
                width: '24px',
                height: '32px'
              }
            },
            {
              value: 'restricted',
              label: 'Restricted Access Printers',
              symbol: {
                type: 'picture-marker',
                url: '/assets/images/icons/services/printer-restricted.png',
                width: '24px',
                height: '32px'
              }
            }
          ]
        } as unknown as esri.UniqueValueRenderer
      }
    },
    {
      type: 'feature',
      id: definitions.FAMILY_FRIENDLY_BATHROOMS.layerId,
      title: definitions.FAMILY_FRIENDLY_BATHROOMS.name,
      url: definitions.FAMILY_FRIENDLY_BATHROOMS.url,
      popupComponent: definitions.FAMILY_FRIENDLY_BATHROOMS.popupComponent,
      listMode: 'show',
      visible: false,
      popupData: {
        description:
          '<strong>Building</strong>: {attributes.Name}\n' + '<strong>Restroom Location(s)</strong>: {attributes.Notes}'
      },
      native: {
        ...commonLayerProps,
        definitionExpression: "showOnAggieMap = 'Y'"
      }
    }
  ];

  return all.filter((source) => {
    // Filter out any sources that are in the exclude list
    if (options && options.exclude && options.exclude.length > 0) {
      const keyId = options.exclude.some((key) => {
        return definitions[key].layerId === source.id;
      });

      if (keyId) {
        return false;
      }
    }

    return true;
  });
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
      } as any
    }
  }
];
