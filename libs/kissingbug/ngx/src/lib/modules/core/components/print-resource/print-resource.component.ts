import { Component, Input } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPrintGallery } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-print-resource',
  templateUrl: './print-resource.component.html',
  styleUrls: ['./print-resource.component.scss']
})
export class PrintResourceComponent {
  @Input()
  public dataSource: IStrapiPrintGallery;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}
}
