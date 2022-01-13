import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { ClassService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Class } from '@tamu-gisc/gisday/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  title: [''],
  code: [''],
  professorGuid: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-classes',
  templateUrl: './admin-add-classes.component.html',
  styleUrls: ['./admin-add-classes.component.scss']
})
export class AdminAddClassesComponent extends BaseAdminAddComponent<Class> {
  constructor(private fb1: FormBuilder, private classService: ClassService) {
    super(fb1, classService);
    this.formGroup = formConfig;
  }
}
