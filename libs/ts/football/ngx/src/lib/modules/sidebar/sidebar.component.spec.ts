import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamedaySidebarComponent } from './sidebar.component';

describe('GamedaySidebarComponent', () => {
  let component: GamedaySidebarComponent;
  let fixture: ComponentFixture<GamedaySidebarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GamedaySidebarComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamedaySidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
