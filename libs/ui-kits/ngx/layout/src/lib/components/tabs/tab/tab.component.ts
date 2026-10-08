import { Component, Input, ViewChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';

import { AbstractContentReplacerToggleComponent } from '../../../abstracts/abstract-content-swap/abstracts/abstract-content-replacer-toggle/abstract-content-replacer-toggle.component';

@Component({
    selector: 'tamu-gisc-tab',
    templateUrl: './tab.component.html',
    styleUrls: ['./tab.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class TabComponent extends AbstractContentReplacerToggleComponent {
  @Input()
  public label: string;

  @ViewChild('template', { static: true })
  public template: TemplateRef<TabComponent>;
}
