import { Component } from '@angular/core';
import { SessionsService } from '@tamu-gisc/gisday/data-access';
import { Session } from '@tamu-gisc/gisday/data-api';
import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';

@Component({
  selector: 'tamu-gisc-admin-view-sessions',
  templateUrl: './admin-view-sessions.component.html',
  styleUrls: ['./admin-view-sessions.component.scss']
})
export class AdminViewSessionsComponent extends BaseAdminViewComponent<Session, SessionsService> {
  constructor(private readonly sessionsService: SessionsService) {
    super(sessionsService);
  }
}
