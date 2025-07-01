import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoservicesUserComponent } from './geoservices-user.component';

describe('GeoservicesUserComponent', () => {
  let component: GeoservicesUserComponent;
  let fixture: ComponentFixture<GeoservicesUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GeoservicesUserComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GeoservicesUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
