import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'tamu-gisc-presentation',
    templateUrl: './presentation.component.html',
    styleUrls: ['./presentation.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class PresentationComponent {}
