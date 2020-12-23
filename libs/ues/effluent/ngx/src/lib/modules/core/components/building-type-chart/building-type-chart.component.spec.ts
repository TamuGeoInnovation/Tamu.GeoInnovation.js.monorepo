import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { UesCommonNgxModule } from '@tamu-gisc/ues/common/ngx';
import { ChartsModule } from '@tamu-gisc/charts';

import { BuildingTypeChartComponent } from './building-type-chart.component';

describe('BuildingTypeChartComponent', () => {
  let component: BuildingTypeChartComponent;
  let fixture: ComponentFixture<BuildingTypeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [UesCommonNgxModule, ChartsModule, CommonModule],
      declarations: [BuildingTypeChartComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildingTypeChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
