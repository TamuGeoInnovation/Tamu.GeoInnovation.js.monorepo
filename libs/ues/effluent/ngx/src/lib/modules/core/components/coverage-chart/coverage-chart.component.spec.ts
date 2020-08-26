import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverageChartComponent } from './coverage-chart.component';

describe('CoverageChartComponent', () => {
  let component: CoverageChartComponent;
  let fixture: ComponentFixture<CoverageChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoverageChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverageChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
