import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { EventService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Event } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ParseDateTimeStringsPipe } from '@tamu-gisc/gisday/platform/ngx/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-event-list',
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, DatePipe, ParseDateTimeStringsPipe, ExistsPipe]
})
export class EventListComponent extends BaseAdminListComponent<Event> {
  private readonly eventService: EventService;
  private readonly ss: SeasonService;
  private readonly ar: ActivatedRoute;
  private readonly rt: Router;
  private readonly ms: ModalService;
  private readonly ns: NotificationService;

  constructor() {
    const eventService = inject(EventService);
    const ss = inject(SeasonService);
    const ar = inject(ActivatedRoute);
    const rt = inject(Router);
    const ms = inject(ModalService);
    const ns = inject(NotificationService);

    super(eventService, ss, ar, rt, ms, ns);

    this.eventService = eventService;
    this.ss = ss;
    this.ar = ar;
    this.rt = rt;
    this.ms = ms;
    this.ns = ns;
  }

  public override promptCopyModal() {
    super.promptCopyModal(
      'Event',
      'This action will only copy event details and not any associated relations such as event date, presenters, or location as those change from season to season. Those will have to be set manually on a per-event basis.'
    );
  }

  public override promptDeleteModal() {
    super.promptDeleteModal('Event');
  }
}
