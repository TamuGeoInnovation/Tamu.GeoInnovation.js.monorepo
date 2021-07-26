import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageFeature } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-figure',
  templateUrl: './figure.component.html',
  styleUrls: ['./figure.component.scss']
})
export class FigureComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPageFeature;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
