import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailCheckinComponent } from './admin-detail-checkin.component';

describe('AdminDetailCheckinComponent', () => {
  let component: AdminDetailCheckinComponent;
  let fixture: ComponentFixture<AdminDetailCheckinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDetailCheckinComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailCheckinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
