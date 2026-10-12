import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscStepperToggle]'
})
export class StepperToggleDirective {
  template = inject<TemplateRef<unknown>>(TemplateRef);
}
