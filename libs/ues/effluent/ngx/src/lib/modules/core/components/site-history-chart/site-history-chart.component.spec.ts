import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteHistoryChartComponent } from './site-history-chart.component';

describe('SiteHistoryChartComponent', () => {
  let component: SiteHistoryChartComponent;
  let fixture: ComponentFixture<SiteHistoryChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SiteHistoryChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteHistoryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
