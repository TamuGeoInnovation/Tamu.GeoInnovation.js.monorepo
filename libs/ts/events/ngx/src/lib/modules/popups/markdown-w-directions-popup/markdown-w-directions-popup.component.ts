import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { BaseEventPopupComponent } from '../base-event-popup/base-event-popup.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'tamu-gisc-markdown-w-directions-popup',
  templateUrl: './markdown-w-directions-popup.component.html',
  styleUrls: ['./markdown-w-directions-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CopyComponent, AsyncPipe]
})
export class MarkdownWDirectionsPopupComponent extends BaseEventPopupComponent implements OnInit {
  public title: string;
  public isContentTheSame: boolean;
  public isContentLengthZero: boolean;

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data.layer.title;

    this.isContentTheSame = this.data?.attributes?.description === this.data?.attributes?.Notes;

    this.isContentLengthZero =
      typeof this.data?.attributes?.description === 'string' && this.data?.attributes?.description.trim().length === 0;
  }

  public override startDirections() {
    super.startDirections(`${this.data.attributes.OBJECTID}`);
  }
}
