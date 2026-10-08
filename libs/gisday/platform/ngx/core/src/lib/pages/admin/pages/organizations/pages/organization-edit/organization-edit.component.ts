import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-organization-edit',
  templateUrl: './organization-edit.component.html',
  styleUrls: ['./organization-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [OrganizationAddEditFormComponent]
})
export class OrganizationEditComponent {}
