import { attributeOf, TripPoint, TripPointAttributes } from './trip-planner-core';

/**
 * A stop's attributes are read whatever their case (#2707). The buildings service publishes `latitude`, `number` and
 * `bldg_number`; the services stops came from before it publish `Latitude`, `Number` and `Bldg_Number`.
 */
describe('attributeOf', () => {
  it('reads a field from the buildings service by the name the other services use', () => {
    const building = { number: '0468', latitude: 30.616607, bldg_number: '0468' };

    expect(attributeOf(building, 'Number')).toBe('0468');
    expect(attributeOf(building, 'Latitude')).toBe('30.616607');
    expect(attributeOf(building, 'Bldg_Number')).toBe('0468');
  });

  it('still reads a field spelled as the name asks', () => {
    expect(attributeOf({ Latitude: '30.6' }, 'Latitude')).toBe('30.6');
  });

  it('treats a missing, null or empty field as absent', () => {
    expect(attributeOf({ number: '' }, 'Number')).toBeUndefined();
    expect(attributeOf({ number: null }, 'Number')).toBeUndefined();
    expect(attributeOf({}, 'Number')).toBeUndefined();
    expect(attributeOf(undefined, 'Number')).toBeUndefined();
  });
});

/**
 * A stop set by clicking the map is named after the feature clicked (#2723). Nature Rx names its spaces in `area_name`,
 * which the stop did not read, so a click on Eli Whitely Park's marker set a stop reading `30.6146, -96.3493`.
 */
describe('a stop set by a map click', () => {
  const clicked = (attributes?: Record<string, unknown>) =>
    new TripPoint({
      source: 'map-event',
      originAttributes: attributes as unknown as TripPointAttributes,
      originGeometry: { latitude: 30.614612, longitude: -96.349321 },
      originParameters: { type: 'map-event', value: { latitude: 30.614612, longitude: -96.349321 } }
    }).normalize().attributes.name;

  it("is named after a Nature Rx space's area_name", () => {
    expect(clicked({ objectid: 7, area_name: 'Eli Whitely Park', location: 'Southside' })).toBe('Eli Whitely Park');
  });

  it('is still named after a building or a lot', () => {
    expect(clicked({ bldgname: 'Harrington Education Center Office Tower' })).toBe('Harrington Education Center Office Tower');
    expect(clicked({ lotname: 'Lot 100g' })).toBe('Lot 100g');
  });

  it('is named by its coordinates on bare ground', () => {
    expect(clicked()).toBe('30.6146, -96.3493');
  });
});
