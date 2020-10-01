import { Component } from '@angular/core';
import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';
import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-tags',
  templateUrl: './admin-view-tags.component.html',
  styleUrls: ['./admin-view-tags.component.scss']
})
export class AdminViewTagsComponent extends BaseAdminViewComponent<Tag, TagService> {
  constructor(private readonly tagService: TagService) {
    super(tagService);
  }
}
