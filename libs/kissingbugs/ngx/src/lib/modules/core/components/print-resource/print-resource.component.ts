import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPagePrintResource } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-print-resource',
  templateUrl: './print-resource.component.html',
  styleUrls: ['./print-resource.component.scss']
})
export class PrintResourceComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPagePrintResource;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}