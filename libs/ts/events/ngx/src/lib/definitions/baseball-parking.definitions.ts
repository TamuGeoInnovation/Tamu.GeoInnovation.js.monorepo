import { LayerSource } from '@tamu-gisc/common/types';
import { Connections } from '@tamu-gisc/aggiemap/ngx/common';

import { MarkdownPopupComponent } from '../modules/popups/markdown-popup/markdown-popup.component';
import { MarkdownWDirectionsPopupComponent } from '../modules/popups/markdown-w-directions-popup/markdown-w-directions-popup.component';

import {
  AggiemapCustomMapConfiguration,
  EventConfiguration,
  SpecialEventOptions
} from '../interfaces/special-event.interface';

export enum BASEBALL_PARKING_LAYERS {
  EVENT_SYMBOLS = 'baseball-event-symbols',
  ACCESSIBLE_SYMBOLS = 'baseball-accessible-symbols',

  ACCESSIBLE_LOTS = 'baseball-accessible-lots',
  ACCESSIBLE_SHUTTLES = 'baseball-accessible-shuttles',

  EVENT_LOTS = 'baseball-event-lots',
  GATE_ROAD_CLOSURE = 'baseball-gate-road-closure'
}

enum BaseballMapMode {
  EVENT = 'event',
  ACCESSIBLE = 'accessible'
}

const eventUrl = Connections.baseballParkingUrl;

/**
 * Picture-marker art for this map's symbols, inlined so it no longer depends on the legacy
 * `TS_Events/BaseMBasketTennisXCountry` map service staying published.
 */
const ACCESSIBLE_SHUTTLE_STOP_IMAGE_DATA =
  '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';

const ACCESSIBLE_PARKING_5_IMAGE_DATA =
  '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' +
  'AASUVORK5CYII=';

const BUS_PARKING_10_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACK0lEQVRIieWWz0sUYRzGP7POuhY1lSOu24' +
  '6YFSxdCiItI7JTBy8V1D9gHaOiQBE6dOigl8rWQxCeg+oUQZcOIWGZFXToN2T+2JmRbWVdV1b318Tseqjd2R2b0Qh6TgPzvM/nfZ+B7zsif1Hi' +
  '/wMblYzdzb0cE2Vkp6G5BAn1BiPtuvC+IuxFnbHD383j+BNChoEryaeJvHxoHD+kCx8sYY3ddGSjhBLPcS1PHUHlMp30YA0TG5By8+ULRRkazs' +
  'DmDvAGwCtDNg4ZHZJvIfYAlqfK19VISL/l2O3Qfw5ab0NahW/ngZJ6t1+BlgGYuQ7T16pn2cJa+qFwWgN2hq09GQ2Uq6DeXPE6gXmbAAHGg0C+' +
  '+qb2vYENIUi+cgjzNcPShD3IVOoL+BQXsNpAsaLVKK1CrdkATmsMQC65Olhuoeh3DBO3Qv0p2DsGhk2VG/dA9J4LmCmPDza1syYS7QyZWZgdhm' +
  'APCBXc2iBs61oDWOoT6EPgPwtev4UhD9pQYfq4h0mdcECtYvDA/q/FR/2OC1h+sXBdmDOO7BwYaWuYtxFyK17HMLOe/BLsugsfu2BhrNxTswUO' +
  'xkEPw2SfC5ip+FPQwrD4zvq9OQsj/fDjvl1SCSwdYc6chb9q+TtMXKgeMml1IgGyMWIVYdFhRpsuMV5/krbSq+RP5Wvl8/QAzyrCDiNERm4ZJ5' +
  'SLtPkU5/8gmSjzM2FeH0kJU1W/2VEEjUEesQ4S1yP0n4D9BIWvqMJsHI2IAAAAAElFTkSuQmCC';

const CLUB_PARKING_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACRklEQVRIiWNhoCNgGTmWlR0oc3z66Wn+r7' +
  '+/BMgxkJGR8Z8Ah8BVHWWdkjzVvJ84LSvcUxg/+czkBd//fGegEDjavrUNZ2BgEMNp2eU3l+upYBEYHH58WLRyf6VPu2P7FqyWffzxkZ+BCKAm' +
  'pMZw690tguq+/PmiQlECcZZ3ZqizrmOwX2ZPqlYGki0rtyhnsJO1Y7CXtWc4+Pgg7SwzEjdicFVwBbPrbeoZnJY70c6ycotyONtRzpHBVsaW4f' +
  'CTw9S3TEVQhSFEPQTM/vPvDwMLEws47lxXulLfslKzUgYmRiaGb7+/MfSc6gFb5KLgwmApbclw/Olx6lkmwS3BEK8bD2ZvvbuVYdLZSQxl5mUM' +
  'HCwcDHVWdQyeqz2pZ1mBSQEDOzM7mL3m5hqGt9/fMiy/vpwhUTeRwUPJg8Fcypzh5LOTlFvGx87HkGGYAWaDSpdt97aB2ZPPTgZbBgK1VrUMPm' +
  't8KLcs0zCTgZ8dUrBsv7ed4cuvL2D2+ZfnGY49PcZgJW3F4K3szWAsYcxw9sVZ0i2L04lj4GXjhQchDHz9/ZUhXgcSdyBw/+N9sGUgMMF5AsOK' +
  '6yvAbFCCOffyHANRljXaNDIo8CtgiMdqx4IxNmAjYwPGIFBxsIJ4y0DF0I23NxjIBfc/3McqjtWyhK0JDLQALMgcfg7+jwwMDELUMpyTmfMyTs' +
  'v0RPTqjj09thhUSlAKbGVsX3Q5de3FaVmfS9+S0n2lj599eVZIjTbIYYbD+OOs26kbVEmRVlExEAeGb7sRAL26wS6e0xY7AAAAAElFTkSuQmCC';

const SUITE_PARKING_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAA7EAAAOxAGVKw4bAAACgklEQVRIieWWX0hTURzHv5cdHS1ECSJTkP' +
  'wDDhaGr4qbiDFCgh6GgoNGsiBx1F4klBQENcxYpPXgQAduTxKiyPTFsenmg0YglRtuDwk1B5NqCwrccotzH2Z5791254ygL1zuOb/zO7/PPef8' +
  '+N1D8JdF/i9gMpnUABgDIM1T/BiAQYZhbLxAAPfCe3tVL/V6eN1u/IxRf/GSFBRA3tAAw/Q0Squr9QAEgeRFVxfeOZ04jY7iceysreG5TofHHg' +
  '9Je4Zejwf5UmBri2MjfF+XSRfKytj3l/39tH5HPLFEZ6msuBgDKytgGAb9TU34EY2Kmk/EOBdIpehbWMCVujq237+4iCG1GvHDw/wDGYbBg9lZ' +
  'XG1uTtkUKhWMNhuednQgmUjkF3jHZEJjezvH3qDR4O7EBMwGQ/6At3p7cdNoFBy/0dPDJtCr0dHTA5VaLW6P0eJzrFAgQPcYl2tqUjbtyAi+hk' +
  'JwWCy5A6+1tuK+xcKe3+9673JxgFTdZjMi4TDe2O3igVX19Xg4P8+WqZNigQCu62nVOpaEEPTOzWGwpQX+zc3sgZcqKzGwvIxzRUW8k2jZSghk' +
  'pVQmwyO7HX2NjQju7mYH1I2P43skgpLSUs7Yvt+Pz8Eg26YBy2trOT7fDg7YrB5ua8sO+EyrhdFqRblcLridbNvp5ACj4TA+er0wdXbyheYH0s' +
  'rhslrx1uHgjPk2NlJt++QkPmxv/zH+yefD+ZISweojmDSvl5aQSXQl9BEjctJAszKbP0ZWwQsLMwMVSiXvVuYihUqVEXhomJkB/evvrK/nvFIJ' +
  'IewVo3tqinZj6YDDFysqMLS6ms9L1BNBIMMwbgBqnKHIWQb/J4C/AGOM16dl5oOrAAAAAElFTkSuQmCC';

const RV_PARKING_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAAB8AAAAfCAYAAAAfrhY5AAAACXBIWXMAAA7EAAAOxAGVKw4bAAADJUlEQVRIidVXPW/TUBQ9LzGIboSJeEvDL8' +
  'BhqQoDEkzOVNrGYnd+BsnPaPaSj5IBBRaQGCrE0rgTiClkc7a6WypFykPHjV3b9UvTJIA4Uj7kvPfOu++de8+Nhn8I7b8ibzabusjeNfldyqnu' +
  'f0I4Ukzd13t7ztrJDzsdI4usAQlbQhpSytkvInwXMoO37XcjIdGDnNQty3JXJm91uvZUypqEzOt6Hg9yOej6Q/8zwHh8AXc0wmAwzJ95ng1xx2' +
  '62j+rW/m5tKfLDTsfITEVNSmk+2iygWCzECKPY2LiHIsdsFnDmefj+4ydcd/Sm1e6alf2d0q3ID2fEEMJ8tr0FRrwouEHOcd0Rjr9+M1rtbl+1' +
  'AS3t4bLEUXDeyxfP8enzF6PZOupZld3yjeStTtfmUa9CHD2FJ6XHOOmfmly3srfTUJLzuCku3vFNxEJcKj2Kqyy4AnUwGAyphQMAavIssgZVTX' +
  'ER9XodtdpcwSo3ZNs2Dg7IBzzd3sL73kcko9fiW4cdpBNxG+IkGo1GSM5s4Jqed25Ho9eilYsFRJVOt0Hq8RcLvHuDPEEBCslZMjmJBWRV8Pj7' +
  '/T4Mwwif5XL3Qx7Mor+m9psiD6IiQfR79PdqtQrHcWLkaetqV5NoEtcVvAyolVKphHK5jHw+njWBGcXIF0U0yrR0iz7TdR29Xg+mafr1Xx05hM' +
  'NpHER1rguMnlcxvhiHPLhGLqYubZHuxMKwbnjeeciDJDkbAfoxbXGd5EGtYJUTEE604YjdORsB+jFtkepUqVkF1TiuxxckYp2OFpstJ3U2AvRj' +
  'GksA5izVS/HMg2oc15PASGam6tpuWZbLDoSNAP04MBfm67yIA6SNG/wa+t6eEaJWSfR4WnIBtj7sQNgI0I9XKbckPemf8g4+VPZfxaJW5jk7D3' +
  'YgbATox8sIkBGTmCKTclJNG6OpJnMD7EDYCFCptMVF8j/Sw/kRk1jVyWrzFmLrQw9mI0A/5hXQnWgSwXWwKLGAMI9nTYMvLv+OU456YXL/BC7N' +
  'v8FN0I9pi6qxPGKmE1WdFNdS5MlN/PV/LIhgdn9zj/OPka8TvwGopL6oPg0S3gAAAABJRU5ErkJggg==';

const MOTORCYCLE_IMAGE_DATA =
  'iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAYAAAByDd+UAAAACXBIWXMAAA7EAAAOxAGVKw4bAAADoElEQVRIieWWaUxUVxTH//dt85g3qyNFUN' +
  'wQba0REIrLh1qM2hBLUiM1sTtqXdI0aYzfFGMTTRqjMagxsUaJjdqGgHWhaWOiSFNxa9VQ2hFqWygpg8AgMPu8ee+auZN+MMPoMLh88CQvucu7' +
  '5/fOyf+c+wQ8YxNePCBdd0gcUCa+hQidlKpTynOqYDNcsGwvufNI4MDG+qndl/5pVp1XFYzSiMTDXXG61lH99jsJgWrHQI3q7BsxTJyZDiHXEf' +
  'Ph7EWkzQ0a1uA/3lzu2dkwy7ylpGVYYKTLOyWVaIwf5EFePBXq7z1wnFyBe8WH2ZiqGtTe0EIAwwOJrnOP9c4RQKdxy8Ef72Lwi0uQCjIh5NgZ' +
  'kPnUdDFllSqrC2A/uAz+E7+hf82Zh/ZMnxVDqchH+FY3guf/SuhjRMC0shlMDP7aP+L2vPuvY7Dy4mN9JAWMQpR1hfDsuwatcxDBH/58aD9847' +
  '9h05wy0FZVCtOGImhdHrhePhC3HzjlTMZNckB+ggWmT+bExllm2HYvhXrTxeaB+jbw40wgiojQTx1PBiiX5gJ8TLxRp/LCSSx9wrQxkF7LgjBj' +
  'LHS3f/RAziYzkSgf57M5DajwHrgO3RtmahRnvRSrvdvd8B27DeN7s+E/0ZwakM+2YmzdSoSaOpnEDQuyQdJEOGpiXYp6QiBmAxtHwQhpCF/+N/' +
  'UI9f4AAmdaIeSOAQ1EEGpshzQ/m0XJWWVW/L2Lv4Z1xyKod/qgrC9EWvlMaC4PhrY1QOvxjQDIc6w9eXZdZmWQcWUN/N+2IPxLF4vcuOIVEEVi' +
  'TaB/Qz3se98E4Tm43z8Fzi7DfqgMfeU1gKYnB5QKM1ldGd6YjPSLHyF4rhXykhz29dLc8aAaBeEBtaWHCcf3TQsIR5Dp/BT9a88ifNMF8dV0qM' +
  '33kowwooOIPGgwAoQ1BBs7YP58HojIgbOnMYVq3V54v/oVUv44cBOtoBEd/HgLpKIsEFmInU02pdFeaNn6OnxHbsE1fT8reO/BG/DsaYo7HGxs' +
  'h3nTfAx9+TO7ITirAcYP89j1lDQQlML9bh1M64sgl05DsKEdgbr43vl/NtyramHevADCdAdL5/21ZxPC4oDEJPmjnSyaEk/VVSRj+lAIg9saEr' +
  '9gEv5OCBRyHUdDTZ1b8YRMzMvw2QoGvk8IdBxbXumu+A6Ru/dXU59qTBVEBEK5LEuHoThjFVlZoiUEMmj18koA0Wf0djp+6fn/lz5tewAQaGfp' +
  '4MusOQAAAABJRU5ErkJggg==';

const accessibleShuttleStopSymbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${ACCESSIBLE_SHUTTLE_STOP_IMAGE_DATA}`,
  width: 24,
  height: 30
};

const accessibleParking5Symbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${ACCESSIBLE_PARKING_5_IMAGE_DATA}`,
  width: 25,
  height: 25
};

const busParkingSymbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${BUS_PARKING_10_IMAGE_DATA}`,
  width: 20,
  height: 20
};

const clubParkingSymbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${CLUB_PARKING_IMAGE_DATA}`,
  width: 20,
  height: 20
};

const suiteParkingSymbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${SUITE_PARKING_IMAGE_DATA}`,
  width: 21,
  height: 21
};

const rvParkingSymbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${RV_PARKING_IMAGE_DATA}`,
  width: 23,
  height: 23
};

const motorcycleSymbol = {
  type: 'picture-marker',
  url: `data:image/png;base64,${MOTORCYCLE_IMAGE_DATA}`,
  width: 21,
  height: 21
};

/**
 * The hosted view publishes the symbol layer with a plain dot renderer, so the symbology has to
 * come from the client. Types with no entry here were not drawn on the legacy map either.
 */
const baseballSymbolsRenderer = {
  type: 'unique-value',
  field: 'type',
  uniqueValueInfos: [
    {
      value: 'Accessible Shuttle Stop',
      label: 'Accessible Shuttle Stop',
      symbol: accessibleShuttleStopSymbol
    },
    {
      value: '$5 Accessible Parking',
      label: '$5 Accessible Parking',
      symbol: accessibleParking5Symbol
    },
    { value: '$10 Bus Parking', label: '$10 Bus Parking', symbol: busParkingSymbol },
    { value: 'Club Parking', label: 'Club Parking', symbol: clubParkingSymbol },
    { value: 'Suite Parking', label: 'Suite Parking', symbol: suiteParkingSymbol },
    { value: 'RV Parking', label: 'RV Parking', symbol: rvParkingSymbol },
    { value: 'Motorcycle', label: 'Motorcycle', symbol: motorcycleSymbol }
  ]
};

export const BaseballParkingColdLayerSources: LayerSource[] = [
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.EVENT_SYMBOLS,
    title: 'Baseball Symbols',
    url: `${eventUrl}/0`,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.type}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Baseball' AND type <> 'Accessible Shuttle Stop'`,
      renderer: baseballSymbolsRenderer
    }
  } as unknown as LayerSource,

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SYMBOLS,
    title: 'Baseball Symbols',
    url: `${eventUrl}/0`,
    visible: false,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: '{attributes.type}'
    },
    native: {
      outFields: ['*'],
      definitionExpression: `event = 'Baseball'`,
      renderer: baseballSymbolsRenderer
    }
  } as unknown as LayerSource,

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.GATE_ROAD_CLOSURE,
    title: 'Gate/Road Closure',
    url: `${eventUrl}/2`,
    popupComponent: MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  },
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.EVENT_LOTS,
    title: 'Event Parking Lots',
    url: `${eventUrl}/3`,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'baseballn',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `baseball IN ('AnyValid','SeasonPass')`
    }
  },

  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_LOTS,
    title: 'Accessible Parking Lots',
    url: `${eventUrl}/3`,
    visible: false,
    popupComponent: MarkdownWDirectionsPopupComponent,
    popupData: {
      name: {
        field: 'lotname',
        collapsed: true
      },
      description: {
        field: 'baseballn',
        collapsed: true
      }
    },
    native: {
      outFields: ['*'],
      definitionExpression: `baseball = 'Permit'`
    }
  },
  {
    type: 'feature',
    id: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES,
    title: 'Accessible Shuttle',
    url: `${eventUrl}/1`,
    visible: false,
    popupComponent: MarkdownPopupComponent,
    native: {
      outFields: ['*']
    }
  }
];

export const BaseballParkingConfiguration: EventConfiguration = {
  id: 'baseball-parking',
  name: 'Baseball',
  applicationName: 'Baseball Parking',
  shortApplicationName: 'Baseball Parking',
  introductionText: 'Parking and access information for Texas A&M baseball home games.',
  eventDates: [
    '2026-02-13',
    '2026-02-14',
    '2026-02-15',
    '2026-02-17',
    '2026-02-20',
    '2026-02-21',
    '2026-02-22',
    '2026-02-24',
    '2026-03-03',
    '2026-03-06',
    '2026-03-07',
    '2026-03-08',
    '2026-03-10',
    '2026-03-17',
    '2026-03-20',
    '2026-03-21',
    '2026-03-22',
    '2026-03-24',
    '2026-03-31',
    '2026-04-02',
    '2026-04-03',
    '2026-04-04',
    '2026-04-10',
    '2026-04-11',
    '2026-04-12',
    '2026-04-14',
    '2026-04-21',
    '2026-04-28',
    '2026-05-01',
    '2026-05-02',
    '2026-05-03',
    '2026-05-05',
    '2026-05-14',
    '2026-05-15',
    '2026-05-16'
  ],
  toast: {
    id: 'baseball-parking-notification-2026',
    title: 'Baseball Parking Map Available',
    message:
      'Heading to Olsen Field? Click me to open the Baseball Parking Map for parking, shuttle, and road closure information.',
    imgUrl: './assets/images/icons/sports/Baseball.png',
    imgAltText: 'Baseball Icon',
    acknowledge: true,
    action: {
      type: 'internal',
      value: '/events/baseball-parking'
    }
  },
  scheduleUrl: 'https://12thman.com/sports/baseball/schedule',
  mapCenter: [-96.34509, 30.60416],
  zoom: 17
};

export const BaseballParkingOptions: SpecialEventOptions = [
  {
    value: 'map-mode',
    label: 'Choose Your Map',
    shortDescription: 'Map Type',
    description:
      'The Event Map shows event parking lots, symbols, and road closures (no accessibility layers). The Accessibility Map shows accessible parking lots, the accessible shuttle route, and all symbols.',
    choices: [
      { value: BaseballMapMode.EVENT, label: 'Baseball Event Map' },
      { value: BaseballMapMode.ACCESSIBLE, label: 'Accessible Baseball Map' }
    ],
    effects: {
      layers: [
        {
          layerId: BASEBALL_PARKING_LAYERS.EVENT_SYMBOLS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: true } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: false } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SYMBOLS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: false } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },

        {
          layerId: BASEBALL_PARKING_LAYERS.GATE_ROAD_CLOSURE,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: true } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.EVENT_LOTS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: true } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.ACCESSIBLE_LOTS,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: false } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        },
        {
          layerId: BASEBALL_PARKING_LAYERS.ACCESSIBLE_SHUTTLES,
          conversions: [
            { input: BaseballMapMode.EVENT, propOverrides: { visible: false } },
            { input: BaseballMapMode.ACCESSIBLE, propOverrides: { visible: true } }
          ]
        }
      ]
    }
  }
];

export const BaseballParkingTs: AggiemapCustomMapConfiguration = {
  configuration: BaseballParkingConfiguration,
  options: BaseballParkingOptions,
  sources: BaseballParkingColdLayerSources,
  references: BASEBALL_PARKING_LAYERS,
  type: 'general-map',
  discover: {
    id: 'baseball-parking',
    name: BaseballParkingConfiguration.name,
    description: 'Baseball event parking with optional accessibility-focused view.',
    source: 'internal',
    type: 'parking',
    mapType: 'athletics',
    keywords: ['baseball', 'parking', 'accessible', 'shuttle', 'closure']
  }
};
