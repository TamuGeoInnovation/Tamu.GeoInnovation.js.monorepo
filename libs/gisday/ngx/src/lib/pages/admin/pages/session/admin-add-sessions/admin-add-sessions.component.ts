import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SessionsService } from '@tamu-gisc/gisday/data-access';
import { Session } from '@tamu-gisc/gisday/data-api';
import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

export const formConfig = {
  guid: [''],
  name: [''],
  duration: [''],
  date: [''],
  abstract: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-sessions',
  templateUrl: './admin-add-sessions.component.html',
  styleUrls: ['./admin-add-sessions.component.scss']
})
export class AdminAddSessionsComponent extends BaseAdminAddComponent<Session, SessionsService> {
  constructor(private fb1: FormBuilder, private sessionsService: SessionsService) {
    super(fb1, sessionsService, formConfig);
  }
}
