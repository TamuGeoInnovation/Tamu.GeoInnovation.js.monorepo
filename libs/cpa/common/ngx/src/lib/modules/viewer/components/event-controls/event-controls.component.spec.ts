import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventControlsComponent } from './event-controls.component';

describe('EventControlsComponent', () => {
  let component: EventControlsComponent;
  let fixture: ComponentFixture<EventControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EventControlsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
