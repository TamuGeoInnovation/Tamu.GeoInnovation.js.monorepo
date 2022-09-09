import { Component, forwardRef } from '@angular/core';

import { RequestBaseComponent } from '../request-base/request-base.component';

@Component({
  selector: 'tamu-gisc-geocoding-request',
  templateUrl: './geocoding-request.component.html',
  styleUrls: ['./geocoding-request.component.scss'],
  providers: [
    {
      provide: RequestBaseComponent,
      useExisting: forwardRef(() => GeocodingRequestComponent),
      multi: true
    }
  ]
})
export class GeocodingRequestComponent extends RequestBaseComponent {}

