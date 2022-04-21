import { Component, Input } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageInfoAlert } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-info-alert',
  templateUrl: './info-alert.component.html',
  styleUrls: ['./info-alert.component.scss']
})
export class InfoAlertComponent {
  @Input()
  public dataSource: IStrapiPageInfoAlert;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}
}
