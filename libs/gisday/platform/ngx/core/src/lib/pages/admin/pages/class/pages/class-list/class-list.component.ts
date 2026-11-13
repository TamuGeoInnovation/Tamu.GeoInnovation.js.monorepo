import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Class } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, ExistsPipe, AdminSearchComponent]
})
export class ClassListComponent extends BaseAdminListComponent<Class> {
  /** The search (#2914) looks in the columns this page shows. */
  protected override readonly searchFields = (c: Partial<Class>) => [`${c.code ?? ''} ${c.number ?? ''}`, c.section, c.title, c.professorName];

  protected readonly entityService = inject(ClassService);
}
