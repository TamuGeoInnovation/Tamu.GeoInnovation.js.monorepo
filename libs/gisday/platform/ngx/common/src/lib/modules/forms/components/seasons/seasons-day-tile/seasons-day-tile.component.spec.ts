import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeasonsDayTileComponent } from './seasons-day-tile.component';

describe('SeasonsDayTileComponent', () => {
  let component: SeasonsDayTileComponent;
  let fixture: ComponentFixture<SeasonsDayTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SeasonsDayTileComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeasonsDayTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
