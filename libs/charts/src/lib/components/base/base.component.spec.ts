import { inject } from '@angular/core/testing';

import { BaseChartComponent } from './base.component';

describe('BaseChartComponent', () => {
  it('should create', () => {
    inject([BaseChartComponent], (baseChartComponent: BaseChartComponent) => {
      expect(baseChartComponent).toBeTruthy();
    });
  });
});
