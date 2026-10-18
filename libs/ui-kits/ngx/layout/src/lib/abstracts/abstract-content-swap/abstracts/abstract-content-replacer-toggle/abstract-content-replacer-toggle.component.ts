import { Component, TemplateRef, ChangeDetectionStrategy, input, viewChild } from '@angular/core';

@Component({
  selector: 'tamu-gisc-abstract-content-replacer-toggle',
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AbstractContentReplacerToggleComponent {
  public readonly label = input<string>(undefined);

  public readonly template = viewChild.required<TemplateRef<unknown>>('template');
}
