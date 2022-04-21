import { Component, Input } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageFeature } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-figure',
  templateUrl: './figure.component.html',
  styleUrls: ['./figure.component.scss']
})
export class FigureComponent {
  @Input()
  public dataSource: IStrapiPageFeature;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}
}
