import { Component, Input, OnInit } from '@angular/core';

import { Lightbox, IAlbum } from 'ngx-lightbox';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageFeature, IStrapiPageGallery } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  @Input()
  public dataSource: IStrapiPageGallery;

  public rowItems: IStrapiPageFeature[][] = [];

  public album: IAlbum[] = [];

  public rowLength = 4;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService, private _lightbox: Lightbox) {}

  public ngOnInit() {
    let items: IStrapiPageFeature[] = [];

    this.album = this.dataSource.items.map((feature) => {
      return {
        src: `${this.api_url}${feature.media.url}`,
        caption: feature.caption,
        thumb: feature.media.formats.thumbnail.url
      };
    });

    this.dataSource.items.forEach((item: IStrapiPageFeature, i) => {
      if (i === 0 || i % this.rowLength !== 0) {
        items.push(item);
      }
      if (i !== 0 && i % this.rowLength === 0) {
        this.rowItems.push(items);
        items = [];
        items.push(item);
      }
    });

    this.rowItems.push(items);
  }

  public open(i: number) {
    this._lightbox.open(this.album, i);
  }
}
