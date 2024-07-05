export const PARKING_TYPES: any = {
  NO_PARKING: 0,
  FREE: 1,
  ONE_HR_DROP: 2,
  ONE_HR_DROP_ACCESSIBLE: 3
};

export const RENDERERS: any = {
  ACCESSIBLE: {
    type: 'unique-value',
    field: 'type',
    uniqueValueInfos: [
      {
        value: 'polygon',
        symbol: {
          type: 'simple-fill',
          color: [30, 136, 229, 0.5],
          outline: {
            color: [41, 121, 255, 1],
            width: 2
          }
        }
      },
      {
        value: 'point',
        symbol: {
          type: 'simple-marker',
          color: [30, 136, 229, 0.75],
          size: 7,
          outline: {
            width: 2,
            color: [30, 136, 229, 1]
          }
        }
      }
    ]
  }
};

export const FEATURES: any = [
  {
    zone: 'South Side'
  },
  {
    zone: 'North Side',
    accessible: [
      {
        name: 'Lot 10b',
        days: [
          {
            numbers: '*',
            type: 3
          }
        ],
        geometry: {
          type: 'polygon',
          paths: [
            [-96.34258954258371, 30.616498049613654],
            [-96.3424380599559, 30.616615343085023],
            [-96.34233137712454, 30.616501951944404],
            [-96.34230411661994, 30.616521045950435],
            [-96.34223996410397, 30.616452758715138],
            [-96.34226590483937, 30.616433426065015],
            [-96.34228530646533, 30.616452982887953],
            [-96.34236329751836, 30.616397856154794],
            [-96.34242284473834, 30.616463516185814],
            [-96.34250318099848, 30.616406701939912],
            [-96.34258954258371, 30.616498049613654]
          ]
        }
      },
      {
        name: 'Lot 30c',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61666,
          longitude: -96.34696
        }
      },
      {
        name: 'Lot 30c',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61674,
          longitude: -96.34684
        }
      },
      {
        name: 'Lot 30c',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.617,
          longitude: -96.34646
        }
      },
      {
        name: 'HOTA',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61841,
          longitude: -96.34407
        }
      },
      {
        name: 'HOTA',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61834,
          longitude: -96.34401
        }
      },
      {
        name: 'BEUT',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61587,
          longitude: -96.34309
        }
      },
      {
        name: 'CAIN',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61206,
          longitude: -96.34311
        }
      },
      {
        name: '30e',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61389,
          longitude: -96.34536
        }
      },
      {
        name: '30e',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.61393,
          longitude: -96.34526
        }
      }
    ]
  },
  {
    zone: 'White Creek',
    lots: [
      {
        name: '107',
        days: [
          {
            numbers: [14, 15, 16, 19, 20, 21],
            type: PARKING_TYPES.NO_PARKING
          },
          {
            numbers: [17, 18],
            type: PARKING_TYPES.FREE
          }
        ]
      },
      {
        name: '112',
        days: [
          {
            numbers: [14, 15, 16, 19, 20, 21],
            type: PARKING_TYPES.NO_PARKING
          },
          {
            numbers: [17, 18],
            type: PARKING_TYPES.FREE
          }
        ]
      },
      {
        name: '119',
        days: [
          {
            numbers: [14, 15, 16, 19, 20, 21],
            type: PARKING_TYPES.NO_PARKING
          },
          {
            numbers: [17, 18],
            type: PARKING_TYPES.FREE
          }
        ]
      },
      {
        name: '114',
        days: [
          {
            numbers: [14, 15, 16, 19, 20, 21],
            type: PARKING_TYPES.NO_PARKING
          },
          {
            numbers: [17, 18],
            type: PARKING_TYPES.FREE
          }
        ]
      },
      {
        name: '18',
        days: [
          {
            numbers: [14, 15, 16, 19, 20, 21],
            type: PARKING_TYPES.NO_PARKING
          },
          {
            numbers: [17, 18],
            type: PARKING_TYPES.FREE
          }
        ]
      },
      {
        name: '98',
        days: [
          {
            numbers: [14, 15, 16, 19, 20, 21],
            type: PARKING_TYPES.NO_PARKING
          },
          {
            numbers: [17, 18],
            type: PARKING_TYPES.FREE
          }
        ]
      },
      {
        name: '86',
        days: [
          {
            numbers: [14, 15, 16, 19, 20, 21],
            type: PARKING_TYPES.NO_PARKING
          },
          {
            numbers: [17, 18],
            type: PARKING_TYPES.FREE
          }
        ]
      },
      {
        name: '122a',
        days: [
          {
            numbers: [14, 15, 16, 17, 18, 19, 20, 21],
            type: PARKING_TYPES.ONE_HR_DROP,
            notes: ['One hour drop-off zone.', 'Lot 122 permit required after one hour.', 'NO TRAILERS.']
          }
        ]
      },
      {
        name: '122b',
        days: [
          {
            numbers: [14, 15, 16, 17, 18, 19, 20, 21],
            type: PARKING_TYPES.FREE,
            notes: ['No overnight parking without Lot 122 permit.']
          }
        ]
      },
      {
        name: '122c',
        days: [
          {
            numbers: [14, 15, 16, 17, 18, 19, 20, 21],
            type: PARKING_TYPES.ONE_HR_DROP_ACCESSIBLE,
            notes: ['One hour wheelchair-accessible drop-off zone.', 'Lot 122 permit required after one hour.']
          }
        ]
      }
    ],
    accessible: [
      {
        name: '107',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60619,
          longitude: -96.35751
        }
      },
      {
        name: '107',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60618,
          longitude: -96.35743
        }
      },
      {
        name: '112',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60538,
          longitude: -96.35618
        }
      },
      {
        name: '119',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60498,
          longitude: -96.35576
        }
      },
      {
        name: '122a',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60784,
          longitude: -96.35471
        }
      },
      {
        name: '122a',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60788,
          longitude: -96.35466
        }
      },
      {
        name: '122a',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60793,
          longitude: -96.35461
        }
      },
      {
        name: '122a',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60845,
          longitude: -96.3553
        }
      },
      {
        name: '122b',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.6082,
          longitude: -96.3536
        }
      },
      {
        name: '122b',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60825,
          longitude: -96.35354
        }
      },
      {
        name: '122b',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.6083,
          longitude: -96.35349
        }
      },
      {
        name: '122b',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60834,
          longitude: -96.35344
        }
      },
      {
        name: '122b',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60839,
          longitude: -96.35339
        }
      },
      {
        name: '114',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60922,
          longitude: -96.35439
        }
      },
      {
        name: '114',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60921,
          longitude: -96.35428
        }
      },
      {
        name: '114',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60921,
          longitude: -96.35415
        }
      },
      {
        name: '114',
        days: {
          numbers: '*',
          type: 3
        },
        geometry: {
          type: 'point',
          latitude: 30.60922,
          longitude: -96.35404
        }
      }
    ]
  }
];

export const BOUNDARIES = [
  {
    name: 'South Side',
    paths: [
      [-96.33620381355286, 30.60746292467841],
      [-96.33033514022827, 30.612698488744297],
      [-96.33448719978331, 30.618081498439352],
      [-96.33610725402832, 30.619189456432807],
      [-96.33705139160156, 30.618838604440157],
      [-96.33975505828857, 30.61646570363617],
      [-96.3414180278778, 30.61488681523681],
      [-96.34034514427185, 30.612523051145768],
      [-96.33620381355286, 30.60746292467841]
    ]
  },
  {
    name: 'North Side',
    paths: [
      [-96.34341, 30.61017],
      [-96.34865, 30.61576],
      [-96.34342, 30.62012],
      [-96.34117, 30.6178],
      [-96.34111, 30.61552],
      [-96.34111, 30.61552],
      [-96.34341, 30.61017]
    ]
  },
  {
    name: 'White Creek',
    paths: [
      [-96.35636329650877, 30.603159762417967],
      [-96.3546895980835, 30.601479076319496],
      [-96.34576320648193, 30.608349389292403],
      [-96.35080575942992, 30.61368647349551],
      [-96.35960340499878, 30.606576451950794],
      [-96.35636329650877, 30.603159762417967]
    ]
  }
];
