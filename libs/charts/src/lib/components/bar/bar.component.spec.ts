import { async, inject, TestBed } from '@angular/core/testing';

import { BarChartComponent } from './bar.component';

describe('BarChartComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({ providers: [BarChartComponent] }).compileComponents();
  }));

  it('should create', inject([BarChartComponent], (component: BarChartComponent) => {
    expect(component).toBeTruthy();
  }));
});
