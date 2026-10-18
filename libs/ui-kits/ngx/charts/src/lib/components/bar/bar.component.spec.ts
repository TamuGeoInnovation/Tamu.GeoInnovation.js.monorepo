import { waitForAsync, inject, TestBed } from '@angular/core/testing';

import { BarChartComponent } from './bar.component';
import { BarChartConfiguration, ChartContainerComponent } from '../chart-container/chart-container.component';
import { Observable } from 'rxjs';

describe('BarChartComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({ providers: [BarChartComponent] }).compileComponents();
  }));

  it('should create', inject([BarChartComponent], (component: BarChartComponent) => {
    expect(component).toBeTruthy();
  }));

  it('should set baseConfig', inject([BarChartComponent], (component: BarChartComponent) => {
    component.source.set(new Observable<unknown[]>());
    // The chart container is a signal query; stand in for it with a function returning a stub.
    (component as unknown as { chart: () => Partial<ChartContainerComponent> }).chart = () => ({
      create: () => {
        return {
          type: 'bar'
        };
      }
    });
    component.ngAfterViewInit();
    expect(component.baseConfig).toEqual(new BarChartConfiguration());
  }));
});
