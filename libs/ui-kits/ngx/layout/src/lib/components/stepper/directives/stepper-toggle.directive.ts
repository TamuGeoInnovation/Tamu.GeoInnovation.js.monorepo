import { Directive, TemplateRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscStepperToggle]'
})
export class StepperToggleDirective {
  constructor(public template: TemplateRef<unknown>) {}
}
