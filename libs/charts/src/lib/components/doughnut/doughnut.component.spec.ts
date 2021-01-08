import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';

import { BaseChartComponent } from '../base/base.component';
import { ChartContainerComponent } from '../chart-container/chart-container.component';
import { DoughnutChartComponent } from './doughnut.component';

describe('DoughnutComponent', () => {
  let component: DoughnutChartComponent;
  let fixture: ComponentFixture<DoughnutChartComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [DoughnutChartComponent, BaseChartComponent, ChartContainerComponent],
        providers: [BaseChartComponent, ChartContainerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(DoughnutChartComponent);
    component = fixture.componentInstance;
    component.source = of(undefined);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
