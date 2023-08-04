import { Component, Input, OnInit } from '@angular/core';
import { Observable, filter, from, reduce } from 'rxjs';

import { IParsedAddress, ParsedAddressField } from '@tamu-gisc/geoprocessing-v5';

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

  public filteredProps: Observable<{ [key: string]: unknown }>;

  public ngOnInit(): void {
    this.filteredProps = from(Object.entries(this.address)).pipe(
      // Filter out unsupported properties based on address format type.
      filter(([key]: [ParsedAddressField, unknown]) => {
        if (this._unsupportedProps[this.address.addressFormatType].includes(key) === false) {
          return true;
        } else {
          return false;
        }
      }),
      reduce((acc, curr) => {
        const [propName, value] = curr;

        if (this.type === 'simple') {
          if (this._simpleProps.includes(propName) === true) {
            acc[propName] = value;
          }
        } else {
          acc[propName] = value;
        }

        return acc;
      }, {})
    );
  }
}

