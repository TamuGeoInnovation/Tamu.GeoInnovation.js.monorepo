import { Component, OnInit } from '@angular/core';

import { BasePopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';

import { normalizePopupContent } from '../popup-content.utils';

@Component({
  selector: 'tamu-gisc-markdown-popup',
  templateUrl: './markdown-popup.component.html',
  styleUrls: ['./markdown-popup.component.scss']
})
export class MarkdownPopupComponent extends BasePopupComponent implements OnInit {
  public title: string;
  public hasDescription: boolean;
  public additionalContent: string | null;

  public ngOnInit(): void {
    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data?.layer?.title || '';
    this.hasDescription = Boolean(this.data?.attributes?.description);
    this.additionalContent = normalizePopupContent(this.data?.attributes?.additionalContent);
  }
}
