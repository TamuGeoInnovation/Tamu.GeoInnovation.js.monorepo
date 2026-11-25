import { Component, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { EventBroadcast } from '@tamu-gisc/gisday/platform/data-api';
import { BroadcastService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { siteListsPlace } from '@tamu-gisc/gisday/common';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-broadcast-list',
  templateUrl: './broadcast-list.component.html',
  styleUrls: ['./broadcast-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, CentralDatePipe, ExistsPipe]
})
export class BroadcastListComponent extends BaseAdminListComponent<EventBroadcast> {
  protected readonly entityService = inject(BroadcastService);
  public readonly site = inject(GISDAY_SITE);

  /**
   * On a site that lists only some organizations' sessions (gisday.tamu.edu), the list starts with those organizations'
   * broadcasts, and this shows every organization's, as the admin Sessions list does (#2986, #3048). 'all' or ''.
   */
  public readonly organizations = new FormControl('', { nonNullable: true });

  protected override listFilters(): Record<string, FormControl<string>> {
    return { ...super.listFilters(), organizations: this.organizations };
  }

  protected override keepEntity(broadcast: Partial<EventBroadcast>): boolean {
    return this.organizations.value === 'all' || siteListsPlace(this.site, broadcast.place);
  }
}
