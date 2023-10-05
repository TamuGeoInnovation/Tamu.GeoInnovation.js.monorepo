import { Directive, TemplateRef } from '@angular/core';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[giscTileSubmenu]'
})
export class TileSubmenuDirective {
  constructor(public template: TemplateRef<unknown>) {}
}
