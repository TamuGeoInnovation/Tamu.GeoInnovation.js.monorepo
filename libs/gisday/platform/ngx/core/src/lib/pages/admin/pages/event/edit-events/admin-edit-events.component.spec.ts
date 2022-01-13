import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEditEventsComponent } from './admin-edit-events.component';

describe('AdminEditEventsComponent', () => {
  let component: AdminEditEventsComponent;
  let fixture: ComponentFixture<AdminEditEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminEditEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminEditEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
