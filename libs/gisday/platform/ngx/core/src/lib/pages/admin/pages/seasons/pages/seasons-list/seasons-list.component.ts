import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { Season, SeasonDay } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-seasons-list',
  templateUrl: './seasons-list.component.html',
  styleUrls: ['./seasons-list.component.scss']
})
export class SeasonsListComponent extends BaseAdminListComponent<Season> implements OnInit {
  public dateRange$: Observable<Array<SeasonDay>>;

  constructor(private readonly ss: SeasonService, private readonly ns: NotificationService) {
    super(ss);
  }

  public ngOnInit(): void {
    super.ngOnInit();
  }

  public createSeason() {
    this.ss.createEntity().subscribe(
      () => {
        this.ns.toast({
          id: 'create-season-success',
          title: 'Create season',
          message: 'Season created successfully.'
        });

        this.$signal.next(true);
      },
      (err) => {
        this.ns.toast({
          id: 'create-season-error',
          title: 'Create season',
          message: `Season creation failed: ${err.status}`
        });
      }
    );
  }
}
