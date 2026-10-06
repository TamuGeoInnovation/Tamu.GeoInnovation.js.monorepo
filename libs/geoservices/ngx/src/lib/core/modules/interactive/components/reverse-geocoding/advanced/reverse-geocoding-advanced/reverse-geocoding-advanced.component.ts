import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ReverseGeocodingBasicComponent } from '../../basic/reverse-geocoding-basic/reverse-geocoding-basic.component';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-advanced',
  templateUrl: './reverse-geocoding-advanced.component.html',
  styleUrls: ['./reverse-geocoding-advanced.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class ReverseGeocodingAdvancedComponent extends ReverseGeocodingBasicComponent {}
