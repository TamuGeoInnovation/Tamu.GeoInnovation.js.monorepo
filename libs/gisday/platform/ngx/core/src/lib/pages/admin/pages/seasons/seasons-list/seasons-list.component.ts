import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Season, SeasonDay } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-seasons-list',
  templateUrl: './seasons-list.component.html',
  styleUrls: ['./seasons-list.component.scss']
})
export class SeasonsListComponent extends BaseAdminEditComponent<Season> implements OnInit {
  public dateRange$: Observable<Array<SeasonDay>>;

  constructor(private readonly ss: SeasonService) {
    super(ss);
  }

  public ngOnInit(): void {
    super.ngOnInit();
  }

  public createSeason() {
    this.ss.createEntity().subscribe(() => {
      this.$signal.next(true);
    });
  }
}

