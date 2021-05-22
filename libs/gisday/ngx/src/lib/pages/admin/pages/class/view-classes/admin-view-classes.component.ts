import { Component } from '@angular/core';

import { ClassService } from '@tamu-gisc/gisday/data-access';
import { Class } from '@tamu-gisc/gisday/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-classes',
  templateUrl: './admin-view-classes.component.html',
  styleUrls: ['./admin-view-classes.component.scss']
})
export class AdminViewClassesComponent extends BaseAdminViewComponent<Class> {
  constructor(private readonly classService: ClassService) {
    super(classService);
  }
}
