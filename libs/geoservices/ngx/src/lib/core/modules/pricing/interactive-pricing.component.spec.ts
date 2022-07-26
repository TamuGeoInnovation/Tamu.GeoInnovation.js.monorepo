import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InteractivePricingComponent } from './interactive-pricing.component';

describe('InteractivePricingComponent', () => {
  let component: InteractivePricingComponent;
  let fixture: ComponentFixture<InteractivePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractivePricingComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InteractivePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
