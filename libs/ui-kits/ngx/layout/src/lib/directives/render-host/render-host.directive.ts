import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[render-host]',
  standalone: false
})
export class RenderHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
