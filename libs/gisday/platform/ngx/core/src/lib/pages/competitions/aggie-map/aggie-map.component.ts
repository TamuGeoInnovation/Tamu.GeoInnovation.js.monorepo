import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'tamu-gisc-aggie-map',
    templateUrl: './aggie-map.component.html',
    styleUrls: ['./aggie-map.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterLink]
})
export class AggieMapComponent {}
