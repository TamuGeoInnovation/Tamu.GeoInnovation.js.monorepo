import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusTimetableComponent } from './bus-timetable.component';

describe('BusTimetableComponent', () => {
  let component: BusTimetableComponent;
  let fixture: ComponentFixture<BusTimetableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusTimetableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusTimetableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
