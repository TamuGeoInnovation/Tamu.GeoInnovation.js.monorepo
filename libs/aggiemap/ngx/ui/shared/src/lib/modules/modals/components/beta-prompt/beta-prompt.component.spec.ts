import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaPromptComponent } from './beta-prompt.component';

describe('BetaPromptComponent', () => {
  let component: BetaPromptComponent;
  let fixture: ComponentFixture<BetaPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetaPromptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BetaPromptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
