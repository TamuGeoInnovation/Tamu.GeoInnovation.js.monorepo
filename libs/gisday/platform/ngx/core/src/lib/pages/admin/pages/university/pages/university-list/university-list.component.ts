import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UniversityService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { University } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-university-list',
  templateUrl: './university-list.component.html',
  styleUrls: ['./university-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, ExistsPipe]
})
export class UniversityListComponent extends BaseAdminListComponent<University> {
  protected readonly entityService = inject(UniversityService);
}
