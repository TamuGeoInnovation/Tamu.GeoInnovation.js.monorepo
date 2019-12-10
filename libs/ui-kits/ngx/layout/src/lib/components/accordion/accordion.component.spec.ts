import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';
import { Component, ViewChild } from '@angular/core';
import { AccordionTitleComponent } from './accordion-title/accordion-title.component';
import { AccordionContentComponent } from './accordion-content/accordion-content.component';

// Mock testing component to emulate ContentChildren title and content components.
@Component({
  template: `
    <tamu-gisc-accordion-title></tamu-gisc-accordion-title>
    <tamu-gisc-accordion-content></tamu-gisc-accordion-content>
  `
})
class TestComponent {
  @ViewChild(AccordionTitleComponent, { static: true })
  public title: AccordionTitleComponent;

  @ViewChild(AccordionContentComponent, { static: true })
  public content: AccordionContentComponent;
}

describe('AccordionComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, AccordionComponent, AccordionTitleComponent, AccordionContentComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
