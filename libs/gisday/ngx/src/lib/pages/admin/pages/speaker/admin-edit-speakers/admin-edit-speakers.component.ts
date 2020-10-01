import { Component } from '@angular/core';

import { SpeakerService } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';
import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-speakers',
  templateUrl: './admin-edit-speakers.component.html',
  styleUrls: ['./admin-edit-speakers.component.scss']
})
export class AdminEditSpeakersComponent extends BaseAdminEditComponent<Speaker, SpeakerService> {
  constructor(private readonly speakerService: SpeakerService) {
    super(speakerService);
  }
}
