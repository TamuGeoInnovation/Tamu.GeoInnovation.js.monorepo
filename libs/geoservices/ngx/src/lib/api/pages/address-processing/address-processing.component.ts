import { Component } from '@angular/core';

import { AddressProcessing, AddressProcessingAddressFormat } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-address-processing',
  templateUrl: './address-processing.component.html',
  styleUrls: ['./address-processing.component.scss']
})
export class AddressProcessingComponent {
  public apiVersion = '5.0';
  public url = 'https://geoservices.tamu.edu/api/addressnormalization/v5';

  public apiKey = 'demo';

  public runner: AddressProcessing = new AddressProcessing({
    apiKey: this.apiKey,
    nonParsedStreetAddress: '123 Old Del Mar',
    nonParsedStreetCity: 'Los Angeles',
    nonParsedStreetState: 'California',
    nonParsedStreetZIP: '900890255',
    addressFormat: [AddressProcessingAddressFormat.USPSPublication28]
  });
}

