import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseChartComponent } from '../base/base.component';
import { ChartContainerComponent } from '../chart-container/chart-container.component';
import { DoughnutChartComponent } from './doughnut.component';

describe('DoughnutComponent', () => {
  let component: DoughnutChartComponent;
  let fixture: ComponentFixture<DoughnutChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DoughnutChartComponent, BaseChartComponent, ChartContainerComponent],
      providers: [BaseChartComponent, ChartContainerComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoughnutChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
