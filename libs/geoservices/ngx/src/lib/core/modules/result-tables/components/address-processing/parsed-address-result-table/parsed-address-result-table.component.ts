import { Component, Input, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { IParsedAddress, ParsedAddressField } from '@tamu-gisc/geoprocessing-v5';

import { ParsedAddressFieldLabel } from '../../../../../util/dictionaries';
import { FieldEnumerator } from '@tamu-gisc/common/utils/object';

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
  public address: IParsedAddress;

  public parsedAddressDict = ParsedAddressFieldLabel;

  private _simpleProps = [
    ParsedAddressField.AddressFormatType,
    ParsedAddressField.AddressFormatType,
    ParsedAddressField.Number,
    ParsedAddressField.NumberFractional,
    ParsedAddressField.PreDirectional,
    ParsedAddressField.PreQualifier,
    ParsedAddressField.PreType,
    ParsedAddressField.PreArticle,
    ParsedAddressField.Name,
    ParsedAddressField.PostArticle,
    ParsedAddressField.Suffix,
    ParsedAddressField.PostQualifier,
    ParsedAddressField.PostDirectional,
    ParsedAddressField.SuiteType,
    ParsedAddressField.SuiteNumber
  ];

  /**
   * Matrix of address formats and properties that are not supported by each.
   *
   * These are filtered depending on the input address `addressFormatType` property.
   */
  private _unsupportedProps = {
    USPSPublication28: [
      ParsedAddressField.PreQualifier,
      ParsedAddressField.PreType,
      ParsedAddressField.PreArticle,
      ParsedAddressField.PostArticle,
      ParsedAddressField.PostQualifier
    ],
    USCensusTiger: [ParsedAddressField.PreArticle, ParsedAddressField.PostArticle],
    LACounty: []
  };

  private _defaultOrder = [
    ParsedAddressField.Number,
    ParsedAddressField.NumberFractional,
    ParsedAddressField.PreDirectional,
    ParsedAddressField.PreQualifier,
    ParsedAddressField.PreType,
    ParsedAddressField.PreArticle,
    ParsedAddressField.Name,
    ParsedAddressField.PostArticle,
    ParsedAddressField.Suffix,
    ParsedAddressField.PostQualifier,
    ParsedAddressField.PostDirectional,
    ParsedAddressField.SuiteType,
    ParsedAddressField.SuiteNumber
  ] as string[];

  public filteredProps: Observable<Array<{ key: string; value: unknown }>>;

  public ngOnInit(): void {
    this.filteredProps = of(this.address).pipe(
      map((address) => {
        return new FieldEnumerator(address).filter('exclude', this._unsupportedProps[address.addressFormatType]) as any;
      }),
      map((address) => {
        if (this.type === 'simple') {
          return new FieldEnumerator(address).filter('include', this._simpleProps) as any;
        } else {
          console.log('Advanced, order');
          return new FieldEnumerator(address).order(this._defaultOrder) as any;
        }
      })
    );
  }
}

