import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';
import { CopyComponent } from '@tamu-gisc/ui-kits/ngx/interactions/clipboard';
import { PhotoCarouselComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AsyncPipe } from '@angular/common';
import { ActivateDirective } from '@tamu-gisc/ui-kits/ngx/interactions/keyboard';

import { MarkdownParsePipe } from '@tamu-gisc/common/ngx/pipes';

import { carouselImageUrls } from '../../carousel-images';

@Component({
  selector: 'tamu-gisc-poi-popup-component',
  templateUrl: './poi.component.html',
  styleUrls: ['../base/base.popup.component.scss'],
  imports: [CopyComponent, PhotoCarouselComponent, AsyncPipe, MarkdownParsePipe, ActivateDirective]
})
export class PoiPopupComponent extends BaseDirectionsComponent implements OnInit {
  public load: ReplaySubject<boolean> = new ReplaySubject(1);
  public medias: Array<string> = [];

  public ngOnInit(): void {
    super.ngOnInit();

    this.medias = carouselImageUrls(this.data?.attributes?.images);
  }

  protected override _getShareUrlFragment(): string | null {
    return this._buildShareUrlFragment('points-of-interest-exact', this.data.attributes.OBJECTID);
  }

  public startDirections() {
    super.startDirections(`${this.data.attributes.Name}`);
  }
}
