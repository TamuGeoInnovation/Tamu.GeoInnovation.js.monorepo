import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-kissingbugs-bug-selection',
  templateUrl: './bug-selection.component.html',
  styleUrls: ['./bug-selection.component.scss']
})
export class BugSelectionComponent implements OnInit, OnDestroy {
  constructor(private environment: EnvironmentService) {}

  public ngOnInit() {}

  public ngOnDestroy() {}
}
