import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../admin-add-tags/admin-add-tags.component';

@Component({
  selector: 'tamu-gisc-admin-detail-tag',
  templateUrl: './admin-detail-tag.component.html',
  styleUrls: ['./admin-detail-tag.component.scss']
})
export class AdminDetailTagComponent extends BaseAdminDetailComponent<Tag, TagService> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private tagService: TagService) {
    super(fb1, route1, tagService, formConfig);
  }
}
