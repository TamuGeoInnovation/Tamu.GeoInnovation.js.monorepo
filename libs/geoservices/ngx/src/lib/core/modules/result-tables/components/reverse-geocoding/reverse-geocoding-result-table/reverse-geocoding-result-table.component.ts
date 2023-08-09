import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { FieldEnumerator, EnumeratorKeyValuePairs } from '@tamu-gisc/common/utils/object';
import { IReverseGeocodeRecord, ReverseGeocodeRecordField } from '@tamu-gisc/geoprocessing-v5';

import { ReverseGeocodeFieldLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-reverse-geocoding-result-table',
  templateUrl: './reverse-geocoding-result-table.component.html',
  styleUrls: ['./reverse-geocoding-result-table.component.scss']
})
export class ReverseGeocodingResultTableComponent implements OnInit {
  @Input()
  public result: IReverseGeocodeRecord;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  public parsedAddressDict = ReverseGeocodeFieldLabel;

  private _excludedProps = [
    ReverseGeocodeRecordField.TimeTaken,
    ReverseGeocodeRecordField.ExceptionOccurred,
    ReverseGeocodeRecordField.ErrorMessage
  ];

  private _defaultOrder = [
    ReverseGeocodeRecordField.Apn,
    ReverseGeocodeRecordField.StreetAddress,
    ReverseGeocodeRecordField.City,
    ReverseGeocodeRecordField.State,
    ReverseGeocodeRecordField.Zip,
    ReverseGeocodeRecordField.ZipPlus4
  ];

  public ngOnInit(): void {
    this.filteredProps = of(this.result).pipe(
      map((result) => {
        return new FieldEnumerator(result).filter('exclude', this._excludedProps).order(this._defaultOrder);
      })
    );
  }
}

