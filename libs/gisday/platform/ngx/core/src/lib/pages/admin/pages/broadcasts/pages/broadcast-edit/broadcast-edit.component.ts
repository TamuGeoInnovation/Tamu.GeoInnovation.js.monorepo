import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BroadcastAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-broadcast-edit',
  templateUrl: './broadcast-edit.component.html',
  styleUrls: ['./broadcast-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BroadcastAddEditFormComponent]
})
export class BroadcastEditComponent {}
