import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SpeakerService } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';
import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../admin-add-speakers/admin-add-speakers.component';

@Component({
  selector: 'tamu-gisc-admin-detail-speaker',
  templateUrl: './admin-detail-speaker.component.html',
  styleUrls: ['./admin-detail-speaker.component.scss']
})
export class AdminDetailSpeakerComponent extends BaseAdminDetailComponent<Speaker, SpeakerService> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private speakerService: SpeakerService) {
    super(fb1, route1, speakerService, formConfig);
  }
}
