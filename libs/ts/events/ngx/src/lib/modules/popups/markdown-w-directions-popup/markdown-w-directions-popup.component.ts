import { Component, OnInit } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

import { normalizePopupContent } from '../popup-content.utils';

@Component({
  selector: 'tamu-gisc-markdown-w-directions-popup',
  templateUrl: './markdown-w-directions-popup.component.html',
  styleUrls: ['./markdown-w-directions-popup.component.scss']
})
export class MarkdownWDirectionsPopupComponent extends BaseDirectionsComponent implements OnInit {
  public title: string;
  public hasDescription: boolean;
  public additionalContent: string | null;

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data?.layer?.title || '';
    this.hasDescription =
      typeof this.data?.attributes?.description === 'string' && this.data.attributes.description.trim().length > 0;
    this.additionalContent = normalizePopupContent(this.data?.attributes?.additionalContent);
  }

  public override startDirections() {
    super.startDirections(String(this.data.attributes.OBJECTID));
  }
}
