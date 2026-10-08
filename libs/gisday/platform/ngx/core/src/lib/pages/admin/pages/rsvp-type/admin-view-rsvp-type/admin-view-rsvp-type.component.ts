import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RsvpTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminViewComponent } from '../../base-admin-view/base-admin-view.component';
import { AsyncPipe, DatePipe } from '@angular/common';

@Component({
    selector: 'tamu-gisc-admin-view-rsvp-type',
    templateUrl: './admin-view-rsvp-type.component.html',
    styleUrls: ['./admin-view-rsvp-type.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [AsyncPipe, DatePipe]
})
export class AdminViewRsvpTypeComponent extends BaseAdminViewComponent<RsvpType> {
  constructor(private readonly rsvpTypeService: RsvpTypeService) {
    super(rsvpTypeService);
  }
}
