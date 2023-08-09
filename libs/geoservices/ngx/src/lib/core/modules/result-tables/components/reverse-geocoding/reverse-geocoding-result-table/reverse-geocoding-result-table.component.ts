import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { FieldEnumerator, EnumeratorKeyValuePairs } from '@tamu-gisc/common/utils/object';
import { IReverseGeocode, ReverseGeocodeField } from '@tamu-gisc/geoprocessing-v5';

import { ReverseGeocodeFieldLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-result-table',
  templateUrl: './reverse-geocoding-result-table.component.html',
  styleUrls: ['./reverse-geocoding-result-table.component.scss']
})
export class ReverseGeocodingResultTableComponent implements OnInit {
  @Input()
  public result: IReverseGeocode;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  public parsedAddressDict = ReverseGeocodeFieldLabel;

  private _excludedProps = [
    ReverseGeocodeField.TimeTaken,
    ReverseGeocodeField.ExceptionOccurred,
    ReverseGeocodeField.ErrorMessage
  ];

  private _defaultOrder = [
    ReverseGeocodeField.Apn,
    ReverseGeocodeField.StreetAddress,
    ReverseGeocodeField.City,
    ReverseGeocodeField.State,
    ReverseGeocodeField.Zip,
    ReverseGeocodeField.ZipPlus4
  ];

  public ngOnInit(): void {
    this.filteredProps = of(this.result).pipe(
      map((result) => {
        return new FieldEnumerator(result).filter('exclude', this._excludedProps).order(this._defaultOrder);
      })
    );
  }
}

