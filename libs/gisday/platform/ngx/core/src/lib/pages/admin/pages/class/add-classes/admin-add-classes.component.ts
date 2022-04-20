import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ClassService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Class } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    title: new FormControl(''),
    code: new FormControl(''),
    professor: new FormControl('')
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-classes',
  templateUrl: './admin-add-classes.component.html',
  styleUrls: ['./admin-add-classes.component.scss']
})
export class AdminAddClassesComponent extends BaseAdminAddComponent<Class> {
  constructor(private fb1: FormBuilder, private classService: ClassService) {
    super(fb1, classService);

    this.form = formExporter();
  }
}
