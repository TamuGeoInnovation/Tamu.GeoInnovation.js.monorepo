import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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
  constructor(
    private fb1: UntypedFormBuilder,
    private route1: ActivatedRoute,
    private rsvpTypeService: RsvpTypeService
  ) {
    super(fb1, route1, rsvpTypeService);
  }

  public ngOnInit() {
    super.ngOnInit();

    this.form = formExporter();
  }
}
