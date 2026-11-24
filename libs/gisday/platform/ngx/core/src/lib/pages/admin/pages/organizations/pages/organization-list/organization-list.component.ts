import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Organization } from '@tamu-gisc/gisday/platform/data-api';
import { OrganizationService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, DatePipe, ExistsPipe, AdminSearchComponent]
})
export class OrganizationListComponent extends BaseAdminListComponent<Organization> {
  /** The search (#2914) looks in the columns this page shows. */
  protected override readonly searchFields = (c: Partial<Organization>) => [c.name];

  protected readonly entityService = inject(OrganizationService);
}
