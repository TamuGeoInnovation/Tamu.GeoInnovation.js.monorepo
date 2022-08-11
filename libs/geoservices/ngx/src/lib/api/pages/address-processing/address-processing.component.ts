import { Component } from '@angular/core';

import { AddressParser } from '@tamu-gisc/common/utils/geometry/geoprocessing';

@Component({
  selector: 'tamu-gisc-address-processing',
  templateUrl: './address-processing.component.html',
  styleUrls: ['./address-processing.component.scss']
})
export class AddressProcessingComponent {
  public apiVersion: '4.01' = '4.01';
  public url = 'https://geoservices.tamu.edu/Services/AddressNormalization/WebService/v04_01/Rest';

  public apiKey = 'demo';

  public runner: AddressParser = new AddressParser({
    apiKey: this.apiKey,
    version: '4.10',
    nonParsedStreetAddress: '9355 Burton Way'
  });
}
