import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UniversityAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-university-edit',
  templateUrl: './university-edit.component.html',
  styleUrls: ['./university-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [UniversityAddEditFormComponent]
})
export class UniversityEditComponent {}
