import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageFeature, IStrapiPagePortrait, IStrapiPagePortraitGallery } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-portrait-gallery',
  templateUrl: './portrait-gallery.component.html',
  styleUrls: ['./portrait-gallery.component.scss']
})
export class PortraitGalleryComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPagePortraitGallery;

  public rowItems: IStrapiPagePortrait[][] = [];

  public rowLength = 2;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {
    var items: IStrapiPagePortrait[] = [];

    this.dataSource.portraits.forEach((item: IStrapiPagePortrait, i) => {
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

    console.log('rowItems', this.rowItems);
  }

  public ngOnDestroy() {}
}
