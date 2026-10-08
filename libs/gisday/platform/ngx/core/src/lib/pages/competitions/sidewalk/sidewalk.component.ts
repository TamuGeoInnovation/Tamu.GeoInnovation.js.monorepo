import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MapboxMapComponent } from '@tamu-gisc/maps/mapbox';

@Component({
    selector: 'tamu-gisc-sidewalk',
    templateUrl: './sidewalk.component.html',
    styleUrls: ['./sidewalk.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MapboxMapComponent]
})
export class SidewalkComponent {}
