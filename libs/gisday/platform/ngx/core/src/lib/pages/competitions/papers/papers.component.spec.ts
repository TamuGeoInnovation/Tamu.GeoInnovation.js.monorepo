import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { COMPETITION_SESSIONS_2027, provideCompetitionSessions } from '../competition-session/competition-session.testing';
import { PapersComponent } from './papers.component';

/**
 * #3321. The Papers page still carried 2020's text: its deadline, when finalists heard, its session's day, time and room,
 * and the awards' day. Its deadline and finalists date now come from the season's Paper competition settings, as the
 * Posters and Presentation pages' do (#3309, #3019), and the rest of 2020's dates are gone. Red on today's code.
 */
describe('PapersComponent (#3321)', () => {
  /** A made-up 2027 season: the paper deadline, Friday, November 12, 5:00 PM Central. */
  const SEASON_2027 = { paperSubmissionsCloseAt: '2027-11-12T23:00:00.000Z' };

  function text(season: object = SEASON_2027) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideCompetitionSessions(of(COMPETITION_SESSIONS_2027)),
        { provide: SeasonService, useValue: { activeSeason$: of(season) } }
      ]
    });

    const fixture = TestBed.createComponent(PapersComponent);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent;
  }

  it("gives the season's paper deadline", () => {
    expect(text()).toContain('Due: Fri, Nov 12, 2027, 5:00 PM Central');
  });

  it('says the deadline is to be announced when the season has none', () => {
    expect(text({})).toContain('Due: to be announced');
  });

  it("says when finalists hear, from the season's Paper competition settings", () => {
    const notified = {
      ...SEASON_2027,
      competitions: [{ competitionType: 'paper', runs: null, finalistsNotifiedAt: '2027-11-13T18:00:00.000Z' }]
    };

    expect(text(notified)).toContain('Finalists will be notified on Sat, Nov 13, 2027, 12:00 PM Central');
  });

  it('leaves the finalists line out when the season has not set when they hear', () => {
    expect(text()).not.toContain('Finalists will be notified');
  });

  it('names the awards session, as the other competition pages do', () => {
    expect(text()).toContain('AWARDS: Student Presentation & Poster Competition Winner Announcements');
  });

  it("carries none of 2020's dates, times or rooms", () => {
    const rendered = text();

    expect(rendered).not.toContain('2020');
    expect(rendered).not.toContain('November 17');
    expect(rendered).not.toContain('November 18');
    expect(rendered).not.toContain('2:15pm');
    expect(rendered).not.toContain('2406B');
  });
});
