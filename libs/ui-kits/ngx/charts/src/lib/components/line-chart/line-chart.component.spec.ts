import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSeries, dayIn, LineChartComponent, niceTicks, runningTotalByDay } from './line-chart.component';

describe('LineChartComponent', () => {
  let fixture: ComponentFixture<LineChartComponent>;

  const day = (d: string) => new Date(`${d}T00:00:00Z`);
  const draw = (series: Array<ChartSeries>, steps = false) => {
    fixture.componentRef.setInput('series', series);
    fixture.componentRef.setInput('label', 'RSVPs over time');
    fixture.componentRef.setInput('steps', steps);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [LineChartComponent] });
    fixture = TestBed.createComponent(LineChartComponent);
  });

  it('draws a labelled image with one line and one dot per point', () => {
    const el = draw([{ label: 'All events', points: [{ x: day('2026-11-01'), y: 2 }, { x: day('2026-11-03'), y: 7 }] }]);

    expect(el.querySelector('svg').getAttribute('role')).toBe('img');
    expect(el.querySelector('svg').getAttribute('aria-label')).toBe('RSVPs over time');
    expect(el.querySelectorAll('path')).toHaveLength(1);
    expect(el.querySelectorAll('circle')).toHaveLength(2);
    expect(el.querySelector('circle title').textContent).toBe('All events, Nov 1: 2');
  });

  it('runs from the first point at the left to the last at the right, and from zero at the bottom', () => {
    draw([{ label: 'All', points: [{ x: day('2026-11-01'), y: 0 }, { x: day('2026-11-05'), y: 8 }] }]);
    const chart = fixture.componentInstance;
    const [first, last] = chart.lines()[0].points;

    expect(first.x).toBe(chart.margin.left);
    expect(last.x).toBe(chart.width - chart.margin.right);
    expect(first.y).toBe(chart.height - chart.margin.bottom);
    // 8 is the top tick, so the last point is at the top of the plot.
    expect(chart.yTicks().at(-1)).toBe(8);
    expect(last.y).toBe(chart.margin.top);
  });

  it('draws steps when asked, so a running total holds until it changes', () => {
    const el = draw([{ label: 'All', points: [{ x: day('2026-11-01'), y: 1 }, { x: day('2026-11-02'), y: 4 }] }], true);

    expect(el.querySelector('path').getAttribute('d')).toMatch(/^M[\d.]+ [\d.]+H[\d.]+V[\d.]+$/);
  });

  it('shows a legend only for more than one series, and gives each its own colour', () => {
    const one = { label: 'All events', points: [{ x: day('2026-11-01'), y: 1 }] };
    expect(draw([one]).querySelector('.line-chart-legend')).toBeNull();

    const el = draw([one, { label: 'Keynote', points: [{ x: day('2026-11-02'), y: 1 }] }]);
    const strokes = Array.from(el.querySelectorAll('path')).map((p) => p.getAttribute('stroke'));

    expect(Array.from(el.querySelectorAll('.line-chart-legend li')).map((li) => li.textContent.trim())).toEqual([
      'All events',
      'Keynote'
    ]);
    expect(new Set(strokes).size).toBe(2);
  });

  it('says there is nothing to chart rather than drawing empty axes', () => {
    const el = draw([{ label: 'All', points: [] }]);

    expect(el.querySelector('svg')).toBeNull();
    expect(el.textContent).toContain('Nothing to chart yet');
  });

  it('labels the days along the bottom', () => {
    const el = draw([{ label: 'All', points: [{ x: day('2026-11-01'), y: 1 }, { x: day('2026-11-04'), y: 3 }] }]);
    const labels = Array.from(el.querySelectorAll('g:nth-of-type(2) text')).map((t) => t.textContent);

    expect(labels).toEqual(['Nov 1', 'Nov 2', 'Nov 3', 'Nov 4']);
  });
});

describe('niceTicks()', () => {
  it.each([
    [7, [0, 2, 4, 6, 8]],
    [10, [0, 2, 4, 6, 8, 10]],
    [3, [0, 1, 2, 3]],
    [1, [0, 1]],
    [0, [0, 1]],
    [240, [0, 50, 100, 150, 200, 250]]
  ])('gives round whole-number ticks up to at least %i', (max, ticks) => {
    expect(niceTicks(max)).toEqual(ticks);
  });
});

describe('runningTotalByDay()', () => {
  it('adds up each day, in Central time, in order', () => {
    expect(
      runningTotalByDay([
        '2026-11-03T15:00:00Z',
        '2026-11-01T15:00:00Z',
        '2026-11-01T20:00:00Z',
        // 11:30 PM Central on 3 November, already the 4th in UTC.
        '2026-11-04T05:30:00Z'
      ])
    ).toEqual([
      { x: new Date('2026-11-01T00:00:00Z'), y: 2 },
      { x: new Date('2026-11-03T00:00:00Z'), y: 4 }
    ]);
  });

  it('gives nothing for no times', () => {
    expect(runningTotalByDay([])).toEqual([]);
  });
});

describe('dayIn()', () => {
  it('gives the calendar day in the time zone asked for', () => {
    expect(dayIn(new Date('2026-11-04T05:30:00Z'), 'America/Chicago')).toBe('2026-11-03');
    expect(dayIn(new Date('2026-11-04T05:30:00Z'), 'UTC')).toBe('2026-11-04');
  });
});
