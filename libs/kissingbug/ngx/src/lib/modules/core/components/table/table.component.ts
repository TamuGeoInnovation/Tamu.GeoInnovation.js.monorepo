import { Component, Input } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiTable } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbug-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent {
  @Input()
  public dataSource: IStrapiTable;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}
}
