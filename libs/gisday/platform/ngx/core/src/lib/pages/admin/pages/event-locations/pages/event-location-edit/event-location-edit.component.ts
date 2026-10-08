import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EventLocationAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-event-location-edit',
    templateUrl: './event-location-edit.component.html',
    styleUrls: ['./event-location-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [EventLocationAddEditFormComponent]
})
export class EventLocationEditComponent {}
