import { Component, OnInit } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';

import { AddressProcessor } from '@tamu-gisc/geoprocessing/v4';

@Component({
  selector: 'tamu-gisc-address-processing',
  templateUrl: './address-processing.component.html',
  styleUrls: ['./address-processing.component.scss']
})
export class AddressProcessingComponent implements OnInit {
  private address: AddressProcessor;
  public result: Observable<string>;

  public ngOnInit(): void {
    this.address = new AddressProcessor({
      apiKey: 'demo',
      version: '5.0',
      nonParsedStreetAddress: '9355 Burton Way'
    });

    this.result = this.address.execute().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }
}
