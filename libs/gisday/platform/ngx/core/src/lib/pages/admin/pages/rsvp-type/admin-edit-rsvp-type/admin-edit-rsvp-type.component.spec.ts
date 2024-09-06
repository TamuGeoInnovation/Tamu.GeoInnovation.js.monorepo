import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditRsvpTypeComponent } from './admin-edit-rsvp-type.component';

describe('AdminEditRsvpTypeComponent', () => {
  let component: AdminEditRsvpTypeComponent;
  let fixture: ComponentFixture<AdminEditRsvpTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminEditRsvpTypeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditRsvpTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
