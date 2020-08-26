import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingTypeChartComponent } from './building-type-chart.component';

describe('BuildingTypeChartComponent', () => {
  let component: BuildingTypeChartComponent;
  let fixture: ComponentFixture<BuildingTypeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BuildingTypeChartComponent ]
    })
    .compileComponents();
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
