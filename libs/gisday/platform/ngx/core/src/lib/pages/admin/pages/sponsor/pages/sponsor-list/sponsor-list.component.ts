import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.scss']
})
export class SponsorListComponent extends BaseAdminListComponent<Sponsor> {
  constructor(
    private readonly sponsorService: SponsorService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(sponsorService, ss, ar, rt, ms, ns);
  }
}
