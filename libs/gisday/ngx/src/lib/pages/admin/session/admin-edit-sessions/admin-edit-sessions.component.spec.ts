import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditSessionsComponent } from './admin-edit-sessions.component';

describe('AdminEditSessionsComponent', () => {
  let component: AdminEditSessionsComponent;
  let fixture: ComponentFixture<AdminEditSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
