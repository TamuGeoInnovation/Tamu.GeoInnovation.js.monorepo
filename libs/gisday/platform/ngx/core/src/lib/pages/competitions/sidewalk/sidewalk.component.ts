import { Component } from '@angular/core';
import { MapboxMapComponent } from '@tamu-gisc/maps/mapbox';

@Component({
  selector: 'tamu-gisc-sidewalk',
  templateUrl: './sidewalk.component.html',
  styleUrls: ['./sidewalk.component.scss'],
  imports: [MapboxMapComponent]
})
export class SidewalkComponent {}
