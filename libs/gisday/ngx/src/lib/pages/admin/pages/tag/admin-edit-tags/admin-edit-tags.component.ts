import { Component } from '@angular/core';

import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';
import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-tags',
  templateUrl: './admin-edit-tags.component.html',
  styleUrls: ['./admin-edit-tags.component.scss']
})
export class AdminEditTagsComponent extends BaseAdminEditComponent<Tag> {
  constructor(private readonly tagService: TagService) {
    super(tagService);
  }
}
