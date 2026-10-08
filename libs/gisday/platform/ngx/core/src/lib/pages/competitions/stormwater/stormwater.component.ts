import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MapboxMapComponent } from '@tamu-gisc/maps/mapbox';

@Component({
  selector: 'tamu-gisc-stormwater',
  templateUrl: './stormwater.component.html',
  styleUrls: ['./stormwater.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MapboxMapComponent]
})
export class StormwaterComponent {}
