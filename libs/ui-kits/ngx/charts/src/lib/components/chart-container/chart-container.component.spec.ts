import { async, inject, TestBed } from '@angular/core/testing';

import {
  BarChartConfiguration,
  ChartConfiguration,
  ChartContainerComponent,
  LineChartConfiguration
} from './chart-container.component';

describe('ChartContainerComponent', () => {
  beforeEach(async(() => {
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
