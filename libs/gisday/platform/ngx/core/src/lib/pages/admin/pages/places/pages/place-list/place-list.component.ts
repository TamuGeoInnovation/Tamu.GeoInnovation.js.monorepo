import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Place } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';
import { AdminSearchComponent } from '../../../base-admin-list/admin-search.component';
import { SelectComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { CheckboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { AsyncPipe } from '@angular/common';
import { ExistsPipe } from '@tamu-gisc/common/ngx/pipes';

@Component({
  selector: 'tamu-gisc-place-list',
  templateUrl: './place-list.component.html',
  styleUrls: ['./place-list.component.scss'],
  imports: [SelectComponent, RouterLink, CheckboxComponent, AsyncPipe, ExistsPipe, AdminSearchComponent]
})
export class PlaceListComponent extends BaseAdminListComponent<Place> {
  /** The search (#2914) looks in the columns this page shows. */
  protected override readonly searchFields = (c: Partial<Place>) => [c.name, c.city, c.state, c.zip];

  protected readonly entityService = inject(PlaceService);
}
