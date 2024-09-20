import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { RsvpTypeService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';
@Component({
  selector: 'tamu-gisc-admin-edit-rsvp-type',
  templateUrl: './admin-edit-rsvp-type.component.html',
  styleUrls: ['./admin-edit-rsvp-type.component.scss']
})
export class AdminEditRsvpTypeComponent extends BaseAdminListComponent<RsvpType> {
  constructor(
    private readonly rsvpTypeService: RsvpTypeService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(rsvpTypeService, ss, ar, rt, ms, ns);
  }
}
