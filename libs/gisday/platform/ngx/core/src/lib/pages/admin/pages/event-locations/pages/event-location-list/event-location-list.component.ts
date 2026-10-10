import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';

import { LocationService, SeasonService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { EventLocation } from '@tamu-gisc/gisday/platform/data-api';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-event-location-list',
  templateUrl: './event-location-list.component.html',
  styleUrls: ['./event-location-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SelectComponent, RouterLink, RouterLinkActive, CheckboxComponent, AsyncPipe, ExistsPipe]
})
export class EventLocationListComponent extends BaseAdminListComponent<EventLocation> {
  private readonly eventLocationService: LocationService;
  private readonly ss: SeasonService;
  private readonly ar: ActivatedRoute;
  private readonly rt: Router;
  private readonly ms: ModalService;
  private readonly ns: NotificationService;

  constructor() {
    const eventLocationService = inject(LocationService);
    const ss = inject(SeasonService);
    const ar = inject(ActivatedRoute);
    const rt = inject(Router);
    const ms = inject(ModalService);
    const ns = inject(NotificationService);

    super(eventLocationService, ss, ar, rt, ms, ns);
  
    this.eventLocationService = eventLocationService;
    this.ss = ss;
    this.ar = ar;
    this.rt = rt;
    this.ms = ms;
    this.ns = ns;
  }
}
