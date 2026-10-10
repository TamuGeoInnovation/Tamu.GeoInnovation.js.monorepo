import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLinkActive, RouterLink } from '@angular/router';

import { RsvpTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminListComponent } from '../../base-admin-list/base-admin-list.component';
import { AsyncPipe, DatePipe } from '@angular/common';
@Component({
  selector: 'tamu-gisc-admin-edit-rsvp-type',
  templateUrl: './admin-edit-rsvp-type.component.html',
  styleUrls: ['./admin-edit-rsvp-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLinkActive, RouterLink, AsyncPipe, DatePipe]
})
export class AdminEditRsvpTypeComponent extends BaseAdminListComponent<RsvpType> {
  protected readonly entityService = inject(RsvpTypeService);
}
