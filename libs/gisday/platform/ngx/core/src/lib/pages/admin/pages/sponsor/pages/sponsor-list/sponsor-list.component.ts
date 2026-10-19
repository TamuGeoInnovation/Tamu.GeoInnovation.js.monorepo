import { Component, inject } from '@angular/core';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { RouterLink } from '@angular/router';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, ExistsPipe]
})
export class SponsorListComponent extends BaseAdminListComponent<Sponsor> {
  protected readonly entityService = inject(SponsorService);
  private readonly ns = inject(NotificationService);

  /**
   * Switches a sponsor on or off for its season without leaving the list (#1962).
   */
  public setActive(sponsor: Partial<Sponsor>, active: boolean) {
    const data = new FormData();
    data.set('active', String(active));

    this.entityService.updateEntityFormData(sponsor.guid, data).subscribe({
      next: () => {
        this.ns.toast({
          id: 'sponsor-active',
          title: 'Sponsors',
          message: `${sponsor.name} is now ${active ? 'shown on' : 'hidden from'} the Sponsors page.`
        });
        this.$signal.next(null);
      },
      error: (err) => {
        this.ns.toast({ id: 'sponsor-active-failed', title: 'Sponsors', message: `Could not update ${sponsor.name}: ${err.status}` });
        this.$signal.next(null);
      }
    });
  }
}
