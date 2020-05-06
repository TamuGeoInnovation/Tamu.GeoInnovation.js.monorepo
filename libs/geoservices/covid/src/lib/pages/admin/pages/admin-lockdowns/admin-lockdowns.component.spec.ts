import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLockdownsComponent } from './admin-lockdowns.component';

describe('AdminLockdownsComponent', () => {
  let component: AdminLockdownsComponent;
  let fixture: ComponentFixture<AdminLockdownsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLockdownsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLockdownsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
