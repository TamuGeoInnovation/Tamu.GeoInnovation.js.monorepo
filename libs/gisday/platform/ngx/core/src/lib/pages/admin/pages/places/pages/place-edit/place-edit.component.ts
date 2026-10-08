import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PlaceLocationAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-place-edit',
    templateUrl: './place-edit.component.html',
    styleUrls: ['./place-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [PlaceLocationAddEditFormComponent]
})
export class PlaceEditComponent {}
