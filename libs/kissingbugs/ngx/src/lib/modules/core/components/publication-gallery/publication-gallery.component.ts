import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPagePrintResource } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-publication-gallery',
  templateUrl: './publication-gallery.component.html',
  styleUrls: ['./publication-gallery.component.scss']
})
export class PublicationGalleryComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPagePrintResource;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
