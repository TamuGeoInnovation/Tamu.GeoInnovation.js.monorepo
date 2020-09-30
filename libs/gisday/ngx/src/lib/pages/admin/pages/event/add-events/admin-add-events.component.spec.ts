import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAddEventsComponent } from './admin-add-events.component';

describe('AdminAddEventsComponent', () => {
  let component: AdminAddEventsComponent;
  let fixture: ComponentFixture<AdminAddEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminAddEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAddEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
