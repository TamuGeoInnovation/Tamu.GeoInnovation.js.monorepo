import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewSessionsComponent } from './admin-view-sessions.component';

describe('AdminViewSessionsComponent', () => {
  let component: AdminViewSessionsComponent;
  let fixture: ComponentFixture<AdminViewSessionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewSessionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewSessionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
