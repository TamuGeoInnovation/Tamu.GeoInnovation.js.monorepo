import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { AccordionDirective } from './accordion.directive';

@Component({
  template: ` <div giscAccordion></div> `
})
class MockAccordionDirectiveComponent {
  @ViewChild(AccordionDirective, { static: true })
  public directive: AccordionDirective;
}

describe('AccordionDirective', () => {
  let fixture: ComponentFixture<MockAccordionDirectiveComponent>;
  let component: MockAccordionDirectiveComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [TemplateRef],
      declarations: [AccordionDirective, MockAccordionDirectiveComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockAccordionDirectiveComponent);
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component).toBeDefined();
  });
});

/* 
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
*/
