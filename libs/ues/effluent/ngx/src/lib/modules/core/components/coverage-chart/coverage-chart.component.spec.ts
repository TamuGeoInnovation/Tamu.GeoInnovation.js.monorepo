import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartsModule } from '@tamu-gisc/charts';

import { of } from 'rxjs';

import { CoverageChartComponent } from './coverage-chart.component';

import esri = __esri;

describe('CoverageChartComponent', () => {
  let component: CoverageChartComponent;
  let fixture: ComponentFixture<CoverageChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ChartsModule],
      declarations: [CoverageChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoverageChartComponent);
    component = fixture.componentInstance;
    const bro = ({
      attributes: {
        Number: 1111
      }
    } as unknown) as esri.Graphic;
    component.zones = of(bro);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
