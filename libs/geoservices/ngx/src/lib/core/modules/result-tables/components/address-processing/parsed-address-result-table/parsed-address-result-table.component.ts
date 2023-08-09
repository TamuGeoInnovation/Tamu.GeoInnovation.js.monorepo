import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { IParsedAddressRecord, ParsedAddressRecordField } from '@tamu-gisc/geoprocessing-v5';
import { EnumeratorKeyValuePairs, FieldEnumerator } from '@tamu-gisc/common/utils/object';

import { ParsedAddressFieldLabel } from '../../../../../util/dictionaries';

@Component({
  selector: 'tamu-gisc-parsed-address-result-table',
  templateUrl: './parsed-address-result-table.component.html',
  styleUrls: ['./parsed-address-result-table.component.scss']
})
export class ParsedAddressResultTableComponent implements OnInit {
  /**
   * Determines the type of table to display. Simple omits some address properties.
   *
   * Defaults to `simple`.
   */
  @Input()
  public type: 'simple' | 'expanded' = 'simple';

  @Input()
  public address: IParsedAddressRecord;

  public parsedAddressDict = ParsedAddressFieldLabel;

  public filteredProps: Observable<EnumeratorKeyValuePairs>;

  private _simpleProps = [
    ParsedAddressRecordField.AddressFormatType,
    ParsedAddressRecordField.Number,
    ParsedAddressRecordField.NumberFractional,
    ParsedAddressRecordField.PreDirectional,
    ParsedAddressRecordField.PreQualifier,
    ParsedAddressRecordField.PreType,
    ParsedAddressRecordField.PreArticle,
    ParsedAddressRecordField.Name,
    ParsedAddressRecordField.PostArticle,
    ParsedAddressRecordField.Suffix,
    ParsedAddressRecordField.PostQualifier,
    ParsedAddressRecordField.PostDirectional,
    ParsedAddressRecordField.SuiteType,
    ParsedAddressRecordField.SuiteNumber
  ];

  /**
   * Matrix of address formats and properties that are not supported by each.
   *
   * These are filtered depending on the input address `addressFormatType` property.
   */
  private _unsupportedProps = {
    USPSPublication28: [
      ParsedAddressRecordField.PreQualifier,
      ParsedAddressRecordField.PreType,
      ParsedAddressRecordField.PreArticle,
      ParsedAddressRecordField.PostArticle,
      ParsedAddressRecordField.PostQualifier
    ],
    USCensusTiger: [ParsedAddressRecordField.PreArticle, ParsedAddressRecordField.PostArticle],
    LACounty: []
  };

  private _defaultOrder = [
    ParsedAddressRecordField.Number,
    ParsedAddressRecordField.NumberFractional,
    ParsedAddressRecordField.PreDirectional,
    ParsedAddressRecordField.PreQualifier,
    ParsedAddressRecordField.PreType,
    ParsedAddressRecordField.PreArticle,
    ParsedAddressRecordField.Name,
    ParsedAddressRecordField.PostArticle,
    ParsedAddressRecordField.Suffix,
    ParsedAddressRecordField.PostQualifier,
    ParsedAddressRecordField.PostDirectional,
    ParsedAddressRecordField.SuiteType,
    ParsedAddressRecordField.SuiteNumber
  ];

  public ngOnInit(): void {
    this.filteredProps = of(this.address).pipe(
      map((address) => {
        return new FieldEnumerator(address).filter('exclude', this._unsupportedProps[address.addressFormatType]);
      }),
      map((address) => {
        if (this.type === 'simple') {
          return new FieldEnumerator(address).filter('include', this._simpleProps).order(this._defaultOrder);
        } else {
          return new FieldEnumerator(address).order(this._defaultOrder);
        }
      })
    );
  }
}
