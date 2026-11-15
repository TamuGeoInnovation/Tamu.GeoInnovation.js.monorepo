import { competitionTypesValue, notRunningMessage, runsCompetition, seasonCompetitions } from './season-competitions';

/** #2948: which research competitions a season runs. */
describe('season competitions', () => {
  it('runs every competition when the season names none, as every season did before', () => {
    expect(seasonCompetitions(null)).toEqual(['poster', 'presentation', 'paper', 'cartography']);
    expect(seasonCompetitions({ competitionTypes: null })).toEqual(['poster', 'presentation', 'paper', 'cartography']);
    expect(seasonCompetitions({ competitionTypes: '' })).toEqual(['poster', 'presentation', 'paper', 'cartography']);
  });

  it('runs only those it names, in the admin page order, ignoring anything it does not know', () => {
    expect(seasonCompetitions({ competitionTypes: 'presentation, poster,vgi' })).toEqual(['poster', 'presentation']);
    expect(runsCompetition({ competitionTypes: 'poster' }, 'poster')).toBe(true);
    expect(runsCompetition({ competitionTypes: 'poster' }, 'paper')).toBe(false);
  });

  it('stores every competition as empty and a choice in order', () => {
    expect(competitionTypesValue(['cartography', 'paper', 'presentation', 'poster'])).toBeNull();
    expect(competitionTypesValue(['presentation', 'poster'])).toBe('poster,presentation');
  });

  it('names the competition for the student', () => {
    expect(notRunningMessage('paper')).toBe('The paper competition is not running this season.');
  });
});
