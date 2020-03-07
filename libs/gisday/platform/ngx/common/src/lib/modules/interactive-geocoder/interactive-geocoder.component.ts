import { Component, OnInit } from '@angular/core';

import { Geocoder, IGeocodeResult } from '@tamu-gisc/common/utils/geometry/geoprocessing';

import { AbstractInteractiveServiceComponent } from '../../abstracts/abstract-interactive-service/abstract-interactive-service.component';

@Component({
  selector: 'tamu-gisc-interactive-geocoder',
  templateUrl: './interactive-geocoder.component.html',
  styleUrls: ['./interactive-geocoder.component.scss']
})
export class InteractiveGeocoderComponent extends AbstractInteractiveServiceComponent<Geocoder, IGeocodeResult> {
  constructor() {
    super();
  }

  public ngOnInit() {}
}
