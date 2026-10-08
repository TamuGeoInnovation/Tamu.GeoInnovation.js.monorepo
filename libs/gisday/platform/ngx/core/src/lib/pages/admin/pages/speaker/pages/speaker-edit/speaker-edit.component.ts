import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SpeakerAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-speaker-edit',
    templateUrl: './speaker-edit.component.html',
    styleUrls: ['./speaker-edit.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SpeakerAddEditFormComponent]
})
export class SpeakerEditComponent {}
