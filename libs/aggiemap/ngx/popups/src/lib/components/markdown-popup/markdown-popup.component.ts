import { Component, OnInit, inject } from '@angular/core';

import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { POPUP_SHARE_URL } from '../../popup-share-url';

/**
 * A feature's `name` (or its layer's title), its `description`, and a copy link where the application gives one.
 *
 * The one markdown popup for AggieMap and the event maps (#3486). The two used to have a copy each, which had drifted:
 * AggieMap's showed `Notes` and no copy link, the event maps' the reverse. No AggieMap layer behind this popup has a
 * `Notes` field (asked of each service on 25 November 2026), so dropping it changed nothing anyone saw.
 */
@Component({
  selector: 'tamu-gisc-markdown-popup',
  templateUrl: './markdown-popup.component.html',
  styleUrls: ['./markdown-popup.component.scss'],
  imports: [CopyComponent]
})
export class MarkdownPopupComponent extends BaseDirectionsComponent implements OnInit {
  public title: string;

  /**
   * The description, or `null` when there is nothing to show. A blank one counts as nothing, so it leaves no empty
   * section behind.
   */
  public description: string | null;

  private readonly _shareUrlFor = inject(POPUP_SHARE_URL, { optional: true });

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data?.layer?.title;

    const description = this.data?.attributes?.description;
    this.description = typeof description === 'string' && description.trim().length > 0 ? description : null;
  }

  protected override _makeShareUrl(): string | null {
    return this._shareUrlFor ? this._shareUrlFor(this.data) : super._makeShareUrl();
  }
}
