import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SpeakerService } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';
import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';

let formConfig: {
  guid: string[];
  firstName: string[];
  lastName: string[];
  email: string[];
  organization: string[];
  speakerInfo: {
    graduationYear: string[];
    degree: string[];
    program: string[];
    affiliation: string[];
    description: string[];
    socialMedia: string[];
    file: string[];
  };
};

@Component({
  selector: 'tamu-gisc-admin-detail-speaker',
  templateUrl: './admin-detail-speaker.component.html',
  styleUrls: ['./admin-detail-speaker.component.scss']
})
export class AdminDetailSpeakerComponent extends BaseAdminDetailComponent<Speaker, SpeakerService> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private speakerService: SpeakerService) {
    super(fb1, route1, speakerService, formConfig);
  }

  public submitNewEntity() {
    const form = this.form.getRawValue();
    const data: FormData = new FormData();
    const formKeys = Object.keys(form);
    formKeys.forEach((key) => {
      data.append(key, form[key]);
    });
    this.speakerService.insertSpeakerInfo(data);
  }
}
