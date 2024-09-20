import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss']
})
export class EventListComponent extends BaseAdminListComponent<Event> {
  constructor(
    private readonly eventService: EventService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(eventService, ss, ar, rt, ms, ns);
  }
}
