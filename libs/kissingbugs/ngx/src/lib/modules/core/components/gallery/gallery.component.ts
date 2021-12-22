import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Lightbox, IAlbum } from 'ngx-lightbox';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageFeature, IStrapiPageGallery } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPageGallery;

  public rowItems: IStrapiPageFeature[][] = [];

  public album: IAlbum[] = [];

  public rowLength = 5;

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
      if (i == 0 || i % this.rowLength !== 0) {
        console.log(i, 'pushing item', item);
        items.push(item);
      }
      if (i != 0 && i % this.rowLength === 0) {
        console.log(i, 'reached row limit');
        this.rowItems.push(items);
        items = [];
        items.push(item);
      }
    });

    this.rowItems.push(items);

    // console.log('rowItems', this.rowItems);
  }

  public ngOnDestroy() {}

  public open(i: number) {
    // console.log('open ', i, this.album[i]);
    this._lightbox.open(this.album, i);
  }
}
