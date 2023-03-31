import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseInteractiveGeoprocessingComponent } from './base-interactive-geoprocessing.component';

describe('BaseInteractiveGeoprocessingComponent', () => {
  let component: BaseInteractiveGeoprocessingComponent;
  let fixture: ComponentFixture<BaseInteractiveGeoprocessingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseInteractiveGeoprocessingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseInteractiveGeoprocessingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
