import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UniversityService } from '@tamu-gisc/gisday/data-access';
import { University } from '@tamu-gisc/gisday/data-api';
import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  name: [''],
  acronym: [''],
  hexTriplet: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-university',
  templateUrl: './admin-add-university.component.html',
  styleUrls: ['./admin-add-university.component.scss']
})
export class AdminAddUniversityComponent extends BaseAdminAddComponent<University, UniversityService> {
  constructor(private fb1: FormBuilder, private universityService: UniversityService) {
    super(fb1, universityService, formConfig);
  }
}
