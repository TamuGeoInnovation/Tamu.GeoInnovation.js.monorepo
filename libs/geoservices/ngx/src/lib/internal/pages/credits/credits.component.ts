import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';

@Component({
    selector: 'tamu-gisc-credits',
    templateUrl: './credits.component.html',
    styleUrls: ['./credits.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLinkActive, RouterLink, RouterOutlet]
})
export class CreditsComponent {}
