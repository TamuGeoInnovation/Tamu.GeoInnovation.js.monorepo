import { Component, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { AddressProcessing } from '@tamu-gisc/geoprocessing-v5';

@Component({
  selector: 'tamu-gisc-address-processing',
  templateUrl: './address-processing.component.html',
  styleUrls: ['./address-processing.component.scss']
})
export class AddressProcessingComponent implements OnInit {
  private address: AddressProcessing;
  public result: Observable<string>;

  public ngOnInit(): void {
    this.address = new AddressProcessing({
      apiKey: 'demo',
      nonParsedStreetAddress: '123 Old US HWY 25',
      nonParsedStreetCity: 'Los Angeles',
      nonParsedStreetState: 'California',
      nonParsedStreetZIP: '900890255',
      addressFormat: ['USPSPublication28']
    });

    this.result = this.address.asObservable().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }
}
