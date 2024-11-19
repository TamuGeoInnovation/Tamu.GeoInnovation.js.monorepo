import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDayMarkdownWDirectionsComponent } from './game-day-markdown-w-directions.component';

describe('GameDayMarkdownWDirectionsComponent', () => {
  let component: GameDayMarkdownWDirectionsComponent;
  let fixture: ComponentFixture<GameDayMarkdownWDirectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameDayMarkdownWDirectionsComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameDayMarkdownWDirectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
