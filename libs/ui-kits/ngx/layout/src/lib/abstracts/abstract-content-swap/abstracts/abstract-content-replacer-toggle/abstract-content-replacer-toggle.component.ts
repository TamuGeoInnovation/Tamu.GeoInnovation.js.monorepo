import { Component, Input, ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'tamu-gisc-abstract-content-replacer-toggle',
  template: ''
})
export class AbstractContentReplacerToggleComponent {
  @Input()
  public label: string;

  @ViewChild('template', { static: true })
  public template: TemplateRef<unknown>;
}
