import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';

import { ReviewEmailSession } from '@tamu-gisc/gisday/common';

import { CompetitionSessionComponent, CompetitionSessionKind } from './competition-session.component';
import { COMPETITION_SESSIONS, provideCompetitionSessions } from './competition-session.testing';

/** #3011. A competition's session as the database has it, not as someone typed it into the page. */
describe('CompetitionSessionComponent', () => {
  function render(kind: CompetitionSessionKind, sessions = provideCompetitionSessions()) {
    TestBed.configureTestingModule({ providers: [provideRouter([]), sessions] });

    const fixture = TestBed.createComponent(CompetitionSessionComponent);
    fixture.componentRef.setInput('kind', kind);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it.each([
    [
      'undergraduate',
      'COMPETITION: Undergraduate Research Competition',
      'Tuesday, November 17, 2026',
      '2:00 to 2:40 PM',
      '/sessions/details/u'
    ],
    [
      'graduate',
      'COMPETITION: Graduate Student Research',
      'Tuesday, November 17, 2026',
      '2:40 to 4:00 PM',
      '/sessions/details/g'
    ],
    [
      'poster',
      'COMPETITION: Student Poster Competition',
      'Tuesday, November 17, 2026',
      '4:15 to 5:15 PM',
      '/sessions/details/p'
    ],
    [
      'awards',
      'AWARDS: Student Presentation & Poster Competition Winner Announcements',
      'Thursday, November 19, 2026',
      '1:00 to 1:15 PM',
      '/sessions/details/a'
    ]
  ] as const)('gives the %s session its name, linked, and its day, time and room', (kind, name, day, time, link) => {
    const page = render(kind);
    const anchor = page.querySelector('a');

    expect(anchor.textContent.trim()).toBe(name);
    expect(anchor.getAttribute('href')).toBe(link);
    expect(page.textContent).toContain(`Date: ${day}`);
    expect(page.textContent).toContain(`Time: ${time}`);
    expect(page.textContent).toContain('Location: TAMU Memorial Student Center Bethancourt Ballroom 2300');
  });

  it('shows nothing while the sessions load', () => {
    const page = render('poster', provideCompetitionSessions(new Subject<Array<ReviewEmailSession>>()));

    expect(page.textContent.trim()).toBe('');
  });

  it('sends a reader to the schedule when the season has no such session', () => {
    const page = render('poster', provideCompetitionSessions(of(COMPETITION_SESSIONS.filter((s) => s.guid !== 'p'))));

    expect(page.textContent).toContain('on the schedule');
    expect(page.querySelector('a').getAttribute('href')).toBe('/sessions');
  });
});
