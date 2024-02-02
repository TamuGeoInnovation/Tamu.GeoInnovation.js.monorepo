import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAddEditFormComponent } from './event-add-edit-form.component';

describe('EventAddEditFormComponent', () => {
  let component: EventAddEditFormComponent;
  let fixture: ComponentFixture<EventAddEditFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventAddEditFormComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAddEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
