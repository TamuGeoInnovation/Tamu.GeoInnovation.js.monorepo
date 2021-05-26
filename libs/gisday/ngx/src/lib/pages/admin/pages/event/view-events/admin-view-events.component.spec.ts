import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewEventsComponent } from './admin-view-events.component';

describe('AdminViewEventsComponent', () => {
  let component: AdminViewEventsComponent;
  let fixture: ComponentFixture<AdminViewEventsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewEventsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
