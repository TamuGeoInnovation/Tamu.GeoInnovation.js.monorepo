import { Directive, TemplateRef, inject } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscTileSubmenu]'
})
export class TileSubmenuDirective {
  template = inject<TemplateRef<unknown>>(TemplateRef);
}
