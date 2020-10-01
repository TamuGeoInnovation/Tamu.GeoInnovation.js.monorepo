import { Component } from '@angular/core';
import { SpeakerService } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';
import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-speakers',
  templateUrl: './admin-view-speakers.component.html',
  styleUrls: ['./admin-view-speakers.component.scss']
})
export class AdminViewSpeakersComponent extends BaseAdminViewComponent<Speaker, SpeakerService> {
  constructor(private readonly speakerService: SpeakerService) {
    super(speakerService);
  }
}
