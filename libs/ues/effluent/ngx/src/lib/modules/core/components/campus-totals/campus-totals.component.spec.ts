import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EnvironmentModule, env } from '@tamu-gisc/common/ngx/environment';
import { ChartsModule } from '@tamu-gisc/charts';

import { BuildingTypeChartComponent } from '../building-type-chart/building-type-chart.component';
import { CoverageChartComponent } from '../coverage-chart/coverage-chart.component';

import { CampusTotalsComponent } from './campus-totals.component';

describe('CampusTotalsComponent', () => {
  let component: CampusTotalsComponent;
  let fixture: ComponentFixture<CampusTotalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ChartsModule, EnvironmentModule, HttpClientTestingModule],
      declarations: [CampusTotalsComponent, CoverageChartComponent, BuildingTypeChartComponent],
      providers: [{ provide: env, useValue: { effluentZonesUrl: [], effluentTiers: [], apiUrl: [] } }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CampusTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
