import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[render-host]'
})
export class RenderHostDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
