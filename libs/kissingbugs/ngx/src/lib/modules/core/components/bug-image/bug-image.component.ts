import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { IStrapiPageBugImage } from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-bug-image',
  templateUrl: './bug-image.component.html',
  styleUrls: ['./bug-image.component.scss']
})
export class BugImageComponent implements OnInit, OnDestroy {
  @Input()
  public dataSource: IStrapiPageBugImage;

  public api_url = this.environment.value('api_url');

  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
