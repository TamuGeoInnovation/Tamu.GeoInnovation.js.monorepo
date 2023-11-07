import { Component } from '@angular/core';

import { Class } from '@tamu-gisc/gisday/platform/data-api';
import { ClassService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss']
})
export class ClassListComponent extends BaseAdminListComponent<Class> {
  constructor(private readonly classService: ClassService) {
    super(classService);
  }
}

