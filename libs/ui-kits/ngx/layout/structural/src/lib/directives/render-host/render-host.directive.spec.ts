import { Component, ViewChild } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';

import { RenderHostDirective } from './render-host.directive';

@Component({
  template: `
    <div render-host></div>
  `
})
class MockRenderHostDirectiveComponent {
  @ViewChild(RenderHostDirective, { static: true })
  public directive: RenderHostDirective;
}

describe('RenderHostDirective', () => {
  let fixture: ComponentFixture<MockRenderHostDirectiveComponent>;
  let component: MockRenderHostDirectiveComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [RenderHostDirective, MockRenderHostDirectiveComponent]
    }).compileComponents();
  });

  it('should create an instance', () => {
    fixture = TestBed.createComponent(MockRenderHostDirectiveComponent);
    component = fixture.componentInstance;

    // Tests directive selector and element reference.
    expect(component.directive.viewContainerRef).toBeTruthy();
  });
});
