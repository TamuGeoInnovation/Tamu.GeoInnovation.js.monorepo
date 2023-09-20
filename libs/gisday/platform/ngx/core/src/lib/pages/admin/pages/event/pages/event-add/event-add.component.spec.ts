import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAddComponent } from './event-add.component';

describe('EventAddComponent', () => {
  let component: EventAddComponent;
  let fixture: ComponentFixture<EventAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventAddComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
