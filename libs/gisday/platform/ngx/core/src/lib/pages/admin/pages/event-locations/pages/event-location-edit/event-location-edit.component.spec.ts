import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLocationEditComponent } from './event-location-edit.component';

describe('EventLocationEditComponent', () => {
  let component: EventLocationEditComponent;
  let fixture: ComponentFixture<EventLocationEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventLocationEditComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLocationEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
