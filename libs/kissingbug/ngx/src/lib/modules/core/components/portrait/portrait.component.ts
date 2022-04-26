import { Component, Input } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPagePortrait } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-portrait',
  templateUrl: './portrait.component.html',
  styleUrls: ['./portrait.component.scss']
})
export class PortraitComponent {
  @Input()
  public dataSource: IStrapiPagePortrait;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}
}
