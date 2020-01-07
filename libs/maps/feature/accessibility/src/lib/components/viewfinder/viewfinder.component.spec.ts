import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewfinderComponent } from './viewfinder.component';

describe('MapViewfinderComponent', () => {
  let component: MapViewfinderComponent;
  let fixture: ComponentFixture<MapViewfinderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapViewfinderComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewfinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
