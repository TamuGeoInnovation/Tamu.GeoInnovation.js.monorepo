import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Sponsor } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SponsorService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-sponsor-list',
  templateUrl: './sponsor-list.component.html',
  styleUrls: ['./sponsor-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, ExistsPipe]
})
export class SponsorListComponent extends BaseAdminListComponent<Sponsor> {
  private readonly sponsorService: SponsorService;
  private readonly ss: SeasonService;
  private readonly ar: ActivatedRoute;
  private readonly rt: Router;
  private readonly ms: ModalService;
  private readonly ns: NotificationService;

  constructor() {
    const sponsorService = inject(SponsorService);
    const ss = inject(SeasonService);
    const ar = inject(ActivatedRoute);
    const rt = inject(Router);
    const ms = inject(ModalService);
    const ns = inject(NotificationService);

    super(sponsorService, ss, ar, rt, ms, ns);
  
    this.sponsorService = sponsorService;
    this.ss = ss;
    this.ar = ar;
    this.rt = rt;
    this.ms = ms;
    this.ns = ns;
  }
}
