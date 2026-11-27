import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSeries, LineChartOptions } from '../../data/chart-data';
import { rgbToHex } from './draw-line-chart';
import { LineChartComponent } from './line-chart.component';
import { LINE_CHART_DRAWER } from './line-chart.drawer';

describe('LineChartComponent', () => {
  let fixture: ComponentFixture<LineChartComponent>;
  let drawn: Array<{ host: HTMLElement; options: LineChartOptions }>;
  let disposed: number;

  const day = (d: string) => new Date(`${d}T00:00:00Z`);
  const all: ChartSeries = {
    label: 'All events',
    points: [
      { x: day('2026-11-01'), y: 2 },
      { x: day('2026-11-03'), y: 7 }
    ]
  };

  async function show(
    inputs: Partial<Record<'series' | 'bars' | 'bands' | 'steps' | 'unit' | 'label' | 'height' | 'interval', unknown>>
  ) {
    for (const [name, value] of Object.entries({ label: 'RSVPs over time', ...inputs })) {
      fixture.componentRef.setInput(name, value);
    }

    fixture.detectChanges();
    await fixture.whenStable();
    // A drawing waits for the one before it to settle (#3829), a few microtasks after the change.
    await new Promise((settled) => setTimeout(settled));

    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(() => {
    drawn = [];
    disposed = 0;

    TestBed.configureTestingModule({
      imports: [LineChartComponent],
      providers: [
        {
          provide: LINE_CHART_DRAWER,
          useValue: (host: HTMLElement, options: LineChartOptions) => {
            drawn.push({ host, options });

            return Promise.resolve(() => disposed++);
          }
        }
      ]
    });
    fixture = TestBed.createComponent(LineChartComponent);
  });

  it('draws into a labelled image of a fixed height, which does not grow with the page', async () => {
    const el = await show({ series: [all] });
    const plot = el.querySelector('.line-chart') as HTMLElement;

    expect(plot.getAttribute('role')).toBe('img');
    expect(plot.getAttribute('aria-label')).toBe('RSVPs over time');
    expect(plot.style.height).toBe('320px');
    expect(drawn).toHaveLength(1);
    expect(drawn[0].host).toBe(plot);
  });

  it("gives each line its own colour, maroon first, and the columns the first line's unless they have one", async () => {
    await show({
      series: [all, { label: 'Keynote', points: [{ x: day('2026-11-02'), y: 1 }] }],
      bars: { label: 'New that day', points: [{ x: day('2026-11-01'), y: 2 }] },
      steps: true,
      unit: 'RSVPs'
    });
    const { options } = drawn.at(-1);

    expect(options.series.map((s) => s.color)).toEqual(['#500000', '#2c7fb8']);
    expect(options.bars.color).toBe('#500000');
    expect(options.steps).toBe(true);
    expect(options.unit).toBe('RSVPs');
  });

  // #3314: the Check-ins dashboard's second chart counts by the hour.
  it('draws by day unless told to draw by the hour', async () => {
    await show({ series: [all] });
    expect(drawn.at(-1).options.interval).toBe('day');

    await show({ series: [all], interval: 'hour' });
    expect(drawn.at(-1).options.interval).toBe('hour');
  });

  it('passes the shaded bands through', async () => {
    const band = { from: day('2026-11-16'), to: day('2026-11-21'), label: 'GIS Day week' };
    await show({ series: [all], bands: [band] });

    expect(drawn.at(-1).options.bands).toEqual([band]);
  });

  it('disposes of the last drawing before drawing again, and when it goes', async () => {
    await show({ series: [all] });
    await show({ series: [all, { label: 'Keynote', points: [{ x: day('2026-11-02'), y: 1 }] }] });

    expect(drawn).toHaveLength(2);
    expect(disposed).toBe(1);

    fixture.destroy();
    expect(disposed).toBe(2);
  });

  it('says there is nothing to chart rather than drawing empty axes', async () => {
    const el = await show({ series: [{ label: 'All', points: [] }] });

    expect(el.querySelector('.line-chart')).toBeNull();
    expect(el.textContent).toContain('Nothing to chart yet');
    expect(drawn).toHaveLength(0);
  });
});

describe('rgbToHex()', () => {
  it('reads the colour the page computes for its text', () => {
    expect(rgbToHex('rgb(62, 62, 62)')).toBe('#3e3e3e');
    expect(rgbToHex('rgba(80, 0, 0, 0.5)')).toBe('#500000');
    expect(rgbToHex('maroon')).toBeNull();
  });
});

/**
 * amCharts allows one Root on an element, and logs "multiple Roots on the same DOM node" when a second is made before the
 * first is disposed (#3829). Its drawer awaits the amCharts import before making the Root, so data arriving twice in
 * quick succession resumed both draws together, and the second Root was made before the first draw had handed back what
 * disposes of it. The admin dashboards showed it on about half their loads.
 */
describe('LineChartComponent, data arriving twice before a draw finishes', () => {
  let live: Map<HTMLElement, number>;
  let most: number;
  let made: number;
  let shown: number | undefined;

  const day = (d: string) => new Date(`${d}T00:00:00Z`);
  const first: ChartSeries = { label: 'All events', points: [{ x: day('2026-11-01'), y: 2 }] };
  const second: ChartSeries = {
    label: 'All events',
    points: [
      { x: day('2026-11-01'), y: 2 },
      { x: day('2026-11-03'), y: 7 }
    ]
  };

  /** As the real drawer does: the import first, then a Root on the element, then what disposes of it. */
  const loaded = Promise.resolve();
  async function drawLikeAmCharts(host: HTMLElement, options: LineChartOptions): Promise<() => void> {
    await loaded;
    shown = options.series[0].points.length;
    live.set(host, (live.get(host) ?? 0) + 1);
    most = Math.max(most, live.get(host) ?? 0);
    made++;

    return () => live.set(host, (live.get(host) ?? 1) - 1);
  }

  beforeEach(() => {
    live = new Map();
    most = 0;
    made = 0;
    shown = undefined;

    TestBed.configureTestingModule({
      imports: [LineChartComponent],
      providers: [{ provide: LINE_CHART_DRAWER, useValue: drawLikeAmCharts }]
    });
  });

  it('never has two Roots on its element at once, and shows the latest data', async () => {
    const fixture = TestBed.createComponent(LineChartComponent);
    fixture.componentRef.setInput('series', [first]);
    fixture.detectChanges();
    fixture.componentRef.setInput('series', [second]);
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((settled) => setTimeout(settled));

    expect(most).toBe(1);
    expect([...live.values()]).toEqual([1]);
    expect(shown).toBe(2);

    fixture.destroy();
    expect([...live.values()]).toEqual([0]);
    expect(made).toBeGreaterThanOrEqual(1);
  });
});
