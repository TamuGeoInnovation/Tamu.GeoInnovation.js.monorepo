import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RsvpTypeService } from '@tamu-gisc/gisday/platform/ngx/data-access';
import { RsvpType } from '@tamu-gisc/gisday/platform/data-api';

import { BaseAdminDetailComponent } from '../../../base-admin-detail/base-admin-detail.component';
import { formExporter } from '../../admin-add-rsvp-type/admin-add-rsvp-type.component';
import { TextboxComponent } from '@tamu-gisc/ui-kits/ngx/forms';
import { ButtonComponent } from '@tamu-gisc/ui-kits/ngx/forms';

@Component({
  selector: 'tamu-gisc-admin-detail-rsvp-type',
  templateUrl: './admin-detail-rsvp-type.component.html',
  styleUrls: ['./admin-detail-rsvp-type.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, ReactiveFormsModule, TextboxComponent, ButtonComponent]
})
export class AdminDetailRsvpTypeComponent extends BaseAdminDetailComponent<RsvpType> implements OnInit {
  protected readonly entityService = inject(RsvpTypeService);

  public ngOnInit() {
    super.ngOnInit();

    this.form = formExporter();
  }
}
