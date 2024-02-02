import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLocationAddEditFormComponent } from './event-location-add-edit-form.component';

describe('EventLocationAddEditFormComponent', () => {
  let component: EventLocationAddEditFormComponent;
  let fixture: ComponentFixture<EventLocationAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventLocationAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLocationAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
