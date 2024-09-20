import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { EventBroadcast } from '@tamu-gisc/gisday/platform/data-api';
import { BroadcastService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-broadcast-list',
  templateUrl: './broadcast-list.component.html',
  styleUrls: ['./broadcast-list.component.scss']
})
export class BroadcastListComponent extends BaseAdminListComponent<EventBroadcast> {
  constructor(
    private readonly broadcastService: BroadcastService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(broadcastService, ss, ar, rt, ms, ns);
  }
}
