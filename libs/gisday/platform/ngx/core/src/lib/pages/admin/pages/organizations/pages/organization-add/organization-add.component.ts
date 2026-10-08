import { Component, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-organization-add',
  templateUrl: './organization-add.component.html',
  styleUrls: ['./organization-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [OrganizationAddEditFormComponent]
})
export class OrganizationAddComponent {}
