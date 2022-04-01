import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs';

import { SpeakerService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker, University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formExporter } from '../../admin-add-speakers/admin-add-speakers.component';

@Component({
  selector: 'tamu-gisc-admin-detail-speaker',
  templateUrl: './admin-detail-speaker.component.html',
  styleUrls: ['./admin-detail-speaker.component.scss']
})
export class AdminDetailSpeakerComponent extends BaseAdminDetailComponent<Speaker> {
  public $universities: Observable<Array<Partial<University>>>;

  constructor(
    private fb1: FormBuilder,
    private route1: ActivatedRoute,
    private speakerService: SpeakerService,
    private universityService: UniversityService
  ) {
    super(fb1, route1, speakerService);

    this.$universities = this.universityService.getEntities();
    this.form = formExporter();
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
