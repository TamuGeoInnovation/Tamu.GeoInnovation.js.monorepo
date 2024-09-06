import { Component, OnInit } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';

import { AddressProcessing, AddressProcessingAddressFormat } from '@tamu-gisc/geoprocessing-v5';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

@Component({
  selector: 'tamu-gisc-address-processing',
  templateUrl: './address-processing.component.html',
  styleUrls: ['./address-processing.component.scss']
})
export class AddressProcessingComponent implements OnInit {
  private address: AddressProcessing;
  public result: Observable<string>;

  public url: string;

  constructor(private readonly env: EnvironmentService) {}

  public ngOnInit(): void {
    this.address = new AddressProcessing({
      apiKey: 'demo',
      nonParsedStreetAddress: '123 Old US HWY 25',
      nonParsedStreetCity: 'Los Angeles',
      nonParsedStreetState: 'California',
      nonParsedStreetZIP: '900890255',
      addressFormat: [AddressProcessingAddressFormat.USPSPublication28],
      serviceHost: this.env.value('geoprocessing_api_host_override')
    });

    this.result = this.address.asObservable().pipe(
      switchMap((r) => {
        return of(JSON.stringify(r, null, '   '));
      }),
      catchError((err) => {
        return of(err.toRenderableJSON(true));
      })
    );

    this.url = this.env.value('accounts_url') + '/UserServices/Databases/Upload/Step1.aspx';
  }
}
