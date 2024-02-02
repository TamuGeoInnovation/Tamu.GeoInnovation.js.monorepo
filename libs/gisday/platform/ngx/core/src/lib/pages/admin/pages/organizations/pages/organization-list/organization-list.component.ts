import { Component } from '@angular/core';

import { Organization } from '@tamu-gisc/gisday/platform/data-api';
import { OrganizationService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent extends BaseAdminListComponent<Organization> {
  constructor(private readonly orgService: OrganizationService) {
    super(orgService);
  }
}
