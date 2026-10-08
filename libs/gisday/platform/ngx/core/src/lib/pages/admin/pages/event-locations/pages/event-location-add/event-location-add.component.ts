import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EventLocationAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-event-location-add',
    templateUrl: './event-location-add.component.html',
    styleUrls: ['./event-location-add.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [EventLocationAddEditFormComponent]
})
export class EventLocationAddComponent {}
