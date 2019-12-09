import { async, inject, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { LineChartComponent } from './line.component';
import { LineChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';

describe('LineChartComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [LineChartComponent] }).compileComponents();
  }));

  it('should create', inject([LineChartComponent], (component: LineChartComponent) => {
    expect(component).toBeTruthy();
  }));

  it('should set baseConfig', inject([LineChartComponent], (component: LineChartComponent) => {
    component.source = new Observable<unknown[]>();
    ((component as unknown) as { chart: Partial<ChartContainerComponent> }).chart = { create: () => {} };
    component.ngAfterViewInit();
    expect(component.baseConfig).toEqual(new LineChartConfiguration());
  }));
});
