import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SpeakerService } from '@tamu-gisc/gisday/data-access';
import { Speaker } from '@tamu-gisc/gisday/data-api';
import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  firstName: [''],
  lastName: [''],
  email: [''],
  organization: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-speakers',
  templateUrl: './admin-add-speakers.component.html',
  styleUrls: ['./admin-add-speakers.component.scss']
})
export class AdminAddSpeakersComponent extends BaseAdminAddComponent<Speaker, SpeakerService> {
  constructor(private fb1: FormBuilder, private speakerService: SpeakerService) {
    super(fb1, speakerService, formConfig);
  }
}
