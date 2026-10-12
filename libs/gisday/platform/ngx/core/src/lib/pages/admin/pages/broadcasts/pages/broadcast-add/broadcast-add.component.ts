import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BroadcastAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-broadcast-add',
  templateUrl: './broadcast-add.component.html',
  styleUrls: ['./broadcast-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [BroadcastAddEditFormComponent]
})
export class BroadcastAddComponent {}
