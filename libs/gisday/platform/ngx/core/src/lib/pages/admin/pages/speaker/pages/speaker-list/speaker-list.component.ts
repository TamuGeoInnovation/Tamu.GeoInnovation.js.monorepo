import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Speaker } from '@tamu-gisc/gisday/platform/data-api';
import { SeasonService, SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { NotificationService } from '@tamu-gisc/common/ngx/ui/notification';
import { ModalService } from '@tamu-gisc/ui-kits/ngx/layout/modal';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-speaker-list',
  templateUrl: './speaker-list.component.html',
  styleUrls: ['./speaker-list.component.scss']
})
export class SpeakerListComponent extends BaseAdminListComponent<Speaker> {
  constructor(
    private readonly speakerService: SpeakerService,
    private readonly ss: SeasonService,
    private readonly ar: ActivatedRoute,
    private readonly rt: Router,
    private readonly ms: ModalService,
    private readonly ns: NotificationService
  ) {
    super(speakerService, ss, ar, rt, ms, ns);
  }
}
