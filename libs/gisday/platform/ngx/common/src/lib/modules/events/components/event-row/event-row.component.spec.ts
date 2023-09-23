import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventRowComponent } from './event-row.component';

describe('EventRowComponent', () => {
  let component: EventRowComponent;
  let fixture: ComponentFixture<EventRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
