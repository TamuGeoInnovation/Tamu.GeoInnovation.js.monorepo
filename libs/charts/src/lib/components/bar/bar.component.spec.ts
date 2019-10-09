import { inject } from '@angular/core/testing';

import { BarChartComponent } from './bar.component';

describe('BarChartComponent', () => {
  it('should create', () => {
    inject([BarChartComponent], (component: BarChartComponent) => {
      expect(component).toBeTruthy();
    });
  });
});
