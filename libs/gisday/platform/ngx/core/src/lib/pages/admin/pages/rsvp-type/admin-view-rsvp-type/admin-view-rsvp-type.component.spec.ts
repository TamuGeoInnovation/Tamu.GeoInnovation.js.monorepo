import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewRsvpTypeComponent } from './admin-view-rsvp-type.component';

describe('AdminViewRsvpTypeComponent', () => {
  let component: AdminViewRsvpTypeComponent;
  let fixture: ComponentFixture<AdminViewRsvpTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminViewRsvpTypeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewRsvpTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
