import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';
import { Component, ViewChild } from '@angular/core';
import { AccordionHeaderComponent } from './accordion-header/accordion-header.component';
import { AccordionContentComponent } from './accordion-content/accordion-content.component';

// Mock testing component to emulate ContentChildren title and content components.
@Component({
  template: `
    <tamu-gisc-accordion-header></tamu-gisc-accordion-header>
    <tamu-gisc-accordion-content></tamu-gisc-accordion-content>
  `
})
class TestComponent {
  @ViewChild(AccordionHeaderComponent, { static: true })
  public title: AccordionHeaderComponent;

  @ViewChild(AccordionContentComponent, { static: true })
  public content: AccordionContentComponent;
}

describe('AccordionComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, AccordionComponent, AccordionHeaderComponent, AccordionContentComponent]
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
