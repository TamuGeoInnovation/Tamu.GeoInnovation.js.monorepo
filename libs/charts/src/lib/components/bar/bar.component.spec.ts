import { async, inject, TestBed } from '@angular/core/testing';

import { BarChartComponent } from './bar.component';
import { BarChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';
import { Observable } from 'rxjs';

describe('BarChartComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [BarChartComponent] }).compileComponents();
  }));

  it('should create', inject([BarChartComponent], (component: BarChartComponent) => {
    expect(component).toBeTruthy();
  }));

  it('should set baseConfig', inject([BarChartComponent], (component: BarChartComponent) => {
    component.source = new Observable<unknown[]>();
    ((component as unknown) as { chart: Partial<ChartContainerComponent> }).chart = { create: () => {} };
    component.ngAfterViewInit();
    expect(component.baseConfig).toEqual(new BarChartConfiguration());
  }));
});
