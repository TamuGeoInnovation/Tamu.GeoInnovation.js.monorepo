import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Place } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-place-list',
  templateUrl: './place-list.component.html',
  styleUrls: ['./place-list.component.scss']
})
export class PlaceListComponent extends BaseAdminListComponent<Place> {
  constructor(
    private readonly orgService: PlaceService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(orgService, ss, ar, rt, ms, ns);
  }
}
