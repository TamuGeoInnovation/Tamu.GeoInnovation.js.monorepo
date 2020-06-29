import { Directive, TemplateRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[giscStepperToggle]'
})
export class StepperToggleDirective {
  constructor(public template: TemplateRef<unknown>) {}
}
