import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { JudgingService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { JudgingResultsDto } from '@tamu-gisc/gisday/common';

import { JudgingResultsComponent, judgingResultsCsv } from './judging-results.component';

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
      criteria: { 'c-1': 18 }
    },
    {
      guid: 's-2',
      title: 'Aquifers',
      presenters: [],
      totals: { 'j-1': null, 'j-2': null },
      judged: 0,
      average: null,
      criteria: { 'c-1': null }
    }
  ]
});

/** #3183: the admins' Judging results page. */
describe('JudgingResultsComponent (#3183)', () => {
  async function open() {
    const judging = { results: jest.fn(() => of(results())) };

    TestBed.configureTestingModule({
      imports: [JudgingResultsComponent],
      providers: [
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
