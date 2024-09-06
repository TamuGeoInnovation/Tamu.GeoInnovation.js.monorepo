import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetailSessionTypeComponent } from './admin-detail-session-type.component';

describe('AdminDetailSessionTypeComponent', () => {
  let component: AdminDetailSessionTypeComponent;
  let fixture: ComponentFixture<AdminDetailSessionTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AdminDetailSessionTypeComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDetailSessionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
