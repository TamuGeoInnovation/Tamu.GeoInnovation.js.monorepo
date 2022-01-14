import { Component } from '@angular/core';

import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-university',
  templateUrl: './admin-view-university.component.html',
  styleUrls: ['./admin-view-university.component.scss']
})
export class AdminViewUniversityComponent extends BaseAdminViewComponent<University> {
  constructor(private readonly universityService: UniversityService) {
    super(universityService);
  }
}
