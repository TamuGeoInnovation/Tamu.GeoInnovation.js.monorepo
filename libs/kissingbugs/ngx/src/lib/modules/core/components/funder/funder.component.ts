import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiStapleFooter } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-funder',
  templateUrl: './funder.component.html',
  styleUrls: ['./funder.component.scss']
})
export class FunderComponent implements OnInit, OnDestroy {
  // @Input()
  // public dataSource: IStrapiStapleFooter;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
