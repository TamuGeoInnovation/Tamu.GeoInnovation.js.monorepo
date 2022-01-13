import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailRsvpTypeComponent } from './admin-detail-rsvp-type.component';

describe('AdminDetailRsvpTypeComponent', () => {
  let component: AdminDetailRsvpTypeComponent;
  let fixture: ComponentFixture<AdminDetailRsvpTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminDetailRsvpTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailRsvpTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
