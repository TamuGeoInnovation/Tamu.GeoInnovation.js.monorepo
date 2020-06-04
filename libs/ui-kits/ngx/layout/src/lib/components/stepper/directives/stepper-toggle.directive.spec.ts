import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { StepperToggleDirective } from './stepper-toggle.directive';

@Component({
  template: `
    <div giscStepperToggle></div>
  `
})
class MockStepperToggleDirectiveComponent {
  @ViewChild(StepperToggleDirective, { static: true })
  public directive: StepperToggleDirective;
}

describe('StepperToggleDirective', () => {
  let fixture: ComponentFixture<MockStepperToggleDirectiveComponent>;
  let component: MockStepperToggleDirectiveComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [TemplateRef],
      declarations: [StepperToggleDirective, MockStepperToggleDirectiveComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockStepperToggleDirectiveComponent);
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component).toBeDefined();
  });
});
