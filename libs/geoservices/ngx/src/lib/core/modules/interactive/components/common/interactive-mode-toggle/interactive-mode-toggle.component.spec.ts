import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractiveModeToggleComponent } from './interactive-mode-toggle.component';

describe('InteractiveModeToggleComponent', () => {
  let component: InteractiveModeToggleComponent;
  let fixture: ComponentFixture<InteractiveModeToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractiveModeToggleComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractiveModeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

