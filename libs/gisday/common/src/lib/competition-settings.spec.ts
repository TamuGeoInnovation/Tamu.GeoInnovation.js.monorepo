import { awardsSession, competitionSession, reviewEmailValues, ReviewEmailSession } from './review-email';
import { competitionSettings, finalistsNotifiedAt, seasonCompetitions } from './season-competitions';

/**
 * #3019, decided 6A and 7A: a season names each competition's sessions and when its finalists hear, on its rows of
 * `season_competitions`. The pages and the acceptance emails use the chosen session, and fall back to the
 * `COMPETITION:` / `AWARDS:` names when none is chosen, so a season set before this reads as it did.
 */
describe('competition settings', () => {
  const session = (guid: string, name: string): ReviewEmailSession => ({ guid, name });
  const sessions = [
    session('named-poster', 'COMPETITION: Student Poster Competition'),
    session('named-undergraduate', 'COMPETITION: Undergraduate Research Competition'),
    session('named-graduate', 'COMPETITION: Graduate Student Research'),
    session('named-awards', 'AWARDS: Student Presentation & Poster Competition Winner Announcements'),
    session('chosen-poster', 'Poster gallery walk'),
    session('chosen-undergraduate', 'Undergraduate talks'),
    session('chosen-graduate', 'Graduate talks'),
    session('chosen-awards', 'Closing ceremony')
  ];
  /** A season whose rows only hold settings (`runs` empty): it still runs every competition. */
  const season = {
    competitions: [
      {
        competitionType: 'poster',
        runs: null,
        sessionGuid: 'chosen-poster',
        awardsSessionGuid: 'chosen-awards',
        finalistsNotifiedAt: '2027-11-13T18:00:00.000Z'
      },
      {
        competitionType: 'presentation',
        runs: null,
        sessionGuid: 'chosen-undergraduate',
        graduateSessionGuid: 'chosen-graduate',
        awardsSessionGuid: null,
        finalistsNotifiedAt: null
      }
    ]
  };

  it('runs every competition when its rows hold only settings', () => {
    expect(seasonCompetitions(season)).toEqual(['poster', 'presentation', 'paper', 'cartography']);
    // A row from before #3019, with no `runs`, still means the season runs that competition.
    expect(seasonCompetitions({ competitions: [{ competitionType: 'poster' }] })).toEqual(['poster']);
    expect(
      seasonCompetitions({ competitions: [{ competitionType: 'poster', runs: true }, season.competitions[1]] })
    ).toEqual(['poster']);
  });

  it("gives a competition's settings, or none", () => {
    expect(competitionSettings(season, 'poster')?.sessionGuid).toBe('chosen-poster');
    expect(competitionSettings(season, 'paper')).toBeNull();
    expect(competitionSettings(null, 'poster')).toBeNull();
  });

  it('finds the chosen session over the one the names point to', () => {
    expect(competitionSession(sessions, 'poster', null, season)?.guid).toBe('chosen-poster');
    expect(competitionSession(sessions, 'presentation', 'undergraduate', season)?.guid).toBe('chosen-undergraduate');
    expect(competitionSession(sessions, 'presentation', 'graduate', season)?.guid).toBe('chosen-graduate');
    expect(awardsSession(sessions, season, 'poster')?.guid).toBe('chosen-awards');
  });

  it("falls back to the names when none is chosen, or the chosen one is not among the season's sessions", () => {
    expect(competitionSession(sessions, 'poster', null)?.guid).toBe('named-poster');
    expect(awardsSession(sessions, season, 'presentation')?.guid).toBe('named-awards');
    expect(awardsSession(sessions)?.guid).toBe('named-awards');

    const gone = { competitions: [{ competitionType: 'poster', runs: null, sessionGuid: 'deleted-session' }] };
    expect(competitionSession(sessions, 'poster', null, gone)?.guid).toBe('named-poster');
  });

  it('gives when finalists hear, or nothing when it is not set', () => {
    expect(finalistsNotifiedAt(season, 'poster')?.toISOString()).toBe('2027-11-13T18:00:00.000Z');
    expect(finalistsNotifiedAt(season, 'presentation')).toBeNull();
    expect(finalistsNotifiedAt(null, 'poster')).toBeNull();
  });

  it("names the chosen sessions in the acceptance email, from the submission's season", () => {
    const values = reviewEmailValues(
      { title: 'T', participants: [], submissionType: 'presentation', classificationType: 'graduate', season },
      { name: 'TxGIS Day', address: 'https://txgisday.org' },
      sessions
    );

    expect(values['{your session}']).toContain('Graduate talks');
    expect(values['{awards session}']).toContain('AWARDS: Student Presentation');
  });
});
