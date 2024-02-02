import { Component } from '@angular/core';

import { EventBroadcast } from '@tamu-gisc/gisday/platform/data-api';
import { BroadcastService } from '@tamu-gisc/gisday/platform/ngx/data-access';

import { BaseAdminListComponent } from '../../../base-admin-list/base-admin-list.component';

@Component({
  selector: 'tamu-gisc-broadcast-list',
  templateUrl: './broadcast-list.component.html',
  styleUrls: ['./broadcast-list.component.scss']
})
export class BroadcastListComponent extends BaseAdminListComponent<EventBroadcast> {
  constructor(private readonly broadcastService: BroadcastService) {
    super(broadcastService);
  }
}
