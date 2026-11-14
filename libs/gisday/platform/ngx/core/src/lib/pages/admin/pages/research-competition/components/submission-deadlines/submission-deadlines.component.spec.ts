import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { DEADLINE_COMPETITIONS } from '@tamu-gisc/gisday/common';

import { SubmissionDeadlinesComponent } from './submission-deadlines.component';

/**
 * #2969: the Submission deadlines section took half the Research Competitions page. It is a panel, collapsed to a
 * one-line summary once a season has deadlines, and open to edit when it has none; open, it is one row per competition
 * with the Central time beside each picker, a small Clear and Save at the end, not across the page.
 *
 * The rows come from the competitions table, so these hold whether it lists two competitions (#2934) or four (#2962).
 */
describe('SubmissionDeadlinesComponent', () => {
  // Fri 13 Nov 2026, 5:00 PM and Mon 16 Nov 2026, 12:00 PM, Central (UTC-6 in November).
  const posterCloses = '2026-11-13T23:00:00.000Z';
  const posterFilesClose = '2026-11-16T18:00:00.000Z';

  function open(season: Partial<Season> | null) {
    TestBed.configureTestingModule({
      imports: [SubmissionDeadlinesComponent],
      providers: [{ provide: SeasonService, useValue: { setSubmissionDeadlines: jest.fn(() => of({})) } }]
    });

    const fixture = TestBed.createComponent(SubmissionDeadlinesComponent);
    fixture.componentRef.setInput('season', season);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const toggle = () => page.querySelector<HTMLButtonElement>('button.deadlines-toggle');

    return { fixture, page, toggle };
  }

  const withDeadlines: Partial<Season> = {
    guid: 'season-1',
    year: 2026,
    posterSubmissionsCloseAt: posterCloses,
    posterFilesCloseAt: posterFilesClose
  } as Partial<Season>;

  it('is collapsed to a one-line summary once the season has deadlines', () => {
    const { page, toggle } = open(withDeadlines);

    expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(page.querySelector('tamu-gisc-date-time-picker')).toBeNull();
    // Every other competition has none: "Presentation open", and with #2962 "Paper open" and "Cartography open".
    const others = DEADLINE_COMPETITIONS.filter((c) => c !== 'poster').map((c) => `${c[0].toUpperCase()}${c.slice(1)} open`);

    expect(page.querySelector('.deadlines-summary')?.textContent?.trim()).toBe(
      `${['Poster closes Fri, Nov 13, 5:00 PM; files Mon, Nov 16, 12:00 PM', ...others].join(' · ')} (Central time)`
    );
  });

  it('opens to edit, one row per competition, and closes again', () => {
    const { fixture, page, toggle } = open(withDeadlines);

    toggle()?.click();
    fixture.detectChanges();

    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(page.querySelector('.deadlines-summary')).toBeNull();

    const rows = Array.from(page.querySelectorAll('tbody tr'));
    expect(rows).toHaveLength(DEADLINE_COMPETITIONS.length);

    // Each row: the competition, then each deadline's picker with its Central time beside it and a small Clear.
    for (const row of rows) {
      expect(row.querySelectorAll('tamu-gisc-date-time-picker')).toHaveLength(2);
      expect(row.querySelectorAll('tamu-gisc-button.small')).toHaveLength(2);
    }

    expect(rows[0].querySelector('th')?.textContent?.trim()).toBe('Poster competition');
    expect(rows[0].querySelector('.deadline-central')?.textContent?.trim()).toBe('Fri, Nov 13, 2026, 5:00 PM Central');

    // Save sits at the panel's end at its own width, not across the page.
    expect(page.querySelector('tamu-gisc-button[type="submit"]')?.classList).toContain('snug');

    toggle()?.click();
    fixture.detectChanges();

    expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(page.querySelector('tamu-gisc-date-time-picker')).toBeNull();
  });

  it('is open to edit when the season has no deadlines, and says so when collapsed', () => {
    const { fixture, page, toggle } = open({ guid: 'season-1', year: 2026 } as Partial<Season>);

    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(page.querySelectorAll('tamu-gisc-date-time-picker')).toHaveLength(DEADLINE_COMPETITIONS.length * 2);

    toggle()?.click();
    fixture.detectChanges();

    expect(page.querySelector('.deadlines-summary')?.textContent?.trim()).toBe(
      'No deadlines set: every competition is open.'
    );
  });
});
