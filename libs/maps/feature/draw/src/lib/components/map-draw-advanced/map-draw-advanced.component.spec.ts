import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDrawAdvancedComponent } from './map-draw-advanced.component';

describe('MapDrawAdvancedComponent', () => {
  let component: MapDrawAdvancedComponent;
  let fixture: ComponentFixture<MapDrawAdvancedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MapDrawAdvancedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapDrawAdvancedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
