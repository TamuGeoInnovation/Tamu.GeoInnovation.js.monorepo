import { Component, ChangeDetectionStrategy } from '@angular/core';
import { GeocodeCorrectionFormComponent } from '../../../../../core/modules/forms/geocode-correction-form/geocode-correction-form.component';

@Component({
  selector: 'tamu-gisc-address-correction',
  templateUrl: './address-correction.component.html',
  styleUrls: ['./address-correction.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [GeocodeCorrectionFormComponent]
})
export class AddressCorrectionComponent {}
