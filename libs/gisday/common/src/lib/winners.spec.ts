import { WINNER_COMPETITIONS, placeLabel, trailChoicesProblem, winnerChoicesProblem, winnersShown } from './winners';

/** #3239: a season's winners, as the API enforces them and the homepage shows them. Made-up entries only. */
describe('winners', () => {
  describe('winnersShown', () => {
    const days = [{ date: '2026-11-16T06:00:00.000Z' }, { date: '2026-11-20T06:00:00.000Z' }];

    it('is false on the last day, in Central time', () => {
      // 11:30 PM Central on Friday 20 November.
      expect(winnersShown(days, new Date('2026-11-21T05:30:00.000Z'))).toBe(false);
    });

    it('is true from the day after the last day', () => {
      // 12:30 AM Central on Saturday 21 November.
      expect(winnersShown(days, new Date('2026-11-21T06:30:00.000Z'))).toBe(true);
    });

    it('is false before the season, and for a season with no days', () => {
      expect(winnersShown(days, new Date('2026-11-01T12:00:00.000Z'))).toBe(false);
      expect(winnersShown([], new Date('2027-01-01T12:00:00.000Z'))).toBe(false);
      expect(winnersShown(undefined)).toBe(false);
    });
  });

  it('lists the four judged competitions, then the trail challenge', () => {
    expect(WINNER_COMPETITIONS.map((c) => c.competition)).toEqual([
      'graduate-poster',
      'undergraduate-poster',
      'graduate-presentation',
      'undergraduate-presentation',
      'trail'
    ]);
  });

  it('names the places', () => {
    expect([1, 2, 3].map(placeLabel)).toEqual(['1st', '2nd', '3rd']);
  });

  describe('winnerChoicesProblem', () => {
    const choice = (place: number, submission: string | null, competition = 'graduate-poster') => ({
      competition,
      place,
      submission
    });

    it('accepts three places, and a place left empty', () => {
      expect(winnerChoicesProblem([choice(1, 'a'), choice(2, 'b'), choice(3, null)])).toBeNull();
      expect(winnerChoicesProblem([])).toBeNull();
    });

    it('refuses a place outside 1st to 3rd, or outside the judged competitions', () => {
      expect(winnerChoicesProblem([choice(4, 'a')])).toBe('Each place must be 1st, 2nd or 3rd.');
      expect(winnerChoicesProblem([choice(1, 'a', 'trail')])).toBe('Each place must be in a research competition.');
    });

    it('refuses a place sent twice, and a submission in two places', () => {
      expect(winnerChoicesProblem([choice(1, 'a'), choice(1, 'b')])).toBe('1st place was sent twice for one competition.');
      expect(winnerChoicesProblem([choice(1, 'a'), choice(2, 'a')])).toBe(
        'A submission can win only one place in its competition.'
      );
    });

    it('lets one submission id stand in two competitions, which cannot happen but is not its to judge', () => {
      expect(winnerChoicesProblem([choice(1, 'a'), choice(1, 'a', 'undergraduate-poster')])).toBeNull();
    });

    it('refuses anything that is not a list', () => {
      expect(winnerChoicesProblem({})).toBe('Send the places as a list.');
    });
  });

  /** #3243: the trail challenge's places, by account. */
  describe('trailChoicesProblem', () => {
    it('accepts three places, and a place left empty', () => {
      expect(
        trailChoicesProblem([
          { place: 1, account: 'a' },
          { place: 2, account: 'b' },
          { place: 3, account: null }
        ])
      ).toBeNull();
    });

    it('refuses a place outside 1st to 3rd, a place sent twice, and one person in two places', () => {
      expect(trailChoicesProblem([{ place: 4, account: 'a' }])).toBe('Each place must be 1st, 2nd or 3rd.');
      expect(
        trailChoicesProblem([
          { place: 1, account: 'a' },
          { place: 1, account: 'b' }
        ])
      ).toBe('1st place was sent twice.');
      expect(
        trailChoicesProblem([
          { place: 1, account: 'a' },
          { place: 2, account: 'a' }
        ])
      ).toBe('A person can win only one place.');
      expect(trailChoicesProblem('a')).toBe('Send the places as a list.');
    });
  });
});
