import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDrawBasicComponent } from './map-draw-basic.component';

describe('MapDrawBasicComponent', () => {
  let component: MapDrawBasicComponent;
  let fixture: ComponentFixture<MapDrawBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapDrawBasicComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapDrawBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
