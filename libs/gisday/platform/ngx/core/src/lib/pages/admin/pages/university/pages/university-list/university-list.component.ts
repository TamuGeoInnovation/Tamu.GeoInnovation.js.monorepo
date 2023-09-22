import { Component } from '@angular/core';

import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminViewComponent } from '../../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-university-list',
  templateUrl: './university-list.component.html',
  styleUrls: ['./university-list.component.scss']
})
export class UniversityListComponent extends BaseAdminViewComponent<University> {
  constructor(private readonly universityService: UniversityService) {
    super(universityService);
  }
}

