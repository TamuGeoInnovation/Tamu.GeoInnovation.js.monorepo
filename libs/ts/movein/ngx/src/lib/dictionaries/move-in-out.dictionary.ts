import { ResidenceZones } from '../interfaces/move-in-out.interface';

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

export const RESIDENCES: ResidenceZones = {
  southSide: {
    name: 'South Side',
    halls: [
      {
        name: 'Appelt Hall',
        Bldg_Number: ['0293']
      },
      {
        name: 'Aston Hall',
        Bldg_Number: ['0447']
      },
      {
        name: 'Dun Hall',
        Bldg_Number: ['0442']
      },
      {
        name: 'Eppright Hall',
        Bldg_Number: ['0292']
      },
      {
        name: 'Hart Hall',
        Bldg_Number: ['0417']
      },
      {
        name: 'Kreuger Hall',
        Bldg_Number: ['0441']
      },
      {
        name: 'Mosher Hall',
        Bldg_Number: ['0433']
      },
      {
        name: 'Rudder Hall',
        Bldg_Number: ['0291']
      },
      {
        name: 'Underwood Hall',
        Bldg_Number: ['0394']
      },
      {
        name: 'Wells Hall',
        Bldg_Number: ['0290']
      }
    ]
  },
  northSide: {
    name: 'North Side',
    halls: [
      {
        name: 'Clements Hall',
        Bldg_Number: ['0548']
      },
      {
        name: 'Davis-Gary Hall',
        Bldg_Number: ['0415']
      },
      {
        name: 'Fowler Hall',
        Bldg_Number: ['0427']
      },
      {
        name: 'Haas Hall',
        Bldg_Number: ['0549']
      },
      {
        name: 'Hart Hall ',
        Bldg_Number: ['0417']
      },
      {
        name: 'Hobby Hall',
        Bldg_Number: ['0653']
      },
      {
        name: 'Hughes Hall',
        Bldg_Number: ['0426']
      },
      {
        name: 'Hullabaloo Hall',
        Bldg_Number: ['1416']
      },
      {
        name: 'Keathley Hall',
        Bldg_Number: ['0428']
      },
      {
        name: 'Lechner Hall',
        Bldg_Number: ['0294']
      },
      {
        name: 'Legett Hall',
        Bldg_Number: ['0419']
      },
      {
        name: 'McFadden Hall',
        Bldg_Number: ['0550']
      },
      {
        name: 'Moses Hall',
        Bldg_Number: ['0412']
      },
      {
        name: 'Neeley Hall',
        Bldg_Number: ['0652']
      },
      {
        name: 'Schuhmacher Hall',
        Bldg_Number: ['0430']
      },
      {
        name: 'Walton Hall',
        Bldg_Number: ['0430']
      }
    ]
  },
  whiteCreek: {
    name: 'White Creek',
    halls: [
      {
        name: 'White Creek Apartments',
        Bldg_Number: ['1590', '1591', '1592', '0064']
      }
    ]
  }
};
