import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightPoleComponent } from './light-pole.component';

describe('LightPoleComponent', () => {
  let component: LightPoleComponent;
  let fixture: ComponentFixture<LightPoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LightPoleComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LightPoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
