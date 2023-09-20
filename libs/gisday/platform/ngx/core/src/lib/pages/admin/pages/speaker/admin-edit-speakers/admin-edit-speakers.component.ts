import { Component } from '@angular/core';

import { SpeakerService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-speakers',
  templateUrl: './admin-edit-speakers.component.html',
  styleUrls: ['./admin-edit-speakers.component.scss']
})
export class AdminEditSpeakersComponent extends BaseAdminListComponent<Speaker> {
  constructor(private readonly speakerService: SpeakerService) {
    super(speakerService);
  }
}
