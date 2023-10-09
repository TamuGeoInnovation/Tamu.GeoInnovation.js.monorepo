import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceLocationAddEditFormComponent } from './place-location-add-edit-form.component';

describe('PlaceLocationAddEditFormComponent', () => {
  let component: PlaceLocationAddEditFormComponent;
  let fixture: ComponentFixture<PlaceLocationAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaceLocationAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceLocationAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

