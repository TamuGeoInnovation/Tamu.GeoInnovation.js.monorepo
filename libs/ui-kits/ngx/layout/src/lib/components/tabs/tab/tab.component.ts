import { Component, Input, ViewChild, TemplateRef } from '@angular/core';

import { AbstractContentReplacerToggleComponent } from '../../../abstracts/abstract-content-swap/abstracts/abstract-content-replacer-toggle/abstract-content-replacer-toggle.component';

@Component({
  selector: 'tamu-gisc-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent extends AbstractContentReplacerToggleComponent {
  @Input()
  public override label: string;

  @ViewChild('template', { static: true })
  public override template: TemplateRef<TabComponent>;
}
