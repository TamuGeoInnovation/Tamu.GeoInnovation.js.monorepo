import { attributeOf } from './trip-planner-core';

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
