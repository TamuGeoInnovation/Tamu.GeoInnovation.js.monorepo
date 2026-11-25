import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TagService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { Tag } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';
import { CentralDatePipe } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-tags-list',
  templateUrl: './tags-list.component.html',
  styleUrls: ['./tags-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, CentralDatePipe, ExistsPipe]
})
export class TagsListComponent extends BaseAdminListComponent<Tag> {
  protected readonly entityService = inject(TagService);
}
