import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-university-list',
  templateUrl: './university-list.component.html',
  styleUrls: ['./university-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, ExistsPipe, AdminSearchComponent]
})
export class UniversityListComponent extends BaseAdminListComponent<University> {
  /** The search (#2914) looks in the columns this page shows. */
  protected override readonly searchFields = (c: Partial<University>) => [c.name, c.acronym];

  protected readonly entityService = inject(UniversityService);
}
