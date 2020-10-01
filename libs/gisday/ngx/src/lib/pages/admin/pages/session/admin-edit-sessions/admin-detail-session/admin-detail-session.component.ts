import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SessionsService } from '@tamu-gisc/gisday/data-access';
import { Session } from '@tamu-gisc/gisday/data-api';
import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formConfig } from '../../admin-add-sessions/admin-add-sessions.component';

@Component({
  selector: 'tamu-gisc-admin-detail-session',
  templateUrl: './admin-detail-session.component.html',
  styleUrls: ['./admin-detail-session.component.scss']
})
export class AdminDetailSessionComponent extends BaseAdminDetailComponent<Session, SessionsService> {
  constructor(private fb1: FormBuilder, private route1: ActivatedRoute, private sessionsService: SessionsService) {
    super(fb1, route1, sessionsService, formConfig);
  }
}
