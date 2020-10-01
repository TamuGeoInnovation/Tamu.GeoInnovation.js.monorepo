import { Component } from '@angular/core';

import { SessionsService } from '@tamu-gisc/gisday/data-access';
import { Session } from '@tamu-gisc/gisday/data-api';
import { BaseAdminEditComponent } from '../../base-admin-edit/base-admin-edit.component';

@Component({
  selector: 'tamu-gisc-admin-edit-sessions',
  templateUrl: './admin-edit-sessions.component.html',
  styleUrls: ['./admin-edit-sessions.component.scss']
})
export class AdminEditSessionsComponent extends BaseAdminEditComponent<Session, SessionsService> {
  constructor(private readonly sessionsService: SessionsService) {
    super(sessionsService);
  }
}
