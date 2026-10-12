import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { BaseEventPopupComponent } from '../base-event-popup/base-event-popup.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

@Component({
  selector: 'tamu-gisc-markdown-popup',
  templateUrl: './markdown-popup.component.html',
  styleUrls: ['./markdown-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CopyComponent]
})
export class MarkdownPopupComponent extends BaseEventPopupComponent implements OnInit {
  public title: string;

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data.layer.title;
  }
}
