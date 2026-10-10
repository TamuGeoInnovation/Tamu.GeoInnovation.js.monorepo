import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
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
  private fb1: UntypedFormBuilder;
  private route1: ActivatedRoute;
  private rsvpTypeService: RsvpTypeService;

  constructor() {
    const fb1 = inject(UntypedFormBuilder);
    const route1 = inject(ActivatedRoute);
    const rsvpTypeService = inject(RsvpTypeService);

    super(fb1, route1, rsvpTypeService);
  
    this.fb1 = fb1;
    this.route1 = route1;
    this.rsvpTypeService = rsvpTypeService;
  }

  public ngOnInit() {
    super.ngOnInit();

    this.form = formExporter();
  }
}
