import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SpeakerAddEditFormComponent } from '@tamu-gisc/gisday/platform/ngx/common';

@Component({
    selector: 'tamu-gisc-speaker-add',
    templateUrl: './speaker-add.component.html',
    styleUrls: ['./speaker-add.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SpeakerAddEditFormComponent]
})
export class SpeakerAddComponent {}
