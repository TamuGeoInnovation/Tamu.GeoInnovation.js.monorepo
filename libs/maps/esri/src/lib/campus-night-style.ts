/**
 * The campus vector basemap at night: a paint for each of its style layers, after the way night maps are drawn (Google's
 * night style, Apple Maps' dark appearance, Esri's Navigation (Dark)) rather than the day map dimmed.
 *
 * - The ground is a deep blue-grey, not black and not the day colours darkened.
 * - Roads, drives and walks are lighter than the ground, so the network a visitor follows is what reads first.
 * - Grass, trees and water lose most of their colour: dark green-grey and blue-black, there but quiet.
 * - Buildings sit a step above the ground. University buildings keep a maroon cast, so campus is still Aggie at night.
 * - Every label is light on a dark halo. Nothing is black.
 *
 * Keyed by the style's layer ids (VTBase3, `aggiemapVectorBasemap`; the dated vector basemaps on dev share them). A layer
 * this does not name is left as it is. Applied and undone by `followPageThemeOnBasemap` (page-theme.ts) with the layer's
 * own `setPaintProperties`, so the change is live, needs no second tile service, and reverses at sunrise.
 */
export const NIGHT = {
  ground: '#1a2029',
  campus: '#1c2420',
  grass: '#1f2c25',
  grassStrong: '#22342a',
  water: '#0e1823',
  waterEdge: '#1b2c3c',
  pavement: '#2e3540',
  pavementEdge: '#3a424e',
  road: '#3a424f',
  roadCasing: '#262c35',
  walk: '#343b46',
  parking: '#252b34',
  parkingEdge: '#363d48',
  building: '#342a2f',
  buildingEdge: '#4f3038',
  otherBuilding: '#30343c',
  otherBuildingEdge: '#454a54',
  garage: '#26324a',
  garageEdge: '#3a5584',
  label: '#d9dee5',
  labelMuted: '#9aa3ae',
  buildingLabel: '#f1e6e7'
} as const;

export type NightPaint = Record<string, string | number>;

const fill = (color: string, outline?: string): NightPaint =>
  outline ? { 'fill-color': color, 'fill-outline-color': outline } : { 'fill-color': color };
const line = (color: string): NightPaint => ({ 'line-color': color });
const text = (color: string, halo: string): NightPaint => ({ 'text-color': color, 'text-halo-color': halo });

/**
 * Night paint by style layer id. A key ending in `*` matches every id that starts with the rest.
 */
export const CAMPUS_NIGHT_PAINT: Record<string, NightPaint> = {
  // Ground: the county outside campus, the campus itself (a touch greener), and its railroad right of way.
  'TxDOT Bryan District County Boundary': fill(NIGHT.ground, NIGHT.ground),
  'County Boundary': fill(NIGHT.ground),
  'Campus Background/Campus Boundary/1': fill(NIGHT.campus),
  'Campus Background/Railroad ROW/2': { 'fill-opacity': 0.25 },
  'Campus Background/Railroad ROW/1': { 'fill-opacity': 0.25 },
  'Campus Background/Railroad ROW/0': line('#4a525e'),

  // Roads: the surface lighter than the ground, edges darker than the surface.
  'Road Names/*': line(NIGHT.road),
  'Brazos County Road Centerline/Overpass/1': line(NIGHT.pavementEdge),
  'Brazos County Road Centerline/Major Street/1': line(NIGHT.pavementEdge),
  'Brazos County Road Centerline/Local Street/1': line(NIGHT.pavementEdge),
  'Brazos County Road Centerline/Access Road/1': line(NIGHT.pavementEdge),
  'Brazos County Road Centerline/Drivewway/1': line(NIGHT.pavementEdge),
  'Brazos County Road Centerline/Overpass/0': line(NIGHT.road),
  'Brazos County Road Centerline/Major Street/0': line(NIGHT.road),
  'Brazos County Road Centerline/Local Street/0': line(NIGHT.road),
  'Brazos County Road Centerline/Access Road/0': line(NIGHT.road),
  'Brazos County Road Centerline/Drivewway/0': line(NIGHT.road),
  'Brazos County Road Centerline/Overpass_1': line(NIGHT.roadCasing),
  'Brazos County Road Centerline/Major Street_1': line(NIGHT.roadCasing),
  'Brazos County Road Centerline/Local Street_1': line(NIGHT.roadCasing),
  'Brazos County Road Centerline/Access Road_1': line(NIGHT.roadCasing),
  'Brazos County Road Centerline/Drivewway_1': line(NIGHT.roadCasing),
  'Street Pavement': fill(NIGHT.pavement, NIGHT.pavementEdge),
  'Campus Driveway/0': line(NIGHT.pavement),
  'Railroad Crossing': fill(NIGHT.pavement, NIGHT.pavementEdge),
  'Airport Runway': fill(NIGHT.pavement, NIGHT.pavementEdge),
  'Restricted Street 6am - 6pm': fill('#463c2b', '#463c2b'),
  'Wall Area/1': fill(NIGHT.pavementEdge),

  // Water: darker than the ground.
  'Brazos River/1': fill(NIGHT.water),
  'Brazos River/0': line(NIGHT.waterEdge),
  Stream: line(NIGHT.waterEdge),
  'Pond/1': fill(NIGHT.water),
  'Pond/0': line(NIGHT.waterEdge),
  'Fountain/1': fill('#13263a'),
  'Fountain/0': line('#26405a'),

  // Green: almost colourless. Trees are sprite icons, so they are faded rather than recoloured.
  'Land Use/Park or Garden': fill(NIGHT.grass),
  'Golf Course/Practice': fill(NIGHT.grass),
  'Golf Course/Course': fill(NIGHT.grass, NIGHT.ground),
  'Golf Course/Fairway': fill(NIGHT.grass),
  'Golf Course/Greens and Tees': fill(NIGHT.grassStrong),
  'Golf Course/Sand': fill('#3b3a33', '#3b3a33'),
  // Faded hard: canopies overlap, so a moderate fade still left them the brightest thing on the map.
  'Trees/*': { 'icon-opacity': 0.2 },
  'Land Use/Electrical Substation/2': fill(NIGHT.otherBuilding),
  'Land Use/Electrical Substation/1': fill(NIGHT.otherBuildingEdge),
  'Land Use/Electrical Substation/0': line(NIGHT.otherBuildingEdge),

  // Fields and courts.
  'Sports and Rec Fields/Kyle Field Bevel/1': fill(NIGHT.otherBuilding),
  'Sports and Rec Fields/Kyle Text': fill('#8a2630', '#8a2630'),
  'Sports and Rec Fields/Grass and Turf Areas': fill(NIGHT.grassStrong, NIGHT.ground),
  'Sports and Rec Fields/Field Dirt Areas/2': fill('#463d30'),
  'Sports and Rec Fields/Field Dirt Areas/1': line('#5a4a33'),
  'Sports and Rec Fields/Track and Courts': fill('#45302d'),
  'Sports and Rec Fields/Sand Courts/2': fill('#3d3a30'),
  'Sports and Rec Fields/Sand Courts/0': line('#6a5a33'),
  'Field Lines': line('#56606b'),

  // Walks: a step lighter than the ground, so the way across campus shows.
  'Sidewalk/Sidewalks/1': fill(NIGHT.walk),
  'Sidewalk/Brick/1': fill('#4a2f27'),
  'Sidewalk/Monument': fill('#3e434c'),
  'Sidewalk/Curb Cut or Ramp/1': fill('#4a4436'),
  'Sidewalk/Deck/2': fill('#3a3631'),
  'Sidewalk/Deck/1': line('#4c4237'),
  'Sidewalk/Deck/0': fill('#4c4237'),
  'Sidewalk/Fire Lane/2': fill(NIGHT.walk),
  'Sidewalk/Fire Lane/1': line(NIGHT.walk),
  'Sidewalk/Gravel/2': fill(NIGHT.walk),
  'Sidewalk/Gravel/1': line(NIGHT.walk),
  Steps: line('#5a626d'),

  // Parking.
  'Private Parking Lot': fill(NIGHT.parking, NIGHT.parkingEdge),
  'Surface Parking': fill(NIGHT.parking, NIGHT.parkingEdge),
  'Parking Line/ADA': line('#3f7fe0'),
  'Parking Line/Bike': line('#4ea852'),
  'Parking Line/Ped': line('#7d8794'),
  'Parking Line/All Others': line('#46505b'),

  // Railroad: black on day, a mid grey at night.
  'Railroad/2': line('#5c6470'),
  'Railroad/1': line('#5c6470'),
  'Railroad/0': { 'icon-color': '#5c6470' },

  // Buildings.
  'Off Campus Building': fill(NIGHT.otherBuilding, NIGHT.otherBuildingEdge),
  'Campus Structures/Currently Under Construction/0': line('#8a8f99'),
  'Campus Structures/Non-University Building': fill(NIGHT.otherBuilding, NIGHT.otherBuildingEdge),
  'Campus Structures/Garage Parking': fill(NIGHT.garage, NIGHT.garageEdge),
  'Campus Structures/University Building': fill(NIGHT.building, NIGHT.buildingEdge),

  // Labels: light on a dark halo, each halo the colour of what it sits on.
  'Road Names/label/*': text(NIGHT.labelMuted, NIGHT.ground),
  'Surface Parking/label/Default': text(NIGHT.labelMuted, NIGHT.parking),
  'Land Use/label/Default': text('#b9c4b9', NIGHT.ground),
  'TxDOT Bryan District County Boundary/label/*': text('#78818c', NIGHT.ground),
  'Campus Structures/label/PvtGarage': text('#c7d3ea', NIGHT.garage),
  'Campus Structures/label/NonUni-*': text(NIGHT.label, NIGHT.otherBuilding),
  'Campus Structures/label/UniBldg-*': text(NIGHT.buildingLabel, NIGHT.building)
};

/**
 * The night paint for one style layer id, or undefined where the night style leaves it alone. An exact key wins over
 * a `*` prefix; among prefixes, the longest.
 */
export function campusNightPaint(styleLayerId: string): NightPaint | undefined {
  if (styleLayerId in CAMPUS_NIGHT_PAINT) {
    return CAMPUS_NIGHT_PAINT[styleLayerId];
  }

  const prefix = Object.keys(CAMPUS_NIGHT_PAINT)
    .filter((key) => key.endsWith('*') && styleLayerId.startsWith(key.slice(0, -1)))
    .sort((a, b) => b.length - a.length)[0];

  return prefix ? CAMPUS_NIGHT_PAINT[prefix] : undefined;
}
