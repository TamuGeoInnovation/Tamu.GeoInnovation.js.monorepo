import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnstileChallengeComponent } from './turnstile-challenge.component';

describe('TurnstileChallengeComponent', () => {
  let component: TurnstileChallengeComponent;
  let fixture: ComponentFixture<TurnstileChallengeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TurnstileChallengeComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnstileChallengeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
