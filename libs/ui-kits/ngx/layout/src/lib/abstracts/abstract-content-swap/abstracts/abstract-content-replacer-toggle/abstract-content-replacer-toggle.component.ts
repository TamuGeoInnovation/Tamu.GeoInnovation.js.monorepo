import { Component, Input, ViewChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'tamu-gisc-abstract-content-replacer-toggle',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AbstractContentReplacerToggleComponent {
  @Input()
  public label: string;

  @ViewChild('template', { static: true })
  public template: TemplateRef<unknown>;
}
