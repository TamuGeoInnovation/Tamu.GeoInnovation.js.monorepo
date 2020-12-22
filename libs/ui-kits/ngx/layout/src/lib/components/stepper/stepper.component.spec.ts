import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';

import { StepperComponent } from './stepper.component';
import { AbstractContentReplacerComponent } from '../../abstracts/abstract-content-swap/abstract-content-replacer.component';
import { StepToggleComponent } from './components/step-toggle/step-toggle.component';

@Component({
  template: ` <tamu-gisc-step-toggle></tamu-gisc-step-toggle> `
})
class TestComponent {
  @ViewChild(StepToggleComponent, { static: true })
  public title: StepToggleComponent;
}

describe('StepperComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, StepperComponent, AbstractContentReplacerComponent, StepToggleComponent]
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
