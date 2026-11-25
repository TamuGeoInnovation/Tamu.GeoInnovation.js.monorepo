import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Season } from '@tamu-gisc/gisday/platform/data-api';
import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { DEADLINE_COMPETITIONS } from '@tamu-gisc/gisday/common';

import { CompetitionSettingsComponent } from './competition-settings.component';

/**
 * #3037: Research Competitions had two sections above its submissions, Competitions in <year> (#2948) and Submission
 * deadlines (#2969, #3012), each with its own Save. They are one panel, Competition settings: which competitions the
 * season runs and each running one's deadlines, saved by one Save that sends both, and naming whichever is refused.
 *
 * #2969: the panel is collapsed to a one-line summary once a season has deadlines, and open to edit when it has none;
 * open, the deadlines are one row per competition with the Central time under each picker, a small Clear and Save at
 * the end, not across the page.
 *
 * The rows come from the competitions table, so these hold whether it lists two competitions (#2934) or four (#2962).
 */
describe('CompetitionSettingsComponent', () => {
  // Fri 13 Nov 2026, 5:00 PM and Mon 16 Nov 2026, 12:00 PM, Central (UTC-6 in November).
  const posterCloses = '2026-11-13T23:00:00.000Z';
  const posterFilesClose = '2026-11-16T18:00:00.000Z';

  const refused = (message: string) => throwError(() => ({ error: { message } }));

  function open(season: Partial<Season> | null, saves: { competitions?: () => unknown; deadlines?: () => unknown } = {}) {
    const seasons = {
      setSubmissionDeadlines: vi.fn(saves.deadlines ?? (() => of({}))),
      setCompetitionTypes: vi.fn(saves.competitions ?? (() => of({}))),
      setCompetitionSettings: vi.fn(() => of({ saved: 1 }))
    };
    // The season's sessions to choose from (#3019).
    const events = {
      getEntitiesForSeason: vi.fn(() =>
        of([
          { guid: 'e-poster', name: 'Poster gallery walk' },
          { guid: 'e-awards', name: 'Closing ceremony' }
        ])
      )
    };

    TestBed.configureTestingModule({
      imports: [CompetitionSettingsComponent],
      providers: [
        { provide: SeasonService, useValue: seasons },
        { provide: EventService, useValue: events }
      ]
    });

    const fixture = TestBed.createComponent(CompetitionSettingsComponent);
    fixture.componentRef.setInput('season', season);
    fixture.detectChanges();

    const page = fixture.nativeElement as HTMLElement;
    const toggle = () => page.querySelector<HTMLButtonElement>('.settings-toolbar button[aria-expanded]');
    const checkboxes = () => Array.from(page.querySelectorAll<HTMLElement>('tamu-gisc-checkbox'));
    const checkbox = (label: string) => checkboxes().find((c) => c.querySelector('label')?.textContent?.trim() === label);
    const isChecked = (label: string) =>
      checkbox(label)?.querySelector('.material-icons')?.textContent?.trim() === 'check_box';
    // The deadlines' rows; the sessions have a table of their own (#3019).
    const rows = () => Array.from(page.querySelectorAll('.deadlines-table:not(.sessions-table) tbody tr'));
    const status = () => page.querySelector('[role="status"]')?.textContent?.trim();
    const save = () => {
      page.querySelector('form')?.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };

    return { fixture, page, seasons, toggle, checkbox, checkboxes, isChecked, rows, status, save };
  }

  // Dates, as the entity declares them; the form reads either a Date or the API's ISO text (#3547).
  const withDeadlines: Partial<Season> = {
    guid: 'season-1',
    year: 2026,
    posterSubmissionsCloseAt: new Date(posterCloses),
    posterFilesCloseAt: new Date(posterFilesClose)
  };

  // Runs only poster and paper (#2948): a row for each competition it runs.
  const posterAndPaper: Partial<Season> = {
    ...withDeadlines,
    competitions: [{ competitionType: 'poster' }, { competitionType: 'paper' }]
  } as Partial<Season>;

  it('is one panel, Competition settings, holding which competitions run and their deadlines, with one Save', () => {
    const { fixture, page, toggle, checkboxes, rows } = open(withDeadlines);

    // One panel to open, named for both.
    expect(page.querySelectorAll('button[aria-expanded]')).toHaveLength(1);
    expect(toggle()?.textContent).toContain('Competition settings for 2026');

    toggle()?.click();
    fixture.detectChanges();

    // Inside: a box per competition, and a row of deadlines per competition it runs.
    expect(checkboxes().map((c) => c.querySelector('label')?.textContent?.trim())).toEqual([
      'Poster competition',
      'Presentation competition',
      'Paper competition',
      'Cartography competition'
    ]);
    expect(rows()).toHaveLength(DEADLINE_COMPETITIONS.length);

    // And one Save, for both.
    const submits = Array.from(page.querySelectorAll('tamu-gisc-button[type="submit"]'));
    expect(submits).toHaveLength(1);
    expect(submits[0].querySelector('input')?.value).toBe('Save');
  });

  it('says in its summary which competitions run, and their deadlines', () => {
    const { page } = open(posterAndPaper);

    expect(page.querySelector('.settings-summary')?.textContent?.trim()).toBe(
      'Poster and paper competitions. Poster closes Fri, Nov 13, 5:00 PM; files Mon, Nov 16, 12:00 PM · Paper open (Central time)'
    );
  });

  it('is collapsed to a one-line summary once the season has deadlines', () => {
    const { page, toggle } = open(withDeadlines);

    expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(page.querySelector('tamu-gisc-date-time-picker')).toBeNull();
    expect(page.querySelector('tamu-gisc-checkbox')).toBeNull();
    // Every other competition has none: "Presentation open", and with #2962 "Paper open" and "Cartography open".
    const others = DEADLINE_COMPETITIONS.filter((c) => c !== 'poster').map((c) => `${c[0].toUpperCase()}${c.slice(1)} open`);

    expect(page.querySelector('.settings-summary')?.textContent?.trim()).toBe(
      `Poster, presentation, paper and cartography competitions. ${[
        'Poster closes Fri, Nov 13, 5:00 PM; files Mon, Nov 16, 12:00 PM',
        ...others
      ].join(' · ')} (Central time)`
    );
  });

  it('shows deadlines only for the competitions ticked, as they are ticked', () => {
    const { fixture, toggle, checkbox, rows } = open(posterAndPaper);

    toggle()?.click();
    fixture.detectChanges();

    expect(rows().map((r) => r.querySelector('th')?.textContent?.trim())).toEqual([
      'Poster competition',
      'Paper competition'
    ]);

    checkbox('Cartography competition')?.querySelector<HTMLInputElement>('input')?.click();
    fixture.detectChanges();

    expect(rows().map((r) => r.querySelector('th')?.textContent?.trim())).toEqual([
      'Poster competition',
      'Paper competition',
      'Cartography competition'
    ]);
  });

  it('sends both the competitions and the deadlines with one Save', () => {
    const { fixture, seasons, toggle, save, status } = open(posterAndPaper);

    toggle()?.click();
    fixture.detectChanges();
    save();

    expect(seasons.setCompetitionTypes).toHaveBeenCalledWith('season-1', ['poster', 'paper']);
    expect(seasons.setSubmissionDeadlines).toHaveBeenCalledWith(
      'season-1',
      expect.objectContaining({ posterSubmissionsCloseAt: posterCloses, posterFilesCloseAt: posterFilesClose })
    );
    expect(status()).toBe('Competitions and deadlines saved.');

    // The season read again after the save: the panel stays open, so what became of the save can still be read.
    fixture.componentRef.setInput('season', { ...posterAndPaper });
    fixture.detectChanges();

    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(status()).toBe('Competitions and deadlines saved.');
  });

  it.each([
    {
      which: 'deadlines',
      saves: { deadlines: () => refused('The deadlines were refused here.') },
      says: 'The competitions were saved. The deadlines were not: The deadlines were refused here.'
    },
    {
      which: 'competitions',
      saves: { competitions: () => refused('The competitions were refused here.') },
      says: 'The deadlines were saved. The competitions were not: The competitions were refused here.'
    },
    {
      which: 'both',
      saves: { competitions: () => refused('No competitions.'), deadlines: () => refused('No deadlines.') },
      says: 'Neither was saved. The competitions: No competitions. The deadlines: No deadlines.'
    }
  ])('says when the $which are refused, and keeps what was typed', ({ saves, says }) => {
    const { fixture, page, toggle, checkbox, isChecked, rows, save, status } = open(posterAndPaper, saves);

    toggle()?.click();
    fixture.detectChanges();

    // Typed: paper turned off, cartography on, and the poster's file deadline cleared.
    checkbox('Paper competition')?.querySelector<HTMLInputElement>('input')?.click();
    checkbox('Cartography competition')?.querySelector<HTMLInputElement>('input')?.click();
    fixture.detectChanges();
    rows()[0].querySelectorAll<HTMLElement>('tamu-gisc-button.small')[1]?.click();
    fixture.detectChanges();

    save();

    expect(status()).toBe(says);

    // The season is read again after any save that went through; what was typed stays in the form regardless.
    fixture.componentRef.setInput('season', { ...posterAndPaper });
    fixture.detectChanges();

    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(isChecked('Poster competition')).toBe(true);
    expect(isChecked('Paper competition')).toBe(false);
    expect(isChecked('Cartography competition')).toBe(true);
    expect(rows()[0].querySelectorAll('.deadline-central')[1]?.textContent?.trim()).toBe('Open');
    expect(page.querySelector('[role="status"]')).not.toBeNull();
  });

  it('opens to edit, one row per competition, and closes again', () => {
    const { fixture, page, toggle, rows } = open(withDeadlines);

    toggle()?.click();
    fixture.detectChanges();

    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(page.querySelector('.settings-summary')).toBeNull();

    expect(rows()).toHaveLength(DEADLINE_COMPETITIONS.length);

    // Each row: the competition, then each deadline's picker with its Central time under it and a small Clear.
    for (const row of rows()) {
      expect(row.querySelectorAll('tamu-gisc-date-time-picker')).toHaveLength(2);
      expect(row.querySelectorAll('tamu-gisc-button.small')).toHaveLength(2);
    }

    expect(rows()[0].querySelector('th')?.textContent?.trim()).toBe('Poster competition');
    expect(rows()[0].querySelector('.deadline-central')?.textContent?.trim()).toBe('Fri, Nov 13, 2026, 5:00 PM Central');

    // Save sits at the panel's end at its own width, not across the page.
    expect(page.querySelector('tamu-gisc-button[type="submit"]')?.classList).toContain('snug');

    toggle()?.click();
    fixture.detectChanges();

    expect(toggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(page.querySelector('tamu-gisc-date-time-picker')).toBeNull();
  });

  // At 1280 px the Central time beside each picker pushed the second column and its Clear past the page's edge. The
  // Central time goes under its picker, in one stack, with Clear beside the stack rather than between the two.
  it('puts each Central time under its picker, with Clear beside them', () => {
    const { fixture, page, toggle } = open(withDeadlines);

    toggle()?.click();
    fixture.detectChanges();

    const cells = Array.from(page.querySelectorAll('.deadlines-table:not(.sessions-table) tbody td'));
    expect(cells).toHaveLength(DEADLINE_COMPETITIONS.length * 2);

    for (const cell of cells) {
      const picker = cell.querySelector('tamu-gisc-date-time-picker');
      const central = cell.querySelector('.deadline-central');
      const clear = cell.querySelector('tamu-gisc-button');

      // Picker and Central time share one column-direction stack, picker first, and Clear is not in it.
      const stack = picker?.parentElement;
      expect(stack?.classList).toContain('flex-column');
      expect(central?.parentElement).toBe(stack);
      expect(picker?.nextElementSibling).toBe(central);
      expect(stack?.contains(clear ?? null)).toBe(false);
      expect(stack?.nextElementSibling).toBe(clear);
    }
  });

  // #3012: closed, the panel read as one line of plain text, not as something to open. Closed, it is the shared tinted
  // box (.info-block.context, as the admin lists' selection bars), its name in the toolbar actions' link colour
  // (.__form-action) with a hint; open, it is the plain section toolbar it was.
  it('is a box to open while closed, and the plain section toolbar while open', () => {
    const { fixture, page, toggle } = open(withDeadlines);
    const toolbar = () => page.querySelector<HTMLElement>('.settings-toolbar');

    expect(toolbar()?.classList).not.toContain('form-section-toolbar');
    expect(toolbar()?.classList).toContain('info-block');
    expect(toolbar()?.classList).toContain('context');
    expect(toggle()?.classList).toContain('__form-action');
    expect(toggle()?.querySelector('.settings-hint')?.textContent?.trim()).toBe('Edit');

    toggle()?.click();
    fixture.detectChanges();

    expect(toolbar()?.classList).toContain('form-section-toolbar');
    expect(toolbar()?.classList).not.toContain('info-block');
    expect(toolbar()?.classList).not.toContain('context');
    expect(toggle()?.classList).not.toContain('__form-action');
    expect(page.querySelector('.settings-hint')).toBeNull();
  });

  it('is open to edit when the season has no deadlines, and says so when collapsed', () => {
    const { fixture, page, toggle } = open({ guid: 'season-1', year: 2026 } as Partial<Season>);

    expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(page.querySelectorAll('.deadlines-table:not(.sessions-table) tamu-gisc-date-time-picker')).toHaveLength(
      DEADLINE_COMPETITIONS.length * 2
    );

    toggle()?.click();
    fixture.detectChanges();

    expect(page.querySelector('.settings-summary')?.textContent?.trim()).toBe(
      'Poster, presentation, paper and cartography competitions. No deadlines set: each is open.'
    );
  });

  // #3019, decided 6A and 7A: each competition's sessions and its finalists date, chosen here and saved with the rest.
  describe('sessions and finalists', () => {
    it("offers the season's sessions, after the choice to find one by its name", () => {
      const { fixture } = open(withDeadlines);

      expect(fixture.componentInstance.sessionChoices().map((c) => c.name)).toEqual([
        'By its name (COMPETITION: / AWARDS:)',
        'Closing ceremony',
        'Poster gallery walk'
      ]);
    });

    it('sends the chosen sessions and finalists date after the competitions, and nothing for a competition without any', () => {
      const { fixture, seasons } = open(withDeadlines);
      const poster = fixture.componentInstance.form.controls.sessions.controls.poster;

      poster.patchValue({
        sessionGuid: 'e-poster',
        awardsSessionGuid: 'e-awards',
        finalistsNotifiedAt: '2026-11-14T18:00:00.000Z'
      });
      poster.markAsDirty();
      // The panel is collapsed for a season with deadlines, so its Save is pressed as the form would.
      fixture.componentInstance.save();

      expect(seasons.setCompetitionSettings).toHaveBeenCalledWith('season-1', [
        {
          competitionType: 'poster',
          sessionGuid: 'e-poster',
          graduateSessionGuid: null,
          awardsSessionGuid: 'e-awards',
          finalistsNotifiedAt: '2026-11-14T18:00:00.000Z'
        }
      ]);
      expect(seasons.setCompetitionTypes.mock.invocationCallOrder[0]).toBeLessThan(
        seasons.setCompetitionSettings.mock.invocationCallOrder[0]
      );
    });

    it("fills in what the season chose, and sends a competition's emptied choice so it is saved", () => {
      const chose: Partial<Season> = {
        ...withDeadlines,
        competitions: [{ competitionType: 'poster', runs: null, sessionGuid: 'e-poster' }]
      } as Partial<Season>;
      const { fixture, seasons } = open(chose);
      const poster = fixture.componentInstance.form.controls.sessions.controls.poster;

      expect(poster.controls.sessionGuid.value).toBe('e-poster');

      poster.controls.sessionGuid.setValue('');
      poster.markAsDirty();
      fixture.componentInstance.save();

      expect(seasons.setCompetitionSettings).toHaveBeenCalledWith('season-1', [
        expect.objectContaining({ competitionType: 'poster', sessionGuid: null })
      ]);
    });
  });
});
