import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { LocationService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EventLocation } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-event-location-list',
  templateUrl: './event-location-list.component.html',
  styleUrls: ['./event-location-list.component.scss']
})
export class EventLocationListComponent extends BaseAdminListComponent<EventLocation> {
  constructor(
    private readonly eventLocationService: LocationService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(eventLocationService, ss, ar, rt, ms, ns);
  }
}
