import { Directive, OnInit, TemplateRef } from '@angular/core';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[giscTileSubmenu]'
})
export class TileSubmenuDirective implements OnInit {
  constructor(public template: TemplateRef<unknown>) {}

  public ngOnInit() {}
}
