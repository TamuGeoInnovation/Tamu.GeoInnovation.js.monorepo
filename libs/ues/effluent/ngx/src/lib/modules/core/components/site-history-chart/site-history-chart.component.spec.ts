import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsModule } from '@tamu-gisc/charts';
import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';

import { SiteHistoryChartComponent } from './site-history-chart.component';

describe('SiteHistoryChartComponent', () => {
  let component: SiteHistoryChartComponent;
  let fixture: ComponentFixture<SiteHistoryChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ChartsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [SiteHistoryChartComponent],
      providers: [
        {
          provide: env,
          useValue: { apiUrl: 'https://', effluentSampleLocationsUrl: '' }
        }
      ]
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
