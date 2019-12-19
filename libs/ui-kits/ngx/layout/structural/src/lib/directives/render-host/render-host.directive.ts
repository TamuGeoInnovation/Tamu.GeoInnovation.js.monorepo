import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[render-host]'
})
export class RenderHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
