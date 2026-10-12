import { inferEmergencyType, isMonthlyTest, EMERGENCY_TYPES } from './code-maroon.taxonomy';

/**
 * The type is inferred from the alert text, because the feed carries no type field we know of
 * (#1289). These pin the two things that matter: that a confident match sends someone to the right
 * procedure, and that an unconfident one sends them nowhere rather than somewhere wrong.
 */
describe('inferring the emergency type', () => {
  it.each([
    ['Tornado Warning for Brazos County', 'tornado'],
    ['Active shooter reported near Rudder', 'active-threat'],
    ['Gas leak reported near Zachry', 'gas-leak'],
    ['Hazardous material spill on Ross Street', 'hazmat'],
    ['Severe thunderstorm warning until 6pm', 'severe-thunderstorm'],
    ['Bomb threat reported, evacuate', 'bomb-threat']
  ])('reads "%s" as %s', (title, expected) => {
    expect(inferEmergencyType(title)?.id).toBe(expected);
  });

  it('gives no type when nothing matches, rather than guessing', () => {
    // A wrong procedure link during an emergency is worse than none. The overlay falls back to the
    // university's index when this returns undefined.
    expect(inferEmergencyType('Campus will close early today')).toBeUndefined();
  });

  it('prefers the headline over the body', () => {
    // The nature of an alert is stated in its title; the body may mention other things in passing.
    const type = inferEmergencyType('Tornado Warning', 'Reports of a gas leak are unconfirmed.');

    expect(type?.id).toBe('tornado');
  });

  it('reads the monthly test as no emergency type', () => {
    // The real wording, as published. A test is not an emergency type and must not be given one.
    const title = 'This is the monthly test of the emergency notification system - No Action Required';

    expect(inferEmergencyType(title)).toBeUndefined();
    expect(isMonthlyTest(title)).toBe(true);
  });

  it('does not call a real alert a test', () => {
    expect(isMonthlyTest('Tornado Warning for Brazos County')).toBe(false);
  });

  it('points every type at a university procedure page', () => {
    // The instructions shown to someone in an emergency should be the university's, not ours.
    EMERGENCY_TYPES.forEach((type) => {
      expect(type.procedure).toMatch(/^https:\/\/em\.tamu\.edu\/emergency-procedures\//);
      expect(type.hints.length).toBeGreaterThan(0);
    });
  });
});
