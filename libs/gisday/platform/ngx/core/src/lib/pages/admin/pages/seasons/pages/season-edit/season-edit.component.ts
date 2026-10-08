import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SeasonAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-season-edit',
  templateUrl: './season-edit.component.html',
  styleUrls: ['./season-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [SeasonAddEditFormComponent]
})
export class SeasonEditComponent {}
