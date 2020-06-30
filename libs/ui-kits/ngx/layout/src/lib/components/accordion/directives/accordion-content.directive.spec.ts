import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { AccordionContentDirective } from './accordion-content.directive';

@Component({
  template: `
    <div giscAccordionContent></div>
  `
})
class MockAccordionContentDirectiveComponent {
  @ViewChild(AccordionContentDirective, { static: true })
  public directive: AccordionContentDirective;
}

describe('AccordionContentDirective', () => {
  let fixture: ComponentFixture<MockAccordionContentDirectiveComponent>;
  let component: MockAccordionContentDirectiveComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [TemplateRef],
      declarations: [AccordionContentDirective, MockAccordionContentDirectiveComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockAccordionContentDirectiveComponent);
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component.directive).toBeDefined();
  });
});
