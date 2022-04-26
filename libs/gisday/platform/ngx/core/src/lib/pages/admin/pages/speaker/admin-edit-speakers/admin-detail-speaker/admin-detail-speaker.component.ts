import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { map, Observable } from 'rxjs';
import { Buffer } from 'buffer';

import { SpeakerService, UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Speaker, University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formExporter } from '../../admin-add-speakers/admin-add-speakers.component';
import { FormToFormData } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-admin-detail-speaker',
  templateUrl: './admin-detail-speaker.component.html',
  styleUrls: ['./admin-detail-speaker.component.scss']
})
export class AdminDetailSpeakerComponent extends BaseAdminDetailComponent<Speaker> implements OnInit {
  public $universities: Observable<Array<Partial<University>>>;
  public $speakerPhoto: Observable<string>;

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

  public ngOnInit() {
    super.ngOnInit();
    this.$speakerPhoto = this.entity.pipe(
      map((entity) => {
        if (!entity.speakerInfo.blob) {
          throw new Error('Entity does not contain blob data');
        }
        const byteArray = entity.speakerInfo.blob.data;
        const buffer = Buffer.from(byteArray as Uint8Array).toString('base64');
        return `data:image/png;base64,${buffer}`;
      })
    );
  }

  public updateEntity() {
    const data = FormToFormData(this.form);
    this.speakerService.updateSpeakerInfo(data).subscribe((result) => {
      console.log(result);
    });
  }
}
