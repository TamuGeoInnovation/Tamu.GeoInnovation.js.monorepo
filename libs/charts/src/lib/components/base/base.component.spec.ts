import { async, inject, TestBed } from '@angular/core/testing';

import { BaseChartComponent } from './base.component';

describe('BaseChartComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [BaseChartComponent] }).compileComponents();
  }));

  it('should create', inject([BaseChartComponent], (baseChartComponent: BaseChartComponent) => {
    expect(baseChartComponent).toBeTruthy();
  }));
});
