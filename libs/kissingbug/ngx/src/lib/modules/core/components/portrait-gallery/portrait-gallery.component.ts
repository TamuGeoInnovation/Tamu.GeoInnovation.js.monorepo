import { Component, Input, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPagePortrait, IStrapiPagePortraitGallery } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-portrait-gallery',
  templateUrl: './portrait-gallery.component.html',
  styleUrls: ['./portrait-gallery.component.scss']
})
export class PortraitGalleryComponent implements OnInit {
  @Input()
  public dataSource: IStrapiPagePortraitGallery;

  public rowItems: IStrapiPagePortrait[][] = [];

  public rowLength = 2;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {
    let items: IStrapiPagePortrait[] = [];

    this.dataSource.portraits.forEach((item: IStrapiPagePortrait, i) => {
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
}
