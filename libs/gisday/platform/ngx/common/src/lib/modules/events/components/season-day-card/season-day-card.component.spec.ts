import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonDayCardComponent } from './season-day-card.component';

describe('SeasonDayCardComponent', () => {
  let component: SeasonDayCardComponent;
  let fixture: ComponentFixture<SeasonDayCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeasonDayCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonDayCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
