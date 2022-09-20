import { Component } from '@angular/core';

import { AddressProcessor } from '@tamu-gisc/geoprocessing/v4';

@Component({
  selector: 'tamu-gisc-address-processing',
  templateUrl: './address-processing.component.html',
  styleUrls: ['./address-processing.component.scss']
})
export class AddressProcessingComponent {
  public apiVersion = '5.0';
  public url = 'https://prod.geoservices.tamu.edu/api/addressnormalization/v5';

  public apiKey = 'demo';

  public runner: AddressProcessor = new AddressProcessor({
    apiKey: this.apiKey,
    version: '5.0',
    nonParsedStreetAddress: '123 Old Del Mar',
    nonParsedStreetCity: 'Los Angeles',
    nonParsedStreetState: 'California',
    nonParsedStreetZIP: '900890255',
    addressFormat: ['USPSPublication28', 'USCensusTiger', 'LACounty']
  });
}
