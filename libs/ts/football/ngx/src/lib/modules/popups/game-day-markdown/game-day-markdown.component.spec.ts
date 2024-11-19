import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameDayMarkdownComponent } from './game-day-markdown.component';

describe('GameDayMarkdownComponent', () => {
  let component: GameDayMarkdownComponent;
  let fixture: ComponentFixture<GameDayMarkdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameDayMarkdownComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameDayMarkdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
