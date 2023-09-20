import { Component } from '@angular/core';

import { ClassService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Class } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-admin-edit-classes',
  templateUrl: './admin-edit-classes.component.html',
  styleUrls: ['./admin-edit-classes.component.scss']
})
export class AdminEditClassesComponent extends BaseAdminListComponent<Class> {
  constructor(private readonly classService: ClassService) {
    super(classService);
  }
}
