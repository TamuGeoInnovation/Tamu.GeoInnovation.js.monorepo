import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ScrollToDirective } from './scroll-to.directive';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/* WORK IN PROGRESS */

/* Dummy Testing Component */
@Component({
  template: `
    <input type="text" scrollTo />
  `
})
class TestScrollToComponent {}

describe('ScrollToDirective', () => {
  let component: TestScrollToComponent;
  let fixture: ComponentFixture<TestScrollToComponent>;
  describe('Directive: ScrollToDirective', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ScrollToDirective, TestScrollToComponent]
      });
      fixture = TestBed.createComponent(TestScrollToComponent);
      component = fixture.componentInstance;
    });
  });
  it('should create an instance', () => {
    expect(component).toBeTruthy();
  });
});
