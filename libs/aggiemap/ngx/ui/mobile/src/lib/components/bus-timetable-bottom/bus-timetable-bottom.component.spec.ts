import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusTimetableBottomComponent } from './bus-timetable-bottom.component';

describe('BusTimetableBottomComponent', () => {
  let component: BusTimetableBottomComponent;
  let fixture: ComponentFixture<BusTimetableBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BusTimetableBottomComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BusTimetableBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
