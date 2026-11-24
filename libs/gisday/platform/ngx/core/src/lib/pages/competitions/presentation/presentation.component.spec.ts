import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { ReviewEmailSession } from '@tamu-gisc/gisday/common';

import {
  COMPETITION_SESSIONS,
  COMPETITION_SESSIONS_2027,
  provideCompetitionSessions
} from '../competition-session/competition-session.testing';
import { PresentationComponent } from './presentation.component';

/**
 * #2663. The 2026 deadline for submissions moved from Monday, November 9 to Friday, November 13, 5:00 PM Central,
 * and finalists hear on Saturday, November 14.
 */
describe('PresentationComponent', () => {
  /** 2026's deadlines, as production's season has them. */
  const SEASON_2026 = {
    presentationSubmissionsCloseAt: '2026-11-13T23:00:00.000Z',
    presentationFilesCloseAt: '2026-11-16T18:00:00.000Z'
  };

  function text(season: object = SEASON_2026, sessions: Array<ReviewEmailSession> = COMPETITION_SESSIONS) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideCompetitionSessions(of(sessions)),
        { provide: SeasonService, useValue: { activeSeason$: of(season) } }
      ]
    });

    const fixture = TestBed.createComponent(PresentationComponent);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent;
  }

  it("gives the season's deadline, Friday, November 13", () => {
    expect(text()).toContain('Due: Fri, Nov 13, 2026, 5:00 PM Central');
  });

  // #3019, decided 7A: when finalists hear is the season's, set in Admin; without it the line is left out.
  it('says when finalists hear, from the season', () => {
    const notified = {
      ...SEASON_2026,
      competitions: [{ competitionType: 'presentation', runs: null, finalistsNotifiedAt: '2027-11-13T18:00:00.000Z' }]
    };

    expect(text(notified)).toContain('Finalists will be notified on Sat, Nov 13, 2027, 12:00 PM Central');
  });

  it('leaves the finalists line out when the season has not set when they hear', () => {
    expect(text()).not.toContain('Finalists will be notified');
  });

  // #3019, decided 6A: the session the season chose in Admin, over the one its name points to.
  it('names the session the season chose, and takes its day from it', () => {
    const chosen = { ...COMPETITION_SESSIONS.find((s) => s.guid === 'u'), guid: 'chosen', name: 'Undergraduate talks', day: { date: '2026-11-18T06:00:00.000Z' } };
    const season = { ...SEASON_2026, competitions: [{ competitionType: 'presentation', runs: null, sessionGuid: 'chosen' }] };
    const rendered = text(season, [...COMPETITION_SESSIONS, chosen]);

    expect(rendered).toContain('Undergraduate talks');
    expect(rendered).toContain('Wednesday, November 18, 2026');
  });

  // #3019: the page's day and deadline were typed in for 2026, and would have been wrong the next year.
  it('takes its day from the competition sessions and its deadline from the season, whatever the year', () => {
    const rendered = text({ presentationSubmissionsCloseAt: '2027-11-12T23:00:00.000Z' }, COMPETITION_SESSIONS_2027);

    expect(rendered).toContain('Tuesday, November 16, 2027');
    expect(rendered).toContain('Due: Fri, Nov 12, 2027, 5:00 PM Central');
    expect(rendered).not.toContain('November 17th, 2026');
    expect(rendered).not.toContain('November 13th, 2026');
  });

  it('says the deadline is to be announced, and gives no day, when the season has neither', () => {
    const rendered = text({}, []);

    expect(rendered).toContain('Due: to be announced');
    expect(rendered).not.toContain('November 17th, 2026');
  });

  it('no longer gives the old deadline', () => {
    const rendered = text();

    expect(rendered).not.toContain('November 9th');
    expect(rendered).not.toContain('November 11th');
  });

  // #2676. The Center for Teaching Excellence no longer provides the prizes; the amounts stay.
  it('no longer credits the prizes to the Center for Teaching Excellence', () => {
    const rendered = text();

    expect(rendered).not.toContain('Center for Teaching Excellence');
    expect(rendered).not.toContain('Montague-CTE');
    expect(rendered).toContain('$250');
  });

  // #3011. The sessions moved and the page still gave the old times and rooms, typed in; and finalists have 5 minutes.
  it('gives each session as the database has it, and 5 minutes in all for a talk', () => {
    const rendered = text();

    expect(rendered).toContain('COMPETITION: Undergraduate Research Competition');
    expect(rendered).toContain('Time: 2:00 to 2:40 PM');
    expect(rendered).toContain('COMPETITION: Graduate Student Research');
    expect(rendered).toContain('Time: 2:40 to 4:00 PM');
    expect(rendered).toContain('Time: 1:00 to 1:15 PM');
    expect(rendered).toContain('5 minutes in all, questions included');
    expect(rendered).not.toContain('Gates Ballroom 2400');
    expect(rendered).not.toContain('3:00 - 4:00 PM');
    expect(rendered).not.toContain('10 minute');
  });

  // #3015. Finalists who don't upload their final slides by the file deadline are removed; the page has to say so.
  it("says finalists' slides are due by the season's presentation file deadline, or they are removed", () => {
    const rendered = text();

    expect(rendered).toContain(
      'Finalists must upload their final presentation slides through the site by Mon, Nov 16, 2026, 12:00 PM Central, or they will be removed from the competition.'
    );
  });

  it('names the deadline without a date when the season has none set', () => {
    expect(text({})).toContain(
      'by the final presentation submission deadline, or they will be removed from the competition.'
    );
  });
});
