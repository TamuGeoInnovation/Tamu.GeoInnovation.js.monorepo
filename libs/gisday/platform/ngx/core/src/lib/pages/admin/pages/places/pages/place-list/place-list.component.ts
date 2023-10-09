import { Component } from '@angular/core';

import { Place } from '@tamu-gisc/gisday/platform/data-api';
import { PlaceService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-place-list',
  templateUrl: './place-list.component.html',
  styleUrls: ['./place-list.component.scss']
})
export class PlaceListComponent extends BaseAdminListComponent<Place> {
  constructor(private readonly orgService: PlaceService) {
    super(orgService);
  }
}

