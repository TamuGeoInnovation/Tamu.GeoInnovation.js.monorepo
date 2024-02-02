import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLocationAddComponent } from './event-location-add.component';

describe('EventLocationAddComponent', () => {
  let component: EventLocationAddComponent;
  let fixture: ComponentFixture<EventLocationAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventLocationAddComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLocationAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
