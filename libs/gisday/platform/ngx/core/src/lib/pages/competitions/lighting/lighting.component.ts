import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'tamu-gisc-lighting',
    templateUrl: './lighting.component.html',
    styleUrls: ['./lighting.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class LightingComponent {}
