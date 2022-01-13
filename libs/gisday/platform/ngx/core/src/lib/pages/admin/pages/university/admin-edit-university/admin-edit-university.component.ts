import { Component } from '@angular/core';

import { UniversityService } from '@tamu-gisc/gisday/data-access';
import { University } from '@tamu-gisc/gisday/data-api';

import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-university',
  templateUrl: './admin-edit-university.component.html',
  styleUrls: ['./admin-edit-university.component.scss']
})
export class AdminEditUniversityComponent extends BaseAdminEditComponent<University> {
  constructor(private readonly universityService: UniversityService) {
    super(universityService);
  }
}
