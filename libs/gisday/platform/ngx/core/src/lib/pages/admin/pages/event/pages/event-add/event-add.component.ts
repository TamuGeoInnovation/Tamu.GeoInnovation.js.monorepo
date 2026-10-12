import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EventAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-event-add',
  templateUrl: './event-add.component.html',
  styleUrls: ['./event-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EventAddEditFormComponent]
})
export class EventAddComponent {}
