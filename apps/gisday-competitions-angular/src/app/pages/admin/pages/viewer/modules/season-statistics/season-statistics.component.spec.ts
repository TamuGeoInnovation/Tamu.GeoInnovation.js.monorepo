import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonStatisticsComponent } from './season-statistics.component';

describe('SeasonStatisticsComponent', () => {
  let component: SeasonStatisticsComponent;
  let fixture: ComponentFixture<SeasonStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeasonStatisticsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
