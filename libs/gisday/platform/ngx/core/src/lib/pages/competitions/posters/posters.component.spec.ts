import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { provideCompetitionSessions } from '../competition-session/competition-session.testing';
import { PostersComponent } from './posters.component';

/**
 * #2663. The 2026 deadline for submissions moved from Monday, November 9 to Friday, November 13, 5:00 PM Central,
 * and finalists hear on Saturday, November 14.
 */
describe('PostersComponent', () => {
  function text() {
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideCompetitionSessions()] });

    const fixture = TestBed.createComponent(PostersComponent);
    fixture.detectChanges();

    return (fixture.nativeElement as HTMLElement).textContent;
  }

  it('gives Friday, November 13 as the deadline and Saturday, November 14 for finalists', () => {
    const rendered = text();

    expect(rendered).toContain('Friday November 13th, 2026');
    expect(rendered).toContain('notified on Saturday November 14th, 2026');
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
