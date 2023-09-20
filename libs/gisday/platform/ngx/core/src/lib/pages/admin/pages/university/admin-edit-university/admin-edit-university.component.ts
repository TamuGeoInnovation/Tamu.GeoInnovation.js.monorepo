import { Component } from '@angular/core';

import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-university',
  templateUrl: './admin-edit-university.component.html',
  styleUrls: ['./admin-edit-university.component.scss']
})
export class AdminEditUniversityComponent extends BaseAdminListComponent<University> {
  constructor(private readonly universityService: UniversityService) {
    super(universityService);
  }
}
