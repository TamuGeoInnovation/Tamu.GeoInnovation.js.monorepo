import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    name: new FormControl(''),
    acronym: new FormControl(''),
    hexTriplet: new FormControl('')
  });
};
@Component({
  selector: 'tamu-gisc-admin-add-university',
  templateUrl: './admin-add-university.component.html',
  styleUrls: ['./admin-add-university.component.scss']
})
export class AdminAddUniversityComponent extends BaseAdminAddComponent<University> implements OnInit {
  constructor(private universityService: UniversityService) {
    super(universityService);
  }

  public ngOnInit() {
    this.form = formExporter();
  }

  public setHexPreview() {
    return `#${this.form.controls.hexTriplet.value}`;
  }
}
