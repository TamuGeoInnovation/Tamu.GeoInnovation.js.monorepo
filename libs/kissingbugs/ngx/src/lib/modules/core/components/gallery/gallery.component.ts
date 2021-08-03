import { Component, Input, OnDestroy, OnInit } from '@angular/core';

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

  public rowLength = 5;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {
    var items: IStrapiPageFeature[] = [];

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

    console.log('rowItems', this.rowItems);
  }

  public ngOnDestroy() {}
}
