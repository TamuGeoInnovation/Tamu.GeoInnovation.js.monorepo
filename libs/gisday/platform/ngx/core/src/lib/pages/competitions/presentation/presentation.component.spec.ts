import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { provideCompetitionSessions } from '../competition-session/competition-session.testing';
import { PresentationComponent } from './presentation.component';

/**
 * #2663. The 2026 deadline for submissions moved from Monday, November 9 to Friday, November 13, 5:00 PM Central,
 * and finalists hear on Saturday, November 14.
 */
describe('PresentationComponent', () => {
  function text(season: object = { presentationFilesCloseAt: '2026-11-16T18:00:00.000Z' }) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideCompetitionSessions(),
        { provide: SeasonService, useValue: { activeSeason$: of(season) } }
      ]
    });

    const fixture = TestBed.createComponent(PresentationComponent);
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
