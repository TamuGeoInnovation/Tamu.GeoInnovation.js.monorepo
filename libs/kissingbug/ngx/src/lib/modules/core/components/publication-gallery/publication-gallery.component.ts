import { Component, Input } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPublicationGallery } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-publication-gallery',
  templateUrl: './publication-gallery.component.html',
  styleUrls: ['./publication-gallery.component.scss']
})
export class PublicationGalleryComponent {
  @Input()
  public dataSource: IStrapiPublicationGallery;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}
}
