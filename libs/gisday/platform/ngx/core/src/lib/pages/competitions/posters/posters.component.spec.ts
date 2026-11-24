import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { of } from 'rxjs';

import { ReviewEmailSession } from '@tamu-gisc/gisday/common';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import {
  COMPETITION_SESSIONS,
  COMPETITION_SESSIONS_2027,
  provideCompetitionSessions
} from '../competition-session/competition-session.testing';
import { PostersComponent } from './posters.component';

/**
 * #2663. The 2026 deadline for submissions moved from Monday, November 9 to Friday, November 13, 5:00 PM Central,
 * and finalists hear on Saturday, November 14.
 */
describe('PostersComponent', () => {
  /** 2026's poster deadline, as production's season has it. */
  const SEASON_2026 = { posterSubmissionsCloseAt: '2026-11-13T23:00:00.000Z' };

  function text(season: object = SEASON_2026, sessions: Array<ReviewEmailSession> = COMPETITION_SESSIONS) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideCompetitionSessions(of(sessions)),
        { provide: SeasonService, useValue: { activeSeason$: of(season) } }
      ]
    });

    const fixture = TestBed.createComponent(PostersComponent);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent;
  }

  it("gives the season's deadline, Friday, November 13, and Saturday, November 14 for finalists", () => {
    const rendered = text();

    expect(rendered).toContain('Due: Fri, Nov 13, 2026, 5:00 PM Central');
    expect(rendered).toContain('notified on Saturday November 14th, 2026');
  });

  // #3019: the page's day and deadline were typed in for 2026, and would have been wrong the next year.
  it('takes its day from the poster session and its deadline from the season, whatever the year', () => {
    const rendered = text({ posterSubmissionsCloseAt: '2027-11-12T23:00:00.000Z' }, COMPETITION_SESSIONS_2027);

    expect(rendered).toContain('Tuesday, November 16, 2027');
    expect(rendered).toContain('Due: Fri, Nov 12, 2027, 5:00 PM Central');
    expect(rendered).toContain('during the Poster Competition Session (Tuesday, November 16, 2027)');
    expect(rendered).not.toContain('November 17th');
    expect(rendered).not.toContain('November 13th, 2026');
  });

  it('says the deadline is to be announced, and gives no day, when the season has neither', () => {
    const rendered = text({}, []);

    expect(rendered).toContain('Due: to be announced');
    expect(rendered).toContain('during the Poster Competition Session.');
    expect(rendered).not.toContain('November 17th');
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

  // #3011. The session moved and the page still gave the old room, typed in.
  it('gives the poster session as the database has it', () => {
    const rendered = text();

    expect(rendered).toContain('COMPETITION: Student Poster Competition');
    expect(rendered).toContain('Time: 4:15 to 5:15 PM');
    expect(rendered).toContain('Bethancourt Ballroom 2300 C');
    expect(rendered).toContain('Time: 1:00 to 1:15 PM');
    expect(rendered).not.toContain('Gates Ballroom 2400');
  });
});
