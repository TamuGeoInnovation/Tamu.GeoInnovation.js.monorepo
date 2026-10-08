import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[render-host]'
})
export class RenderHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
