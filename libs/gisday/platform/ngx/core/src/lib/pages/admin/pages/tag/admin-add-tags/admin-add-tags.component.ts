import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Tag } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formExporter = () => {
  return new FormGroup({
    guid: new FormControl(''),
    name: new FormControl('')
  });
};

@Component({
  selector: 'tamu-gisc-admin-add-tags',
  templateUrl: './admin-add-tags.component.html',
  styleUrls: ['./admin-add-tags.component.scss']
})
export class AdminAddTagsComponent extends BaseAdminAddComponent<Tag> {
  constructor(private fb1: FormBuilder, private tagService: TagService) {
    super(fb1, tagService);

    this.form = formExporter();
  }
}
