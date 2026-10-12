import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[render-host]'
})
export class RenderHostDirective {
  viewContainerRef = inject(ViewContainerRef);
}
