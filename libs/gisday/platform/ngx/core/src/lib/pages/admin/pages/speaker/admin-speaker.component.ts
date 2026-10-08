import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-admin-speaker',
    templateUrl: './admin-speaker.component.html',
    styleUrls: ['./admin-speaker.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class AdminSpeakerComponent {}
