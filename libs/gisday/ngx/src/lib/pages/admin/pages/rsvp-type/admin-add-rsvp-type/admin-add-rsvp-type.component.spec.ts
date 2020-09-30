import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddRsvpTypeComponent } from './admin-add-rsvp-type.component';

describe('AdminAddRsvpTypeComponent', () => {
  let component: AdminAddRsvpTypeComponent;
  let fixture: ComponentFixture<AdminAddRsvpTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddRsvpTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddRsvpTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
