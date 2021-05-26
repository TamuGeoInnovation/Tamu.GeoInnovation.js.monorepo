import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRsvpTypeComponent } from './admin-rsvp-type.component';

describe('AdminRsvpTypeComponent', () => {
  let component: AdminRsvpTypeComponent;
  let fixture: ComponentFixture<AdminRsvpTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminRsvpTypeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRsvpTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
