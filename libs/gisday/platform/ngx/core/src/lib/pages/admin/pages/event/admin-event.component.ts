import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-admin-event',
    templateUrl: './admin-event.component.html',
    styleUrls: ['./admin-event.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet]
})
export class AdminEventComponent {}
