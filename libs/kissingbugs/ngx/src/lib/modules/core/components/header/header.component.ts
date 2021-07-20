import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageHeader } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy, OnChanges {
  @Input()
  public dataSource: IStrapiPageHeader;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {
    console.log(this.dataSource);
  }

  public ngOnDestroy() {}

  public ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
  }
}
