import { competitionTypesValue, notRunningMessage, runsCompetition, seasonCompetitions } from './season-competitions';

/** A season as the API loads it, with its rows of `season_competitions` (#2948). */
const running = (...types: Array<string>) => ({ competitions: types.map((competitionType) => ({ competitionType })) });

/** #2948: which research competitions a season runs. */
describe('season competitions', () => {
  it('runs every competition when the season has no rows, as every season did before', () => {
    expect(seasonCompetitions(null)).toEqual(['poster', 'presentation', 'paper', 'cartography']);
    expect(seasonCompetitions({ competitions: null })).toEqual(['poster', 'presentation', 'paper', 'cartography']);
    expect(seasonCompetitions(running())).toEqual(['poster', 'presentation', 'paper', 'cartography']);
  });

  it('runs only those it has rows for, in the admin page order, ignoring anything it does not know', () => {
    expect(seasonCompetitions(running('presentation', 'poster', 'vgi'))).toEqual(['poster', 'presentation']);
    expect(runsCompetition(running('poster'), 'poster')).toBe(true);
    expect(runsCompetition(running('poster'), 'paper')).toBe(false);
  });

  it('stores every competition as no rows, and a choice in order', () => {
    expect(competitionTypesValue(['cartography', 'paper', 'presentation', 'poster'])).toEqual([]);
    expect(competitionTypesValue(['presentation', 'poster'])).toEqual(['poster', 'presentation']);
  });

  it('names the competition for the student', () => {
    expect(notRunningMessage('paper')).toBe('The paper competition is not running this season.');
  });
});
