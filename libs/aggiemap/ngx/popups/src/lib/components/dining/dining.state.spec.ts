import { diningStateAbbreviation } from './dining.component';

/**
 * The dining service publishes the state inconsistently (#954). Counted over all 54 locations on
 * 25 November 2026: `'TX'` 35 times, `'Texas'` 15, `'texas'` 3, and one empty. The popup rendered it straight out,
 * so the same address line read "College Station, TX" on some locations and "College Station, texas" on others.
 *
 * The four values measured that day are each a case here, so this records what was actually seen rather than what
 * was expected to be seen.
 */
describe('diningStateAbbreviation (#954)', () => {
  it.each([
    ['TX', 'TX'],
    ['Texas', 'TX'],
    ['texas', 'TX'],
    ['  texas  ', 'TX'],
    ['TEXAS', 'TX'],
    ['tx', 'TX']
  ])('reads %p as %p', (published, expected) => {
    expect(diningStateAbbreviation(published)).toBe(expected);
  });

  it('gives an empty string for a state that is missing, so its separator can be dropped', () => {
    expect(diningStateAbbreviation('')).toBe('');
    expect(diningStateAbbreviation('   ')).toBe('');
    expect(diningStateAbbreviation(null)).toBe('');
    expect(diningStateAbbreviation(undefined)).toBe('');
  });

  it('leaves a state it cannot know about as published', () => {
    // A location outside Texas, were one ever added, is shown as the service publishes it rather than guessed at.
    expect(diningStateAbbreviation('Oklahoma')).toBe('Oklahoma');
    expect(diningStateAbbreviation('OK')).toBe('OK');
  });

  it('does not match a value that merely contains Texas', () => {
    expect(diningStateAbbreviation('Texas Avenue')).toBe('Texas Avenue');
    expect(diningStateAbbreviation('East Texas')).toBe('East Texas');
  });
});
