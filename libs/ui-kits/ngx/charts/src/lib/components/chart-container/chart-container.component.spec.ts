import { waitForAsync, inject, TestBed } from '@angular/core/testing';

import {
  applyChartColors,
  CHART_COLORS,
  BarChartConfiguration,
  ChartConfiguration,
  ChartContainerComponent,
  LineChartConfiguration
} from './chart-container.component';

describe('ChartContainerComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [ChartContainerComponent]
    }).compileComponents();
  }));

  it('should create', inject([ChartContainerComponent], (component: ChartContainerComponent) => {
    expect(component).toBeTruthy();
    expect(component.ngOnDestroy()).toBeUndefined();
  }));
});

describe('ChartConfiguration', () => {
  it('should create with data', () => {
    const args = { data: { datasets: [] } };
    const config = new ChartConfiguration(args);
    expect(config.data).toEqual(args.data);
  });

  it('should update data', () => {
    const data = { datasets: [] };
    const config = new ChartConfiguration();
    config.updateData(data);
    expect(config.data).toEqual(data);
  });
});

describe('BarChartConfiguration', () => {
  it('should create', () => {
    const config = new BarChartConfiguration();
    expect(config.type).toEqual('bar');
  });
});

describe('LineChartConfiguration', () => {
  it('should create', () => {
    const config = new LineChartConfiguration();
    expect(config.type).toEqual('line');
  });
});

// The colours chartjs-plugin-colorschemes gave these charts before chart.js 4 (#1218): its default palette, by its rules.
describe('applyChartColors', () => {
  it('fills each bar dataset with the next colour of the palette', () => {
    const data = { labels: ['a', 'b'], datasets: [{ data: [1, 2] }, { data: [3, 4] }] };

    applyChartColors('bar', data);

    expect(data.datasets.map((d) => d['backgroundColor'])).toEqual(['#a6cee3', '#1f78b4']);
    expect(data.datasets[0]['borderColor']).toBeUndefined();
  });

  it('gives a line its colour as border and points, and a half-transparent fill', () => {
    const data = { datasets: [{ data: [1, 2] }] };

    applyChartColors('line', data);

    expect(data.datasets[0]).toMatchObject({
      borderColor: '#a6cee3',
      backgroundColor: 'rgba(166, 206, 227, 0.5)',
      pointBorderColor: '#a6cee3',
      pointBackgroundColor: 'rgba(166, 206, 227, 0.5)'
    });
  });

  it('gives each slice of a pie its own colour', () => {
    const data = { datasets: [{ data: Array.from({ length: 13 }, (_, i) => i) }] };

    applyChartColors('pie', data);

    expect(data.datasets[0]['backgroundColor']).toEqual([...CHART_COLORS, CHART_COLORS[0]]);
  });

  it('keeps a colour the caller set', () => {
    const data = { datasets: [{ data: [1], backgroundColor: '#500000' }] };

    applyChartColors('bar', data);

    expect(data.datasets[0].backgroundColor).toBe('#500000');
  });
});
