import { Component, OnInit } from '@angular/core';
import { AddressParser } from '@tamu-gisc/common/utils/geometry/geoprocessing';
import { Observable, of, switchMap } from 'rxjs';

@Component({
  selector: 'tamu-gisc-address-processing',
  templateUrl: './address-processing.component.html',
  styleUrls: ['./address-processing.component.scss']
})
export class AddressProcessingComponent implements OnInit {
  private address: AddressParser;
  public result: Observable<string>;

  public ngOnInit(): void {
    this.address = new AddressParser({
      apiKey: 'demo',
      version: '4.10',
      nonParsedStreetAddress: '9355 Burton Way'
    });

    this.result = this.address.execute().pipe(switchMap((r) => of(JSON.stringify(r, null, '   '))));
  }
}
