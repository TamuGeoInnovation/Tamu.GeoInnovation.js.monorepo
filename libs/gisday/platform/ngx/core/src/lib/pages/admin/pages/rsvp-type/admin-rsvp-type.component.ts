import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-admin-rsvp-type',
    templateUrl: './admin-rsvp-type.component.html',
    styleUrls: ['./admin-rsvp-type.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, RouterLink, RouterOutlet]
})
export class AdminRsvpTypeComponent {}
