import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink } from '@angular/router';

import { RsvpTypeService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';
import { AsyncPipe, DatePipe } from '@angular/common';
@Component({
  selector: 'tamu-gisc-admin-edit-rsvp-type',
  templateUrl: './admin-edit-rsvp-type.component.html',
  styleUrls: ['./admin-edit-rsvp-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLinkActive, RouterLink, AsyncPipe, DatePipe]
})
export class AdminEditRsvpTypeComponent extends BaseAdminListComponent<RsvpType> {
  private readonly rsvpTypeService: RsvpTypeService;
  private readonly ss: SeasonService;
  private readonly ar: ActivatedRoute;
  private readonly rt: Router;
  private readonly ms: ModalService;
  private readonly ns: NotificationService;

  constructor() {
    const rsvpTypeService = inject(RsvpTypeService);
    const ss = inject(SeasonService);
    const ar = inject(ActivatedRoute);
    const rt = inject(Router);
    const ms = inject(ModalService);
    const ns = inject(NotificationService);

    super(rsvpTypeService, ss, ar, rt, ms, ns);
  
    this.rsvpTypeService = rsvpTypeService;
    this.ss = ss;
    this.ar = ar;
    this.rt = rt;
    this.ms = ms;
    this.ns = ns;
  }
}
