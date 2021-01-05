import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ClassService } from '@tamu-gisc/gisday/data-access';
import { Class } from '@tamu-gisc/gisday/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../add-classes/admin-add-classes.component';

@Component({
  selector: 'tamu-gisc-detail-class',
  templateUrl: './admin-detail-class.component.html',
  styleUrls: ['./admin-detail-class.component.scss']
})
export class AdminDetailClassComponent extends BaseAdminDetailComponent<Class, ClassService> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private classService: ClassService) {
    super(fb1, route1, classService, formConfig);
  }
}
