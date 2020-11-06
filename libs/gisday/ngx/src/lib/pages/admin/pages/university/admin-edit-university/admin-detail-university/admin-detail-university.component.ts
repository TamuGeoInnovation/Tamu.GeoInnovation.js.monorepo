import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UniversityService } from '@tamu-gisc/gisday/data-access';
import { University } from '@tamu-gisc/gisday/data-api';
import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../admin-add-university/admin-add-university.component';

@Component({
  selector: 'tamu-gisc-admin-detail-university',
  templateUrl: './admin-detail-university.component.html',
  styleUrls: ['./admin-detail-university.component.scss']
})
export class AdminDetailUniversityComponent extends BaseAdminDetailComponent<University, UniversityService> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private universityService: UniversityService) {
    super(fb1, route1, universityService, formConfig);
  }
}
