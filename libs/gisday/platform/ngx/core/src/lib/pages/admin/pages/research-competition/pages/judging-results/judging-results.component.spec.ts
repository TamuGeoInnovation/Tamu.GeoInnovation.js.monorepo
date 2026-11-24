import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { JudgingService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { JudgingResultsDto } from '@tamu-gisc/gisday/common';

import { JudgingResultsComponent, everyScoreCsv, judgingResultsCsv } from './judging-results.component';

/** A competition's results, made up: two judges, two entries, one not judged yet. */
const results = (): JudgingResultsDto => ({
  competition: 'graduate-poster',
  label: 'Graduate poster competition',
  rubric: { name: 'A rubric', criteria: [{ guid: 'c-1', name: 'Clarity', maxPoints: 20 }] },
  judges: [
    { guid: 'j-1', name: 'Dana Judge', scored: 1, toScore: 1 },
    { guid: 'j-2', name: 'Emery Judge', scored: 0, toScore: 2 }
  ],
  rows: [
    {
      guid: 's-1',
      title: 'Rivers',
      presenters: ['Avery Example'],
      totals: { 'j-1': 18, 'j-2': null },
      judged: 1,
      average: 18,
      criteria: { 'c-1': 18 },
      // A made-up judge's comment, with a comma and quotes, as a comment may have.
      assessments: { 'j-1': { scores: { 'c-1': 18 }, total: 18, comment: 'Clear, "careful" work.' }, 'j-2': null }
    },
    {
      guid: 's-2',
      title: 'Aquifers',
      presenters: [],
      totals: { 'j-1': null, 'j-2': null },
      judged: 0,
      average: null,
      criteria: { 'c-1': null },
      assessments: { 'j-1': null, 'j-2': null }
    }
  ]
});

/** #3193: an entry's breakdown, a line per judge, and every score as a CSV file. */
describe('JudgingResultsComponent, each judge on an entry (#3193)', () => {
  async function open() {
    TestBed.configureTestingModule({
      imports: [JudgingResultsComponent],
      providers: [
        // The season is picked from the address (#3329).
        provideRouter([]),
        { provide: JudgingService, useValue: { results: jest.fn(() => of(results())) } },
        {
          provide: SeasonService,
          useValue: {
            activeSeason$: of({ guid: 'season-2026', year: 2026 }),
            seasons$: of([{ guid: 'season-2026', year: 2026 }])
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(JudgingResultsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const lines = () =>
      Array.from(root.querySelectorAll('.breakdown tbody tr')).map((tr) =>
        Array.from(tr.querySelectorAll('th, td')).map((c) => c.textContent?.replace(/\s+/g, ' ').trim())
      );
    const openRow = async (title: string) => {
      const cell = Array.from(root.querySelectorAll<HTMLElement>('datatable-body-cell')).find((c) =>
        c.textContent?.includes(title)
      );

      cell.click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    };

    return { fixture, root, lines, openRow, component: fixture.componentInstance };
  }

  it("opens an entry's breakdown on a click: each judge's score on each criterion, their total and comment", async () => {
    const { root, lines, openRow, component } = await open();

    expect(root.querySelector('.breakdown')).toBeNull();

    await openRow('Rivers');

    expect(component.opened()).toBe('s-1');
    expect(Array.from(root.querySelectorAll('.breakdown thead th')).map((th) => th.textContent?.trim())).toEqual([
      'Judge',
      'Total',
      'Comment',
      'Clarity (of 20)'
    ]);
    // Total and comment come first, so they are in view without scrolling past every criterion (lab, batch 126).
    expect(lines()).toEqual([
      ['Dana Judge', '18', 'Clear, "careful" work.', '18'],
      ['Emery Judge', 'Not scored yet']
    ]);
  });

  it('shows a judge who has not scored the entry as Not scored yet', async () => {
    const { lines, openRow } = await open();

    await openRow('Aquifers');

    expect(lines()).toEqual([
      ['Dana Judge', 'Not scored yet'],
      ['Emery Judge', 'Not scored yet']
    ]);
  });

  it('closes the breakdown on a second click, and opens only one at a time', async () => {
    const { component, openRow } = await open();

    await openRow('Rivers');
    await openRow('Aquifers');
    expect(component.opened()).toBe('s-2');

    await openRow('Aquifers');
    expect(component.opened()).toBeNull();
  });

  it('gives every score as a CSV, a row per judge per entry, its comment escaped', () => {
    const csv = everyScoreCsv(results()).split('\r\n');

    expect(csv).toEqual([
      'Title,Presenters,Judge,Clarity (of 20),Total,Comment',
      'Rivers,Avery Example,Dana Judge,18,18,"Clear, ""careful"" work."',
      'Rivers,Avery Example,Emery Judge,,Not scored yet,',
      'Aquifers,,Dana Judge,,Not scored yet,',
      'Aquifers,,Emery Judge,,Not scored yet,'
    ]);
  });

  it('offers the Every score download beside the results CSV', async () => {
    const { root } = await open();

    expect(Array.from(root.querySelectorAll('.form-section-actions a')).map((a) => a.textContent?.trim())).toEqual([
      'Download CSV',
      'Every score'
    ]);
  });
});

/** #3183: the admins' Judging results page. */
describe('JudgingResultsComponent (#3183)', () => {
  async function open() {
    const judging = { results: jest.fn(() => of(results())) };

    TestBed.configureTestingModule({
      imports: [JudgingResultsComponent],
      providers: [
        // The season is picked from the address (#3329).
        provideRouter([]),
        { provide: JudgingService, useValue: judging },
        {
          provide: SeasonService,
          useValue: {
            activeSeason$: of({ guid: 'season-2026', year: 2026 }),
            seasons$: of([{ guid: 'season-2026', year: 2026 }])
          }
        }
      ]
    });

    const fixture = TestBed.createComponent(JudgingResultsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    return { fixture, root: fixture.nativeElement as HTMLElement, judging, component: fixture.componentInstance };
  }

  it("reads the active season's first competition, and shows each judge's progress", async () => {
    const { root, judging } = await open();

    expect(judging.results).toHaveBeenCalledWith('season-2026', 'graduate-poster');
    expect(Array.from(root.querySelectorAll('.judges li')).map((li) => li.textContent?.trim())).toEqual([
      'Dana Judge: 1 scored, 1 to score',
      'Emery Judge: 0 scored, 2 to score'
    ]);
    expect(root.textContent).toContain('2 accepted entries, highest average first.');
  });

  it("lists a row per entry with each judge's total, the average and each criterion's average", async () => {
    const { root } = await open();
    const headers = Array.from(root.querySelectorAll('datatable-header-cell')).map((h) => h.textContent?.trim());

    expect(headers).toEqual(['Rank', 'Title', 'Judges', 'Average', 'Dana Judge', 'Emery Judge', 'Clarity (of 20)']);

    const first = Array.from(root.querySelector('datatable-body-row')?.querySelectorAll('datatable-body-cell') ?? []).map(
      (c) => c.textContent?.replace(/\s+/g, ' ').trim()
    );

    expect(first).toEqual(['1', 'RiversAvery Example', '1', '18', '18', '', '18']);
  });

  // An entry no judge has scored says so in its row, and in the file its rank and average are blank, with 0 judges.
  it('marks an entry no judge has scored as Not scored yet, on the page and in the CSV', async () => {
    const { root } = await open();
    const second = Array.from(
      root.querySelectorAll('datatable-body-row')[1]?.querySelectorAll('datatable-body-cell') ?? []
    ).map((c) => c.textContent?.replace(/\s+/g, ' ').trim());

    expect(second.slice(0, 4)).toEqual(['', 'Aquifers', '0', 'Not scored yet']);
    expect(root.querySelectorAll('.not-scored')).toHaveLength(1);

    const [, , unscored] = judgingResultsCsv(results()).split('\r\n');
    const [rank, title, , judges, average] = unscored.split(',');

    expect([rank, title, judges, average]).toEqual(['', 'Aquifers', '0', '']);
  });

  it('gives each judge and criterion column room for its whole heading, so the table scrolls rather than cuts it', async () => {
    const { component } = await open();

    expect(component.columnWidth('Dana Judge')).toBe(117);
    expect(component.columnWidth('Al')).toBe(110);
    expect(component.columnWidth('Geographic Understanding & Accuracy (of 20)')).toBeGreaterThan(350);
  });

  // The lab (batch 123): ngx-datatable clips past its own width, so its box never scrolled and the criterion columns
  // could not be reached. The table is now as wide as all its columns, so its box scrolls.
  it('draws the table as wide as all its columns, so its box scrolls to the last one', async () => {
    const { root, component } = await open();
    const table = root.querySelector<HTMLElement>('ngx-datatable');
    // Rank 60 + Title 220 + Judges 80 + Average 130, then a column for each judge and the criterion.
    const expected =
      490 +
      component.columnWidth('Dana Judge') +
      component.columnWidth('Emery Judge') +
      component.columnWidth('Clarity (of 20)');

    expect(component.tableWidth(results())).toBe(expected);
    expect(table?.style.minWidth).toBe(`${expected}px`);
  });

  it('reads another competition when one is chosen', async () => {
    const { judging, component } = await open();

    component.chooseCompetition('undergraduate-presentation');
    TestBed.tick();

    expect(judging.results).toHaveBeenLastCalledWith('season-2026', 'undergraduate-presentation');
  });

  it('gives the results as a CSV file, as the page shows them', () => {
    const csv = judgingResultsCsv(results()).split('\r\n');

    expect(csv[0]).toBe('Rank,Title,Presenters,Judges,Average total,Dana Judge,Emery Judge,Clarity (average of 20)');
    expect(csv[1]).toBe('1,Rivers,Avery Example,1,18,18,,18');
    expect(csv[2]).toBe(',Aquifers,,0,,,,');
  });
});
