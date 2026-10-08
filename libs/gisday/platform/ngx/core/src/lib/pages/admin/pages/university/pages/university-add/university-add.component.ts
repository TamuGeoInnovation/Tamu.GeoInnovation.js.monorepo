import { Component, ChangeDetectionStrategy } from '@angular/core';
import { UniversityAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-university-add',
  templateUrl: './university-add.component.html',
  styleUrls: ['./university-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [UniversityAddEditFormComponent]
})
export class UniversityAddComponent {}
