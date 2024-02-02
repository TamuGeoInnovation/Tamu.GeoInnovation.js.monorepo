import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightingComponent } from './lighting.component';

describe('LightingComponent', () => {
  let component: LightingComponent;
  let fixture: ComponentFixture<LightingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LightingComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LightingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
