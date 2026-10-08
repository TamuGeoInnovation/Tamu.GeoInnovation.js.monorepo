import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EventAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
  selector: 'tamu-gisc-event-edit',
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EventAddEditFormComponent]
})
export class EventEditComponent {}
