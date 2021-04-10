import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';

import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  name: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-tags',
  templateUrl: './admin-add-tags.component.html',
  styleUrls: ['./admin-add-tags.component.scss']
})
export class AdminAddTagsComponent extends BaseAdminAddComponent<Tag> {
  constructor(private fb1: FormBuilder, private tagService: TagService) {
    super(fb1, tagService);
    this.formGroup = formConfig;
  }
}
