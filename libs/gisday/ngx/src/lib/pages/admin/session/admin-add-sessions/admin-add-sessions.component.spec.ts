import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddSessionsComponent } from './admin-add-sessions.component';

describe('AdminAddSessionsComponent', () => {
  let component: AdminAddSessionsComponent;
  let fixture: ComponentFixture<AdminAddSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
