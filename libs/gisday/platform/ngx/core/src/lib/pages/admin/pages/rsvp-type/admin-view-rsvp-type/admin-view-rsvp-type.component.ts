import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

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
  private readonly rsvpTypeService: RsvpTypeService;

  constructor() {
    const rsvpTypeService = inject(RsvpTypeService);

    super(rsvpTypeService);
  
    this.rsvpTypeService = rsvpTypeService;
  }
}
