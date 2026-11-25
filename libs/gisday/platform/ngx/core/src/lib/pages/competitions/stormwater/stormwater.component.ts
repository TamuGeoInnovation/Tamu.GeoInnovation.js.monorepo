import { Component } from '@angular/core';
import { MapboxMapComponent } from '@tamu-gisc/maps/mapbox';

@Component({
  selector: 'tamu-gisc-stormwater',
  templateUrl: './stormwater.component.html',
  styleUrls: ['./stormwater.component.scss'],
  imports: [MapboxMapComponent]
})
export class StormwaterComponent {}
