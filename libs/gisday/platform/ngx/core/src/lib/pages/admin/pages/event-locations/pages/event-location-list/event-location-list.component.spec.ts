import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLocationListComponent } from './event-location-list.component';

describe('EventLocationListComponent', () => {
  let component: EventLocationListComponent;
  let fixture: ComponentFixture<EventLocationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventLocationListComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventLocationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
