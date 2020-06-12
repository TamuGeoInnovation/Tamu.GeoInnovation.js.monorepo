import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeMapComponent } from './time-map.component';

describe('TimeMapComponent', () => {
  let component: TimeMapComponent;
  let fixture: ComponentFixture<TimeMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TimeMapComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
