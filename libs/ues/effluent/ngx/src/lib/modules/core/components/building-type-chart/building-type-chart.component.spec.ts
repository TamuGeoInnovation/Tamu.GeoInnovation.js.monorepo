import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UesCommonNgxModule } from '@tamu-gisc/ues/common/ngx';
import { ChartsModule } from '@tamu-gisc/charts';

import { BuildingTypeChartComponent } from './building-type-chart.component';
import { of } from 'rxjs';

describe('BuildingTypeChartComponent', () => {
  let component: BuildingTypeChartComponent;
  let fixture: ComponentFixture<BuildingTypeChartComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [UesCommonNgxModule, ChartsModule],
        declarations: [BuildingTypeChartComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildingTypeChartComponent);
    component = fixture.componentInstance;
    component.buildings = of([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
