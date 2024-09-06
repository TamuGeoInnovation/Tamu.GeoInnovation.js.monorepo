import { Component, ViewChild } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { DragDirective } from './drag.directive';

@Component({
  template: ` <div draggable></div> `
})
class MockDraggableDirectiveComponent {
  @ViewChild(DragDirective, { static: true })
  public directive: DragDirective;
}

describe('DragDirective', () => {
  let fixture: ComponentFixture<MockDraggableDirectiveComponent>;
  let component: MockDraggableDirectiveComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [DragDirective, MockDraggableDirectiveComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MockDraggableDirectiveComponent);
    component = fixture.componentInstance;
  });

  it('should create an instance', () => {
    expect(component.directive).toBeDefined();
  });
});
